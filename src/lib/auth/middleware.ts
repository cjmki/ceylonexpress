/**
 * Authentication middleware for server actions
 */
import { createServerSupabaseClient } from '@/lib/supabase'

/**
 * Requires user to be authenticated via Supabase
 * Use this for all admin operations
 * 
 * @throws Error if user is not authenticated
 * @returns Authenticated user object
 */
export async function requireAuth() {
  const supabase = createServerSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    throw new Error('Unauthorized: Authentication required')
  }
  
  return user
}

/**
 * Checks if user is authenticated (non-throwing version)
 * Returns null if not authenticated
 */
export async function getAuthUser() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  return user
}

/**
 * Type guard to check if user is authenticated
 */
export function isAuthenticated(user: unknown): user is { id: string; email?: string } {
  return !!user && typeof user === 'object' && 'id' in user
}
