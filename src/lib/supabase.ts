import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export interface Profile {
  id: string
  username: string
  full_name?: string
  avatar_url?: string
  bio?: string
  created_at: string
  updated_at: string
}

export interface Item {
  id: string
  title: string
  description: string
  price: number
  image_url?: string
  user_id: string
  created_at: string
  updated_at: string
}

export interface Offer {
  id: string
  item_id: string
  user_id: string
  amount: number
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
}
