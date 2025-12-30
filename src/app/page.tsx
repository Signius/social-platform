import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center space-y-8">
        <h1 className="text-6xl font-bold tracking-tight">
          Welcome to <span className="text-primary">EventConnect</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          A community-driven platform for organizing and discovering local events
          while connecting with like-minded people.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/login">
            <Button size="lg">Get Started</Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="outline">
              Explore Events
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}

