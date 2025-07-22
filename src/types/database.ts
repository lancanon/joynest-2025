// Database types for Joynest e-commerce application

export interface Profile {
  id: string
  display_name?: string
  full_name?: string
  username?: string
  avatar_url?: string
  created_at: string
  updated_at?: string
}

export interface Item {
  id: string
  title: string
  description: string
  price: number
  image_url?: string
  category?: string
  condition?: string
  is_sold: boolean
  buyer_id?: string
  user_id: string
  created_at: string
  updated_at?: string
}

export interface Offer {
  id: string
  item_id: string
  user_id: string
  amount: number
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  updated_at?: string
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'id' | 'created_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      items: {
        Row: Item
        Insert: Omit<Item, 'id' | 'created_at'>
        Update: Partial<Omit<Item, 'id' | 'created_at'>>
      }
      offers: {
        Row: Offer
        Insert: Omit<Offer, 'id' | 'created_at'>
        Update: Partial<Omit<Offer, 'id' | 'created_at'>>
      }
    }
  }
}
