'use client'

import { useState, useEffect } from 'react'
import { X, AlertTriangle } from 'lucide-react'
import { createTemperatureLog } from '../../../actions/health-safety'
import { TemperatureType, getTemperatureTypeDisplay } from '../../../constants/enums'

interface TemperatureRange {
  id: number
  temperature_type: string
  min_temp: number | null
  max_temp: number | null
  warning_message: string
}

interface TemperatureLogFormProps {
  preselectedType?: string
  ranges: TemperatureRange[]
  onSuccess: () => void
  onClose: () => void
}

export function TemperatureLogForm({ preselectedType, ranges, onSuccess, onClose }: TemperatureLogFormProps) {
  const [formData, setFormData] = useState({
    temperatureType: preselectedType || TemperatureType.FRIDGE,
    temperatureValue: '',
    unit: 'celsius',
    recordedBy: '',
    orderId: '',
    batchDate: '',
    notes: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [warning, setWarning] = useState<string | null>(null)

  useEffect(() => {
    checkTemperatureRange()
  }, [formData.temperatureType, formData.temperatureValue])

  const checkTemperatureRange = () => {
    if (!formData.temperatureValue) {
      setWarning(null)
      return
    }

    const temp = parseFloat(formData.temperatureValue)
    if (isNaN(temp)) {
      setWarning(null)
      return
    }

    const range = ranges.find(r => r.temperature_type === formData.temperatureType)
    if (!range) {
      setWarning(null)
      return
    }

    let isOutOfRange = false
    
    if (range.min_temp !== null && temp < range.min_temp) {
      isOutOfRange = true
    }
    
    if (range.max_temp !== null && temp > range.max_temp) {
      isOutOfRange = true
    }

    if (isOutOfRange) {
      setWarning(range.warning_message)
    } else {
      setWarning(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate that notes are provided if out of range
    if (warning && !formData.notes.trim()) {
      setError('Notes are required when temperature is out of safe range')
      return
    }

    setSubmitting(true)

    try {
      const submitData = {
        temperatureType: formData.temperatureType,
        temperatureValue: parseFloat(formData.temperatureValue),
        unit: formData.unit,
        recordedBy: formData.recordedBy,
        orderId: formData.orderId ? parseInt(formData.orderId) : undefined,
        batchDate: formData.batchDate || undefined,
        notes: formData.notes || undefined,
      }

      const result = await createTemperatureLog(submitData)

      if (result.success) {
        onSuccess()
      } else {
        setError(result.error || 'Failed to save temperature log')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Log Temperature</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {warning && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-yellow-800">Temperature Out of Range</p>
                  <p className="text-sm text-yellow-700 mt-1">{warning}</p>
                  <p className="text-xs text-yellow-600 mt-2">
                    Please provide notes explaining the situation and corrective action taken.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Temperature Type <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.temperatureType}
              onChange={(e) => setFormData({ ...formData, temperatureType: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              {Object.values(TemperatureType).map((type) => (
                <option key={type} value={type}>
                  {getTemperatureTypeDisplay(type)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Temperature <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.1"
                required
                value={formData.temperatureValue}
                onChange={(e) => setFormData({ ...formData, temperatureValue: e.target.value })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="e.g., 3.5"
              />
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="celsius">°C</option>
                <option value="fahrenheit">°F</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recorded By <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.recordedBy}
              onChange={(e) => setFormData({ ...formData, recordedBy: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order ID (optional)
            </label>
            <input
              type="number"
              value={formData.orderId}
              onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Link to an order"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Batch Date (optional)
            </label>
            <input
              type="date"
              value={formData.batchDate}
              onChange={(e) => setFormData({ ...formData, batchDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes {warning && <span className="text-red-500">*</span>}
            </label>
            <textarea
              required={!!warning}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder={warning ? "Explain the situation and corrective action..." : "Optional notes"}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Saving...' : 'Save Log'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
