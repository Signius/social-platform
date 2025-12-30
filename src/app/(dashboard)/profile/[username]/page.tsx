import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Database } from "@/types/database"

export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const supabase = await createClient()
  
  const { username } = await params

  // Get profile by username
  const { data: profileData } = await (supabase as any)
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()
  
  const profile = profileData as Database['public']['Tables']['profiles']['Row'] | null

  if (!profile) {
    notFound()
  }

  // Get user stats
  const { data: statsData } = await (supabase as any).rpc('get_user_stats', {
    user_id: profile.id,
  })
  const stats = statsData?.[0] || null

  // Get user badges
  const { data: badges } = await (supabase as any)
    .from('user_badges')
    .select('badge_id, earned_at, badges(*)')
    .eq('user_id', profile.id)
    .order('earned_at', { ascending: false })

  // Check if current user is viewing their own profile
  const { data: { user } } = await supabase.auth.getUser()
  const isOwnProfile = user?.id === profile.id

  // Check connection status
  let connectionStatus = null
  if (user && !isOwnProfile) {
    const { data: connectionData } = await (supabase as any)
      .from('connections')
      .select('*')
      .or(`and(requester_id.eq.${user.id},receiver_id.eq.${profile.id}),and(requester_id.eq.${profile.id},receiver_id.eq.${user.id})`)
      .single()
    
    const connection = connectionData as Database['public']['Tables']['connections']['Row'] | null

    if (connection) {
      connectionStatus = connection.status
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex gap-6 items-start">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.username} className="w-24 h-24 rounded-full object-cover" />
            ) : (
              profile.username[0].toUpperCase()
            )}
          </div>
          <div>
            <h1 className="text-4xl font-bold">{profile.full_name || profile.username}</h1>
            <p className="text-muted-foreground mt-1">@{profile.username}</p>
            {profile.location && (
              <p className="text-sm text-muted-foreground mt-2">📍 {profile.location}</p>
            )}
          </div>
        </div>
        {!isOwnProfile && user && (
          <div>
            {connectionStatus === 'accepted' && (
              <Button variant="outline" disabled>
                Connected
              </Button>
            )}
            {connectionStatus === 'pending' && (
              <Button variant="outline" disabled>
                Request Sent
              </Button>
            )}
            {!connectionStatus && (
              <Button>
                Connect
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Bio */}
      {profile.bio && (
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{profile.bio}</p>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Reputation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{profile.reputation_score}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Events Hosted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.hosted_events || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Events Attended
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.attended_events || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Connections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.connections_count || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Interests */}
      {profile.interests && profile.interests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Interests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest) => (
                <span
                  key={interest}
                  className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                >
                  {interest}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Badges */}
      {badges && badges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Badges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {badges.map((userBadge: any) => (
                <div
                  key={userBadge.badge_id}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  <div className="text-3xl">{userBadge.badges.icon}</div>
                  <div>
                    <p className="font-semibold">{userBadge.badges.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {userBadge.badges.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

