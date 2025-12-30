import { createClient } from '@/lib/supabase/server'
import { Profile } from '@/types'

export interface MatchScore {
  userId: string
  profile: Profile
  score: number
  commonInterests: string[]
  proximityScore: number
  eventOverlap: number
}

export async function calculateMatches(
  currentUserId: string,
  limit: number = 10
): Promise<MatchScore[]> {
  const supabase = await createClient()

  // Get current user's profile
  const { data: currentUser } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', currentUserId)
    .single()

  if (!currentUser) {
    throw new Error('User not found')
  }

  // Get potential matches (exclude self and existing connections)
  const { data: existingConnections } = await supabase
    .from('connections')
    .select('requester_id, receiver_id')
    .or(`requester_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
    .eq('status', 'accepted')

  const connectedUserIds = new Set(
    existingConnections?.flatMap((c) => [c.requester_id, c.receiver_id]) || []
  )
  connectedUserIds.add(currentUserId)

  const { data: potentialMatches } = await supabase
    .from('profiles')
    .select('*')
    .not('id', 'in', `(${Array.from(connectedUserIds).join(',')})`)

  if (!potentialMatches) {
    return []
  }

  // Calculate scores for each potential match
  const scoredMatches = await Promise.all(
    potentialMatches.map(async (user) => {
      // Calculate interest similarity (Jaccard index)
      const userInterests = user.interests || []
      const currentInterests = currentUser.interests || []
      const commonInterests = userInterests.filter((i: string) =>
        currentInterests.includes(i)
      )
      const unionSize = new Set([...userInterests, ...currentInterests]).size
      const interestScore = unionSize > 0 ? commonInterests.length / unionSize : 0

      // Calculate location proximity (simplified)
      const proximityScore =
        currentUser.location === user.location ? 1 : 0.5

      // Calculate event participation overlap
      const { data: userEvents } = await supabase
        .from('event_attendees')
        .select('event_id')
        .eq('user_id', user.id)

      const { data: currentUserEvents } = await supabase
        .from('event_attendees')
        .select('event_id')
        .eq('user_id', currentUserId)

      const userEventIds = new Set(
        userEvents?.map((e) => e.event_id) || []
      )
      const currentEventIds = new Set(
        currentUserEvents?.map((e) => e.event_id) || []
      )

      const commonEvents = [...userEventIds].filter((id) =>
        currentEventIds.has(id)
      )
      const eventOverlap = commonEvents.length

      // Weight the scores
      const finalScore =
        interestScore * 0.5 +
        proximityScore * 0.3 +
        Math.min(eventOverlap / 10, 1) * 0.2

      return {
        userId: user.id,
        profile: user,
        score: finalScore,
        commonInterests,
        proximityScore,
        eventOverlap,
      }
    })
  )

  // Sort by score and return top matches
  return scoredMatches
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

