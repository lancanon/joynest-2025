'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Navigation() {
  const { user, signOut } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist yet, that's okay
        } else {
          console.warn('Profile fetch error:', error.message || 'Unknown error')
        }
        return
      }

      // Profile fetched successfully but not stored in state since we don't use it
    } catch (error) {
      console.warn('Error fetching profile:', error instanceof Error ? error.message : 'Unknown error')
      // If it's an auth error, the user will be signed out by AuthContext
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Navigate to browse page with search query
      router.push(`/browse?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <nav style={{ backgroundColor: '#333333', height: '60px' }}>
      <div className="max-w-7xl mx-auto px-8 h-full">
        <div className="grid grid-cols-3 items-center h-full">
          <div className="flex items-center justify-start" style={{ marginLeft: '20px' }}>
            <Link href="/" className="flex items-center text-white no-underline" style={{ textDecoration: 'none', gap: '12px' }}>
              <Image
                src="/images/jnLogo.png"
                alt="Joynest Logo"
                width={32}
                height={32}
                className="object-contain"
                style={{ marginBottom: '12px' }}
              />
              <span style={{ fontSize: '1.4em', fontWeight: '500', color: 'white' }}>Joynest</span>
            </Link>
          </div>

          {/* Center - Search bar */}
          <div className="flex items-center justify-center">
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: '9px 14px',
                  borderRadius: '4px 0 0 4px',
                  border: 'none',
                  outline: 'none',
                  width: '450px',
                  fontSize: '14px'
                }}
              />
              <button 
                type="submit" 
                style={{
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  padding: '9px 18px',
                  border: 'none',
                  borderRadius: '0 4px 4px 0',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Search
              </button>
            </form>
          </div>

          {/* Right side - Navigation */}
          <div className="flex items-center justify-end" style={{ gap: '28px', marginRight: '30px' }}>
            <Link href="/browse" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold', fontSize: '17px' }}>
              Browse
            </Link>
            
            <Link href="/items/new" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold', fontSize: '17px' }}>
              Sell
            </Link>

            {user ? (
              <>
                <Link href="/profile" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold', fontSize: '17px' }}>
                  Profile
                </Link>
                <button
                  onClick={handleSignOut}
                  style={{ 
                    color: 'white', 
                    background: 'none', 
                    border: 'none', 
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '15px'
                  }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold', fontSize: '17px' }}>
                  Login
                </Link>
                <Link href="/auth/register" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold', fontSize: '17px' }}>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
