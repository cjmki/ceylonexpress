/**
 * Application-wide enums with snake_case values for database storage
 * and display maps for frontend presentation
 */

// ==================== Menu Categories ====================

export enum MenuCategory {
  FEATURED = 'featured',
  MAINS = 'mains',
  BITES = 'bites',
  SNACKS = 'snacks',
  DRINKS = 'drinks',
  DESSERTS = 'desserts',
  SPECIALS = 'specials'
}

export const MENU_CATEGORY_DISPLAY: Record<MenuCategory, string> = {
  [MenuCategory.FEATURED]: 'Featured',
  [MenuCategory.MAINS]: 'Mains',
  [MenuCategory.SPECIALS]: 'Specials',
  [MenuCategory.SNACKS]: 'Snacks',
  [MenuCategory.DRINKS]: 'Drinks',
  [MenuCategory.DESSERTS]: 'Desserts',
  [MenuCategory.BITES]: 'Bites'
}

// Array of all menu categories in display order
export const MENU_CATEGORIES = [
  MenuCategory.FEATURED,
  MenuCategory.SPECIALS,
  MenuCategory.MAINS,
  MenuCategory.SNACKS,
  MenuCategory.DRINKS,
  MenuCategory.DESSERTS,
  MenuCategory.BITES,
] as const

// ==================== Order Status ====================

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export const ORDER_STATUS_DISPLAY: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'Pending',
  [OrderStatus.CONFIRMED]: 'Confirmed',
  [OrderStatus.COMPLETED]: 'Completed',
  [OrderStatus.CANCELLED]: 'Cancelled'
}

export const ORDER_STATUS_DISPLAY_WITH_EMOJI: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: '⏳ Pending',
  [OrderStatus.CONFIRMED]: '✅ Confirmed',
  [OrderStatus.COMPLETED]: '🎉 Completed',
  [OrderStatus.CANCELLED]: '❌ Cancelled'
}

// Array of all order statuses
export const ORDER_STATUSES = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.COMPLETED,
  OrderStatus.CANCELLED
] as const

// ==================== Delivery Methods ====================

export enum DeliveryMethod {
  DELIVERY = 'delivery',
  PICKUP = 'pickup'
}

export const DELIVERY_METHOD_DISPLAY: Record<DeliveryMethod, string> = {
  [DeliveryMethod.DELIVERY]: 'Delivery',
  [DeliveryMethod.PICKUP]: 'Pickup'
}

export const DELIVERY_METHOD_DISPLAY_WITH_EMOJI: Record<DeliveryMethod, string> = {
  [DeliveryMethod.DELIVERY]: '🚚 Delivery',
  [DeliveryMethod.PICKUP]: '🏪 Pickup'
}

// Array of all delivery methods
export const DELIVERY_METHODS = [
  DeliveryMethod.DELIVERY,
  DeliveryMethod.PICKUP
] as const

// ==================== Delivery Times ====================

export enum DeliveryTime {
  BREAKFAST = 'breakfast',
  LUNCH = 'lunch',
  DINNER = 'dinner'
}

export const DELIVERY_TIME_DISPLAY: Record<DeliveryTime, string> = {
  [DeliveryTime.BREAKFAST]: 'Breakfast',
  [DeliveryTime.LUNCH]: 'Lunch',
  [DeliveryTime.DINNER]: 'Dinner'
}

export const DELIVERY_TIME_DISPLAY_FULL: Record<DeliveryTime, string> = {
  [DeliveryTime.BREAKFAST]: 'Breakfast (8:00 AM - 10:00 AM)',
  [DeliveryTime.LUNCH]: 'Lunch (12:00 PM - 2:00 PM)',
  [DeliveryTime.DINNER]: 'Dinner (6:00 PM - 8:00 PM)'
}

// Array of all delivery times
export const DELIVERY_TIMES = [
  DeliveryTime.BREAKFAST,
  DeliveryTime.LUNCH,
  DeliveryTime.DINNER
] as const

// ==================== Helper Functions ====================

/**
 * Get display name for a menu category
 */
export function getMenuCategoryDisplay(category: MenuCategory | string): string {
  return MENU_CATEGORY_DISPLAY[category as MenuCategory] || category
}

/**
 * Get display name for an order status
 */
export function getOrderStatusDisplay(status: OrderStatus | string, withEmoji = false): string {
  if (withEmoji) {
    return ORDER_STATUS_DISPLAY_WITH_EMOJI[status as OrderStatus] || status
  }
  return ORDER_STATUS_DISPLAY[status as OrderStatus] || status
}

/**
 * Get display name for a delivery method
 */
export function getDeliveryMethodDisplay(method: DeliveryMethod | string, withEmoji = false): string {
  if (withEmoji) {
    return DELIVERY_METHOD_DISPLAY_WITH_EMOJI[method as DeliveryMethod] || method
  }
  return DELIVERY_METHOD_DISPLAY[method as DeliveryMethod] || method
}

/**
 * Get display name for a delivery time
 */
export function getDeliveryTimeDisplay(time: DeliveryTime | string, fullFormat = false): string {
  if (fullFormat) {
    return DELIVERY_TIME_DISPLAY_FULL[time as DeliveryTime] || time
  }
  return DELIVERY_TIME_DISPLAY[time as DeliveryTime] || time
}

/**
 * Type guard to check if a string is a valid MenuCategory
 */
export function isMenuCategory(value: string): value is MenuCategory {
  return Object.values(MenuCategory).includes(value as MenuCategory)
}

/**
 * Type guard to check if a string is a valid OrderStatus
 */
export function isOrderStatus(value: string): value is OrderStatus {
  return Object.values(OrderStatus).includes(value as OrderStatus)
}

/**
 * Type guard to check if a string is a valid DeliveryMethod
 */
export function isDeliveryMethod(value: string): value is DeliveryMethod {
  return Object.values(DeliveryMethod).includes(value as DeliveryMethod)
}

/**
 * Type guard to check if a string is a valid DeliveryTime
 */
export function isDeliveryTime(value: string): value is DeliveryTime {
  return Object.values(DeliveryTime).includes(value as DeliveryTime)
}
