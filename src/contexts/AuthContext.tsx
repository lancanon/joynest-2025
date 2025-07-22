'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, metadata?: { username: string }) => Promise<{ error: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session with error handling
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Session error:', error)
        // If there's an error getting the session (like invalid refresh token),
        // clear any corrupted session data
        supabase.auth.signOut({ scope: 'local' })
        setUser(null)
      } else {
        setUser(session?.user ?? null)
      }
      setLoading(false)
    }).catch((error) => {
      console.error('Unexpected session error:', error)
      // Clear any corrupted session data
      supabase.auth.signOut({ scope: 'local' })
      setUser(null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Handle token refresh errors
      if (event === 'TOKEN_REFRESHED' && !session) {
        console.log('Token refresh failed, signing out')
        setUser(null)
        return
      }
      
      // Handle sign out events
      if (event === 'SIGNED_OUT') {
        setUser(null)
        setLoading(false)
        return
      }

      // Handle authentication errors
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user)
      } else if (event === 'SIGNED_IN' && !session?.user) {
        // Sign in failed
        setUser(null)
      } else {
        setUser(session?.user ?? null)
      }
      
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signUp = async (email: string, password: string, metadata?: { username: string }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata || {}
      }
    })

    // If signup was successful and we have a user, create their profile
    if (!error && data.user && metadata?.username) {
      try {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              username: metadata.username,
              display_name: metadata.username, // Use username as display name
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ])
        
        if (profileError) {
          console.error('Error creating profile:', profileError)
          // Don't return error here as the user was created successfully
          // The profile can be created later if needed
        }
      } catch (profileError) {
        console.error('Error creating profile:', profileError)
      }
    }

    return { error }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Sign out error:', error)
        // Even if there's an error, clear the local state
        setUser(null)
      }
    } catch (error) {
      console.error('Unexpected sign out error:', error)
      // Force clear the local state
      setUser(null)
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
