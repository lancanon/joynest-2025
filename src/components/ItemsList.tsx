'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase, Item } from '@/lib/supabase'
import { handleAuthError } from '@/lib/auth-utils'
import { useAuth } from '@/contexts/AuthContext'
import ItemCard from '@/components/ItemCard'
import { ShoppingBag, Search } from 'lucide-react'

interface ItemsListProps {
  selectedConditions?: string[]
  selectedCategories?: string[]
}

export default function ItemsList({ selectedConditions = [], selectedCategories = [] }: ItemsListProps) {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const { user } = useAuth()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Get search query from URL params
    const query = searchParams.get('search') || ''
    setSearchQuery(query)
    fetchItems(query)
  }, [user?.id, searchParams, selectedConditions, selectedCategories])

  const fetchItems = async (query?: string) => {
    try {
      setLoading(true)
      let supabaseQuery = supabase
        .from('items')
        .select('*')
        .eq('is_sold', false)
        .order('created_at', { ascending: false })

      // If there's a search query, filter results
      if (query && query.trim()) {
        supabaseQuery = supabaseQuery.or(
          `title.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%,condition.ilike.%${query}%`
        )
      }

      const { data, error } = await supabaseQuery

      if (error) {
        console.error('Error fetching items:', error)
        await handleAuthError(error)
        setItems([])
        return
      }

      let filteredData: Item[] = data || []

      // Apply condition filters
      if (selectedConditions.length > 0) {
        filteredData = filteredData.filter((item: Item) => 
          selectedConditions.includes(item.condition?.toLowerCase() || '')
        )
      }

      // Apply category filters
      if (selectedCategories.length > 0) {
        filteredData = filteredData.filter((item: Item) => 
          selectedCategories.includes(item.category?.toLowerCase() || '')
        )
      }

      setItems(filteredData)
    } catch (error) {
      console.error('Error:', error)
      await handleAuthError(error)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return null
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="mx-auto w-32 h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mb-8">
          {searchQuery ? (
            <Search className="h-16 w-16 text-blue-600" />
          ) : (
            <ShoppingBag className="h-16 w-16 text-blue-600" />
          )}
        </div>
        {searchQuery ? (
          <>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              No items found for &quot;{searchQuery}&quot;
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
              Try searching with different keywords or browse all items.
            </p>
            <Link
              href="/browse"
              className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-lg hover:shadow-xl"
            >
              Browse All Items
            </Link>
          </>
        ) : (
          <>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">No items yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
              Be the first to discover amazing items in our marketplace!
            </p>
            {!user && (
              <div className="space-y-4">
                <p className="text-gray-500">Sign in to start exploring</p>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-lg hover:shadow-xl"
                >
                  Sign In
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-center mb-8 mt-8">
        <div className="text-center">
          {searchQuery ? (
            <>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
                <Search className="h-6 w-6" />
                Showing Results for &quot;{searchQuery}&quot;
              </h2>
              <p className="text-gray-600 text-sm mt-2">
                {items.length} item{items.length !== 1 ? 's' : ''} found
              </p>
            </>
          ) : (
            <>
            </>
          )}
        </div>
      </div>

      {/* Items Grid - Dynamic Centered Layout */}
      <div className="flex justify-center" style={{marginTop: '60px'}}>
        <div 
          className="grid gap-6 w-full px-4"
          style={{ 
            display: 'grid', 
            gridTemplateColumns: `repeat(${Math.min(items.length, 4)}, 300px)`,
            gap: '2.5rem',
            justifyContent: 'center',
            maxWidth: '1400px'
          }}
        >
          {items.map((item) => (
            <ItemCard key={`${item.id}-${user?.id || 'anonymous'}`} item={item} />
          ))}
        </div>
      </div>
    </div>
  )
}
