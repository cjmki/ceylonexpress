import { z } from 'zod'
import { CleaningArea, CleaningFrequency, TemperatureType } from '../../../app/constants/enums'

// ==================== Cleaning Task Schemas ====================

export const createCleaningTaskSchema = z.object({
  taskName: z.string().min(1, 'Task name is required').max(255),
  area: z.nativeEnum(CleaningArea),
  frequency: z.nativeEnum(CleaningFrequency),
  cleaningMethod: z.string().min(1).max(255).optional(),
  responsiblePerson: z.string().min(1, 'Responsible person is required').max(255),
})

export const updateCleaningTaskSchema = z.object({
  id: z.number().int().positive(),
  data: z.object({
    taskName: z.string().min(1).max(255).optional(),
    area: z.nativeEnum(CleaningArea).optional(),
    frequency: z.nativeEnum(CleaningFrequency).optional(),
    cleaningMethod: z.string().min(1).max(255).optional(),
    responsiblePerson: z.string().min(1).max(255).optional(),
    isActive: z.boolean().optional(),
  }),
})

export const deleteCleaningTaskSchema = z.object({
  id: z.number().int().positive(),
})

export const getCleaningTaskSchema = z.object({
  id: z.number().int().positive(),
})

// ==================== Cleaning Log Schemas ====================

export const logCleaningCompletionSchema = z.object({
  cleaningTaskId: z.number().int().positive(),
  completedBy: z.string().min(1, 'Completed by is required').max(255),
  comment: z.string().max(1000).optional(),
  completedAt: z.string().datetime().optional(), // ISO datetime string
})

export const getCleaningLogsSchema = z.object({
  taskId: z.number().int().positive().optional(),
  area: z.nativeEnum(CleaningArea).optional(),
  frequency: z.nativeEnum(CleaningFrequency).optional(),
  dateFrom: z.string().optional(), // YYYY-MM-DD
  dateTo: z.string().optional(), // YYYY-MM-DD
  limit: z.number().int().positive().max(1000).optional(),
})

// ==================== Temperature Log Schemas ====================

export const createTemperatureLogSchema = z.object({
  temperatureType: z.nativeEnum(TemperatureType),
  temperatureValue: z.number().min(-50).max(200, 'Temperature must be between -50°C and 200°C'),
  unit: z.enum(['celsius', 'fahrenheit']).default('celsius'),
  recordedAt: z.string().datetime().optional(), // ISO datetime string
  orderId: z.number().int().positive().optional(),
  batchDate: z.string().optional(), // YYYY-MM-DD
  notes: z.string().max(1000).optional(),
  recordedBy: z.string().min(1, 'Recorded by is required').max(255),
})

export const updateTemperatureLogSchema = z.object({
  id: z.number().int().positive(),
  data: z.object({
    temperatureType: z.nativeEnum(TemperatureType).optional(),
    temperatureValue: z.number().min(-50).max(200).optional(),
    notes: z.string().max(1000).optional(),
    recordedBy: z.string().min(1).max(255).optional(),
  }),
})

export const deleteTemperatureLogSchema = z.object({
  id: z.number().int().positive(),
})

export const getTemperatureLogsSchema = z.object({
  temperatureType: z.nativeEnum(TemperatureType).optional(),
  dateFrom: z.string().optional(), // YYYY-MM-DD
  dateTo: z.string().optional(), // YYYY-MM-DD
  outOfRangeOnly: z.boolean().optional(),
  limit: z.number().int().positive().max(1000).optional(),
})

// ==================== Temperature Range Schemas ====================

export const updateTemperatureRangeSchema = z.object({
  temperatureType: z.enum(TemperatureType),
  minTemp: z.number().min(-50).max(200).nullable().optional(),
  maxTemp: z.number().min(-50).max(200).nullable().optional(),
  warningMessage: z.string().max(500).optional(),
})

export const getTemperatureRangeSchema = z.object({
  temperatureType: z.enum(TemperatureType),
})

// ==================== Dashboard Stats Schemas ====================

export const getHealthSafetyStatsSchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
})

// ==================== Type Exports ====================

export type CreateCleaningTaskInput = z.infer<typeof createCleaningTaskSchema>
export type UpdateCleaningTaskInput = z.infer<typeof updateCleaningTaskSchema>
export type LogCleaningCompletionInput = z.infer<typeof logCleaningCompletionSchema>
export type CreateTemperatureLogInput = z.infer<typeof createTemperatureLogSchema>
export type UpdateTemperatureLogInput = z.infer<typeof updateTemperatureLogSchema>
export type UpdateTemperatureRangeInput = z.infer<typeof updateTemperatureRangeSchema>
