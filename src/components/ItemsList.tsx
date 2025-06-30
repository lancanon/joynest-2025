'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase, Item } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import ItemCard from '@/components/ItemCard'
import { Plus, ShoppingBag } from 'lucide-react'

export default function ItemsList() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const { user } = useAuth()
  const searchParams = useSearchParams()

  useEffect(() => {
    const query = searchParams?.get('search') || ''
    setSearchQuery(query)
    fetchItems(query)
  }, [searchParams])

  const fetchItems = async (search?: string) => {
    try {
      let query = supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false })

      // Add search functionality for title and description
      if (search && search.trim()) {
        const searchTerm = search.trim()
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      }

      const { data, error } = await query

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
      <div className="flex justify-center w-full">
        <div className="inline-flex flex-wrap justify-center gap-6 max-w-none">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 animate-pulse overflow-hidden" style={{ width: '250px', height: '300px' }}>
              <div className="h-[150px] bg-gray-200"></div>
              <div className="p-4">
                <div className="h-5 bg-gray-200 rounded mb-2"></div>
                <div className="space-y-2 mb-3">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
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
      <div className="text-center py-16">
        <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="h-12 w-12 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">No items yet</h3>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Be the first to add an item to the marketplace and start selling to our community!
        </p>
        {user ? (
          <Link
            href="/items/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-5 w-5" />
            Add Your First Item
          </Link>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">Sign in to start selling</p>
            <Link
              href="/auth/login"
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Sign In
            </Link>
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {searchQuery ? `Search Results for "${searchQuery}"` : 'Latest Items'}
        </h2>
        <p className="text-gray-600 text-sm mt-1">
          {items.length} item{items.length !== 1 ? 's' : ''} {searchQuery ? 'found' : 'available'}
        </p>
      </div>

      {/* Items Grid - Perfectly centered layout */}
      <div className="flex justify-center w-full">
        <div className="inline-flex flex-wrap justify-center gap-6 max-w-none">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  )
}
