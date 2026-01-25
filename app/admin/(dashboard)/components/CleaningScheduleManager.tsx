'use client'

import { useState, useEffect } from 'react'
import { Plus, Check, Calendar, X } from 'lucide-react'
import { getAllCleaningTasks, logCleaningCompletion, getCleaningLogs } from '../../../actions/health-safety'
import { CleaningTaskForm } from './CleaningTaskForm'
import { CleaningLogsTable } from './CleaningLogsTable'
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
  is_active: boolean
  created_at: string
  updated_at: string
}

interface CleaningLog {
  id: number
  cleaning_task_id: number
  completed_at: string
  completed_by: string
  comment: string | null
  next_due_date: string | null
}

interface CleaningScheduleManagerProps {
  onUpdate?: () => void
}

export function CleaningScheduleManager({ onUpdate }: CleaningScheduleManagerProps) {
  const [tasks, setTasks] = useState<CleaningTask[]>([])
  const [recentLogs, setRecentLogs] = useState<CleaningLog[]>([])
  const [loading, setLoading] = useState(true)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState<CleaningTask | null>(null)
  const [showLogs, setShowLogs] = useState(false)
  const [selectedArea, setSelectedArea] = useState<string>('all')
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [completingTask, setCompletingTask] = useState<CleaningTask | null>(null)
  const [completedBy, setCompletedBy] = useState('')
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    setLoading(true)
    
    // Fetch tasks
    const tasksResult = await getAllCleaningTasks()
    if (tasksResult.success && tasksResult.data) {
      setTasks(tasksResult.data)
    }
    
    // Fetch recent logs (last 7 days to check completion status)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const logsResult = await getCleaningLogs({
      dateFrom: sevenDaysAgo.toISOString().split('T')[0],
      limit: 500,
    })
    
    if (logsResult.success && logsResult.data) {
      setRecentLogs(logsResult.data)
    }
    
    setLoading(false)
  }

  const handleTaskComplete = (taskId: number) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    setCompletingTask(task)
    setShowCompleteModal(true)
    setCompletedBy('')
    setComment('')
  }

  const handleSubmitCompletion = async () => {
    if (!completingTask || !completedBy.trim()) return

    setSubmitting(true)

    const result = await logCleaningCompletion({
      cleaningTaskId: completingTask.id,
      completedBy: completedBy.trim(),
      comment: comment.trim() || undefined,
    })

    if (result.success) {
      setShowCompleteModal(false)
      setCompletingTask(null)
      setCompletedBy('')
      setComment('')
      loadTasks()
      onUpdate?.()
    } else {
      alert(`Error: ${result.error}`)
    }

    setSubmitting(false)
  }

  const handleTaskFormSuccess = () => {
    setShowTaskForm(false)
    setEditingTask(null)
    loadTasks()
    onUpdate?.()
  }

  // Check if a task is completed within its schedule period
  const isTaskCompleted = (task: CleaningTask): { completed: boolean; lastCompletion?: CleaningLog } => {
    // Find the most recent log for this task
    const taskLogs = recentLogs
      .filter(log => log.cleaning_task_id === task.id)
      .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())
    
    if (taskLogs.length === 0) {
      return { completed: false }
    }
    
    const lastLog = taskLogs[0]
    const lastCompletedDate = new Date(lastLog.completed_at)
    const now = new Date()
    
    // Reset time to start of day for comparison
    lastCompletedDate.setHours(0, 0, 0, 0)
    now.setHours(0, 0, 0, 0)
    
    switch (task.frequency) {
      case 'daily':
        // Completed today
        return {
          completed: lastCompletedDate.getTime() === now.getTime(),
          lastCompletion: lastLog
        }
      
      case 'weekly':
        // Completed this week (within last 7 days)
        const daysDiff = Math.floor((now.getTime() - lastCompletedDate.getTime()) / (1000 * 60 * 60 * 24))
        return {
          completed: daysDiff < 7,
          lastCompletion: lastLog
        }
      
      case 'monthly':
        // Completed this month
        return {
          completed: lastCompletedDate.getMonth() === now.getMonth() && 
                    lastCompletedDate.getFullYear() === now.getFullYear(),
          lastCompletion: lastLog
        }
      
      case 'after_use':
        // Always show as incomplete for after_use tasks
        return { completed: false, lastCompletion: lastLog }
      
      default:
        return { completed: false }
    }
  }

  const filteredTasks = selectedArea === 'all'
    ? tasks
    : tasks.filter(task => task.area === selectedArea)

  // Group tasks by area
  const tasksByArea = filteredTasks.reduce((acc, task) => {
    if (!acc[task.area]) {
      acc[task.area] = []
    }
    acc[task.area].push(task)
    return acc
  }, {} as Record<string, CleaningTask[]>)

  if (showLogs) {
    return (
      <div>
        <button
          onClick={() => setShowLogs(false)}
          className="mb-4 text-emerald-600 hover:text-emerald-700 font-medium"
        >
          ← Back to Tasks
        </button>
        <CleaningLogsTable />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Cleaning Tasks</h3>
          <p className="text-sm text-gray-600 mt-1">
            Manage routine cleaning schedule and log completions
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowLogs(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Calendar className="h-4 w-4" />
            View Logs
          </button>
          <button
            onClick={() => setShowTaskForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Task
          </button>
        </div>
      </div>

      {/* Area Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedArea('all')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
            selectedArea === 'all'
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All Areas
        </button>
        {Object.values(CleaningArea).map(area => (
          <button
            key={area}
            onClick={() => setSelectedArea(area)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              selectedArea === area
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {getCleaningAreaDisplay(area)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <p className="mt-2 text-gray-600">Loading tasks...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No cleaning tasks found.</p>
          <button
            onClick={() => setShowTaskForm(true)}
            className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Add your first task
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(tasksByArea).map(([area, areaTasks]) => (
            <div key={area} className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-md font-semibold text-gray-800 mb-3">
                {getCleaningAreaDisplay(area as CleaningArea)}
              </h4>
              <div className="space-y-2">
                {areaTasks.map(task => {
                  const completionStatus = isTaskCompleted(task)
                  
                  return (
                    <div
                      key={task.id}
                      className={`bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow ${
                        completionStatus.completed ? 'border-2 border-green-200' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h5 className="font-semibold text-gray-900">{task.task_name}</h5>
                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                              {getCleaningFrequencyDisplay(task.frequency as CleaningFrequency)}
                            </span>
                            {completionStatus.completed && (
                              <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">
                                <Check className="h-3 w-3" />
                                Completed
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">Method:</span>{' '}
                            {task.cleaning_method.replace(/_/g, ' ')}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Responsible:</span> {task.responsible_person}
                          </p>
                          {completionStatus.completed && completionStatus.lastCompletion && (
                            <p className="text-xs text-green-600 mt-2">
                              Last completed by {completionStatus.lastCompletion.completed_by} on{' '}
                              {new Date(completionStatus.lastCompletion.completed_at).toLocaleDateString('en-GB', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleTaskComplete(task.id)}
                          disabled={completionStatus.completed}
                          className={`flex items-center gap-2 px-4 py-2 font-medium rounded-lg transition-colors ${
                            completionStatus.completed
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-emerald-600 text-white hover:bg-emerald-700'
                          }`}
                        >
                          <Check className="h-4 w-4" />
                          {completionStatus.completed ? 'Up to Date' : 'Mark Complete'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {showTaskForm && (
        <CleaningTaskForm
          task={editingTask}
          onSuccess={handleTaskFormSuccess}
          onClose={() => {
            setShowTaskForm(false)
            setEditingTask(null)
          }}
        />
      )}

      {showCompleteModal && completingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Mark Task Complete</h3>
              <button
                onClick={() => {
                  setShowCompleteModal(false)
                  setCompletingTask(null)
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Task</p>
                <p className="font-semibold text-gray-900">{completingTask.task_name}</p>
                <p className="text-sm text-gray-600 mt-2">
                  {getCleaningAreaDisplay(completingTask.area as CleaningArea)} · {getCleaningFrequencyDisplay(completingTask.frequency as CleaningFrequency)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={completedBy}
                  onChange={(e) => setCompletedBy(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && completedBy.trim()) {
                      handleSubmitCompletion()
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comment (optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Any notes or observations..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCompleteModal(false)
                    setCompletingTask(null)
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitCompletion}
                  disabled={submitting || !completedBy.trim()}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Saving...' : 'Mark Complete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
