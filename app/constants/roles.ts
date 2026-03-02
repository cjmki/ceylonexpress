export type UserRole = 'admin' | 'kitchen_delivery'

export type Permission =
  | 'view_dashboard_stats'
  | 'view_statistics'
  | 'view_orders'
  | 'manage_orders'
  | 'view_menu'
  | 'manage_menu'
  | 'view_kitchen'
  | 'view_delivery'
  | 'view_health_safety'

const ALL_PERMISSIONS: Permission[] = [
  'view_dashboard_stats',
  'view_statistics',
  'view_orders',
  'manage_orders',
  'view_menu',
  'manage_menu',
  'view_kitchen',
  'view_delivery',
  'view_health_safety',
]

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: ALL_PERMISSIONS,
  kitchen_delivery: [
    'view_orders',
    'view_kitchen',
    'view_delivery',
    'view_health_safety',
  ],
}

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  kitchen_delivery: 'Kitchen & Delivery',
}

export function hasPermission(role: UserRole | undefined, permission: Permission): boolean {
  if (!role) return false
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

export function isValidRole(value: unknown): value is UserRole {
  return typeof value === 'string' && value in ROLE_PERMISSIONS
}

export function getRoleLabel(role: UserRole | undefined): string {
  if (!role) return 'Unknown'
  return ROLE_LABELS[role] ?? 'Unknown'
}
