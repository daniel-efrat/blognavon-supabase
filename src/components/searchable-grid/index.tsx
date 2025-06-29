"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
} from "@/components/ui/pagination"
import { Search, X, AlertCircle, ChevronRight, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Post } from "@/lib/types"
import { debounce } from "lodash"
import { LazyMotion, domAnimation, m } from "framer-motion"
import { PostCard } from "./post-card"

interface DebugInfo {
  allPostsCount: number
  filteredPostsCount: number
  currentPage: number
  totalPages: number
  searchQuery: string
  timeLastUpdated: string
}

interface SearchableGridProps {
  initialPosts?: Post[]
  postsPerPage?: number
  showDevTools?: boolean
  onDebugInfoUpdate?: (debugInfo: DebugInfo) => void
}

export default function SearchableGrid({
  initialPosts = [],
  postsPerPage = 12,
  showDevTools = false,
  onDebugInfoUpdate = () => {},
}: SearchableGridProps) {
  // Core state
  const [allPosts, setAllPosts] = useState<Post[]>([])
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  // UI state
  const [isLoading, setIsLoading] = useState(true)
  const [error] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  // Debug state
  const [debugInfo, setDebugInfo] = useState({
    allPostsCount: 0,
    filteredPostsCount: 0,
    currentPage: 1,
    totalPages: 1,
    searchQuery: "",
    timeLastUpdated: "",
  })

  // Safe debug info update that won't cause render cycles
  const updateDebugInfo = useCallback((all: Post[], filtered: Post[], page: number, query: string) => {
    if (!showDevTools) return;
    
    const debugData = {
      allPostsCount: all.length,
      filteredPostsCount: filtered.length,
      currentPage: page,
      totalPages: Math.ceil(filtered.length / postsPerPage),
      searchQuery: query,
      timeLastUpdated: new Date().toISOString(),
    }
    setDebugInfo(debugData)
    onDebugInfoUpdate(debugData)
  }, [showDevTools, postsPerPage, onDebugInfoUpdate])

  // Load posts when initialPosts changes
  useEffect(() => {
    // Skip if initialPosts is empty (prevent unnecessary loading)
    if (!initialPosts?.length) return;

    console.log("[SearchableGrid] Using provided posts:", initialPosts.length)
    setAllPosts(initialPosts)
    setFilteredPosts(initialPosts)
    setIsLoading(false)

    updateDebugInfo(initialPosts, initialPosts, 1, "")
  }, [initialPosts, updateDebugInfo])

  // Handle search input change with debounce
  const debouncedSearch = useMemo(
    () =>
      debounce((query: string) => {
        console.log('[SearchableGrid] Searching for:', query)

        if (!query.trim()) {
          // If search is cleared, show all posts
          console.log('[SearchableGrid] Empty search, showing all posts:', allPosts.length)
          setFilteredPosts(allPosts)
          updateDebugInfo(allPosts, allPosts, 1, "")
          setCurrentPage(1)
          return
        }

        const lowerQuery = query.toLowerCase()
        const results = allPosts.filter((post) => {
          const title = post.title?.toLowerCase() || ""
          const excerpt = post.excerpt?.toLowerCase() || ""
          const content = post.content?.toLowerCase() || ""

          return (
            title.includes(lowerQuery) ||
            excerpt.includes(lowerQuery) ||
            content.includes(lowerQuery)
          )
        })

        console.log('[SearchableGrid] Search results:', results.length)

        // Explicitly force a render by creating a new array
        setFilteredPosts([...results])
        setCurrentPage(1) // Reset to first page on new search
        updateDebugInfo(allPosts, results, 1, query)
      }, 300),
    [allPosts, updateDebugInfo]
  )

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value
    console.log('[SearchableGrid] Search input changed:', newQuery)
    setSearchQuery(newQuery)
    debouncedSearch(newQuery)
  }

  // Clear search
  const handleClearSearch = () => {
    console.log('[SearchableGrid] Clearing search')
    setSearchQuery("")
    setFilteredPosts([...allPosts]) // Force a new array reference
    setCurrentPage(1)
    updateDebugInfo(allPosts, allPosts, 1, "")
  }

  // Calculate pagination - use useMemo to avoid recalculating on every render
  const { totalPages, currentPosts } = useMemo(() => {
    console.log('[SearchableGrid] Calculating pagination:', filteredPosts.length)
    const totalPages = Math.ceil(filteredPosts.length / postsPerPage)
    const startIndex = (currentPage - 1) * postsPerPage
    const currentPosts = filteredPosts.slice(
      startIndex,
      startIndex + postsPerPage
    )
    return { totalPages, currentPosts }
  }, [filteredPosts, currentPage, postsPerPage])

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    updateDebugInfo(allPosts, filteredPosts, page, searchQuery)
  }

  // Generate pagination items
  const renderPaginationItems = () => {
    // If fewer than 2 pages, don't show pagination
    if (totalPages <= 1) return null

    const items = []

    // Next button
    items.push(
      <PaginationItem key="next">
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            handlePageChange(Math.min(totalPages, currentPage + 1))
          }
          disabled={currentPage === totalPages}
          className="gap-1"
        >
          הבא
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </PaginationItem>
    )

    // Page numbers (RTL order)
    const pageNumbers = []
    for (let i = totalPages; i >= 1; i--) {
      // Only show current page, first, last, and pages close to current
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        pageNumbers.push(
          <PaginationItem key={i}>
            <PaginationLink
              isActive={currentPage === i}
              onClick={() => handlePageChange(i)}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        )
      } else if (
        (i === currentPage - 2 && currentPage > 3) ||
        (i === currentPage + 2 && currentPage < totalPages - 2)
      ) {
        // Add ellipsis
        pageNumbers.push(
          <PaginationItem key={`ellipsis-${i}`}>
            <PaginationEllipsis />
          </PaginationItem>
        )
      }
    }
    items.push(...pageNumbers)

    // Previous button
    items.push(
      <PaginationItem key="prev">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="gap-1"
        >
          <ChevronRight className="h-4 w-4" />
          הקודם
        </Button>
      </PaginationItem>
    )

    return items
  }

  return (
    <div className="space-y-6 " dir="rtl">
      {/* Search Bar */}
      <div className="relative w-1/2 sm:w-1/3 md:w-1/4">
        <Input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="חפש בפוסטים..."
          className="px-8 py-3 "
          dir="rtl"
        />
        <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-2 h-6 w-6 p-0"
            onClick={handleClearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search Status */}
      {searchQuery && (
        <div className="text-sm text-gray-500">
          נמצאו {filteredPosts.length} תוצאות עבור &quot;{searchQuery}&quot;
        </div>
      )}

      {/* Error Message */}
      {error && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Skeleton Loaders */}
          {Array.from({ length: postsPerPage }).map((_, i) => (
            <Card key={i} className="h-80 animate-pulse">
              <CardHeader className="h-1/3 bg-gray-200 dark:bg-gray-700" />
              <CardContent className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
              </CardContent>
              <CardFooter>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Posts Grid */}
          {currentPosts.length > 0 ? (
            <LazyMotion features={domAnimation}>
              <m.div
                initial="hidden"
                animate="show"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1,
                    },
                  },
                }}
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              >
                {currentPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </m.div>
            </LazyMotion>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {searchQuery
                  ? `לא נמצאו תוצאות עבור &quot;${searchQuery}&quot;`
                  : "אין פוסטים להצגה"}
              </p>
            </div>
          )}

          {/* Pagination */}
          <Pagination>
            <PaginationContent className="flex-row-reverse">
              {renderPaginationItems()}
            </PaginationContent>
          </Pagination>
        </>
      )}

      {/* Developer Tools */}
      {showDevTools && (
        <div className="mt-8 bg-gray-100 dark:bg-gray-800 p-4 rounded-md border border-gray-300 dark:border-gray-700">
          <h3 className="text-lg font-medium mb-2">מידע למפתחים</h3>
          <pre
            className="bg-white dark:bg-gray-900 p-4 rounded text-xs overflow-auto max-h-60 text-left"
            dir="ltr"
          >
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
