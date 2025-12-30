import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function GroupsPage() {
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>No Groups Yet</CardTitle>
            <CardDescription>Start by creating or joining a group</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Groups help you connect with people who share your interests.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

