/**
 * Order validation schemas
 */
import { z } from 'zod'
import {
  uuidSchema,
  numericIdSchema,
  stringNumericIdSchema,
  emailSchema,
  phoneSchema,
  nameSchema,
  textSchema,
  addressSchema,
  priceSchema,
  quantitySchema,
  futureDateSchema,
  paginationSchema,
  sortOrderSchema,
} from './common.validation'
import {
  OrderStatus,
  DeliveryMethod,
  DeliveryTime,
} from '../../../app/constants/enums'
import { DELIVERY_FEE } from '../../../app/constants/currency'

/**
 * Order item validation (cart item)
 */
export const orderItemSchema = z.object({
  id: uuidSchema,
  name: nameSchema,
  price: priceSchema,
  quantity: quantitySchema,
})

/**
 * Create order validation schema
 */
export const createOrderSchema = z.object({
  customerName: nameSchema,
  customerEmail: emailSchema,
  customerPhone: phoneSchema,
  deliveryMethod: z.nativeEnum(DeliveryMethod),
  deliveryAddress: z.string().trim(),
  deliveryDate: futureDateSchema,
  deliveryTime: z.nativeEnum(DeliveryTime),
  totalAmount: priceSchema,
  notes: textSchema,
  orderItems: z
    .array(orderItemSchema)
    .min(1, 'Order must contain at least one item')
    .max(50, 'Order cannot contain more than 50 items'),
}).refine(
  data => {
    // If delivery method is 'delivery', address is required
    if (data.deliveryMethod === DeliveryMethod.DELIVERY) {
      return data.deliveryAddress.length >= 2
    }
    return true
  },
  {
    message: 'Delivery address is required for delivery orders (min 10 characters)',
    path: ['deliveryAddress'],
  }
).refine(
  data => {
    // Validate total amount matches sum of items (plus delivery fee if applicable)
    const itemsSubtotal = data.orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )
    
    // Add delivery fee if delivery method is 'delivery'
    const deliveryFee = data.deliveryMethod === DeliveryMethod.DELIVERY ? DELIVERY_FEE : 0
    const calculatedTotal = itemsSubtotal + deliveryFee
    
    // Allow small floating point differences (within 1 cent)
    return Math.abs(calculatedTotal - data.totalAmount) < 0.01
  },
  {
    message: 'Total amount does not match cart items and delivery fee',
    path: ['totalAmount'],
  }
)

/**
 * Update order status validation schema
 */
export const updateOrderStatusSchema = z.object({
  orderId: z.union([numericIdSchema, stringNumericIdSchema]),
  status: z.nativeEnum(OrderStatus),
})

/**
 * Get order by ID validation schema
 */
export const getOrderByIdSchema = z.object({
  orderId: z.union([numericIdSchema, stringNumericIdSchema]),
})

/**
 * Get filtered orders validation schema
 */
export const getFilteredOrdersSchema = z.object({
  page: z.number().int().positive().default(1).optional(),
  pageSize: z.number().int().positive().min(1).max(50000).default(10).optional(),
  status: z
    .nativeEnum(OrderStatus)
    .or(z.literal('all'))
    .optional(),
  deliveryMethod: z
    .nativeEnum(DeliveryMethod)
    .or(z.literal('all'))
    .optional(),
  searchQuery: z
    .string()
    .max(100)
    .trim()
    .optional()
    .transform(val => val || undefined), // Convert empty string to undefined
  dateFrom: z
    .string()
    .trim()
    .optional()
    .transform(val => val || undefined) // Convert empty string to undefined
    .pipe(
      z.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')
        .optional()
    ),
  dateTo: z
    .string()
    .trim()
    .optional()
    .transform(val => val || undefined) // Convert empty string to undefined
    .pipe(
      z.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')
        .optional()
    ),
  sortBy: z
    .enum(['created_at', 'updated_at', 'total_amount', 'delivery_date'])
    .default('created_at')
    .optional(),
  sortOrder: sortOrderSchema.optional(),
  useCompletionDate: z
    .boolean()
    .optional()
    .default(false),
}).refine(
  data => {
    // If both dates provided, validate dateFrom is before dateTo
    if (data.dateFrom && data.dateTo) {
      return new Date(data.dateFrom) <= new Date(data.dateTo)
    }
    return true
  },
  {
    message: 'Start date must be before or equal to end date',
    path: ['dateFrom'],
  }
)

/**
 * Type exports for TypeScript
 */
export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>
export type GetOrderByIdInput = z.infer<typeof getOrderByIdSchema>
export type GetFilteredOrdersInput = z.infer<typeof getFilteredOrdersSchema>
export type OrderItem = z.infer<typeof orderItemSchema>
