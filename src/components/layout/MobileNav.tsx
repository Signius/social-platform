'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function MobileNav({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/groups', label: 'Groups' },
    { href: '/events', label: 'Events' },
    { href: '/connections', label: 'Connections' },
  ]

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-2 rounded-md hover:bg-muted transition-colors"
        aria-label="Toggle menu"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {isOpen ? (
            <path d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <div
        className={`
          fixed top-0 right-0 h-full w-64 bg-background border-l z-50 transform transition-transform duration-300 ease-in-out md:hidden
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Close Button */}
          <div className="flex justify-between items-center p-4 border-b">
            <span className="font-bold text-primary">EventConnect</span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-md hover:bg-muted transition-colors"
              aria-label="Close menu"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto py-4">
            {isAuthenticated ? (
              <div className="space-y-1 px-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`
                      block px-4 py-3 rounded-md transition-colors
                      ${pathname === link.href 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-muted'
                      }
                    `}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="border-t my-2" />
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 rounded-md hover:bg-muted transition-colors"
                >
                  Profile
                </Link>
                <Link
                  href="/profile/edit"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 rounded-md hover:bg-muted transition-colors"
                >
                  Settings
                </Link>
              </div>
            ) : (
              <div className="space-y-2 px-2">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="block"
                >
                  <Button variant="ghost" className="w-full justify-start">
                    Login
                  </Button>
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsOpen(false)}
                  className="block"
                >
                  <Button className="w-full">Sign Up</Button>
                </Link>
              </div>
            )}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t text-xs text-muted-foreground text-center">
            © 2025 EventConnect
          </div>
        </div>
      </div>
    </>
  )
}

