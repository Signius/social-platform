import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatRelativeTime } from "@/lib/utils/format"

export default async function GroupDetailPage({ params }: { params: { slug: string } }) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Get group by slug
  const { data: group } = await supabase
    .from('groups')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (!group) {
    notFound()
  }

  // Check if user is a member and get their role
  const { data: membership } = await supabase
    .from('group_members')
    .select('role')
    .eq('group_id', group.id)
    .eq('user_id', user.id)
    .single()

  const isMember = !!membership
  const isAdmin = membership?.role === 'admin'
  const isModerator = membership?.role === 'moderator' || membership?.role === 'admin'

  // Get group stats
  const { data: statsData } = await supabase.rpc('get_group_stats', {
    group_id: group.id,
  })
  const stats = statsData?.[0] || null

  // Get members (limit to 12 for display)
  const { data: members } = await supabase
    .from('group_members')
    .select('user_id, role, joined_at, profiles(*)')
    .eq('group_id', group.id)
    .order('joined_at', { ascending: true })
    .limit(12)

  // Get upcoming events
  const { data: events } = await supabase
    .from('events')
    .select('*, profiles(username, full_name)')
    .eq('group_id', group.id)
    .eq('status', 'upcoming')
    .gte('start_time', new Date().toISOString())
    .order('start_time', { ascending: true })
    .limit(6)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative">
        {group.cover_image_url && (
          <div className="h-48 rounded-lg overflow-hidden bg-muted">
            <img src={group.cover_image_url} alt={group.name} className="w-full h-full object-cover" />
          </div>
        )}
        <div className={group.cover_image_url ? "mt-4" : ""}>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold">{group.name}</h1>
              <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                {group.category && <span>📁 {group.category}</span>}
                {group.location && <span>📍 {group.location}</span>}
                <span className="capitalize">🔒 {group.privacy}</span>
              </div>
            </div>
            <div className="flex gap-2">
              {isMember ? (
                <>
                  <Button variant="outline">
                    Leave Group
                  </Button>
                  {isModerator && (
                    <Link href={`/groups/${group.slug}/events/create`}>
                      <Button>Create Event</Button>
                    </Link>
                  )}
                  {isAdmin && (
                    <Link href={`/groups/${group.slug}/settings`}>
                      <Button variant="outline">Settings</Button>
                    </Link>
                  )}
                </>
              ) : (
                <Button>
                  Join Group
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      {group.description && (
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">{group.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.members_count || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.events_count || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.upcoming_events || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Upcoming Events */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Upcoming Events</h2>
            {isMember && (
              <Link href={`/groups/${group.slug}/events`}>
                <Button variant="link">View All</Button>
              </Link>
            )}
          </div>
          {events && events.length > 0 ? (
            <div className="space-y-4">
              {events.map((event) => (
                <Card key={event.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>
                          <Link href={`/events/${event.id}`} className="hover:text-primary">
                            {event.title}
                          </Link>
                        </CardTitle>
                        <CardDescription>
                          {new Date(event.start_time).toLocaleString()}
                        </CardDescription>
                      </div>
                      <Link href={`/events/${event.id}`}>
                        <Button size="sm">Details</Button>
                      </Link>
                    </div>
                  </CardHeader>
                  {event.description && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {event.description}
                      </p>
                      {event.location && (
                        <p className="text-sm text-muted-foreground mt-2">
                          📍 {event.location}
                        </p>
                      )}
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  No upcoming events yet
                </p>
                {isModerator && (
                  <div className="flex justify-center mt-4">
                    <Link href={`/groups/${group.slug}/events/create`}>
                      <Button>Create First Event</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Members */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Members</h2>
            <Link href={`/groups/${group.slug}/members`}>
              <Button variant="link">View All</Button>
            </Link>
          </div>
          <div className="space-y-2">
            {members && members.length > 0 ? (
              members.map((member: any) => (
                <Card key={member.user_id}>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {member.profiles.avatar_url ? (
                          <img 
                            src={member.profiles.avatar_url} 
                            alt={member.profiles.username} 
                            className="w-10 h-10 rounded-full object-cover" 
                          />
                        ) : (
                          member.profiles.username[0].toUpperCase()
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link 
                          href={`/profile/${member.profiles.username}`}
                          className="font-medium hover:text-primary truncate block"
                        >
                          {member.profiles.full_name || member.profiles.username}
                        </Link>
                        <p className="text-xs text-muted-foreground capitalize">
                          {member.role}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-6 text-center text-sm text-muted-foreground">
                  No members yet
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

