import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatRelativeTime } from "@/lib/utils/format"
import type { Database } from "@/types/database"

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Get user's profile
  const { data: profileData } = await (supabase as any)
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  const profile = profileData as Database['public']['Tables']['profiles']['Row'] | null

  // Get groups count
  const { count: groupsCount } = await supabase
    .from('group_members')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  // Get upcoming events count (events user is attending)
  const { data: upcomingRsvps } = await supabase
    .from('event_attendees')
    .select('event_id, events!inner(start_time, status)')
    .eq('user_id', user.id)
    .eq('rsvp_status', 'going')
    .gte('events.start_time', new Date().toISOString())
    .eq('events.status', 'upcoming')

  const upcomingEventsCount = upcomingRsvps?.length || 0

  // Get connections count
  const { count: connectionsCount } = await supabase
    .from('connections')
    .select('*', { count: 'exact', head: true })
    .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .eq('status', 'accepted')

  // Get upcoming events details (limited to 5)
  const { data: upcomingEvents } = await supabase
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
    .gte('events.start_time', new Date().toISOString())
    .order('events(start_time)', { ascending: true })
    .limit(5)

  // Get recent activities (last 10)
  const { data: recentGroups } = await supabase
    .from('group_members')
    .select('joined_at, groups(name, slug)')
    .eq('user_id', user.id)
    .order('joined_at', { ascending: false })
    .limit(5)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back, {profile?.full_name || profile?.username}!
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Groups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{groupsCount || 0}</div>
            <p className="text-xs text-muted-foreground">Groups you're in</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingEventsCount}</div>
            <p className="text-xs text-muted-foreground">Upcoming events</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connectionsCount || 0}</div>
            <p className="text-xs text-muted-foreground">People you know</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reputation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile?.reputation_score || 0}</div>
            <p className="text-xs text-muted-foreground">Your reputation score</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Events you're attending soon</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingEvents && upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map((rsvp: any) => (
                  <div key={rsvp.event_id} className="flex justify-between items-start">
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
                ))}
                {upcomingEventsCount > 5 && (
                  <Link href="/events" className="block">
                    <Button variant="link" className="w-full">
                      View all {upcomingEventsCount} events
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground mb-4">No upcoming events</p>
                <Link href="/groups">
                  <Button variant="outline">Browse Groups</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest actions</CardDescription>
          </CardHeader>
          <CardContent>
            {recentGroups && recentGroups.length > 0 ? (
              <div className="space-y-4">
                {recentGroups.map((member: any, index: number) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-muted-foreground">•</span>
                    <div>
                      <p className="text-sm">
                        Joined{' '}
                        <Link 
                          href={`/groups/${member.groups.slug}`}
                          className="font-medium hover:text-primary"
                        >
                          {member.groups.name}
                        </Link>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeTime(member.joined_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground mb-4">No recent activity</p>
                <Link href="/groups/create">
                  <Button variant="outline">Create a Group</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

