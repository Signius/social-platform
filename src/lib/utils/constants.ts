export const SUBSCRIPTION_LIMITS = {
  free: {
    maxGroups: 3,
    maxEventsPerMonth: 1,
    canMessage: false,
    priorityMatching: false,
    customBadges: false,
  },
  premium: {
    maxGroups: Infinity,
    maxEventsPerMonth: Infinity,
    canMessage: true,
    priorityMatching: true,
    customBadges: true,
  },
} as const

export const REPUTATION_POINTS = {
  HOST_EVENT: 10,
  ATTEND_EVENT: 5,
  COMPLETE_EVENT: 15,
  RECEIVE_5_STAR: 20,
  RECEIVE_4_STAR: 10,
  RECEIVE_3_STAR: 5,
  RECEIVE_2_STAR: -5,
  RECEIVE_1_STAR: -10,
  CREATE_GROUP: 25,
  HELPFUL_COMMENT: 2,
  CANCEL_EVENT: -5,
  NO_SHOW: -10,
} as const

export const EVENT_DIFFICULTY_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
] as const

export const GROUP_CATEGORIES = [
  'Sports & Fitness',
  'Technology',
  'Arts & Culture',
  'Food & Drink',
  'Outdoor & Adventure',
  'Games',
  'Education',
  'Music',
  'Business',
  'Health & Wellness',
  'Social',
  'Other',
] as const

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'EventConnect'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// Matching algorithm weights
export const MATCHING_WEIGHTS = {
  INTEREST_SIMILARITY: 0.5,
  LOCATION_PROXIMITY: 0.3,
  EVENT_OVERLAP: 0.2,
  MAX_EVENT_OVERLAP_SCORE: 10,
} as const

// File upload limits
export const FILE_UPLOAD = {
  MAX_AVATAR_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_GROUP_COVER_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_IMAGE_EXTENSIONS: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
} as const

// Profile limits
export const PROFILE_LIMITS = {
  MAX_INTERESTS: 10,
  MAX_BIO_LENGTH: 500,
  MAX_USERNAME_LENGTH: 20,
  MIN_USERNAME_LENGTH: 3,
  MAX_LOCATION_LENGTH: 100,
} as const

// Event limits
export const EVENT_LIMITS = {
  MIN_TITLE_LENGTH: 3,
  MAX_TITLE_LENGTH: 200,
  MAX_DESCRIPTION_LENGTH: 2000,
  MAX_LOCATION_LENGTH: 300,
} as const

// Group limits
export const GROUP_LIMITS = {
  MIN_NAME_LENGTH: 3,
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 1000,
} as const

// Connection statuses
export const CONNECTION_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
} as const

// Event statuses
export const EVENT_STATUS = {
  UPCOMING: 'upcoming',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

// RSVP statuses
export const RSVP_STATUS = {
  GOING: 'going',
  INTERESTED: 'interested',
  NOT_GOING: 'not_going',
} as const

// Group privacy levels
export const GROUP_PRIVACY = {
  PUBLIC: 'public',
  PRIVATE: 'private',
  INVITE_ONLY: 'invite_only',
} as const

// Group roles
export const GROUP_ROLES = {
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  MEMBER: 'member',
} as const

