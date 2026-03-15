'use server'

import { createServerSupabaseClient } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth/middleware'
import {
  safeValidate,
  applyMenuUpdatesSchema,
  scheduleMenuUpdateSchema,
  cancelScheduledUpdateSchema,
  deleteScheduledUpdateSchema,
  type MenuUpdateItem,
} from '@/lib/validations'

/**
 * Apply menu updates immediately: set menu_items.available and has_limited_availability,
 * and upsert availability slots for all selected items.
 */
export async function applyMenuUpdatesNow(items: MenuUpdateItem[]) {
  try {
    await requireAuth()

    const validation = safeValidate(applyMenuUpdatesSchema, { items })
    if (!validation.success) {
      return { success: false, error: validation.error }
    }

    const serverClient = createServerSupabaseClient()

    for (const item of validation.data.items) {
      await serverClient
        .from('menu_items')
        .update({ available: true, has_limited_availability: true })
        .eq('id', item.menu_item_id)

      const slots = item.dates.map((date) => ({
        menu_item_id: item.menu_item_id,
        available_date: date,
        max_orders: item.max_orders,
        current_orders: 0,
        is_active: true,
      }))

      const { error: upsertError } = await serverClient
        .from('menu_item_availability')
        .upsert(slots, {
          onConflict: 'menu_item_id,available_date',
          ignoreDuplicates: false,
        })

      if (upsertError) throw upsertError
    }

    return {
      success: true,
      message: `Applied updates for ${validation.data.items.length} menu item(s).`,
    }
  } catch (error) {
    console.error('Failed to apply menu updates:', error)
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { success: false, error: 'Authentication required. Please log in.' }
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to apply menu updates',
    }
  }
}

/**
 * Schedule a menu update to run at a future time (processed by pg_cron).
 */
export async function scheduleMenuUpdate(
  items: MenuUpdateItem[],
  scheduledFor: string,
  notes?: string
) {
  try {
    const user = await requireAuth()

    const validation = safeValidate(scheduleMenuUpdateSchema, {
      items,
      scheduledFor,
      notes,
    })
    if (!validation.success) {
      return { success: false, error: validation.error }
    }

    const serverClient = createServerSupabaseClient()

    const payload = {
      scheduled_for: validation.data.scheduledFor,
      status: 'pending',
      created_by: user.id,
      notes: validation.data.notes ?? null,
      items: validation.data.items.map((i) => ({
        menu_item_id: i.menu_item_id,
        menu_item_name: i.menu_item_name,
        max_orders: i.max_orders,
        dates: i.dates,
      })),
    }

    const { error } = await serverClient.from('scheduled_menu_updates').insert(payload)

    if (error) throw error

    return {
      success: true,
      message: `Scheduled update for ${validation.data.scheduledFor}.`,
    }
  } catch (error) {
    console.error('Failed to schedule menu update:', error)
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { success: false, error: 'Authentication required. Please log in.' }
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to schedule menu update',
    }
  }
}

/**
 * Fetch recent scheduled updates (all pending + last 10 completed/failed/cancelled).
 */
export async function getScheduledUpdates() {
  try {
    await requireAuth()

    const serverClient = createServerSupabaseClient()

    const { data: pending, error: pendingError } = await serverClient
      .from('scheduled_menu_updates')
      .select('*')
      .eq('status', 'pending')
      .order('scheduled_for', { ascending: true })

    if (pendingError) throw pendingError

    const { data: recent, error: recentError } = await serverClient
      .from('scheduled_menu_updates')
      .select('*')
      .in('status', ['completed', 'failed', 'cancelled'])
      .order('scheduled_for', { ascending: false })
      .limit(10)

    if (recentError) throw recentError

    const combined = [...(pending ?? []), ...(recent ?? [])]

    return {
      success: true,
      data: combined.map((row) => ({
        id: row.id,
        created_at: row.created_at,
        scheduled_for: row.scheduled_for,
        status: row.status,
        created_by: row.created_by,
        executed_at: row.executed_at,
        notes: row.notes,
        items: row.items as MenuUpdateItem[],
        error_message: row.error_message,
      })),
    }
  } catch (error) {
    console.error('Failed to fetch scheduled updates:', error)
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { success: false, error: 'Authentication required. Please log in.', data: [] }
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch scheduled updates',
      data: [],
    }
  }
}

/**
 * Cancel a pending scheduled update.
 */
export async function cancelScheduledUpdate(id: string) {
  try {
    await requireAuth()

    const validation = safeValidate(cancelScheduledUpdateSchema, { id })
    if (!validation.success) {
      return { success: false, error: validation.error }
    }

    const serverClient = createServerSupabaseClient()

    const { data, error } = await serverClient
      .from('scheduled_menu_updates')
      .update({ status: 'cancelled' })
      .eq('id', validation.data.id)
      .eq('status', 'pending')
      .select()
      .single()

    if (error) throw error
    if (!data) {
      return { success: false, error: 'Update not found or already processed.' }
    }

    return { success: true, message: 'Scheduled update cancelled.' }
  } catch (error) {
    console.error('Failed to cancel scheduled update:', error)
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { success: false, error: 'Authentication required. Please log in.' }
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel scheduled update',
    }
  }
}

/**
 * Permanently delete a scheduled update (any status).
 */
export async function deleteScheduledUpdate(id: string) {
  try {
    await requireAuth()

    const validation = safeValidate(deleteScheduledUpdateSchema, { id })
    if (!validation.success) {
      return { success: false, error: validation.error }
    }

    const serverClient = createServerSupabaseClient()

    const { error } = await serverClient
      .from('scheduled_menu_updates')
      .delete()
      .eq('id', validation.data.id)

    if (error) throw error

    return { success: true, message: 'Scheduled update removed.' }
  } catch (error) {
    console.error('Failed to delete scheduled update:', error)
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { success: false, error: 'Authentication required. Please log in.' }
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to remove scheduled update',
    }
  }
}
