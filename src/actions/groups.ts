'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createGroupSchema } from '@/lib/validations/group'
import { slugify } from '@/lib/utils/format'

export async function createGroup(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'You must be logged in to create a group' }
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

  const { data, error } = await supabase
    .from('groups')
    .insert({
      ...validatedData,
      slug,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/groups')
  return { data }
}

export async function joinGroup(groupId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'You must be logged in to join a group' }
  }

  const { error } = await supabase
    .from('group_members')
    .insert({
      group_id: groupId,
      user_id: user.id,
      role: 'member',
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/groups')
  return { success: true }
}

export async function leaveGroup(groupId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'You must be logged in' }
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
}

