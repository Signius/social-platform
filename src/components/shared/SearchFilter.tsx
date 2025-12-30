'use client'

import { useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface SearchFilterProps {
  placeholder?: string
  categories?: string[]
  showCategoryFilter?: boolean
}

export function SearchFilter({ 
  placeholder = "Search...", 
  categories = [],
  showCategoryFilter = false 
}: SearchFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [category, setCategory] = useState(searchParams.get('category') || 'all')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    
    if (search) {
      params.set('search', search)
    } else {
      params.delete('search')
    }

    if (category && category !== 'all') {
      params.set('category', category)
    } else {
      params.delete('category')
    }
    
    params.delete('page') // Reset to first page on search
    
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleClear = () => {
    setSearch('')
    setCategory('all')
    router.push(pathname)
  }

  const hasFilters = search || (category && category !== 'all')

  return (
    <form onSubmit={handleSearch} className="space-y-4">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder={placeholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        {showCategoryFilter && categories.length > 0 && (
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        )}
        <Button type="submit">Search</Button>
        {hasFilters && (
          <Button type="button" variant="outline" onClick={handleClear}>
            Clear
          </Button>
        )}
      </div>
    </form>
  )
}

