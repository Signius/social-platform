'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { profileSchema } from '@/lib/validations/profile'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'You must be logged in to update your profile' }
  }

  const rawData = {
    username: formData.get('username') as string,
    fullName: formData.get('fullName') as string,
    bio: formData.get('bio') as string,
    location: formData.get('location') as string,
    interests: formData.get('interests') ? (formData.get('interests') as string).split(',').map(i => i.trim()).filter(Boolean) : [],
  }

  try {
    const validatedData = profileSchema.parse(rawData)

    const { error } = await supabase
      .from('profiles')
      .update({
        username: validatedData.username,
        full_name: validatedData.fullName || null,
        bio: validatedData.bio || null,
        location: validatedData.location || null,
        interests: validatedData.interests || [],
      })
      .eq('id', user.id)

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/profile')
    revalidatePath('/profile/edit')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Failed to update profile' }
  }
}

export async function getProfile(userId?: string) {
  const supabase = await createClient()

  if (!userId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'Not authenticated' }
    }
    userId = user.id
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function getProfileByUsername(username: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (error) {
    return { error: error.message }
  }

  // Get user stats
  const { data: stats } = await supabase.rpc('get_user_stats', {
    user_id: data.id,
  })

  // Get user badges
  const { data: badges } = await supabase
    .from('user_badges')
    .select('badge_id, earned_at, badges(*)')
    .eq('user_id', data.id)

  return { 
    data: {
      ...data,
      stats: stats?.[0] || null,
      badges: badges || [],
    }
  }
}

export async function updateAvatar(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'You must be logged in to update your avatar' }
  }

  const file = formData.get('avatar') as File
  
  if (!file || file.size === 0) {
    return { error: 'Please select a file' }
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    return { error: 'File must be an image' }
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return { error: 'File must be less than 5MB' }
  }

  try {
    // Upload to Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}.${fileExt}`
    const filePath = `${user.id}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        upsert: true,
      })

    if (uploadError) {
      return { error: uploadError.message }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    // Update profile with new avatar URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id)

    if (updateError) {
      return { error: updateError.message }
    }

    revalidatePath('/profile')
    revalidatePath('/profile/edit')
    return { success: true, avatarUrl: publicUrl }
  } catch (error: any) {
    return { error: error.message || 'Failed to upload avatar' }
  }
}

