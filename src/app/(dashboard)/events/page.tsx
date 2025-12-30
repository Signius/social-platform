import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function EventsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Events</h1>
        <p className="text-muted-foreground mt-2">Discover and attend local events</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>No Events Yet</CardTitle>
            <CardDescription>Events will appear here once you join groups</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Join groups to start seeing and creating events.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

