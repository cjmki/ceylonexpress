import { z } from 'zod'

export const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(8, 'Please enter a valid phone number').max(20, 'Phone number is too long').optional().or(z.literal('')),
  eventDate: z.string().optional(),
  eventTime: z.string().optional(),
  message: z.string().max(1000, 'Message must be less than 1000 characters').optional().or(z.literal('')),
})

export type ContactFormData = z.infer<typeof contactFormSchema>
