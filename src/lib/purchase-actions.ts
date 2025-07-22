'use server'

import { createClient } from '@supabase/supabase-js'

/**
 * Supabase client with service role key for administrative operations
 * This bypasses Row Level Security (RLS) policies
 */
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

/**
 * Server action to handle item purchases with elevated privileges
 * 
 * @param itemId - The ID of the item to purchase
 * @param buyerId - The ID of the user making the purchase
 * @returns Promise with success status and data or error message
 */
export async function purchaseItem(itemId: string, buyerId: string) {
  try {
    // Perform atomic update with conditions to prevent race conditions
    const { data, error } = await supabase
      .from('items')
      .update({ 
        is_sold: true,
        buyer_id: buyerId,
        updated_at: new Date().toISOString()
      })
      .eq('id', itemId)
      .eq('is_sold', false) // Only update if not already sold
      .select()

    if (error) {
      console.error('Purchase error:', error)
      return { 
        success: false, 
        error: 'Failed to complete purchase. Please try again.' 
      }
    }

    if (!data || data.length === 0) {
      return { 
        success: false, 
        error: 'This item has already been sold by someone else.' 
      }
    }

    return { 
      success: true, 
      data: data[0] 
    }

  } catch (error) {
    console.error('Unexpected purchase error:', error)
    return { 
      success: false, 
      error: 'An unexpected error occurred during purchase.' 
    }
  }
}
