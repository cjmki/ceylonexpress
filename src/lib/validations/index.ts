/**
 * Validation utilities and exports
 */
import { z } from 'zod'

/**
 * Validation error class for better error handling
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public errors: z.ZodError
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

/**
 * Validates data against a schema and returns formatted errors
 * @param schema Zod schema to validate against
 * @param data Data to validate
 * @returns Validated and transformed data
 * @throws ValidationError if validation fails
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data)
  
  if (!result.success) {
    throw new ValidationError('Validation failed', result.error)
  }
  
  return result.data
}

/**
 * Formats Zod errors into a user-friendly format
 * @param error Zod error
 * @returns Formatted error message
 */
export function formatValidationErrors(error: z.ZodError<unknown>): string {
  const formattedErrors = error.issues.map(err => {
    const path = err.path.join('.')
    return path ? `${path}: ${err.message}` : err.message
  })
  
  return formattedErrors.join('; ')
}

/**
 * Safe validation that returns result object instead of throwing
 * @param schema Zod schema to validate against
 * @param data Data to validate
 * @returns Result object with success flag and data or errors
 */
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data)
  
  if (!result.success) {
    return {
      success: false,
      error: formatValidationErrors(result.error),
    }
  }
  
  return {
    success: true,
    data: result.data,
  }
}

// Re-export all validation schemas
export * from './common.validation'
export * from './auth.validation'
export * from './order.validation'
export * from './menu.validation'
export * from './contact.validation'
export * from './careers.validation'
export * from './health-safety.validation'
