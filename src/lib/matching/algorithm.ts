import { createClient } from '@/lib/supabase/server'
import { Profile } from '@/types'
import { MATCHING_WEIGHTS } from '@/lib/utils/constants'

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
  const { data: currentUser, error: userError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', currentUserId)
    .single()

  if (userError || !currentUser) {
    throw new Error('User not found')
  }

  // Get existing connections to exclude (fixed SQL injection risk)
  const { data: existingConnections } = await supabase
    .from('connections')
    .select('requester_id, receiver_id')
    .or(`requester_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
    .eq('status', 'accepted')

  const connectedUserIds = new Set(
    existingConnections?.flatMap((c) => [c.requester_id, c.receiver_id]) || []
  )
  connectedUserIds.add(currentUserId)

  // Get potential matches - Fixed: Use array parameter instead of string interpolation
  const connectedUserIdsArray = Array.from(connectedUserIds)
  const { data: potentialMatches, error: matchesError } = await supabase
    .from('profiles')
    .select('*')
    .not('id', 'in', `(${connectedUserIdsArray.map(() => '?').join(',')})`)

  // If the above doesn't work with Supabase, use filter method instead
  const { data: allProfiles } = await supabase
    .from('profiles')
    .select('*')

  if (!allProfiles) {
    return []
  }

  // Filter out connected users in JavaScript
  const filteredMatches = allProfiles.filter(
    (profile) => !connectedUserIds.has(profile.id)
  )

  if (filteredMatches.length === 0) {
    return []
  }

  // OPTIMIZATION: Fetch ALL event attendance data in bulk (reduces N+2 to 2 queries)
  const allUserIds = filteredMatches.map((u) => u.id)
  allUserIds.push(currentUserId)

  const { data: allEventAttendances } = await supabase
    .from('event_attendees')
    .select('user_id, event_id')
    .in('user_id', allUserIds)

  // Build a map of user_id -> Set of event_ids for O(1) lookup
  const eventsByUser = new Map<string, Set<string>>()
  allEventAttendances?.forEach((attendance) => {
    if (!eventsByUser.has(attendance.user_id)) {
      eventsByUser.set(attendance.user_id, new Set())
    }
    eventsByUser.get(attendance.user_id)?.add(attendance.event_id)
  })

  const currentUserEvents = eventsByUser.get(currentUserId) || new Set()

  // Calculate scores for each potential match (now without additional queries)
  const scoredMatches = filteredMatches.map((user) => {
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
      currentUser.location && user.location && currentUser.location === user.location ? 1 : 0.5

    // Calculate event participation overlap (using pre-fetched data)
    const userEvents = eventsByUser.get(user.id) || new Set()
    const commonEvents = [...userEvents].filter((eventId) =>
      currentUserEvents.has(eventId)
    )
    const eventOverlap = commonEvents.length

    // Weight the scores using constants
    const finalScore =
      interestScore * MATCHING_WEIGHTS.INTEREST_SIMILARITY +
      proximityScore * MATCHING_WEIGHTS.LOCATION_PROXIMITY +
      Math.min(eventOverlap / MATCHING_WEIGHTS.MAX_EVENT_OVERLAP_SCORE, 1) * MATCHING_WEIGHTS.EVENT_OVERLAP

    return {
      userId: user.id,
      profile: user,
      score: finalScore,
      commonInterests,
      proximityScore,
      eventOverlap,
    }
  })

  // Sort by score and return top matches
  return scoredMatches
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

