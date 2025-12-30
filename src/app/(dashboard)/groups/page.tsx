import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SearchFilter } from "@/components/shared/SearchFilter"
import { GROUP_CATEGORIES } from "@/lib/utils/constants"
import type { Database } from "@/types/database"

export default async function GroupsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string }>
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const params = await searchParams
  const searchQuery = params.search?.toLowerCase() || ''
  const categoryFilter = params.category || 'all'

  // Get user's groups
  const { data: myGroupsData } = await (supabase as any)
    .from('group_members')
    .select(`
      role,
      joined_at,
      groups(
        id,
        name,
        slug,
        description,
        category,
        location,
        privacy,
        cover_image_url
      )
    `)
    .eq('user_id', user.id)
    .order('joined_at', { ascending: false })
  
  type GroupMembership = Pick<Database['public']['Tables']['group_members']['Row'], 'role' | 'joined_at'> & {
    groups: Pick<Database['public']['Tables']['groups']['Row'], 'id' | 'name' | 'slug' | 'description' | 'category' | 'location' | 'privacy' | 'cover_image_url'>
  }
  
  const myGroups = myGroupsData as GroupMembership[] | null

  // Get member counts for each group
  const groupIds = myGroups?.map((g: any) => g.groups.id) || []
  let groupStats: Record<string, any> = {}
  
  if (groupIds.length > 0) {
    const { data: stats } = await supabase
      .from('group_members')
      .select('group_id')
      .in('group_id', groupIds)
    
    // Count members per group
    stats?.forEach((stat: any) => {
      if (!groupStats[stat.group_id]) {
        groupStats[stat.group_id] = { memberCount: 0 }
      }
      groupStats[stat.group_id].memberCount++
    })
  }

  // Get public groups user hasn't joined
  let publicGroupsQuery = (supabase as any)
    .from('groups')
    .select('*')
    .eq('privacy', 'public')
    .not('id', 'in', groupIds.length > 0 ? `(${groupIds.join(',')})` : '(00000000-0000-0000-0000-000000000000)')
    .order('created_at', { ascending: false })
    .limit(12)

  // Apply category filter
  if (categoryFilter && categoryFilter !== 'all') {
    publicGroupsQuery = publicGroupsQuery.eq('category', categoryFilter)
  }

  const { data: allPublicGroupsData } = await publicGroupsQuery
  
  const allPublicGroups = allPublicGroupsData as Database['public']['Tables']['groups']['Row'][] | null

  // Apply search filter (client-side for simplicity)
  let publicGroups: Database['public']['Tables']['groups']['Row'][] = allPublicGroups || []
  if (searchQuery) {
    publicGroups = publicGroups.filter(group =>
      group.name.toLowerCase().includes(searchQuery) ||
      group.description?.toLowerCase().includes(searchQuery)
    )
  }

  // Filter myGroups by search
  let filteredMyGroups: GroupMembership[] = myGroups || []
  if (searchQuery) {
    filteredMyGroups = filteredMyGroups.filter((membership: any) =>
      membership.groups.name.toLowerCase().includes(searchQuery) ||
      membership.groups.description?.toLowerCase().includes(searchQuery)
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Groups</h1>
          <p className="text-muted-foreground mt-2">Discover and join interest-based groups</p>
        </div>
        <Link href="/groups/create">
          <Button>Create Group</Button>
        </Link>
      </div>

      {/* Search and Filter */}
      <SearchFilter 
        placeholder="Search groups by name or description..."
        categories={GROUP_CATEGORIES as unknown as string[]}
        showCategoryFilter={true}
      />

      {/* My Groups */}
      {filteredMyGroups && filteredMyGroups.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">My Groups ({filteredMyGroups.length})</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredMyGroups.map((membership: any) => {
              const group = membership.groups
              const stats = groupStats[group.id] || { memberCount: 0 }
              
              return (
                <Card key={group.id} className="hover:border-primary transition-colors">
                  <CardHeader>
                    {group.cover_image_url && (
                      <div className="h-32 -mx-6 -mt-6 mb-4 rounded-t-lg overflow-hidden bg-muted">
                        <img 
                          src={group.cover_image_url} 
                          alt={group.name} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    )}
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="line-clamp-1">
                          <Link href={`/groups/${group.slug}`} className="hover:text-primary">
                            {group.name}
                          </Link>
                        </CardTitle>
                        <CardDescription className="capitalize">
                          {membership.role} • {group.category}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {group.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {group.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex gap-3 text-sm text-muted-foreground">
                        <span>👥 {stats.memberCount} member{stats.memberCount !== 1 ? 's' : ''}</span>
                        {group.location && <span>📍 {group.location}</span>}
                      </div>
                      <Link href={`/groups/${group.slug}`}>
                        <Button size="sm" variant="outline">View</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Discover Groups */}
      {publicGroups && publicGroups.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Discover Groups</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {publicGroups.map((group: any) => (
              <Card key={group.id} className="hover:border-primary transition-colors">
                <CardHeader>
                  {group.cover_image_url && (
                    <div className="h-32 -mx-6 -mt-6 mb-4 rounded-t-lg overflow-hidden bg-muted">
                      <img 
                        src={group.cover_image_url} 
                        alt={group.name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  )}
                  <CardTitle className="line-clamp-1">
                    <Link href={`/groups/${group.slug}`} className="hover:text-primary">
                      {group.name}
                    </Link>
                  </CardTitle>
                  <CardDescription>{group.category}</CardDescription>
                </CardHeader>
                <CardContent>
                  {group.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {group.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    {group.location && (
                      <span className="text-sm text-muted-foreground">📍 {group.location}</span>
                    )}
                    <Link href={`/groups/${group.slug}`}>
                      <Button size="sm">Join</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {(!filteredMyGroups || filteredMyGroups.length === 0) && (!publicGroups || publicGroups.length === 0) && (
        <Card>
          <CardHeader>
            <CardTitle>No Groups Yet</CardTitle>
            <CardDescription>Start by creating or joining a group</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Groups help you connect with people who share your interests.
            </p>
            <Link href="/groups/create">
              <Button>Create Your First Group</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

