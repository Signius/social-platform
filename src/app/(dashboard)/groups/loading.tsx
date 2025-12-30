import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function GroupsLoading() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="flex justify-between items-center">
        <div>
          <div className="h-10 bg-muted animate-pulse rounded w-32 mb-2" />
          <div className="h-5 bg-muted animate-pulse rounded w-64" />
        </div>
        <div className="h-10 bg-muted animate-pulse rounded w-32" />
      </div>

      {/* Groups grid skeleton */}
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded w-40" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-32 -mx-6 -mt-6 mb-4 bg-muted animate-pulse rounded-t-lg" />
                <div className="h-6 bg-muted animate-pulse rounded w-3/4 mb-2" />
                <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="h-12 bg-muted animate-pulse rounded mb-3" />
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-muted animate-pulse rounded w-24" />
                  <div className="h-8 bg-muted animate-pulse rounded w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

