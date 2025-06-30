'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { ShoppingBag } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase, Profile } from '@/lib/supabase'

export default function Navigation() {
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  useEffect(() => {
    // Get search query from URL params
    const query = searchParams?.get('search') || ''
    setSearchQuery(query)
  }, [searchParams])

  const fetchProfile = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist yet, that's okay
          console.log('Profile not found, will be created on next login')
        } else {
          console.warn('Profile fetch error:', error.message || 'Unknown error')
        }
        return
      }

      setProfile(data)
    } catch (error) {
      console.warn('Error fetching profile:', error instanceof Error ? error.message : 'Unknown error')
    }
  }

  const handleSignOut = () => {
    signOut()
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/browse?search=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      router.push('/browse')
    }
  }

  return (
    <header>
      <div className="logo">
        <Link href="/">
          <ShoppingBag className="h-6 w-6 text-green-500 inline mr-3" />
          <span>Joynest</span>
        </Link>
      </div>

      {/* Search Container */}
      <div className="search-container">
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
      </div>

      {/* Navigation */}
      <nav>
        <ul>
          <li>
            <Link href="/browse">Browse</Link>
          </li>
          {user && (
            <li>
              <Link href="/items/new">Sell</Link>
            </li>
          )}
          {user ? (
            <>
              <li>
                <Link href="/profile">
                  {profile?.username ? `@${profile.username}` : 'Profile'}
                </Link>
              </li>
              <li>
                <button
                  onClick={handleSignOut}
                  className="sign-out"
                >
                  Sign Out
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link href="/auth/login">Login</Link>
              </li>
              <li>
                <button
                  onClick={() => router.push('/auth/register')}
                >
                  Sign Up
                </button>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  )
}
