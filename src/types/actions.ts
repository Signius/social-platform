/**
 * Reusable type definitions for server actions
 */

// Standard action result type
export type ActionResult<T = void> = {
  success?: boolean
  data?: T
  error?: string
}

// Auth-specific result types
export type AuthResult = {
  success?: boolean
  error?: string
  requiresVerification?: boolean
}

// Connection result types
export type ConnectionResult = ActionResult<{
  connectionId?: string
}>

export type ConnectionsListResult = ActionResult<any[]>

// Profile result types
export type ProfileResult = ActionResult<any>

export type AvatarUploadResult = ActionResult<{
  avatarUrl: string
}>

// Group result types
export type GroupResult = ActionResult<any>

export type GroupsListResult = ActionResult<any[]>

// Event result types
export type EventResult = ActionResult<any>

export type EventsListResult = ActionResult<any[]>

// Matching result types
export type MatchingResult = ActionResult<any[]>

// Generic list result with pagination
export type PaginatedResult<T> = ActionResult<{
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}>

// Validation error type
export type ValidationError = {
  field: string
  message: string
}

export type ValidationResult = {
  success: boolean
  errors?: ValidationError[]
}

