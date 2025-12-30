'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createEventSchema } from '@/lib/validations/event'
import { ZodError } from 'zod'

export async function createEvent(groupId: string, formData: FormData) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { error: 'You must be logged in to create an event' }
    }

    // Verify user is a member of the group
    const { data: membership } = await supabase
      .from('group_members')
      .select('role')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return { error: 'You must be a member of the group to create events' }
    }

    // Check subscription limits
    const { data: canCreate, error: limitError } = await supabase
      .rpc('check_subscription_limit', {
        user_id: user.id,
        limit_type: 'events'
      })

    if (limitError) {
      console.error('Error checking subscription limit:', limitError)
      return { error: 'Failed to verify subscription limits' }
    }

    if (!canCreate) {
      return { error: 'Free tier limit reached. You can only create 1 event per month. Upgrade to premium for unlimited events.' }
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

    // Validate start time is in the future
    const startTime = new Date(validatedData.startTime)
    if (startTime < new Date()) {
      return { error: 'Event start time must be in the future' }
    }

    // Validate end time is after start time if provided
    if (validatedData.endTime) {
      const endTime = new Date(validatedData.endTime)
      if (endTime <= startTime) {
        return { error: 'Event end time must be after start time' }
      }
    }

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
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.errors[0]
      return { error: `${firstError.path.join('.')}: ${firstError.message}` }
    }
    console.error('Unexpected error in createEvent:', error)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}

export async function rsvpEvent(eventId: string, status: 'going' | 'interested' | 'not_going') {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { error: 'You must be logged in to RSVP' }
    }

    // Get event details and check capacity
    const { data: event } = await supabase
      .from('events')
      .select('capacity, group_id, start_time, status')
      .eq('id', eventId)
      .single()

    if (!event) {
      return { error: 'Event not found' }
    }

    // Check if event is in the past or cancelled
    if (event.status === 'cancelled') {
      return { error: 'This event has been cancelled' }
    }

    if (new Date(event.start_time) < new Date() && event.status !== 'upcoming') {
      return { error: 'Cannot RSVP to past events' }
    }

    // Verify user is a member of the group
    const { data: membership } = await supabase
      .from('group_members')
      .select('user_id')
      .eq('group_id', event.group_id)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return { error: 'You must be a member of the group to RSVP to this event' }
    }

    // Check capacity if status is 'going'
    if (status === 'going' && event.capacity) {
      const { count } = await supabase
        .from('event_attendees')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId)
        .eq('rsvp_status', 'going')

      if (count && count >= event.capacity) {
        // Check if user already has RSVP
        const { data: existingRsvp } = await supabase
          .from('event_attendees')
          .select('rsvp_status')
          .eq('event_id', eventId)
          .eq('user_id', user.id)
          .single()

        if (!existingRsvp || existingRsvp.rsvp_status !== 'going') {
          return { error: 'This event is at full capacity' }
        }
      }
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
  } catch (error) {
    console.error('Unexpected error in rsvpEvent:', error)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}

