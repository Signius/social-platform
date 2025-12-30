'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { profileSchema } from '@/lib/validations/profile'
import { ZodError } from 'zod'
import { PROFILE_LIMITS, FILE_UPLOAD } from '@/lib/utils/constants'
import { logger } from '@/lib/utils/logger'
import type { Database } from '@/types/database'

type ActionResult = {
  success?: boolean
  error?: string
}

// Sanitize HTML to prevent XSS attacks
function sanitizeHtml(text: string): string {
  if (!text) return text
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

export async function updateProfile(formData: FormData): Promise<ActionResult> {
  try {
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

    const validatedData = profileSchema.parse(rawData)

    // Sanitize text inputs to prevent XSS
    const sanitizedBio = validatedData.bio ? sanitizeHtml(validatedData.bio) : null
    const sanitizedLocation = validatedData.location ? sanitizeHtml(validatedData.location) : null
    const sanitizedFullName = validatedData.fullName ? sanitizeHtml(validatedData.fullName) : null

    // Check if username is being changed and if it's already taken
    if (validatedData.username) {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', validatedData.username)
        .neq('id', user.id)
        .maybeSingle()

      if (existingProfile) {
        return { error: 'Username is already taken. Please choose a different username.' }
      }
    }

    // Validate interests count
    if (validatedData.interests && validatedData.interests.length > PROFILE_LIMITS.MAX_INTERESTS) {
      return { error: `You can only have up to ${PROFILE_LIMITS.MAX_INTERESTS} interests` }
    }

    const updateData: Database['public']['Tables']['profiles']['Update'] = {
      username: validatedData.username,
      full_name: sanitizedFullName,
      bio: sanitizedBio,
      location: sanitizedLocation,
      interests: validatedData.interests || [],
    }

    const { error } = await (supabase as any)
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)

    if (error) {
      // Handle unique constraint violation
      if (error.code === '23505') {
        return { error: 'Username is already taken. Please choose a different username.' }
      }
      console.error('Error updating profile:', error)
      return { error: 'Failed to update profile' }
    }

    revalidatePath('/profile')
    revalidatePath('/profile/edit')
    revalidatePath(`/profile/${validatedData.username}`)
    return { success: true }
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.errors[0]
      return { error: `${firstError.path.join('.')}: ${firstError.message}` }
    }
    console.error('Unexpected error in updateProfile:', error)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}

type ProfileResult = {
  data?: any
  error?: string
}

export async function getProfile(userId?: string): Promise<ProfileResult> {
  try {
    const supabase = await createClient()

    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { error: 'Not authenticated' }
      }
      userId = user.id
    }

    // Validate userId format
    if (!userId || typeof userId !== 'string') {
      return { error: 'Invalid user ID' }
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      return { error: 'Profile not found' }
    }

    return { data }
  } catch (error) {
    console.error('Unexpected error in getProfile:', error)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}

export async function getProfileByUsername(username: string): Promise<ProfileResult> {
  try {
    const supabase = await createClient()

    // Validate username
    if (!username || typeof username !== 'string') {
      return { error: 'Invalid username' }
    }

    // Sanitize username to prevent injection
    const sanitizedUsername = username.trim().toLowerCase()

    const { data: profileData, error } = await (supabase as any)
      .from('profiles')
      .select('*')
      .eq('username', sanitizedUsername)
      .single()
    
    const data = profileData as Database['public']['Tables']['profiles']['Row'] | null

    if (error || !data) {
      console.error('Error fetching profile by username:', error)
      return { error: 'Profile not found' }
    }

    // Get user stats
    const { data: stats, error: statsError } = await (supabase as any).rpc('get_user_stats', {
      p_user_id: data.id,
    })

    if (statsError) {
      console.error('Error fetching user stats:', statsError)
    }

    // Get user badges
    const { data: badges, error: badgesError } = await supabase
      .from('user_badges')
      .select('badge_id, earned_at, badges(*)')
      .eq('user_id', data.id)

    if (badgesError) {
      console.error('Error fetching user badges:', badgesError)
    }

    return { 
      data: {
        ...data,
        stats: stats?.[0] || null,
        badges: badges || [],
      }
    }
  } catch (error) {
    console.error('Unexpected error in getProfileByUsername:', error)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}

type AvatarResult = {
  success?: boolean
  avatarUrl?: string
  error?: string
}

export async function updateAvatar(formData: FormData): Promise<AvatarResult> {
  try {
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
    const allowedTypes = FILE_UPLOAD.ALLOWED_IMAGE_TYPES as readonly string[]
    if (!allowedTypes.includes(file.type)) {
      return { error: 'File must be a valid image (JPEG, PNG, GIF, or WebP)' }
    }

    // Validate file size
    if (file.size > FILE_UPLOAD.MAX_AVATAR_SIZE) {
      const maxSizeMB = FILE_UPLOAD.MAX_AVATAR_SIZE / (1024 * 1024)
      return { error: `File must be less than ${maxSizeMB}MB` }
    }

    // Validate file extension matches MIME type
    const fileExt = file.name.split('.').pop()?.toLowerCase()

    const allowedExtensions = FILE_UPLOAD.ALLOWED_IMAGE_EXTENSIONS as readonly string[]
    if (!fileExt || !allowedExtensions.includes(fileExt)) {
      return { error: 'Invalid file extension' }
    }

    // Upload to Supabase Storage
    const fileName = `${user.id}-${Date.now()}.${fileExt}`
    const filePath = `${user.id}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type,
      })

    if (uploadError) {
      console.error('Error uploading avatar:', uploadError)
      return { error: 'Failed to upload avatar. Please try again.' }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    // Update profile with new avatar URL
    const avatarUpdateData: Database['public']['Tables']['profiles']['Update'] = {
      avatar_url: publicUrl,
    }

    const { error: updateError } = await (supabase as any)
      .from('profiles')
      .update(avatarUpdateData)
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating profile with avatar URL:', updateError)
      // Try to clean up uploaded file
      await supabase.storage.from('avatars').remove([filePath])
      return { error: 'Failed to update profile with new avatar' }
    }

    revalidatePath('/profile')
    revalidatePath('/profile/edit')
    return { success: true, avatarUrl: publicUrl }
  } catch (error) {
    console.error('Unexpected error in updateAvatar:', error)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}

