'use server'

import { requireAuth } from '@/lib/auth/middleware'
import { safeValidate, sendSMSSchema } from '@/lib/validations'
import { send46elksSMS } from '@/lib/sms'

export async function sendOrderConfirmationSMS(phoneNumber: string, message: string) {
  try {
    await requireAuth()

    const validation = safeValidate(sendSMSSchema, { phoneNumber, message })

    if (!validation.success) {
      return { success: false, error: validation.error }
    }

    const { phoneNumber: validatedPhone, message: validatedMessage } = validation.data

    const result = await send46elksSMS(validatedPhone, validatedMessage)

    if (!result.success) {
      return { success: false, error: result.error || 'Failed to send SMS' }
    }

    return {
      success: true,
      messageId: result.messageId,
      message: 'SMS sent successfully',
    }
  } catch (error) {
    console.error('Failed to send order confirmation SMS:', error)

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { success: false, error: 'Authentication required. Please log in.' }
    }

    return { success: false, error: 'Failed to send SMS' }
  }
}
