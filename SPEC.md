# EventConnect - Technical Specification

**Version**: 1.0  
**Last Updated**: December 30, 2025  
**Status**: In Development

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Features & Requirements](#features--requirements)
4. [Database Schema](#database-schema)
5. [API Design](#api-design)
6. [Authentication & Authorization](#authentication--authorization)
7. [Business Logic](#business-logic)
8. [Integration Points](#integration-points)
9. [Security Requirements](#security-requirements)
10. [Performance Requirements](#performance-requirements)

---

## Executive Summary

EventConnect is a community-driven platform for organizing and discovering local events while connecting with like-minded people. The platform combines event management, social networking, and gamification to foster meaningful connections.

### Core Value Proposition

- **For Users**: Discover events, meet people with shared interests, build reputation
- **For Event Organizers**: Easy event management, engaged community, quality attendees
- **For Communities**: Structured group management, member engagement, growth tools

---

## System Architecture

### Technology Stack

#### Frontend

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript 5+
- **Styling**: Tailwind CSS 3+ with shadcn/ui components
- **State Management**:
  - React Context for auth state
  - Zustand for complex client state
  - Server Components for data fetching
- **Forms**: React Hook Form + Zod validation
- **Date Handling**: date-fns

#### Backend

- **Runtime**: Node.js 18+
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (for images)
- **Real-time**: Supabase Realtime subscriptions
- **API**: Next.js API Routes + Server Actions

#### Infrastructure

- **Hosting**: Netlify
- **CDN**: Netlify Edge Network
- **Database**: Supabase Cloud
- **Monitoring**: Netlify Analytics + Sentry (future)
- **Email**: Resend or SendGrid (future)

#### Payments

- **Provider**: PayFast (South African payment gateway)
- **Method**: Webhook-based subscription management

### Architecture Patterns

1. **Presentation Layer**: React Server Components + Client Components
2. **Business Logic**: Server Actions + API Routes
3. **Data Access**: Supabase client (typed with generated types)
4. **State Management**: Server state (RSC) + Client state (Zustand)
5. **Authentication**: JWT tokens via Supabase Auth

---

## Features & Requirements

### 1. User Management

#### 1.1 Authentication

- **Email/Password**: Standard registration and login
- **Social Logins**: Google OAuth, Facebook OAuth (future)
- **Password Reset**: Email-based password recovery
- **Email Verification**: Required for new accounts
- **Session Management**: Automatic token refresh

#### 1.2 User Profiles

- **Basic Info**: Username, full name, email, avatar
- **Extended Info**: Bio (500 chars), location, interests (up to 10)
- **Privacy Settings**: Profile visibility, contact preferences
- **Stats Display**: Reputation score, badges, event history
- **Profile Pictures**: Image upload via Supabase Storage

#### 1.3 Reputation System

Points earned through:

- Hosting successful events: +10 points
- Attending events: +5 points
- Event completion: +15 points
- 5-star rating received: +20 points
- 1-star rating received: -10 points
- Creating groups: +25 points
- Helpful comments: +2 points
- No-show penalty: -10 points

#### 1.4 Subscription Tiers

**Free Tier**:

- Join up to 3 groups
- Create 1 event per month
- Basic profile visibility
- No direct messaging
- Standard matching priority

**Premium Tier** ($9.99/month via PayFast):

- Unlimited group membership
- Unlimited event creation
- Enhanced profile visibility
- Direct messaging enabled
- Priority in matching algorithm
- Advanced analytics dashboard
- Custom badge display

### 2. Groups

#### 2.1 Group Creation

- **Name**: 3-100 characters, must be unique slug
- **Description**: Optional, up to 1000 characters
- **Category**: Required from predefined list
- **Location**: Optional geographic location
- **Cover Image**: Optional image upload
- **Privacy**: Public, Private, or Invite-only

#### 2.2 Group Management

- **Roles**:
  - Admin: Full control (creator becomes admin automatically)
  - Moderator: Can manage members and events
  - Member: Can create events and participate
- **Member Management**: Approve/reject requests, remove members
- **Settings**: Update group details, manage roles

#### 2.3 Group Features

- Member list with role indicators
- Group-specific event feed
- Group statistics (member count, event count)
- Member activity tracking

### 3. Events

#### 3.1 Event Creation

- **Title**: 3-200 characters
- **Description**: Optional, up to 2000 characters
- **Location**: Required, up to 300 characters
- **Date/Time**: Start time required, end time optional
- **Capacity**: Optional maximum attendees
- **Difficulty Level**: Beginner, Intermediate, Advanced, Expert
- **Group Association**: Must be created within a group

#### 3.2 RSVP System

- **Status Types**:
  - Going: Committed attendance
  - Interested: Considering attendance
  - Not Going: Declined (removes from attendee list)
- **Capacity Management**: Auto-limit when full
- **Waitlist**: Future feature

#### 3.3 Event Management

- **Attendee List**: View RSVPs with status
- **Event Updates**: Notify attendees of changes
- **Event Completion**: Mark as complete, rate attendees
- **Event Cancellation**: Cancel with notification

#### 3.4 Comments

- **Threaded Comments**: Reply to comments
- **Markdown Support**: Future feature
- **Edit/Delete**: Own comments only
- **Real-time Updates**: Via Supabase Realtime

### 4. Social Features

#### 4.1 Matching Algorithm

Considers:

- **Interest Similarity**: Jaccard index of shared interests (50% weight)
- **Location Proximity**: Same location = 1.0, different = 0.5 (30% weight)
- **Event Overlap**: Common event attendance (20% weight)
- **Reputation**: Higher reputation = slight boost (future)

#### 4.2 Connections

- **Connection Requests**: Send/accept/reject
- **Connection Types**: Simple friend connection (future: followers)
- **Connection Feed**: See connections' activities (future)

#### 4.3 Messaging (Premium)

- **Direct Messages**: One-on-one text messaging
- **Message Status**: Read/unread indicators
- **Connection Required**: Can only message connections
- **Real-time Delivery**: Via Supabase Realtime

#### 4.4 Notifications

Types:

- New connection request
- Connection accepted
- Event invitation
- Event reminder (24h before)
- Event update
- Comment on your event
- Badge earned
- Group invitation

### 5. Gamification

#### 5.1 Badges

Predefined badges:

- **Early Adopter**: Joined in first month
- **Social Butterfly**: 50+ connections
- **Event Master**: Hosted 20+ events
- **Super Attendee**: Attended 50+ events
- **Group Leader**: Created 5+ groups
- **Reputation Hero**: 1000+ reputation points
- **5-Star Host**: 10+ five-star ratings
- **Community Builder**: Helped 100+ connections

#### 5.2 Leaderboards

- **Global**: Top users by reputation
- **Regional**: By location (future)
- **Group-specific**: Top contributors per group (future)
- **Time-based**: Monthly, all-time (future)

---

## Database Schema

### Core Tables

#### `profiles`

Extends Supabase auth.users with application-specific data.

```sql
- id: UUID (PK, FK to auth.users)
- username: TEXT (unique, required)
- full_name: TEXT
- avatar_url: TEXT
- bio: TEXT (max 500 chars)
- location: TEXT
- interests: TEXT[] (array, max 10)
- reputation_score: INTEGER (default 0)
- subscription_tier: TEXT (default 'free')
- subscription_expires_at: TIMESTAMP
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `groups`

```sql
- id: UUID (PK)
- name: TEXT (required)
- slug: TEXT (unique, required)
- description: TEXT
- cover_image_url: TEXT
- location: TEXT
- category: TEXT
- privacy: TEXT (public/private/invite_only)
- created_by: UUID (FK to profiles)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `group_members`

```sql
- id: UUID (PK)
- group_id: UUID (FK to groups, cascade delete)
- user_id: UUID (FK to profiles, cascade delete)
- role: TEXT (admin/moderator/member)
- joined_at: TIMESTAMP
- UNIQUE(group_id, user_id)
```

#### `events`

```sql
- id: UUID (PK)
- group_id: UUID (FK to groups, cascade delete)
- created_by: UUID (FK to profiles)
- title: TEXT (required)
- description: TEXT
- location: TEXT
- start_time: TIMESTAMP (required)
- end_time: TIMESTAMP
- capacity: INTEGER
- difficulty_level: TEXT
- status: TEXT (upcoming/completed/cancelled)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `event_attendees`

```sql
- id: UUID (PK)
- event_id: UUID (FK to events, cascade delete)
- user_id: UUID (FK to profiles, cascade delete)
- rsvp_status: TEXT (going/interested/not_going)
- attended: BOOLEAN (default false)
- rating: INTEGER (1-5, nullable)
- created_at: TIMESTAMP
- UNIQUE(event_id, user_id)
```

### Indexes

Key indexes for performance:

```sql
- profiles(username)
- profiles(subscription_tier)
- groups(slug)
- groups(category)
- group_members(group_id)
- group_members(user_id)
- events(group_id)
- events(start_time)
- events(status)
- event_attendees(event_id)
- event_attendees(user_id)
```

---

## API Design

### Server Actions (Primary)

#### Authentication

```typescript
- login(formData: FormData): Promise<{error?: string}>
- register(formData: FormData): Promise<{error?: string}>
- signOut(): Promise<void>
- resetPassword(formData: FormData): Promise<{success?: boolean, error?: string}>
```

#### Groups

```typescript
- createGroup(formData: FormData): Promise<{data?: Group, error?: string}>
- updateGroup(id: string, formData: FormData): Promise<{data?: Group, error?: string}>
- deleteGroup(id: string): Promise<{success: boolean, error?: string}>
- joinGroup(groupId: string): Promise<{success: boolean, error?: string}>
- leaveGroup(groupId: string): Promise<{success: boolean, error?: string}>
```

#### Events

```typescript
- createEvent(groupId: string, formData: FormData): Promise<{data?: Event, error?: string}>
- updateEvent(id: string, formData: FormData): Promise<{data?: Event, error?: string}>
- deleteEvent(id: string): Promise<{success: boolean, error?: string}>
- rsvpEvent(eventId: string, status: RSVPStatus): Promise<{success: boolean, error?: string}>
```

### API Routes

#### Webhooks

```
POST /api/webhooks/payfast
- Handles PayFast payment notifications
- Verifies signature
- Updates subscription status
```

#### Matching

```
GET /api/matching?userId={uuid}&limit={number}
- Returns matched users based on algorithm
- Requires authentication
```

---

## Authentication & Authorization

### Row Level Security (RLS)

All tables have RLS enabled with policies:

#### Profiles

- SELECT: Public (all profiles viewable)
- INSERT: Own profile only
- UPDATE: Own profile only

#### Groups

- SELECT: Public groups OR member of group
- INSERT: Authenticated users
- UPDATE: Group admins only
- DELETE: Group admins only

#### Events

- SELECT: Group members only
- INSERT: Group members only
- UPDATE: Event creator or group admin
- DELETE: Event creator or group admin

#### Messages

- SELECT: Sender or receiver only
- INSERT: Connection exists AND sender is self
- UPDATE: Receiver only (mark as read)

---

## Business Logic

### Subscription Limits Enforcement

```typescript
// Before creating group
if (userTier === "free") {
  const groupCount = await getGroupCount(userId);
  if (groupCount >= 3) {
    throw new Error("Free tier limit: 3 groups");
  }
}

// Before creating event
if (userTier === "free") {
  const eventCount = await getMonthlyEventCount(userId);
  if (eventCount >= 1) {
    throw new Error("Free tier limit: 1 event per month");
  }
}
```

### Reputation Updates

Triggered by:

- Event completion (runs reputation calculation)
- User rating (immediately updates both users)
- No-show detection (24h after event if RSVP=going but attended=false)

### Badge Award Logic

Checks run after:

- Reputation change
- Event attendance
- Connection acceptance
- Group creation

---

## Integration Points

### Supabase

- **Database**: PostgreSQL queries via Supabase client
- **Auth**: JWT token-based authentication
- **Storage**: Image uploads (avatars, group covers)
- **Realtime**: WebSocket subscriptions for comments and notifications

### PayFast

- **Payment Flow**:
  1. User clicks upgrade
  2. Generate payment URL with signature
  3. Redirect to PayFast
  4. User completes payment
  5. PayFast sends webhook to `/api/webhooks/payfast`
  6. Verify signature, update subscription status
- **Security**: MD5 signature verification with passphrase

---

## Security Requirements

### Data Protection

- All passwords hashed (handled by Supabase Auth)
- Environment variables for all secrets
- RLS policies on all tables
- Input validation with Zod schemas
- SQL injection protection (parameterized queries)

### API Security

- CSRF protection (Next.js built-in)
- Rate limiting (future with Netlify)
- Webhook signature verification
- JWT token validation

### Headers

```
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

---

## Performance Requirements

### Response Times

- Page load: < 3s (first contentful paint)
- API responses: < 500ms (p95)
- Database queries: < 100ms (p95)

### Scalability

- Support 10,000+ users (Phase 1)
- Support 100+ concurrent users
- Handle 1M+ database rows

### Optimization Strategies

- Server Components for zero-JS pages
- Image optimization (Next.js Image)
- Database indexes on frequent queries
- CDN caching via Netlify
- Lazy loading for heavy components

---

## Constraints & Assumptions

### Technical Constraints

- Must support modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile-responsive (mobile-first design)
- Offline support: Not required (future consideration)

### Business Constraints

- Payment processing: South Africa only (PayFast limitation)
- Email delivery: Limited by provider (100 emails/day on free tier)
- Storage: 1GB free (Supabase), then upgrade required

### Assumptions

- Users have stable internet connection
- Users have email access for verification
- Average event size: 10-50 attendees
- Average user in 2-3 groups

---

## Future Enhancements

### Phase 5+ (Post-Launch)

- Mobile app (React Native)
- Video conferencing integration
- Ticket sales integration
- Event templates
- Recurring events
- Calendar sync (Google Calendar, iCal)
- Advanced analytics
- Email digest notifications
- Social media integration
- Export attendee data
- QR code check-in

---

**Document Maintained By**: Development Team  
**Review Frequency**: Updated as features are implemented  
**Next Review**: After MVP completion
