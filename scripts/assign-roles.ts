/**
 * One-time script to assign roles via Supabase Admin API.
 *
 * Usage:
 *   npx tsx scripts/assign-roles.ts
 *
 * Before running:
 *   1. Set SUPABASE_SERVICE_ROLE_KEY in .env.development
 *      (Supabase Dashboard > Settings > API > service_role key)
 *   2. Edit ROLE_ASSIGNMENTS below with the email-to-role mapping
 *
 * After running:
 *   Sign out and sign back in so the new app_metadata is picked up.
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

function loadEnv() {
  const envPath = resolve(__dirname, '..', '.env.development')
  const contents = readFileSync(envPath, 'utf-8')
  for (const line of contents.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIndex = trimmed.indexOf('=')
    if (eqIndex === -1) continue
    const key = trimmed.slice(0, eqIndex)
    const value = trimmed.slice(eqIndex + 1)
    if (!process.env[key]) {
      process.env[key] = value
    }
  }
}

loadEnv()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
console.log("🚀 ~ serviceRoleKey:", serviceRoleKey)

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.development')
  process.exit(1)
}

if (serviceRoleKey === 'your-service-role-key-here') {
  console.error('You need to replace the placeholder SUPABASE_SERVICE_ROLE_KEY in .env.development with your actual key.')
  console.error('Find it at: Supabase Dashboard > Settings > API > service_role key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ─── CONFIGURE YOUR ROLE ASSIGNMENTS HERE ───────────────────────────
// Map email addresses to roles: 'admin' | 'kitchen_delivery'
const ROLE_ASSIGNMENTS: Record<string, string> = {
  'cvljayawardana@gmail.com': 'kitchen_delivery',
  'koshi.berni@gmail.com': 'admin',
  // 'employee@example.com': 'kitchen_delivery',
}
// ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Fetching users...\n')

  const { data: { users }, error } = await supabase.auth.admin.listUsers()

  if (error) {
    console.error('Failed to list users:', error.message)
    process.exit(1)
  }

  console.log(`Found ${users.length} user(s):\n`)

  for (const user of users) {
    const currentRole = user.app_metadata?.role ?? '(none)'
    console.log(`  ${user.email}  —  current role: ${currentRole}`)
  }

  const entries = Object.entries(ROLE_ASSIGNMENTS)
  if (entries.length === 0) {
    console.log('\nNo role assignments configured.')
    console.log('Edit ROLE_ASSIGNMENTS in scripts/assign-roles.ts, then run again.')
    return
  }

  console.log('\nAssigning roles...\n')

  for (const [email, role] of entries) {
    const user = users.find((u) => u.email === email)

    if (!user) {
      console.log(`  SKIP: ${email} — user not found`)
      continue
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      app_metadata: { role },
    })

    if (updateError) {
      console.log(`  FAIL: ${email} — ${updateError.message}`)
    } else {
      console.log(`  OK:   ${email} — role set to "${role}"`)
    }
  }

  console.log('\nDone! Sign out and sign back in to pick up the new roles.')
}

main()
