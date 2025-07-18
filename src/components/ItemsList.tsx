'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase, Item } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import ItemCard from '@/components/ItemCard'
import { Plus, ShoppingBag, Search } from 'lucide-react'

export default function ItemsList() {
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
  }, [user?.id, searchParams])

  const fetchItems = async (query?: string) => {
    try {
      let supabaseQuery = supabase
        .from('items')
        .select('*')
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
        return
      }

      setItems(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center">
        <div 
          className="grid gap-4 max-w-7xl w-full px-4"
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1rem',
            justifyItems: 'center'
          }}
        >
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 animate-pulse overflow-hidden" style={{ width: '300px', minHeight: '360px' }}>
              <div className="h-48 bg-gray-200"></div>
              <div className="p-4" style={{ display: 'flex', flexDirection: 'column', height: '160px' }}>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-px bg-gray-200 my-2"></div>
                <div className="space-y-2 mb-3 flex-1">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
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
              No items found for "{searchQuery}"
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
                Search Results for "{searchQuery}"
              </h2>
              <p className="text-gray-600 text-sm mt-2">
                {items.length} item{items.length !== 1 ? 's' : ''} found
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-900">More to explore</h2>
            </>
          )}
        </div>
      </div>

      {/* Items Grid - Centered and Modern */}
      <div className="flex justify-center">
        <div 
          className="grid gap-4 max-w-7xl w-full px-4"
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1rem',
            justifyItems: 'center'
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
