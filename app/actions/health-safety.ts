'use server'

import { createServerSupabaseClient } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth/middleware'
import {
  safeValidate,
  createCleaningTaskSchema,
  updateCleaningTaskSchema,
  deleteCleaningTaskSchema,
  logCleaningCompletionSchema,
  getCleaningLogsSchema,
  createTemperatureLogSchema,
  updateTemperatureLogSchema,
  deleteTemperatureLogSchema,
  getTemperatureLogsSchema,
  updateTemperatureRangeSchema,
} from '@/lib/validations'

// ==================== Cleaning Tasks ====================

export async function getAllCleaningTasks() {
  'use server'
  
  try {
    await requireAuth()
    
    const serverClient = createServerSupabaseClient()
    
    const { data, error } = await serverClient
      .from('cleaning_tasks')
      .select('*')
      .eq('is_active', true)
      .order('area', { ascending: true })
      .order('frequency', { ascending: true })
    
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Failed to fetch cleaning tasks:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { success: false, error: 'Authentication required. Please log in.', data: [] }
    }
    
    return { success: false, error: 'Failed to fetch cleaning tasks', data: [] }
  }
}

export async function createCleaningTask(taskData: {
  taskName: string
  area: string
  frequency: string
  cleaningMethod?: string
  responsiblePerson: string
}) {
  'use server'
  
  try {
    await requireAuth()
    
    const validation = safeValidate(createCleaningTaskSchema, taskData)
    
    if (!validation.success) {
      return { success: false, error: validation.error }
    }

    const validatedData = validation.data
    const serverClient = createServerSupabaseClient()
    
    const { data, error } = await serverClient
      .from('cleaning_tasks')
      .insert([{
        task_name: validatedData.taskName,
        area: validatedData.area,
        frequency: validatedData.frequency,
        cleaning_method: validatedData.cleaningMethod || 'detergent_and_disinfectant',
        responsible_person: validatedData.responsiblePerson,
        is_active: true,
      }])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }
    
    return { success: true, data, message: 'Cleaning task created successfully' }
  } catch (error) {
    console.error('Failed to create cleaning task:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { success: false, error: 'Authentication required. Please log in.' }
    }
    
    return { success: false, error: 'Failed to create cleaning task' }
  }
}

export async function updateCleaningTask(id: number, taskData: {
  taskName?: string
  area?: string
  frequency?: string
  cleaningMethod?: string
  responsiblePerson?: string
  isActive?: boolean
}) {
  'use server'
  
  try {
    await requireAuth()
    
    const validation = safeValidate(updateCleaningTaskSchema, { id, data: taskData })
    
    if (!validation.success) {
      return { success: false, error: validation.error }
    }

    const { id: validatedId, data: validatedData } = validation.data
    const serverClient = createServerSupabaseClient()
    
    // Map camelCase to snake_case
    const updateData: any = {}
    if (validatedData.taskName !== undefined) updateData.task_name = validatedData.taskName
    if (validatedData.area !== undefined) updateData.area = validatedData.area
    if (validatedData.frequency !== undefined) updateData.frequency = validatedData.frequency
    if (validatedData.cleaningMethod !== undefined) updateData.cleaning_method = validatedData.cleaningMethod
    if (validatedData.responsiblePerson !== undefined) updateData.responsible_person = validatedData.responsiblePerson
    if (validatedData.isActive !== undefined) updateData.is_active = validatedData.isActive
    
    const { data, error } = await serverClient
      .from('cleaning_tasks')
      .update(updateData)
      .eq('id', validatedId)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }
    
    return { success: true, data, message: 'Cleaning task updated successfully' }
  } catch (error) {
    console.error('Failed to update cleaning task:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { success: false, error: 'Authentication required. Please log in.' }
    }
    
    return { success: false, error: 'Failed to update cleaning task' }
  }
}

export async function deleteCleaningTask(id: number) {
  'use server'
  
  try {
    await requireAuth()
    
    const validation = safeValidate(deleteCleaningTaskSchema, { id })
    
    if (!validation.success) {
      return { success: false, error: validation.error }
    }

    const { id: validatedId } = validation.data
    const serverClient = createServerSupabaseClient()
    
    // Soft delete by setting is_active to false
    const { error } = await serverClient
      .from('cleaning_tasks')
      .update({ is_active: false })
      .eq('id', validatedId)

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }
    
    return { success: true, message: 'Cleaning task deleted successfully' }
  } catch (error) {
    console.error('Failed to delete cleaning task:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { success: false, error: 'Authentication required. Please log in.' }
    }
    
    return { success: false, error: 'Failed to delete cleaning task' }
  }
}

// ==================== Cleaning Logs ====================

export async function logCleaningCompletion(logData: {
  cleaningTaskId: number
  completedBy: string
  comment?: string
  completedAt?: string
}) {
  'use server'
  
  try {
    await requireAuth()
    
    const validation = safeValidate(logCleaningCompletionSchema, logData)
    
    if (!validation.success) {
      return { success: false, error: validation.error }
    }

    const validatedData = validation.data
    const serverClient = createServerSupabaseClient()
    
    const { data, error } = await serverClient
      .from('cleaning_logs')
      .insert([{
        cleaning_task_id: validatedData.cleaningTaskId,
        completed_by: validatedData.completedBy,
        comment: validatedData.comment || null,
        completed_at: validatedData.completedAt || new Date().toISOString(),
      }])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }
    
    return { success: true, data, message: 'Cleaning completion logged successfully' }
  } catch (error) {
    console.error('Failed to log cleaning completion:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { success: false, error: 'Authentication required. Please log in.' }
    }
    
    return { success: false, error: 'Failed to log cleaning completion' }
  }
}

export async function getCleaningLogs(filters?: {
  taskId?: number
  area?: string
  frequency?: string
  dateFrom?: string
  dateTo?: string
  limit?: number
}) {
  'use server'
  
  try {
    await requireAuth()
    
    const validation = safeValidate(getCleaningLogsSchema, filters || {})
    
    if (!validation.success) {
      return { success: false, error: validation.error, data: [] }
    }

    const validatedFilters = validation.data
    const serverClient = createServerSupabaseClient()
    
    let query = serverClient
      .from('cleaning_logs')
      .select(`
        *,
        cleaning_tasks (
          id,
          task_name,
          area,
          frequency,
          responsible_person
        )
      `)
      .order('completed_at', { ascending: false })
    
    if (validatedFilters.taskId) {
      query = query.eq('cleaning_task_id', validatedFilters.taskId)
    }
    
    if (validatedFilters.dateFrom) {
      query = query.gte('completed_at', new Date(validatedFilters.dateFrom).toISOString())
    }
    
    if (validatedFilters.dateTo) {
      const endDate = new Date(validatedFilters.dateTo)
      endDate.setDate(endDate.getDate() + 1)
      query = query.lt('completed_at', endDate.toISOString())
    }
    
    if (validatedFilters.limit) {
      query = query.limit(validatedFilters.limit)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    // Filter by area and frequency on client side (after joining)
    let filteredData = data || []
    
    if (validatedFilters.area && filteredData.length > 0) {
      filteredData = filteredData.filter(log => 
        (log.cleaning_tasks as any)?.area === validatedFilters.area
      )
    }
    
    if (validatedFilters.frequency && filteredData.length > 0) {
      filteredData = filteredData.filter(log => 
        (log.cleaning_tasks as any)?.frequency === validatedFilters.frequency
      )
    }
    
    return { success: true, data: filteredData }
  } catch (error) {
    console.error('Failed to fetch cleaning logs:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { success: false, error: 'Authentication required. Please log in.', data: [] }
    }
    
    return { success: false, error: 'Failed to fetch cleaning logs', data: [] }
  }
}

// ==================== Temperature Logs ====================

export async function getAllTemperatureLogs(filters?: {
  temperatureType?: string
  dateFrom?: string
  dateTo?: string
  outOfRangeOnly?: boolean
  limit?: number
}) {
  'use server'
  
  try {
    await requireAuth()
    
    const validation = safeValidate(getTemperatureLogsSchema, filters || {})
    
    if (!validation.success) {
      return { success: false, error: validation.error, data: [] }
    }

    const validatedFilters = validation.data
    const serverClient = createServerSupabaseClient()
    
    let query = serverClient
      .from('temperature_logs')
      .select('*')
      .order('recorded_at', { ascending: false })
    
    if (validatedFilters.temperatureType) {
      query = query.eq('temperature_type', validatedFilters.temperatureType)
    }
    
    if (validatedFilters.outOfRangeOnly) {
      query = query.eq('is_within_range', false)
    }
    
    if (validatedFilters.dateFrom) {
      query = query.gte('recorded_at', new Date(validatedFilters.dateFrom).toISOString())
    }
    
    if (validatedFilters.dateTo) {
      const endDate = new Date(validatedFilters.dateTo)
      endDate.setDate(endDate.getDate() + 1)
      query = query.lt('recorded_at', endDate.toISOString())
    }
    
    if (validatedFilters.limit) {
      query = query.limit(validatedFilters.limit)
    } else {
      query = query.limit(500) // Default limit
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Failed to fetch temperature logs:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { success: false, error: 'Authentication required. Please log in.', data: [] }
    }
    
    return { success: false, error: 'Failed to fetch temperature logs', data: [] }
  }
}

export async function createTemperatureLog(logData: {
  temperatureType: string
  temperatureValue: number
  unit?: string
  recordedAt?: string
  orderId?: number
  batchDate?: string
  notes?: string
  recordedBy: string
}) {
  'use server'
  
  try {
    await requireAuth()
    
    const validation = safeValidate(createTemperatureLogSchema, logData)
    
    if (!validation.success) {
      return { success: false, error: validation.error }
    }

    const validatedData = validation.data
    const serverClient = createServerSupabaseClient()
    
    const { data, error } = await serverClient
      .from('temperature_logs')
      .insert([{
        temperature_type: validatedData.temperatureType,
        temperature_value: validatedData.temperatureValue,
        unit: validatedData.unit || 'celsius',
        recorded_at: validatedData.recordedAt || new Date().toISOString(),
        order_id: validatedData.orderId || null,
        batch_date: validatedData.batchDate || null,
        notes: validatedData.notes || null,
        recorded_by: validatedData.recordedBy,
      }])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }
    
    return { success: true, data, message: 'Temperature log created successfully' }
  } catch (error: any) {
    console.error('Failed to create temperature log:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { success: false, error: 'Authentication required. Please log in.' }
    }
    
    // Check for temperature out of range error
    if (error?.message?.includes('out of safe range')) {
      return { success: false, error: error.message }
    }
    
    return { success: false, error: 'Failed to create temperature log' }
  }
}

export async function deleteTemperatureLog(id: number) {
  'use server'
  
  try {
    await requireAuth()
    
    const validation = safeValidate(deleteTemperatureLogSchema, { id })
    
    if (!validation.success) {
      return { success: false, error: validation.error }
    }

    const { id: validatedId } = validation.data
    const serverClient = createServerSupabaseClient()
    
    const { error } = await serverClient
      .from('temperature_logs')
      .delete()
      .eq('id', validatedId)

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }
    
    return { success: true, message: 'Temperature log deleted successfully' }
  } catch (error) {
    console.error('Failed to delete temperature log:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { success: false, error: 'Authentication required. Please log in.' }
    }
    
    return { success: false, error: 'Failed to delete temperature log' }
  }
}

// ==================== Temperature Ranges ====================

export async function getAllTemperatureRanges() {
  'use server'
  
  try {
    await requireAuth()
    
    const serverClient = createServerSupabaseClient()
    
    const { data, error } = await serverClient
      .from('temperature_ranges')
      .select('*')
      .order('temperature_type', { ascending: true })
    
    if (error) throw error
    
    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Failed to fetch temperature ranges:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { success: false, error: 'Authentication required. Please log in.', data: [] }
    }
    
    return { success: false, error: 'Failed to fetch temperature ranges', data: [] }
  }
}

export async function updateTemperatureRange(rangeData: {
  temperatureType: string
  minTemp?: number | null
  maxTemp?: number | null
  warningMessage?: string
}) {
  'use server'
  
  try {
    await requireAuth()
    
    const validation = safeValidate(updateTemperatureRangeSchema, rangeData)
    
    if (!validation.success) {
      return { success: false, error: validation.error }
    }

    const validatedData = validation.data
    const serverClient = createServerSupabaseClient()
    
    const updateData: any = {}
    if (validatedData.minTemp !== undefined) updateData.min_temp = validatedData.minTemp
    if (validatedData.maxTemp !== undefined) updateData.max_temp = validatedData.maxTemp
    if (validatedData.warningMessage !== undefined) updateData.warning_message = validatedData.warningMessage
    
    const { data, error } = await serverClient
      .from('temperature_ranges')
      .update(updateData)
      .eq('temperature_type', validatedData.temperatureType)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }
    
    return { success: true, data, message: 'Temperature range updated successfully' }
  } catch (error) {
    console.error('Failed to update temperature range:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { success: false, error: 'Authentication required. Please log in.' }
    }
    
    return { success: false, error: 'Failed to update temperature range' }
  }
}

// ==================== Dashboard Stats ====================

export async function getHealthSafetyStats() {
  'use server'
  
  try {
    await requireAuth()
    
    const serverClient = createServerSupabaseClient()
    
    // Get overdue tasks count
    const { data: overdueTasks, error: overdueError } = await serverClient
      .from('overdue_cleaning_tasks')
      .select('task_id')
    
    if (overdueError) throw overdueError
    
    // Get out of range temperatures in last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const { data: outOfRangeTemps, error: tempError } = await serverClient
      .from('temperature_logs')
      .select('id')
      .eq('is_within_range', false)
      .gte('recorded_at', sevenDaysAgo.toISOString())
    
    if (tempError) throw tempError
    
    // Get today's due tasks
    const today = new Date().toISOString().split('T')[0]
    
    const { data: todayDue, error: todayError } = await serverClient
      .from('cleaning_logs')
      .select('next_due_date')
      .eq('next_due_date', today)
    
    if (todayError) throw todayError
    
    return {
      success: true,
      data: {
        overdueTasks: overdueTasks?.length || 0,
        outOfRangeTemperatures: outOfRangeTemps?.length || 0,
        tasksDueToday: todayDue?.length || 0,
      },
    }
  } catch (error) {
    console.error('Failed to fetch health safety stats:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return {
        success: false,
        error: 'Authentication required. Please log in.',
        data: { overdueTasks: 0, outOfRangeTemperatures: 0, tasksDueToday: 0 },
      }
    }
    
    return {
      success: false,
      error: 'Failed to fetch stats',
      data: { overdueTasks: 0, outOfRangeTemperatures: 0, tasksDueToday: 0 },
    }
  }
}
