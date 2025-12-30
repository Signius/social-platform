'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createEventSchema } from '@/lib/validations/event'

export async function createEvent(groupId: string, formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'You must be logged in to create an event' }
  }

  const rawData = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    location: formData.get('location') as string,
    startTime: formData.get('startTime') as string,
    endTime: formData.get('endTime') as string,
    capacity: formData.get('capacity') ? parseInt(formData.get('capacity') as string) : undefined,
    difficultyLevel: formData.get('difficultyLevel') as string,
  }

  const validatedData = createEventSchema.parse(rawData)

  const { data, error } = await supabase
    .from('events')
    .insert({
      ...validatedData,
      group_id: groupId,
      created_by: user.id,
      start_time: validatedData.startTime,
      end_time: validatedData.endTime,
      difficulty_level: validatedData.difficultyLevel,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/groups/${groupId}`)
  revalidatePath('/events')
  return { data }
}

export async function rsvpEvent(eventId: string, status: 'going' | 'interested' | 'not_going') {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'You must be logged in to RSVP' }
  }

  const { error } = await supabase
    .from('event_attendees')
    .upsert({
      event_id: eventId,
      user_id: user.id,
      rsvp_status: status,
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/events')
  return { success: true }
}

