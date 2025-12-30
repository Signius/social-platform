'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createGroupSchema } from '@/lib/validations/group'
import { slugify } from '@/lib/utils/format'
import { ZodError } from 'zod'
import type { Database } from '@/types/database'

export async function createGroup(formData: FormData) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { error: 'You must be logged in to create a group' }
    }

    // Check subscription limits
    const { data: canCreate, error: limitError } = await (supabase as any)
      .rpc('check_subscription_limit', {
        p_user_id: user.id,
        p_limit_type: 'groups'
      })

    if (limitError) {
      console.error('Error checking subscription limit:', limitError)
      return { error: 'Failed to verify subscription limits' }
    }

    if (!canCreate) {
      return { error: 'Free tier limit reached. Upgrade to premium to create more groups.' }
    }

    const rawData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      location: formData.get('location') as string,
      category: formData.get('category') as string,
      privacy: formData.get('privacy') as 'public' | 'private' | 'invite_only',
    }

    const validatedData = createGroupSchema.parse(rawData)
    const slug = slugify(validatedData.name)

    const insertData: Database['public']['Tables']['groups']['Insert'] = {
      name: validatedData.name,
      slug,
      description: validatedData.description || null,
      location: validatedData.location || null,
      category: validatedData.category || null,
      privacy: validatedData.privacy,
      created_by: user.id,
    }

    const { data, error } = await (supabase as any)
      .from('groups')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      // Handle unique constraint violation for slug
      if (error.code === '23505') {
        return { error: 'A group with this name already exists. Please choose a different name.' }
      }
      console.error('Error creating group:', error)
      return { error: 'Failed to create group. Please try again.' }
    }

    // Verify the database trigger added the creator as admin
    // The trigger should execute immediately, but we'll verify with retries
    let membership = null
    let retries = 0
    const maxRetries = 3
    
    while (!membership && retries < maxRetries) {
      const { data: membershipData, error: membershipError } = await (supabase as any)
        .from('group_members')
        .select('role')
        .eq('group_id', data.id)
        .eq('user_id', user.id)
        .maybeSingle()
      
      const typedMembership = membershipData as Pick<Database['public']['Tables']['group_members']['Row'], 'role'> | null

      if (typedMembership && typedMembership.role === 'admin') {
        membership = typedMembership
        break
      }

      retries++
      if (retries < maxRetries) {
        // Wait a bit before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 50 * retries))
      }
    }

    if (!membership || membership.role !== 'admin') {
      // Fallback: manually add user as admin if trigger failed
      console.warn('Database trigger failed after retries, manually adding admin')
      
      const insertMemberData: Database['public']['Tables']['group_members']['Insert'] = {
        group_id: data.id,
        user_id: user.id,
        role: 'admin',
      }

      const { error: addAdminError } = await (supabase as any)
        .from('group_members')
        .insert(insertMemberData)

      if (addAdminError) {
        // Only fail if it's not a duplicate error (trigger may have succeeded between checks)
        if (addAdminError.code !== '23505') {
          console.error('Critical: Failed to add creator as admin:', addAdminError)
          // Delete the group since creator can't be admin
          await supabase.from('groups').delete().eq('id', data.id)
          return { error: 'Failed to create group properly. Please try again.' }
        }
        // If duplicate error, trigger worked, so we're good
      }
    }

    revalidatePath('/groups')
    return { data }
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.errors[0]
      return { error: `${firstError.path.join('.')}: ${firstError.message}` }
    }
    console.error('Unexpected error in createGroup:', error)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}

export async function joinGroup(groupId: string) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { error: 'You must be logged in to join a group' }
    }

    // Check subscription limits for free users
    const { data: profileData } = await (supabase as any)
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single()
    
    const profile = profileData as Pick<Database['public']['Tables']['profiles']['Row'], 'subscription_tier'> | null

    if (profile?.subscription_tier === 'free') {
      const { count } = await supabase
        .from('group_members')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      if (count && count >= 3) {
        return { error: 'Free tier limit reached. You can only join 3 groups. Upgrade to premium for unlimited groups.' }
      }
    }

    const insertMemberData: Database['public']['Tables']['group_members']['Insert'] = {
      group_id: groupId,
      user_id: user.id,
      role: 'member',
    }

    const { error } = await (supabase as any)
      .from('group_members')
      .insert(insertMemberData)

    if (error) {
      // Handle duplicate membership
      if (error.code === '23505') {
        return { error: 'You are already a member of this group.' }
      }
      return { error: error.message }
    }

    revalidatePath('/groups')
    return { success: true }
  } catch (error) {
    console.error('Unexpected error in joinGroup:', error)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}

export async function leaveGroup(groupId: string) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { error: 'You must be logged in' }
    }

    // Check if user is the last admin
    const { data: adminMembersData } = await (supabase as any)
      .from('group_members')
      .select('user_id')
      .eq('group_id', groupId)
      .eq('role', 'admin')
    
    const adminMembers = adminMembersData as Pick<Database['public']['Tables']['group_members']['Row'], 'user_id'>[] | null

    if (adminMembers && adminMembers.length === 1 && adminMembers[0].user_id === user.id) {
      const { count: totalMembers } = await supabase
        .from('group_members')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', groupId)

      if (totalMembers && totalMembers > 1) {
        return { error: 'You are the only admin. Please assign another admin before leaving the group.' }
      }
    }

    const { error } = await supabase
      .from('group_members')
      .delete()
      .match({ group_id: groupId, user_id: user.id })

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/groups')
    return { success: true }
  } catch (error) {
    console.error('Unexpected error in leaveGroup:', error)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}

