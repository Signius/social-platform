'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function sendConnectionRequest(receiverId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'You must be logged in to send connection requests' }
  }

  if (user.id === receiverId) {
    return { error: 'You cannot connect with yourself' }
  }

  // Check if connection already exists
  const { data: existing } = await supabase
    .from('connections')
    .select('*')
    .or(`and(requester_id.eq.${user.id},receiver_id.eq.${receiverId}),and(requester_id.eq.${receiverId},receiver_id.eq.${user.id})`)
    .single()

  if (existing) {
    if (existing.status === 'pending') {
      return { error: 'Connection request already sent' }
    }
    if (existing.status === 'accepted') {
      return { error: 'You are already connected' }
    }
  }

  const { error } = await supabase
    .from('connections')
    .insert({
      requester_id: user.id,
      receiver_id: receiverId,
      status: 'pending',
    })

  if (error) {
    return { error: error.message }
  }

  // TODO: Create notification for receiver

  revalidatePath('/connections')
  revalidatePath('/connections/discover')
  return { success: true }
}

export async function acceptConnectionRequest(connectionId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'You must be logged in' }
  }

  // Verify user is the receiver
  const { data: connection } = await supabase
    .from('connections')
    .select('*')
    .eq('id', connectionId)
    .single()

  if (!connection) {
    return { error: 'Connection request not found' }
  }

  if (connection.receiver_id !== user.id) {
    return { error: 'You can only accept requests sent to you' }
  }

  const { error } = await supabase
    .from('connections')
    .update({ status: 'accepted' })
    .eq('id', connectionId)

  if (error) {
    return { error: error.message }
  }

  // TODO: Create notification for requester

  revalidatePath('/connections')
  return { success: true }
}

export async function rejectConnectionRequest(connectionId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'You must be logged in' }
  }

  // Verify user is the receiver
  const { data: connection } = await supabase
    .from('connections')
    .select('*')
    .eq('id', connectionId)
    .single()

  if (!connection) {
    return { error: 'Connection request not found' }
  }

  if (connection.receiver_id !== user.id) {
    return { error: 'You can only reject requests sent to you' }
  }

  const { error } = await supabase
    .from('connections')
    .update({ status: 'rejected' })
    .eq('id', connectionId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/connections')
  return { success: true }
}

export async function removeConnection(connectionId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'You must be logged in' }
  }

  // Verify user is part of the connection
  const { data: connection } = await supabase
    .from('connections')
    .select('*')
    .eq('id', connectionId)
    .single()

  if (!connection) {
    return { error: 'Connection not found' }
  }

  if (connection.requester_id !== user.id && connection.receiver_id !== user.id) {
    return { error: 'You can only remove your own connections' }
  }

  const { error } = await supabase
    .from('connections')
    .delete()
    .eq('id', connectionId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/connections')
  return { success: true }
}

export async function getMyConnections() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'You must be logged in' }
  }

  const { data, error } = await supabase
    .from('connections')
    .select(`
      *,
      requester:requester_id(id, username, full_name, avatar_url, bio, location),
      receiver:receiver_id(id, username, full_name, avatar_url, bio, location)
    `)
    .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .eq('status', 'accepted')
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function getPendingRequests() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'You must be logged in' }
  }

  const { data, error } = await supabase
    .from('connections')
    .select(`
      *,
      requester:requester_id(id, username, full_name, avatar_url, bio, location)
    `)
    .eq('receiver_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message }
  }

  return { data }
}

