'use client'

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { signOut } from "@/actions/auth"

export function Header() {
  const { user, loading } = useAuth()
  const router = useRouter()

  async function handleSignOut() {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-primary">
          EventConnect
        </Link>
        
        {user && (
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="hover:text-primary transition-colors">
              Dashboard
            </Link>
            <Link href="/groups" className="hover:text-primary transition-colors">
              Groups
            </Link>
            <Link href="/events" className="hover:text-primary transition-colors">
              Events
            </Link>
            <Link href="/connections" className="hover:text-primary transition-colors">
              Connections
            </Link>
          </nav>
        )}

        <div className="flex items-center gap-4">
          {loading ? (
            <div className="h-9 w-24 bg-muted animate-pulse rounded" />
          ) : user ? (
            <>
              <Link href="/profile/edit">
                <Button variant="ghost">Profile</Button>
              </Link>
              <Button variant="outline" onClick={handleSignOut}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/register">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

