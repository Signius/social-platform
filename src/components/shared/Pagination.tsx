'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

interface PaginationProps {
  currentPage: number
  totalPages: number
  baseUrl?: string
}

export function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    return `${baseUrl || pathname}?${params.toString()}`
  }

  if (totalPages <= 1) {
    return null
  }

  const pages = []
  const showEllipsis = totalPages > 7

  if (showEllipsis) {
    // Always show first page
    pages.push(1)

    if (currentPage > 3) {
      pages.push(-1) // Ellipsis indicator
    }

    // Show pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i)
    }

    if (currentPage < totalPages - 2) {
      pages.push(-2) // Ellipsis indicator
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages)
    }
  } else {
    // Show all pages
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {/* Previous Button */}
      {currentPage > 1 ? (
        <Link href={createPageUrl(currentPage - 1)}>
          <Button variant="outline" size="sm">
            Previous
          </Button>
        </Link>
      ) : (
        <Button variant="outline" size="sm" disabled>
          Previous
        </Button>
      )}

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {pages.map((page, index) => {
          if (page === -1 || page === -2) {
            return (
              <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                ...
              </span>
            )
          }

          return (
            <Link key={page} href={createPageUrl(page)}>
              <Button
                variant={currentPage === page ? 'default' : 'outline'}
                size="sm"
                className="w-9"
              >
                {page}
              </Button>
            </Link>
          )
        })}
      </div>

      {/* Next Button */}
      {currentPage < totalPages ? (
        <Link href={createPageUrl(currentPage + 1)}>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </Link>
      ) : (
        <Button variant="outline" size="sm" disabled>
          Next
        </Button>
      )}
    </div>
  )
}

