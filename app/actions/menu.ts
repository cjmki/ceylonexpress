'use server'

import { supabase, createServerSupabaseClient } from '@/lib/supabase'
import { formatDateForDB } from '@/lib/utils'
import { unstable_cache } from 'next/cache'

// ==================== Types ====================

export interface MenuItemAllergen {
  allergen_id: number
  allergen_name: string
  allergen_code: string
  icon_emoji: string
}

export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  image_url: string | null
  available: boolean
  includes: string[] | null
  has_limited_availability?: boolean
  pre_orders_only?: boolean
  next_available_date?: string | null
  available_slots?: number
  minimum_order_quantity?: number
  allergens: MenuItemAllergen[]
}

// ==================== Base Data (cacheable, uses anon client) ====================

/**
 * Fetch menu items + availability using anon client.
 * Safe for unstable_cache (no cookies/dynamic data).
 */
async function fetchMenuBaseData(): Promise<MenuItem[]> {
  // Step 1: Fetch all available menu items (1 query)
  const { data: menuItems, error: menuError } = await supabase
    .from('menu_items')
    .select('*')
    .eq('available', true)
    .order('category', { ascending: true })

  if (menuError) throw menuError
  if (!menuItems || menuItems.length === 0) return []

  const limitedAvailabilityItemIds = menuItems
    .filter(item => item.has_limited_availability)
    .map(item => item.id)

  // Step 2: Fetch ALL availability slots in one query
  const today = formatDateForDB(new Date())

  let availabilityData: any[] = []
  if (limitedAvailabilityItemIds.length > 0) {
    const { data, error } = await supabase
      .from('menu_item_availability')
      .select('*')
      .in('menu_item_id', limitedAvailabilityItemIds)
      .eq('is_active', true)
      .gte('available_date', today)
      .order('available_date', { ascending: true })

    if (error) {
      console.error('Error fetching availability:', error)
    } else {
      availabilityData = data || []
    }
  }

  // Build availability lookup map
  const availabilityMap = new Map<string, { next_available_date: string | null; available_slots: number }>()

  // Group slots by menu_item_id
  const slotsByItem = new Map<string, typeof availabilityData>()
  for (const slot of availabilityData) {
    const existing = slotsByItem.get(slot.menu_item_id) || []
    existing.push(slot)
    slotsByItem.set(slot.menu_item_id, existing)
  }

  // For each item, find the first available slot
  for (const [menuItemId, slots] of slotsByItem) {
    const nextAvailableSlot = slots.find(
      (slot: any) => slot.current_orders < slot.max_orders
    )

    if (nextAvailableSlot) {
      const remaining = nextAvailableSlot.max_orders - nextAvailableSlot.current_orders
      availabilityMap.set(menuItemId, {
        next_available_date: nextAvailableSlot.available_date,
        available_slots: remaining,
      })
    } else {
      availabilityMap.set(menuItemId, {
        next_available_date: null,
        available_slots: 0,
      })
    }
  }

  // Items with limited availability but no slots at all
  for (const itemId of limitedAvailabilityItemIds) {
    if (!availabilityMap.has(itemId)) {
      availabilityMap.set(itemId, {
        next_available_date: null,
        available_slots: 0,
      })
    }
  }

  // Merge availability into items (allergens added later)
  return menuItems.map(item => {
    const availability = item.has_limited_availability
      ? availabilityMap.get(item.id)
      : undefined

    return {
      ...item,
      ...(availability && {
        next_available_date: availability.next_available_date,
        available_slots: availability.available_slots,
      }),
      allergens: [], // Populated separately via server client
    }
  })
}

// ==================== Allergens (uses server client, NOT cached) ====================

/**
 * Fetch allergens for all given menu item IDs in a single batched query.
 * Uses the server Supabase client (requires cookies for RLS).
 * Cannot be inside unstable_cache.
 */
async function fetchAllAllergens(itemIds: string[]): Promise<Map<string, MenuItemAllergen[]>> {
  const allergensMap = new Map<string, MenuItemAllergen[]>()

  if (itemIds.length === 0) return allergensMap

  try {
    const serverClient = createServerSupabaseClient()

    const { data, error } = await serverClient
      .from('menu_items_with_allergens')
      .select('*')
      .in('menu_item_id', itemIds)

    if (error) {
      console.error('Error fetching allergens:', error)
      return allergensMap
    }

    if (data) {
      for (const row of data) {
        const allergens: MenuItemAllergen[] = []
        const ids = row.allergen_ids || []
        const names = row.allergen_names || []
        const codes = row.allergen_codes || []
        const icons = row.allergen_icons || []

        for (let i = 0; i < ids.length; i++) {
          if (ids[i]) {
            allergens.push({
              allergen_id: ids[i],
              allergen_name: names[i],
              allergen_code: codes[i],
              icon_emoji: icons[i],
            })
          }
        }
        allergensMap.set(row.menu_item_id, allergens)
      }
    }
  } catch (error) {
    console.error('Failed to fetch allergens:', error)
  }

  return allergensMap
}

// ==================== Cached Base Data ====================

/**
 * Cached version of menu items + availability.
 * Revalidates every 2 minutes.
 */
const getMenuBaseDataCached = unstable_cache(
  fetchMenuBaseData,
  ['menu-items-base'],
  {
    revalidate: 120,
    tags: ['menu-items'],
  }
)

// ==================== Public API ====================

/**
 * Get all menu items with availability and allergens.
 * 
 * - Menu items + availability: cached for 2 minutes (fast, uses anon client)
 * - Allergens: fetched fresh each request (single batched query, uses server client)
 */
export async function getMenuItemsCached(): Promise<MenuItem[]> {
  // Get cached base data (menu items + availability)
  const items = await getMenuBaseDataCached()

  if (items.length === 0) return items

  // Fetch allergens separately (needs server client, can't be in unstable_cache)
  const itemIds = items.map(item => item.id)
  const allergensMap = await fetchAllAllergens(itemIds)

  // Merge allergens into items
  return items.map(item => ({
    ...item,
    allergens: allergensMap.get(item.id) || [],
  }))
}

/**
 * Get menu items without cache (for real-time availability polling from client).
 * Uses anon client only (called as server action from client components).
 */
export async function getMenuItemsFresh(): Promise<MenuItem[]> {
  const items = await fetchMenuBaseData()

  if (items.length === 0) return items

  // For client-side refresh, allergens are already in the initial data
  // and rarely change, so we use the anon client as a best-effort fallback
  const itemIds = items.map(item => item.id)

  try {
    const { data, error } = await supabase
      .from('menu_items_with_allergens')
      .select('*')
      .in('menu_item_id', itemIds)

    if (!error && data) {
      const allergensMap = new Map<string, MenuItemAllergen[]>()
      for (const row of data) {
        const allergens: MenuItemAllergen[] = []
        const ids = row.allergen_ids || []
        const names = row.allergen_names || []
        const codes = row.allergen_codes || []
        const icons = row.allergen_icons || []

        for (let i = 0; i < ids.length; i++) {
          if (ids[i]) {
            allergens.push({
              allergen_id: ids[i],
              allergen_name: names[i],
              allergen_code: codes[i],
              icon_emoji: icons[i],
            })
          }
        }
        allergensMap.set(row.menu_item_id, allergens)
      }

      return items.map(item => ({
        ...item,
        allergens: allergensMap.get(item.id) || [],
      }))
    }
  } catch (err) {
    console.error('Failed to fetch allergens in refresh:', err)
  }

  return items
}
