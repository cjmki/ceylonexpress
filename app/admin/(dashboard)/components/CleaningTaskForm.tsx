'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { createCleaningTask, updateCleaningTask } from '../../../actions/health-safety'
import {
  CleaningArea,
  CleaningFrequency,
  getCleaningAreaDisplay,
  getCleaningFrequencyDisplay,
} from '../../../constants/enums'

interface CleaningTask {
  id: number
  task_name: string
  area: string
  frequency: string
  cleaning_method: string
  responsible_person: string
}

interface CleaningTaskFormProps {
  task?: CleaningTask | null
  onSuccess: () => void
  onClose: () => void
}

export function CleaningTaskForm({ task, onSuccess, onClose }: CleaningTaskFormProps) {
  const [formData, setFormData] = useState({
    taskName: task?.task_name || '',
    area: task?.area || CleaningArea.KITCHEN,
    frequency: task?.frequency || CleaningFrequency.DAILY,
    cleaningMethod: task?.cleaning_method || 'detergent_and_disinfectant',
    responsiblePerson: task?.responsible_person || '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const result = task
        ? await updateCleaningTask(task.id, formData)
        : await createCleaningTask(formData)

      if (result.success) {
        onSuccess()
      } else {
        setError(result.error || 'Failed to save task')
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
          <h3 className="text-xl font-semibold text-gray-900">
            {task ? 'Edit Cleaning Task' : 'Add Cleaning Task'}
          </h3>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.taskName}
              onChange={(e) => setFormData({ ...formData, taskName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="e.g., Clean work surfaces"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Area <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.area}
              onChange={(e) => setFormData({ ...formData, area: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              {Object.values(CleaningArea).map((area) => (
                <option key={area} value={area}>
                  {getCleaningAreaDisplay(area)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Frequency <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.frequency}
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              {Object.values(CleaningFrequency).map((freq) => (
                <option key={freq} value={freq}>
                  {getCleaningFrequencyDisplay(freq)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cleaning Method
            </label>
            <input
              type="text"
              value={formData.cleaningMethod}
              onChange={(e) => setFormData({ ...formData, cleaningMethod: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="e.g., hot_water_detergent_disinfectant"
            />
            <p className="text-xs text-gray-500 mt-1">Use underscores instead of spaces</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Responsible Person <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.responsiblePerson}
              onChange={(e) => setFormData({ ...formData, responsiblePerson: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="e.g., Kitchen Manager"
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
              {submitting ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
