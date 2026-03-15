'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  CalendarClock,
  Calendar,
  AlertCircle,
  X,
  Trash2,
  Clock,
  Eye,
} from 'lucide-react'
import { getAllMenuItems } from '../../../actions/orders'
import {
  applyMenuUpdatesNow,
  scheduleMenuUpdate,
  getScheduledUpdates,
  cancelScheduledUpdate,
  deleteScheduledUpdate,
} from '../../../actions/menu-schedule'
import type { MenuUpdateItem } from '@/lib/validations'
import { getMenuCategoryDisplay } from '../../../constants/enums'
import { formatPrice } from '../../../constants/currency'
import { getNextDaysOfWeek, formatDateForDB, formatDateForDisplay } from '@/lib/utils'

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  image_url: string | null
  available: boolean
  includes: string[] | null
}

interface ScheduledUpdateRow {
  id: string
  created_at: string
  scheduled_for: string
  status: string
  executed_at: string | null
  notes: string | null
  items: MenuUpdateItem[]
  error_message: string | null
}

function getNextSundayAt18(): string {
  const next = getNextDaysOfWeek(0, 1)[0]
  next.setHours(18, 0, 0, 0)
  const y = next.getFullYear()
  const m = String(next.getMonth() + 1).padStart(2, '0')
  const d = String(next.getDate()).padStart(2, '0')
  const h = String(next.getHours()).padStart(2, '0')
  const min = String(next.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${d}T${h}:${min}`
}

export function LiveMenuManager() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [perItemMaxOrders, setPerItemMaxOrders] = useState<Record<string, number>>({})
  const [availabilityDates, setAvailabilityDates] = useState<string[]>([])

  const [scheduleLater, setScheduleLater] = useState(false)
  const [scheduledFor, setScheduledFor] = useState(getNextSundayAt18)
  const [notes, setNotes] = useState('')

  const [scheduledUpdates, setScheduledUpdates] = useState<ScheduledUpdateRow[]>([])
  const [loadingUpdates, setLoadingUpdates] = useState(true)
  const [confirmAction, setConfirmAction] = useState<'go-live' | 'schedule' | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [viewingSchedule, setViewingSchedule] = useState<ScheduledUpdateRow | null>(null)

  const groupedItems = useMemo(() => {
    const acc: Record<string, MenuItem[]> = {}
    for (const item of menuItems) {
      if (!acc[item.category]) acc[item.category] = []
      acc[item.category].push(item)
    }
    return acc
  }, [menuItems])

  const minDate = formatDateForDB(new Date())
  const selectedDates = useMemo(
    () => availabilityDates.filter((d) => d && d.length === 10 && d >= minDate).sort(),
    [availabilityDates, minDate]
  )

  const addAvailabilityDate = () => {
    setAvailabilityDates((prev) => [...prev, minDate])
  }

  const setAvailabilityDateAt = (index: number, value: string) => {
    setAvailabilityDates((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }

  const removeAvailabilityDate = (index: number) => {
    setAvailabilityDates((prev) => prev.filter((_, i) => i !== index))
  }

  const toggleItem = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAllInCategory = (category: string) => {
    const ids = groupedItems[category]?.map((i) => i.id) ?? []
    setSelectedIds((prev) => {
      const next = new Set(prev)
      ids.forEach((id) => next.add(id))
      return next
    })
  }

  const deselectAllInCategory = (category: string) => {
    const ids = groupedItems[category]?.map((i) => i.id) ?? []
    setSelectedIds((prev) => {
      const next = new Set(prev)
      ids.forEach((id) => next.delete(id))
      return next
    })
  }

  const getMaxOrdersForItem = (id: string) => perItemMaxOrders[id] ?? 12
  const setMaxOrdersForItem = (id: string, value: number) => {
    setPerItemMaxOrders((prev) => ({ ...prev, [id]: value }))
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getAllMenuItems()
        setMenuItems(Array.isArray(data) ? data : [])
      } catch (e) {
        console.error(e)
        setError('Failed to load menu items.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    const load = async () => {
      setLoadingUpdates(true)
      try {
        const res = await getScheduledUpdates()
        if (res.success && res.data) setScheduledUpdates(res.data as ScheduledUpdateRow[])
      } catch (e) {
        console.error(e)
      } finally {
        setLoadingUpdates(false)
      }
    }
    load()
  }, [])

  const refreshScheduled = async () => {
    const res = await getScheduledUpdates()
    if (res.success && res.data) setScheduledUpdates(res.data as ScheduledUpdateRow[])
  }

  const buildPayload = (): MenuUpdateItem[] => {
    return menuItems
      .filter((i) => selectedIds.has(i.id))
      .map((i) => ({
        menu_item_id: i.id,
        menu_item_name: i.name,
        max_orders: getMaxOrdersForItem(i.id),
        dates: selectedDates,
      }))
  }

  const handleGoLiveNow = async () => {
    const items = buildPayload()
    if (items.length === 0 || selectedDates.length === 0) return
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)
    try {
      const result = await applyMenuUpdatesNow(items)
      if (result.success) {
        setSuccess(result.message ?? 'Menu updates applied.')
        setConfirmAction(null)
        setSelectedIds(new Set())
      } else {
        setError(result.error ?? 'Failed to apply updates.')
      }
    } catch (e) {
      console.error(e)
      setError('An unexpected error occurred.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSchedule = async () => {
    const items = buildPayload()
    if (items.length === 0 || selectedDates.length === 0) return
    const iso = new Date(scheduledFor).toISOString()
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)
    try {
      const result = await scheduleMenuUpdate(items, iso, notes || undefined)
      if (result.success) {
        setSuccess(result.message ?? 'Update scheduled.')
        setConfirmAction(null)
        setSelectedIds(new Set())
        await refreshScheduled()
      } else {
        setError(result.error ?? 'Failed to schedule.')
      }
    } catch (e) {
      console.error(e)
      setError('An unexpected error occurred.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancelScheduled = async (id: string) => {
    setCancellingId(id)
    setError(null)
    try {
      const result = await cancelScheduledUpdate(id)
      if (result.success) {
        setSuccess(result.message ?? 'Cancelled.')
        await refreshScheduled()
      } else {
        setError(result.error ?? 'Failed to cancel.')
      }
    } catch (e) {
      console.error(e)
      setError('Failed to cancel.')
    } finally {
      setCancellingId(null)
    }
  }

  const handleRemoveScheduled = async (id: string) => {
    if (!confirm('Remove this scheduled update from the list? This cannot be undone.')) return
    setRemovingId(id)
    setError(null)
    try {
      const result = await deleteScheduledUpdate(id)
      if (result.success) {
        setSuccess(result.message ?? 'Removed.')
        await refreshScheduled()
      } else {
        setError(result.error ?? 'Failed to remove.')
      }
    } catch (e) {
      console.error(e)
      setError('Failed to remove.')
    } finally {
      setRemovingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600" />
        <span className="ml-3 text-gray-600">Loading menu items...</span>
      </div>
    )
  }

  const canSubmit =
    selectedIds.size > 0 && selectedDates.length > 0
  const payload = buildPayload()

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm font-semibold">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
          <p className="text-green-700 text-sm font-semibold">{success}</p>
        </div>
      )}

      {/* Section A: Menu item selection */}
      <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-orange-50 px-6 py-3 border-b-2 border-orange-200">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-orange-600" />
            Select menu items
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Choose items to go live. Set max orders per item when selected; pick dates below.
          </p>
        </div>
        <div className="divide-y divide-gray-200">
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-gray-900">{getMenuCategoryDisplay(category)}</h4>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => selectAllInCategory(category)}
                    className="text-xs font-semibold text-orange-600 hover:underline"
                  >
                    Select all
                  </button>
                  <button
                    type="button"
                    onClick={() => deselectAllInCategory(category)}
                    className="text-xs font-semibold text-gray-500 hover:underline"
                  >
                    Deselect all
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-3 bg-white border border-gray-200 rounded-lg hover:border-orange-200"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(item.id)}
                      onChange={() => toggleItem(item.id)}
                      className="h-4 w-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
                    />
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt=""
                        className="h-10 w-10 rounded object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded bg-orange-100 flex items-center justify-center text-lg">
                        🍛
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{item.name}</p>
                      <p className="text-sm text-gray-500">{formatPrice(item.price)}</p>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        item.available ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {item.available ? 'Available' : 'Unavailable'}
                    </span>
                    {selectedIds.has(item.id) && (
                      <div className="flex items-center gap-1">
                        <label className="text-xs font-semibold text-gray-600">Max orders:</label>
                        <input
                          type="number"
                          min={1}
                          max={999}
                          value={getMaxOrdersForItem(item.id)}
                          onChange={(e) =>
                            setMaxOrdersForItem(item.id, parseInt(e.target.value, 10) || 12)
                          }
                          className="w-20 px-2 py-1 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-sm"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section B: Availability dates — simple date picker */}
      <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-6 py-3 border-b-2 border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-orange-600" />
            Availability dates
          </h3>
          <p className="text-sm text-gray-600 mt-1">Pick one or more dates. Past dates are disabled.</p>
        </div>
        <div className="p-6 space-y-3">
          <div className="flex flex-wrap gap-3 items-end">
            {availabilityDates.map((date, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="date"
                  min={minDate}
                  value={date}
                  onChange={(e) => setAvailabilityDateAt(index, e.target.value)}
                  className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
                <button
                  type="button"
                  onClick={() => removeAvailabilityDate(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  aria-label="Remove date"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addAvailabilityDate}
              className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300"
            >
              Add date
            </button>
          </div>
          {selectedDates.length > 0 && (
            <p className="text-sm text-gray-600">
              Selected: {selectedDates.map((d) => formatDateForDisplay(d)).join(', ')}
            </p>
          )}
        </div>
      </div>

      {/* Section C: Action panel */}
      <div className="border-2 border-orange-200 rounded-lg p-6 bg-orange-50/50">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Go live</h3>
        <div className="flex flex-wrap gap-4 items-end">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={scheduleLater}
              onChange={(e) => setScheduleLater(e.target.checked)}
              className="text-orange-600 border-gray-300 rounded"
            />
            <span className="font-medium text-gray-800">Schedule for later</span>
          </label>
          {scheduleLater && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Date & time</label>
                <input
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                  className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Notes (optional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Next weekend menu"
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </>
          )}
        </div>
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            disabled={!canSubmit || isSubmitting}
            onClick={() => (scheduleLater ? setConfirmAction('schedule') : setConfirmAction('go-live'))}
            className="px-6 py-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {scheduleLater ? 'Schedule update' : 'Go live now'}
          </button>
        </div>
      </div>

      {/* Confirmation modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => !isSubmitting && setConfirmAction(null)}
          />
          <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {confirmAction === 'go-live' ? 'Go live now?' : 'Schedule this update?'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {payload.length} item(s) will get availability on {selectedDates.length} date(s). Menu items will be
              set to available with limited availability.
            </p>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 text-sm space-y-3 mb-4 overflow-y-auto max-h-[40vh]">
              {confirmAction === 'schedule' && (
                <div>
                  <span className="font-semibold text-gray-700">Scheduled for: </span>
                  <span className="text-gray-900">
                    {new Date(scheduledFor).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' })}
                  </span>
                  {notes && (
                    <p className="mt-1 text-gray-600">
                      <span className="font-semibold">Notes: </span>
                      {notes}
                    </p>
                  )}
                </div>
              )}
              <div>
                <span className="font-semibold text-gray-700">Availability dates: </span>
                <span className="text-gray-900">
                  {selectedDates.map((d) => formatDateForDisplay(d)).join(', ')}
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-700 block mb-1">Items & max orders:</span>
                <ul className="list-disc list-inside space-y-0.5 text-gray-900">
                  {payload.map((item) => (
                    <li key={item.menu_item_id}>
                      {item.menu_item_name} — max {item.max_orders} per date
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex gap-3 justify-end flex-shrink-0">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={confirmAction === 'go-live' ? handleGoLiveNow : handleSchedule}
                className="px-4 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Please wait...' : confirmAction === 'go-live' ? 'Go live' : 'Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Section D: Scheduled updates list */}
      <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-6 py-3 border-b-2 border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-600" />
            Scheduled updates
          </h3>
        </div>
        <div className="overflow-x-auto">
          {loadingUpdates ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : scheduledUpdates.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No scheduled updates.</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Scheduled for</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Items</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {scheduledUpdates.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setViewingSchedule(row)}
                  >
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(row.scheduled_for).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {Array.isArray(row.items) ? row.items.length : 0} item(s)
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          row.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : row.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : row.status === 'failed'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {row.status}
                      </span>
                      {row.status === 'failed' && row.error_message && (
                        <p className="text-xs text-red-600 mt-1 truncate max-w-xs" title={row.error_message}>
                          {row.error_message}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setViewingSchedule(row)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {row.status === 'pending' && (
                        <button
                          type="button"
                          disabled={cancellingId === row.id}
                          onClick={() => handleCancelScheduled(row.id)}
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg disabled:opacity-50"
                          title="Cancel"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={removingId === row.id}
                        onClick={() => handleRemoveScheduled(row.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 ml-1"
                        title="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Schedule details modal */}
      {viewingSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setViewingSchedule(null)}
          />
          <div
            className="relative bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Scheduled update details</h3>
              <button
                type="button"
                onClick={() => setViewingSchedule(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
                aria-label="Close"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <div className="space-y-4 text-sm overflow-y-auto">
              <div>
                <span className="font-semibold text-gray-700">Scheduled for: </span>
                <span className="text-gray-900">
                  {new Date(viewingSchedule.scheduled_for).toLocaleString(undefined, {
                    dateStyle: 'full',
                    timeStyle: 'short',
                  })}
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Status: </span>
                <span
                  className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                    viewingSchedule.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : viewingSchedule.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : viewingSchedule.status === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {viewingSchedule.status}
                </span>
              </div>
              {viewingSchedule.executed_at && (
                <div>
                  <span className="font-semibold text-gray-700">Executed at: </span>
                  <span className="text-gray-900">
                    {new Date(viewingSchedule.executed_at).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>
              )}
              {viewingSchedule.notes && (
                <div>
                  <span className="font-semibold text-gray-700">Notes: </span>
                  <span className="text-gray-900">{viewingSchedule.notes}</span>
                </div>
              )}
              {viewingSchedule.status === 'failed' && viewingSchedule.error_message && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <span className="font-semibold text-red-800">Error: </span>
                  <p className="text-red-700 mt-1 text-xs break-words">{viewingSchedule.error_message}</p>
                </div>
              )}
              <div>
                <span className="font-semibold text-gray-700 block mb-1">Availability dates: </span>
                <span className="text-gray-900">
                  {Array.isArray(viewingSchedule.items) && viewingSchedule.items[0]?.dates?.length
                    ? viewingSchedule.items[0].dates
                        .map((d: string) => formatDateForDisplay(d))
                        .join(', ')
                    : '—'}
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-700 block mb-2">Items & max orders:</span>
                <ul className="list-disc list-inside space-y-0.5 text-gray-900">
                  {Array.isArray(viewingSchedule.items)
                    ? viewingSchedule.items.map((item: MenuUpdateItem) => (
                        <li key={item.menu_item_id}>
                          {item.menu_item_name} — max {item.max_orders} per date
                        </li>
                      ))
                    : null}
                </ul>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingSchedule(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
