import { createClient } from '@supabase/supabase-js'
import type { Database, Profile, Item, Offer } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Helper function to get display name with fallback logic
export const getDisplayName = (profile: Profile | null): string => {
  if (!profile) return 'Unknown User'
  return profile.display_name || profile.full_name || profile.username || 'Unknown User'
}

// Re-export types for convenience
export type { Profile, Item, Offer }
