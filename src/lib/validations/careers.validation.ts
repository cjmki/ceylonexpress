import { z } from 'zod'

export const careersFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(8, 'Please enter a valid phone number').max(20, 'Phone number is too long'),
  jobTitle: z.string().min(1, 'Please select a position'),
  socialMedia: z.string().optional().or(z.literal('')),
  message: z.string().min(10, 'Please tell us a bit about yourself (at least 10 characters)').max(1000, 'Message must be less than 1000 characters'),
})

export type CareersFormData = z.infer<typeof careersFormSchema>
