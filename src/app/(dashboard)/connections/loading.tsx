import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function ConnectionsLoading() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="flex justify-between items-center">
        <div>
          <div className="h-10 bg-muted animate-pulse rounded w-40 mb-2" />
          <div className="h-5 bg-muted animate-pulse rounded w-64" />
        </div>
        <div className="h-10 bg-muted animate-pulse rounded w-40" />
      </div>

      {/* Connections grid skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="h-5 bg-muted animate-pulse rounded w-32 mb-2" />
                  <div className="h-4 bg-muted animate-pulse rounded w-24" />
                </div>
                <div className="h-6 bg-muted animate-pulse rounded w-16" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-12 bg-muted animate-pulse rounded" />
              <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
              <div className="flex gap-2">
                <div className="h-8 bg-muted animate-pulse rounded flex-1" />
                <div className="h-8 bg-muted animate-pulse rounded flex-1" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

