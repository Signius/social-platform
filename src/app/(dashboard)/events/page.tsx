import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatEventDate } from "@/lib/utils/format"

export default async function EventsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Get groups user is member of
  const { data: userGroups } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('user_id', user.id)

  const groupIds = userGroups?.map(g => g.group_id) || []

  if (groupIds.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold">Events</h1>
          <p className="text-muted-foreground mt-2">Discover and attend local events</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>No Events Yet</CardTitle>
            <CardDescription>Join groups to start seeing events</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Events are created within groups. Join some groups to discover events!
            </p>
            <Link href="/groups">
              <Button>Browse Groups</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Get upcoming events from user's groups
  const { data: upcomingEvents } = await supabase
    .from('events')
    .select(`
      *,
      groups(name, slug),
      creator:created_by(username, full_name)
    `)
    .in('group_id', groupIds)
    .eq('status', 'upcoming')
    .gte('start_time', new Date().toISOString())
    .order('start_time', { ascending: true })

  // Get user's RSVPs
  const eventIds = upcomingEvents?.map(e => e.id) || []
  let userRsvps: Record<string, string> = {}
  
  if (eventIds.length > 0) {
    const { data: rsvps } = await supabase
      .from('event_attendees')
      .select('event_id, rsvp_status')
      .eq('user_id', user.id)
      .in('event_id', eventIds)
    
    rsvps?.forEach(rsvp => {
      userRsvps[rsvp.event_id] = rsvp.rsvp_status
    })
  }

  // Get attendee counts for each event
  let attendeeCounts: Record<string, number> = {}
  if (eventIds.length > 0) {
    const { data: counts } = await supabase
      .from('event_attendees')
      .select('event_id')
      .in('event_id', eventIds)
      .eq('rsvp_status', 'going')
    
    counts?.forEach(count => {
      if (!attendeeCounts[count.event_id]) {
        attendeeCounts[count.event_id] = 0
      }
      attendeeCounts[count.event_id]++
    })
  }

  // Get past events user attended
  const { data: pastEvents } = await supabase
    .from('event_attendees')
    .select(`
      event_id,
      events(
        id,
        title,
        start_time,
        location,
        groups(name, slug)
      )
    `)
    .eq('user_id', user.id)
    .eq('rsvp_status', 'going')
    .lt('events.start_time', new Date().toISOString())
    .order('events(start_time)', { ascending: false })
    .limit(5)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Events</h1>
        <p className="text-muted-foreground mt-2">Discover and attend local events</p>
      </div>

      {/* Upcoming Events */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">
          Upcoming Events {upcomingEvents && upcomingEvents.length > 0 && `(${upcomingEvents.length})`}
        </h2>
        {upcomingEvents && upcomingEvents.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.map((event) => {
              const rsvpStatus = userRsvps[event.id]
              const attendeeCount = attendeeCounts[event.id] || 0
              const spotsLeft = event.capacity ? event.capacity - attendeeCount : null
              
              return (
                <Card key={event.id} className="hover:border-primary transition-colors">
                  <CardHeader>
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="line-clamp-2">
                          <Link href={`/events/${event.id}`} className="hover:text-primary">
                            {event.title}
                          </Link>
                        </CardTitle>
                        <CardDescription className="line-clamp-1">
                          <Link href={`/groups/${event.groups.slug}`} className="hover:text-primary">
                            {event.groups.name}
                          </Link>
                        </CardDescription>
                      </div>
                      {rsvpStatus === 'going' && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          Going
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>🗓️ {formatEventDate(event.start_time, event.end_time)}</p>
                      {event.location && <p className="line-clamp-1">📍 {event.location}</p>}
                      <p>
                        👥 {attendeeCount} going
                        {spotsLeft !== null && (
                          <span className={spotsLeft === 0 ? "text-destructive" : ""}>
                            {' '}• {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left
                          </span>
                        )}
                      </p>
                    </div>
                    <Link href={`/events/${event.id}`} className="block">
                      <Button size="sm" className="w-full">
                        {rsvpStatus === 'going' ? 'View Event' : 'RSVP Now'}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground mb-4">No upcoming events in your groups</p>
              <p className="text-sm text-muted-foreground mb-4">
                Be the first to create an event!
              </p>
              <Link href="/groups">
                <Button>View My Groups</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Past Events */}
      {pastEvents && pastEvents.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Past Events</h2>
          <div className="space-y-3">
            {pastEvents.map((rsvp: any) => (
              <Card key={rsvp.event_id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <Link 
                        href={`/events/${rsvp.events.id}`}
                        className="font-medium hover:text-primary"
                      >
                        {rsvp.events.title}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {new Date(rsvp.events.start_time).toLocaleDateString()} •{' '}
                        <Link 
                          href={`/groups/${rsvp.events.groups.slug}`}
                          className="hover:text-primary"
                        >
                          {rsvp.events.groups.name}
                        </Link>
                      </p>
                    </div>
                    <Link href={`/events/${rsvp.events.id}`}>
                      <Button size="sm" variant="outline">View</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

