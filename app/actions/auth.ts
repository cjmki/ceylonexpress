'use server'

import { createServerSupabaseClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { signInSchema, safeValidate } from '@/lib/validations'
import { type UserRole, isValidRole } from '../constants/roles'

export async function signIn(email: string, password: string) {
  // Validate input
  const validation = safeValidate(signInSchema, { email, password })
  
  if (!validation.success) {
    return { error: validation.error }
  }

  const supabase = createServerSupabaseClient()
  
  const { error } = await supabase.auth.signInWithPassword({
    email: validation.data.email,
    password: validation.data.password,
  })

  if (error) {
    // Generic error message to prevent user enumeration
    return { error: 'Invalid email or password' }
  }

  redirect('/admin')
}

export async function signOut() {
  const supabase = createServerSupabaseClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}

export async function getUser() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getUserWithRole(): Promise<{ user: Awaited<ReturnType<typeof getUser>>; role: UserRole | undefined }> {
  const user = await getUser()
  const rawRole = user?.app_metadata?.role
  const role = isValidRole(rawRole) ? rawRole : undefined
  return { user, role }
}
