import { z } from 'zod'
import { phoneSchema } from './common.validation'

export const sendSMSSchema = z.object({
  phoneNumber: phoneSchema,
  message: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(1600, 'Message is too long (max 1600 characters / 10 SMS segments)'),
})
