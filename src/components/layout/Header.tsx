'use client'

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { signOut } from "@/actions/auth"
import { MobileNav } from "./MobileNav"

export function Header() {
  const { user, loading } = useAuth()
  const router = useRouter()

  async function handleSignOut() {
    try {
      await signOut()
      // signOut action already handles redirect, no need to push
    } catch (error) {
      console.error('Error signing out:', error)
      // Fallback redirect in case of error
      router.push('/login')
    }
  }

  return (
    <header className="border-b sticky top-0 bg-background z-30">
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
              <Link href="/profile/edit" className="hidden md:block">
                <Button variant="ghost">Profile</Button>
              </Link>
              <Button variant="outline" onClick={handleSignOut} className="hidden md:flex">
                Logout
              </Button>
              <MobileNav isAuthenticated={true} />
            </>
          ) : (
            <>
              <Link href="/login" className="hidden md:block">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/register" className="hidden md:block">
                <Button>Sign Up</Button>
              </Link>
              <MobileNav isAuthenticated={false} />
            </>
          )}
        </div>
      </div>
    </header>
  )
}

