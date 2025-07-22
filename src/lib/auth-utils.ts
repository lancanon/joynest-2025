import { supabase } from './supabase'

/**
 * Check if an error is an authentication error that requires sign out
 */
export function isAuthError(error: any): boolean {
  if (!error) return false
  
  // Check for common auth error patterns
  const authErrorCodes = [
    'PGRST301', // JWT token expired
    'PGRST302', // JWT token invalid
    'invalid_token',
    'token_expired',
    'refresh_token_not_found'
  ]
  
  const authErrorMessages = [
    'Invalid Refresh Token',
    'refresh token not found',
    'token expired',
    'invalid token',
    'JWT expired'
  ]
  
  // Check error code
  if (error.code && authErrorCodes.includes(error.code)) {
    return true
  }
  
  // Check error message
  if (error.message) {
    const message = error.message.toLowerCase()
    return authErrorMessages.some(authMsg => 
      message.includes(authMsg.toLowerCase())
    )
  }
  
  // Check error name (for AuthApiError)
  if (error.name === 'AuthApiError') {
    return true
  }
  
  return false
}

/**
 * Handle authentication errors by signing out the user
 */
export async function handleAuthError(error: any): Promise<void> {
  if (isAuthError(error)) {
    console.warn('Authentication error detected, signing out:', error.message)
    try {
      await supabase.auth.signOut({ scope: 'local' })
    } catch (signOutError) {
      console.error('Error during forced sign out:', signOutError)
    }
  }
}

/**
 * Wrapper for Supabase queries that handles auth errors automatically
 */
export async function safeSupabaseQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>
): Promise<{ data: T | null; error: any }> {
  try {
    const result = await queryFn()
    
    if (result.error && isAuthError(result.error)) {
      await handleAuthError(result.error)
    }
    
    return result
  } catch (error) {
    if (isAuthError(error)) {
      await handleAuthError(error)
    }
    return { data: null, error }
  }
}
