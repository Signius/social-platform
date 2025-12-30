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

