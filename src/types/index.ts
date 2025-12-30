import { Database } from './database'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Group = Database['public']['Tables']['groups']['Row']
export type GroupMember = Database['public']['Tables']['group_members']['Row']
export type Event = Database['public']['Tables']['events']['Row']
export type EventAttendee = Database['public']['Tables']['event_attendees']['Row']
export type Comment = Database['public']['Tables']['comments']['Row']
export type Connection = Database['public']['Tables']['connections']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type Badge = Database['public']['Tables']['badges']['Row']
export type UserBadge = Database['public']['Tables']['user_badges']['Row']
export type Subscription = Database['public']['Tables']['subscriptions']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']

export type SubscriptionTier = 'free' | 'premium'
export type GroupPrivacy = 'public' | 'private' | 'invite_only'
export type GroupMemberRole = 'admin' | 'moderator' | 'member'
export type RSVPStatus = 'going' | 'interested' | 'not_going'
export type EventStatus = 'upcoming' | 'completed' | 'cancelled'
export type ConnectionStatus = 'pending' | 'accepted' | 'rejected'

export interface GroupWithMembers extends Group {
  member_count?: number
  is_member?: boolean
  user_role?: GroupMemberRole
}

export interface EventWithDetails extends Event {
  group?: Group
  creator?: Profile
  attendee_count?: number
  user_rsvp?: RSVPStatus
}

export interface ProfileWithStats extends Profile {
  hosted_events?: number
  attended_events?: number
  badges?: Badge[]
}

