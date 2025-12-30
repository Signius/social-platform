import { createClient } from '@/lib/supabase/server'
import { REPUTATION_POINTS } from '@/lib/utils/constants'

export type ReputationAction = keyof typeof REPUTATION_POINTS

export async function updateReputation(
  userId: string,
  action: ReputationAction
): Promise<void> {
  const supabase = await createClient()
  const points = REPUTATION_POINTS[action]

  const { error } = await supabase.rpc('increment_reputation', {
    user_id: userId,
    points,
  })

  if (error) {
    console.error('Error updating reputation:', error)
    throw error
  }

  // Check for badge eligibility after reputation change
  await checkBadgeEligibility(userId)
}

async function checkBadgeEligibility(userId: string): Promise<void> {
  const supabase = await createClient()

  // Get user's current stats
  const { data: stats } = await supabase.rpc('get_user_stats', {
    user_id: userId,
  })

  if (!stats) return

  // Get user's current reputation
  const { data: profile } = await supabase
    .from('profiles')
    .select('reputation_score')
    .eq('id', userId)
    .single()

  if (!profile) return

  // Get all badges
  const { data: badges } = await supabase.from('badges').select('*')

  if (!badges) return

  // Check each badge's criteria
  for (const badge of badges) {
    const criteria = badge.criteria as any

    let eligible = false

    switch (criteria.type) {
      case 'reputation':
        eligible = profile.reputation_score >= criteria.points
        break
      case 'hosted_events':
        eligible = stats.hosted_events >= criteria.count
        break
      case 'attended_events':
        eligible = stats.attended_events >= criteria.count
        break
      case 'connections':
        eligible = stats.connections_count >= criteria.count
        break
      // Add more criteria types as needed
    }

    if (eligible) {
      // Check if user already has this badge
      const { data: existingBadge } = await supabase
        .from('user_badges')
        .select('id')
        .eq('user_id', userId)
        .eq('badge_id', badge.id)
        .single()

      if (!existingBadge) {
        // Award the badge
        await supabase.from('user_badges').insert({
          user_id: userId,
          badge_id: badge.id,
        })

        // TODO: Send notification about new badge
      }
    }
  }
}

