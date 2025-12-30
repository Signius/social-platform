import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function ProfileLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header skeleton */}
      <div className="flex justify-between items-start">
        <div className="flex gap-6 items-start">
          <div className="w-24 h-24 rounded-full bg-muted animate-pulse" />
          <div>
            <div className="h-10 bg-muted animate-pulse rounded w-48 mb-2" />
            <div className="h-5 bg-muted animate-pulse rounded w-32 mb-2" />
            <div className="h-4 bg-muted animate-pulse rounded w-40" />
          </div>
        </div>
        <div className="h-10 bg-muted animate-pulse rounded w-28" />
      </div>

      {/* Bio skeleton */}
      <Card>
        <CardHeader>
          <div className="h-6 bg-muted animate-pulse rounded w-20" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-4 bg-muted animate-pulse rounded" />
            <div className="h-4 bg-muted animate-pulse rounded w-5/6" />
          </div>
        </CardContent>
      </Card>

      {/* Stats skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted animate-pulse rounded w-20" />
            </CardHeader>
            <CardContent>
              <div className="h-10 bg-muted animate-pulse rounded w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Interests skeleton */}
      <Card>
        <CardHeader>
          <div className="h-6 bg-muted animate-pulse rounded w-24" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 bg-muted animate-pulse rounded w-24" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

