import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-primary">
          EventConnect
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/dashboard" className="hover:text-primary">
            Dashboard
          </Link>
          <Link href="/groups" className="hover:text-primary">
            Groups
          </Link>
          <Link href="/events" className="hover:text-primary">
            Events
          </Link>
          <Link href="/connections" className="hover:text-primary">
            Connections
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link href="/register">
            <Button>Sign Up</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

