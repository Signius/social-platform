'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/utils/logger'
import type { Connection } from '@/types'
import type { Database } from '@/types/database'

type ActionResult = {
  success?: boolean
  error?: string
}

export async function sendConnectionRequest(receiverId: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { error: 'You must be logged in to send connection requests' }
    }

    // Validate receiverId
    if (!receiverId || typeof receiverId !== 'string') {
      return { error: 'Invalid user ID' }
    }

    if (user.id === receiverId) {
      return { error: 'You cannot connect with yourself' }
    }

    // Verify receiver exists
    const { data: receiver, error: receiverError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', receiverId)
      .single()

    if (receiverError || !receiver) {
      return { error: 'User not found' }
    }

    // Check if connection already exists (as requester)
    const { data: asRequester } = await supabase
      .from('connections')
      .select('*')
      .eq('requester_id', user.id)
      .eq('receiver_id', receiverId)
      .maybeSingle()
    
    // Check if connection already exists (as receiver)
    const { data: asReceiver } = await supabase
      .from('connections')
      .select('*')
      .eq('requester_id', receiverId)
      .eq('receiver_id', user.id)
      .maybeSingle()
    
    type ConnectionRow = Database['public']['Tables']['connections']['Row']
    const existing: ConnectionRow | null = (asRequester || asReceiver) as ConnectionRow | null

    if (existing) {
      if (existing.status === 'pending') {
        // Check who sent the request
        if (existing.requester_id === user.id) {
          return { error: 'Connection request already sent' }
        } else {
          return { error: 'This user has already sent you a connection request. Please check your pending requests.' }
        }
      }
      if (existing.status === 'accepted') {
        return { error: 'You are already connected with this user' }
      }
      if (existing.status === 'rejected') {
        // Allow resending after rejection
        const { error: deleteError } = await supabase
          .from('connections')
          .delete()
          .eq('id', existing.id)

        if (deleteError) {
          return { error: 'Failed to send connection request' }
        }
      }
    }

    const insertPayload: Database['public']['Tables']['connections']['Insert'] = {
      requester_id: user.id,
      receiver_id: receiverId,
      status: 'pending',
    }
    
    const { error } = await supabase
      .from('connections')
      .insert(insertPayload as any)

    if (error) {
      console.error('Error sending connection request:', error)
      return { error: 'Failed to send connection request' }
    }

    // TODO: Create notification for receiver

    revalidatePath('/connections')
    revalidatePath('/connections/discover')
    return { success: true }
  } catch (error) {
    console.error('Unexpected error in sendConnectionRequest:', error)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}

export async function acceptConnectionRequest(connectionId: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { error: 'You must be logged in' }
    }

    // Validate connectionId
    if (!connectionId || typeof connectionId !== 'string') {
      return { error: 'Invalid connection ID' }
    }

    // Verify user is the receiver
    const { data: connectionData, error: fetchError } = await supabase
      .from('connections')
      .select('*')
      .eq('id', connectionId)
      .single()
    
    const connection = connectionData as Database['public']['Tables']['connections']['Row'] | null

    if (fetchError || !connection) {
      return { error: 'Connection request not found' }
    }

    if (connection.receiver_id !== user.id) {
      return { error: 'You can only accept requests sent to you' }
    }

    if (connection.status === 'accepted') {
      return { error: 'Connection request already accepted' }
    }

    if (connection.status === 'rejected') {
      return { error: 'This connection request was previously rejected' }
    }

    const updatePayload: Database['public']['Tables']['connections']['Update'] = {
      status: 'accepted',
    }
    
    const result: any = await (supabase as any)
      .from('connections')
      .update(updatePayload)
      .eq('id', connectionId)
    const { error } = result

    if (error) {
      console.error('Error accepting connection request:', error)
      return { error: 'Failed to accept connection request' }
    }

    // TODO: Create notification for requester

    revalidatePath('/connections')
    return { success: true }
  } catch (error) {
    console.error('Unexpected error in acceptConnectionRequest:', error)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}

export async function rejectConnectionRequest(connectionId: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { error: 'You must be logged in' }
    }

    // Validate connectionId
    if (!connectionId || typeof connectionId !== 'string') {
      return { error: 'Invalid connection ID' }
    }

    // Verify user is the receiver
    const { data: connectionData, error: fetchError } = await supabase
      .from('connections')
      .select('*')
      .eq('id', connectionId)
      .single()
    
    const connection = connectionData as Database['public']['Tables']['connections']['Row'] | null

    if (fetchError || !connection) {
      return { error: 'Connection request not found' }
    }

    if (connection.receiver_id !== user.id) {
      return { error: 'You can only reject requests sent to you' }
    }

    if (connection.status === 'rejected') {
      return { error: 'Connection request already rejected' }
    }

    if (connection.status === 'accepted') {
      return { error: 'Cannot reject an accepted connection. Please remove the connection instead.' }
    }

    const updatePayload: Database['public']['Tables']['connections']['Update'] = {
      status: 'rejected',
    }
    
    const result: any = await (supabase as any)
      .from('connections')
      .update(updatePayload)
      .eq('id', connectionId)
    const { error } = result

    if (error) {
      console.error('Error rejecting connection request:', error)
      return { error: 'Failed to reject connection request' }
    }

    revalidatePath('/connections')
    return { success: true }
  } catch (error) {
    console.error('Unexpected error in rejectConnectionRequest:', error)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}

export async function removeConnection(connectionId: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { error: 'You must be logged in' }
    }

    // Validate connectionId
    if (!connectionId || typeof connectionId !== 'string') {
      return { error: 'Invalid connection ID' }
    }

    // Verify user is part of the connection
    const { data: connectionData, error: fetchError } = await supabase
      .from('connections')
      .select('*')
      .eq('id', connectionId)
      .single()
    
    const connection = connectionData as Database['public']['Tables']['connections']['Row'] | null

    if (fetchError || !connection) {
      return { error: 'Connection not found' }
    }

    if (connection.requester_id !== user.id && connection.receiver_id !== user.id) {
      return { error: 'You can only remove your own connections' }
    }

    if (connection.status !== 'accepted') {
      return { error: 'Can only remove accepted connections' }
    }

    const { error } = await supabase
      .from('connections')
      .delete()
      .eq('id', connectionId)

    if (error) {
      console.error('Error removing connection:', error)
      return { error: 'Failed to remove connection' }
    }

    revalidatePath('/connections')
    return { success: true }
  } catch (error) {
    console.error('Unexpected error in removeConnection:', error)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}

type ConnectionsResult = {
  data?: any[]
  error?: string
}

export async function getMyConnections(): Promise<ConnectionsResult> {
  try {
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
      console.error('Error fetching connections:', error)
      return { error: 'Failed to load connections' }
    }

    return { data: data || [] }
  } catch (error) {
    console.error('Unexpected error in getMyConnections:', error)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}

export async function getPendingRequests(): Promise<ConnectionsResult> {
  try {
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
      console.error('Error fetching pending requests:', error)
      return { error: 'Failed to load pending requests' }
    }

    return { data: data || [] }
  } catch (error) {
    console.error('Unexpected error in getPendingRequests:', error)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}

