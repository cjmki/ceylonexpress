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

// ==================== Health & Safety - Cleaning Areas ====================

export enum CleaningArea {
  KITCHEN = 'kitchen',
  FRIDGE = 'fridge',
  FREEZER = 'freezer',
  STORAGE = 'storage',
  OTHER = 'other'
}

export const CLEANING_AREA_DISPLAY: Record<CleaningArea, string> = {
  [CleaningArea.KITCHEN]: 'Kitchen',
  [CleaningArea.FRIDGE]: 'Fridge',
  [CleaningArea.FREEZER]: 'Freezer',
  [CleaningArea.STORAGE]: 'Storage',
  [CleaningArea.OTHER]: 'Other'
}

export const CLEANING_AREAS = Object.values(CleaningArea)

// ==================== Health & Safety - Cleaning Frequency ====================

export enum CleaningFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  AFTER_USE = 'after_use'
}

export const CLEANING_FREQUENCY_DISPLAY: Record<CleaningFrequency, string> = {
  [CleaningFrequency.DAILY]: 'Daily',
  [CleaningFrequency.WEEKLY]: 'Weekly',
  [CleaningFrequency.MONTHLY]: 'Monthly',
  [CleaningFrequency.AFTER_USE]: 'After Use'
}

export const CLEANING_FREQUENCIES = Object.values(CleaningFrequency)

// ==================== Health & Safety - Temperature Types ====================

export enum TemperatureType {
  FRIDGE = 'fridge',
  FREEZER = 'freezer',
  COOKING = 'cooking',
  COOLING = 'cooling',
  REHEATING = 'reheating',
  HOT_HOLDING = 'hot_holding'
}

export const TEMPERATURE_TYPE_DISPLAY: Record<TemperatureType, string> = {
  [TemperatureType.FRIDGE]: 'Fridge',
  [TemperatureType.FREEZER]: 'Freezer',
  [TemperatureType.COOKING]: 'Cooking',
  [TemperatureType.COOLING]: 'Cooling',
  [TemperatureType.REHEATING]: 'Reheating',
  [TemperatureType.HOT_HOLDING]: 'Hot Holding'
}

export const TEMPERATURE_TYPES = Object.values(TemperatureType)

// ==================== Health & Safety Helper Functions ====================

/**
 * Get display name for a cleaning area
 */
export function getCleaningAreaDisplay(area: CleaningArea | string): string {
  return CLEANING_AREA_DISPLAY[area as CleaningArea] || area
}

/**
 * Get display name for a cleaning frequency
 */
export function getCleaningFrequencyDisplay(frequency: CleaningFrequency | string): string {
  return CLEANING_FREQUENCY_DISPLAY[frequency as CleaningFrequency] || frequency
}

/**
 * Get display name for a temperature type
 */
export function getTemperatureTypeDisplay(type: TemperatureType | string): string {
  return TEMPERATURE_TYPE_DISPLAY[type as TemperatureType] || type
}

/**
 * Type guard to check if a string is a valid CleaningArea
 */
export function isCleaningArea(value: string): value is CleaningArea {
  return Object.values(CleaningArea).includes(value as CleaningArea)
}

/**
 * Type guard to check if a string is a valid CleaningFrequency
 */
export function isCleaningFrequency(value: string): value is CleaningFrequency {
  return Object.values(CleaningFrequency).includes(value as CleaningFrequency)
}

/**
 * Type guard to check if a string is a valid TemperatureType
 */
export function isTemperatureType(value: string): value is TemperatureType {
  return Object.values(TemperatureType).includes(value as TemperatureType)
}
