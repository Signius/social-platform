import { createClient } from "@/lib/supabase/server"
import { calculateMatches } from "@/lib/matching/algorithm"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pagination } from "@/components/shared/Pagination"
import Link from "next/link"
import { redirect } from "next/navigation"

const ITEMS_PER_PAGE = 12

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const currentPage = Number(searchParams.page) || 1

  // Get user's profile to check if they have interests set
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile?.interests || profile.interests.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold">Discover People</h1>
          <p className="text-muted-foreground mt-2">
            Find like-minded people based on shared interests
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Set Up Your Profile First</CardTitle>
            <CardDescription>
              To get personalized matches, please add your interests to your profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/profile/edit">
              <Button>Complete Your Profile</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  let matches = []
  try {
    // Get more matches for pagination
    matches = await calculateMatches(user.id, 100)
  } catch (error) {
    console.error('Error calculating matches:', error)
  }

  // Pagination logic
  const totalMatches = matches.length
  const totalPages = Math.ceil(totalMatches / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedMatches = matches.slice(startIndex, endIndex)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Discover People</h1>
        <p className="text-muted-foreground mt-2">
          {totalMatches > 0 
            ? `We found ${totalMatches} people who share your interests`
            : "Find like-minded people based on shared interests"}
        </p>
      </div>

      {paginatedMatches.length === 0 && currentPage === 1 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Matches Yet</CardTitle>
            <CardDescription>
              Join some groups and attend events to get matched with like-minded people
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Link href="/groups">
                <Button>Browse Groups</Button>
              </Link>
              <Link href="/events">
                <Button variant="outline">Browse Events</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {paginatedMatches.map((match) => (
            <Card key={match.userId}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {match.profile.full_name || match.profile.username}
                    </CardTitle>
                    <CardDescription>@{match.profile.username}</CardDescription>
                  </div>
                  <div className="text-sm font-semibold text-primary">
                    {Math.round(match.score * 100)}% match
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {match.profile.bio && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {match.profile.bio}
                  </p>
                )}
                
                {match.profile.location && (
                  <p className="text-sm text-muted-foreground">
                    📍 {match.profile.location}
                  </p>
                )}

                {match.commonInterests.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">
                      {match.commonInterests.length} shared interest{match.commonInterests.length !== 1 ? 's' : ''}:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {match.commonInterests.slice(0, 3).map((interest) => (
                        <span
                          key={interest}
                          className="text-xs bg-primary/10 text-primary px-2 py-1 rounded"
                        >
                          {interest}
                        </span>
                      ))}
                      {match.commonInterests.length > 3 && (
                        <span className="text-xs text-muted-foreground px-2 py-1">
                          +{match.commonInterests.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {match.eventOverlap > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Attended {match.eventOverlap} event{match.eventOverlap !== 1 ? 's' : ''} together
                  </p>
                )}

                <div className="flex gap-2 pt-2">
                  <Link href={`/profile/${match.profile.username}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      View Profile
                    </Button>
                  </Link>
                  <Button size="sm" className="flex-1">
                    Connect
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
        />
      </>
    )}
    </div>
  )
}

