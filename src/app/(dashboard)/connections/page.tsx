import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ConnectionsPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Connections</h1>
          <p className="text-muted-foreground mt-2">Your network of like-minded people</p>
        </div>
        <Link href="/connections/discover">
          <Button>Discover People</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>No Connections Yet</CardTitle>
            <CardDescription>Start connecting with like-minded people</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Our matching algorithm will help you find people who share your interests.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

