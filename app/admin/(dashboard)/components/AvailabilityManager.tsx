'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Calendar, AlertCircle } from 'lucide-react'
import {
  getMenuItemAvailability,
  setMenuItemAvailability,
  generateAvailabilitySchedule,
  deleteAvailabilitySlot,
  updateAvailabilitySlot,
} from '../../../actions/orders'
import { getNextSaturdays, getNextDaysOfWeek, formatDateForDB, formatDateForDisplay } from '@/lib/utils'

interface AvailabilitySlot {
  id?: string
  date: string
  maxOrders: number
  currentOrders?: number
  remaining?: number
  isActive?: boolean
}

interface AvailabilityManagerProps {
  menuItemId: string
  menuItemName: string
}

export function AvailabilityManager({ menuItemId, menuItemName }: AvailabilityManagerProps) {
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  
  // Quick generate settings
  const [quickGenSettings, setQuickGenSettings] = useState({
    count: 3,
    maxOrders: 12,
    dayOfWeek: 6, // Saturday by default
  })

  const weekdays = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
  ]

  // Manual add
  const [newSlot, setNewSlot] = useState<AvailabilitySlot>({
    date: '',
    maxOrders: 12,
  })

  useEffect(() => {
    loadAvailability()
  }, [menuItemId])

  const loadAvailability = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await getMenuItemAvailability(menuItemId)
      
      if (result.success && result.data) {
        setAvailabilitySlots(result.data)
      } else {
        setError(result.error || 'Failed to load availability')
      }
    } catch (err) {
      console.error('Error loading availability:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickGenerate = async () => {
    setIsGenerating(true)
    setError(null)
    setSuccess(null)

    try {
      // Get existing availability slots to avoid duplicates
      const existingSlots = availabilitySlots.map(slot => slot.date)
      
      // Generate dates for selected weekday
      const selectedWeekday = weekdays.find(w => w.value === quickGenSettings.dayOfWeek)?.label || 'selected day'
      const dates = getNextDaysOfWeek(quickGenSettings.dayOfWeek, quickGenSettings.count * 2) // Get extra in case some exist
      
      // Filter out dates that already have slots
      const newDates = dates
        .filter(date => !existingSlots.includes(formatDateForDB(date)))
        .slice(0, quickGenSettings.count) // Only take the count we need

      if (newDates.length === 0) {
        setError(`No new slots to generate. All upcoming ${selectedWeekday}s already have availability.`)
        setIsGenerating(false)
        return
      }

      // Create slots for new dates only
      const slots = newDates.map(date => ({
        date: formatDateForDB(date),
        maxOrders: quickGenSettings.maxOrders,
      }))

      const result = await setMenuItemAvailability(menuItemId, slots)

      if (result.success) {
        setSuccess(`Generated ${newDates.length} new ${selectedWeekday} slot${newDates.length > 1 ? 's' : ''}!`)
        await loadAvailability()
      } else {
        setError(result.error || 'Failed to generate availability')
      }
    } catch (err) {
      console.error('Error generating availability:', err)
      setError('An unexpected error occurred')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAddSlot = async () => {
    if (!newSlot.date || !newSlot.maxOrders) {
      setError('Please fill in both date and max orders')
      return
    }

    setError(null)
    setSuccess(null)

    try {
      const result = await setMenuItemAvailability(menuItemId, [
        { date: newSlot.date, maxOrders: newSlot.maxOrders },
      ])

      if (result.success) {
        setSuccess('Availability slot added!')
        setNewSlot({ date: '', maxOrders: 12 })
        await loadAvailability()
      } else {
        setError(result.error || 'Failed to add availability slot')
      }
    } catch (err) {
      console.error('Error adding slot:', err)
      setError('An unexpected error occurred')
    }
  }

  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm('Are you sure you want to delete this availability slot?')) {
      return
    }

    setError(null)
    setSuccess(null)

    try {
      const result = await deleteAvailabilitySlot(slotId)

      if (result.success) {
        setSuccess('Availability slot deleted!')
        await loadAvailability()
      } else {
        setError(result.error || 'Failed to delete availability slot')
      }
    } catch (err) {
      console.error('Error deleting slot:', err)
      setError('An unexpected error occurred')
    }
  }

  const handleUpdateSlot = async (slotId: string, maxOrders: number) => {
    setError(null)
    setSuccess(null)

    try {
      const result = await updateAvailabilitySlot(slotId, { maxOrders })

      if (result.success) {
        setSuccess('Availability slot updated!')
        await loadAvailability()
      } else {
        setError(result.error || 'Failed to update availability slot')
      }
    } catch (err) {
      console.error('Error updating slot:', err)
      setError('An unexpected error occurred')
    }
  }

  const getMinDate = () => {
    const today = new Date()
    return formatDateForDB(today)
  }

  if (loading) {
    return (
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          <span className="ml-3 text-gray-600">Loading availability...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="border-t border-gray-200 pt-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-orange-600" />
          Availability Schedule
        </h3>
        <p className="text-sm text-gray-600">
          Manage date-based capacity limits for "{menuItemName}"
        </p>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-4 bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm font-semibold">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border-2 border-green-200 rounded-lg p-4">
          <p className="text-green-700 text-sm font-semibold">{success}</p>
        </div>
      )}

      {/* Quick Generate Section */}
      <div className="mb-6 p-4 bg-orange-50 border-2 border-orange-200 rounded-lg">
        <h4 className="font-bold text-gray-900 mb-3">🚀 Quick Generate</h4>
        <p className="text-sm text-gray-700 mb-4">
          Generate availability for upcoming weeks
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Day of Week
            </label>
            <select
              value={quickGenSettings.dayOfWeek}
              onChange={(e) =>
                setQuickGenSettings({ ...quickGenSettings, dayOfWeek: parseInt(e.target.value) })
              }
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
            >
              {weekdays.map(day => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              How Many
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={quickGenSettings.count}
              onChange={(e) =>
                setQuickGenSettings({ ...quickGenSettings, count: parseInt(e.target.value) || 1 })
              }
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Max Orders
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={quickGenSettings.maxOrders}
              onChange={(e) =>
                setQuickGenSettings({ ...quickGenSettings, maxOrders: parseInt(e.target.value) || 12 })
              }
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleQuickGenerate}
              disabled={isGenerating}
              className="w-full px-6 py-2 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-600 italic">
          💡 Only generates new slots, won't replace existing ones
        </p>
      </div>

      {/* Manual Add Section */}
      <div className="mb-6 p-4 bg-gray-50 border-2 border-gray-200 rounded-lg">
        <h4 className="font-bold text-gray-900 mb-3">➕ Add Custom Date</h4>
        
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              min={getMinDate()}
              value={newSlot.date}
              onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Max Orders
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={newSlot.maxOrders}
              onChange={(e) =>
                setNewSlot({ ...newSlot, maxOrders: parseInt(e.target.value) || 12 })
              }
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <button
            type="button"
            onClick={handleAddSlot}
            className="px-6 py-2 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-800 transition-colors"
          >
            Add Slot
          </button>
        </div>
      </div>

      {/* Existing Slots */}
      <div>
        <h4 className="font-bold text-gray-900 mb-3">📅 Scheduled Availability</h4>
        
        {availabilitySlots.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No availability slots configured yet</p>
            <p className="text-sm mt-1">Use Quick Generate or Add Custom Date above</p>
          </div>
        ) : (
          <div className="space-y-2">
            {availabilitySlots.map((slot) => (
              <div
                key={slot.id || slot.date}
                className="flex items-center gap-4 p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-orange-300 transition-colors"
              >
                <div className="flex-1">
                  <div className="font-bold text-gray-900">
                    {formatDateForDisplay(slot.date)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {slot.currentOrders || 0} / {slot.maxOrders} orders
                    {slot.remaining !== undefined && (
                      <span className="ml-2 text-orange-600 font-semibold">
                        ({slot.remaining} remaining)
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-gray-700">Max:</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={slot.maxOrders}
                      onChange={(e) => {
                        const newMax = parseInt(e.target.value) || slot.maxOrders
                        if (slot.id) {
                          handleUpdateSlot(slot.id, newMax)
                        }
                      }}
                      className="w-20 px-2 py-1 border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                    />
                  </div>

                  {slot.id && (
                    <button
                      type="button"
                      onClick={() => handleDeleteSlot(slot.id!)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete slot"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
