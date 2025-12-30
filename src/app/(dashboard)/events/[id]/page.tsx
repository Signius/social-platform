import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatEventDate } from "@/lib/utils/format"

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Get event
  const { data: event } = await supabase
    .from('events')
    .select(`
      *,
      groups(*),
      creator:created_by(id, username, full_name, avatar_url)
    `)
    .eq('id', params.id)
    .single()

  if (!event) {
    notFound()
  }

  // Check if user is a member of the group
  const { data: membership } = await supabase
    .from('group_members')
    .select('role')
    .eq('group_id', event.group_id)
    .eq('user_id', user.id)
    .single()

  const isMember = !!membership
  const canEdit = membership?.role === 'admin' || event.created_by === user.id

  if (!isMember) {
    // User must be a group member to view events
    redirect(`/groups/${event.groups.slug}`)
  }

  // Get user's RSVP status
  const { data: userRsvp } = await supabase
    .from('event_attendees')
    .select('rsvp_status, attended, rating')
    .eq('event_id', event.id)
    .eq('user_id', user.id)
    .single()

  // Get attendees by status
  const { data: goingAttendees } = await supabase
    .from('event_attendees')
    .select('user_id, profiles(username, full_name, avatar_url)')
    .eq('event_id', event.id)
    .eq('rsvp_status', 'going')

  const { data: interestedAttendees } = await supabase
    .from('event_attendees')
    .select('user_id')
    .eq('event_id', event.id)
    .eq('rsvp_status', 'interested')

  const goingCount = goingAttendees?.length || 0
  const interestedCount = interestedAttendees?.length || 0
  const spotsLeft = event.capacity ? event.capacity - goingCount : null

  const isPast = new Date(event.start_time) < new Date()
  const isFull = event.capacity && goingCount >= event.capacity

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="text-sm text-muted-foreground mb-2">
          <Link href={`/groups/${event.groups.slug}`} className="hover:text-primary">
            {event.groups.name}
          </Link>
          {' / '}
          <span>Event</span>
        </div>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold">{event.title}</h1>
            <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
              <span>🗓️ {formatEventDate(event.start_time, event.end_time)}</span>
              {event.location && <span>📍 {event.location}</span>}
              {event.difficulty_level && (
                <span className="capitalize">⚡ {event.difficulty_level}</span>
              )}
            </div>
          </div>
          {canEdit && (
            <Link href={`/events/${event.id}/edit`}>
              <Button variant="outline">Edit Event</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Status Banner */}
      {isPast && (
        <Card className="bg-muted">
          <CardContent className="pt-6">
            <p className="text-center font-medium">This event has ended</p>
          </CardContent>
        </Card>
      )}
      {event.status === 'cancelled' && (
        <Card className="bg-destructive/10 border-destructive">
          <CardContent className="pt-6">
            <p className="text-center font-medium text-destructive">This event has been cancelled</p>
          </CardContent>
        </Card>
      )}

      {/* RSVP Section */}
      {!isPast && event.status === 'upcoming' && (
        <Card>
          <CardHeader>
            <CardTitle>RSVP Status</CardTitle>
            <CardDescription>
              {goingCount} going{interestedCount > 0 && `, ${interestedCount} interested`}
              {spotsLeft !== null && (
                <span className={spotsLeft === 0 ? "text-destructive" : ""}>
                  {' • '}{spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                variant={userRsvp?.rsvp_status === 'going' ? 'default' : 'outline'}
                disabled={isFull && userRsvp?.rsvp_status !== 'going'}
              >
                {userRsvp?.rsvp_status === 'going' ? '✓ Going' : 'Going'}
              </Button>
              <Button
                variant={userRsvp?.rsvp_status === 'interested' ? 'default' : 'outline'}
              >
                {userRsvp?.rsvp_status === 'interested' ? '✓ Interested' : 'Interested'}
              </Button>
              {userRsvp && (
                <Button variant="ghost">
                  Can't Go
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Description */}
      {event.description && (
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">{event.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Event Details */}
      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Hosted by</p>
              <Link 
                href={`/profile/${event.creator.username}`}
                className="font-medium hover:text-primary"
              >
                {event.creator.full_name || event.creator.username}
              </Link>
            </div>
            {event.capacity && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Capacity</p>
                <p className="font-medium">{event.capacity} people</p>
              </div>
            )}
            {event.difficulty_level && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Difficulty</p>
                <p className="font-medium capitalize">{event.difficulty_level}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <p className="font-medium capitalize">{event.status}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendees */}
      {goingAttendees && goingAttendees.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Attendees ({goingCount})</CardTitle>
            <CardDescription>People who are going to this event</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {goingAttendees.slice(0, 8).map((attendee: any) => (
                <div key={attendee.user_id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                    {attendee.profiles.avatar_url ? (
                      <img 
                        src={attendee.profiles.avatar_url} 
                        alt={attendee.profiles.username} 
                        className="w-10 h-10 rounded-full object-cover" 
                      />
                    ) : (
                      attendee.profiles.username[0].toUpperCase()
                    )}
                  </div>
                  <Link 
                    href={`/profile/${attendee.profiles.username}`}
                    className="font-medium hover:text-primary"
                  >
                    {attendee.profiles.full_name || attendee.profiles.username}
                  </Link>
                </div>
              ))}
            </div>
            {goingCount > 8 && (
              <p className="text-sm text-muted-foreground mt-4">
                And {goingCount - 8} more...
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Comments Section - Placeholder for now */}
      <Card>
        <CardHeader>
          <CardTitle>Discussion</CardTitle>
          <CardDescription>Comments and questions about this event</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Comments feature coming soon
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

