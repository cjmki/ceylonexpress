'use client'

import { useState, useEffect } from 'react'
import { Plus, Thermometer, AlertTriangle } from 'lucide-react'
import { getAllTemperatureLogs, getAllTemperatureRanges } from '../../../actions/health-safety'
import { TemperatureLogForm } from './TemperatureLogForm'
import { TemperatureLogsTable } from './TemperatureLogsTable'
import { TemperatureType, getTemperatureTypeDisplay } from '../../../constants/enums'

interface TemperatureLog {
  id: number
  temperature_type: string
  temperature_value: number
  unit: string
  recorded_at: string
  order_id: number | null
  batch_date: string | null
  notes: string | null
  is_within_range: boolean
  recorded_by: string
  created_at: string
}

interface TemperatureRange {
  id: number
  temperature_type: string
  min_temp: number | null
  max_temp: number | null
  warning_message: string
}

interface TemperatureControlManagerProps {
  onUpdate?: () => void
}

export function TemperatureControlManager({ onUpdate }: TemperatureControlManagerProps) {
  const [recentLogs, setRecentLogs] = useState<TemperatureLog[]>([])
  const [ranges, setRanges] = useState<TemperatureRange[]>([])
  const [loading, setLoading] = useState(true)
  const [showLogForm, setShowLogForm] = useState(false)
  const [showAllLogs, setShowAllLogs] = useState(false)
  const [selectedType, setSelectedType] = useState<string | undefined>()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    
    // Load recent logs (last 20)
    const logsResult = await getAllTemperatureLogs({ limit: 20 })
    if (logsResult.success && logsResult.data) {
      setRecentLogs(logsResult.data)
    }

    // Load temperature ranges
    const rangesResult = await getAllTemperatureRanges()
    if (rangesResult.success && rangesResult.data) {
      setRanges(rangesResult.data)
    }

    setLoading(false)
  }

  const handleLogSuccess = () => {
    setShowLogForm(false)
    setSelectedType(undefined)
    loadData()
    onUpdate?.()
  }

  const handleQuickLog = (type: TemperatureType) => {
    setSelectedType(type)
    setShowLogForm(true)
  }

  const getRangeForType = (type: string) => {
    return ranges.find(r => r.temperature_type === type)
  }

  const outOfRangeCount = recentLogs.filter(log => !log.is_within_range).length

  if (showAllLogs) {
    return (
      <div>
        <button
          onClick={() => setShowAllLogs(false)}
          className="mb-4 text-emerald-600 hover:text-emerald-700 font-medium"
        >
          ← Back to Quick Entry
        </button>
        <TemperatureLogsTable />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Temperature Control</h3>
          <p className="text-sm text-gray-600 mt-1">
            Log and monitor temperatures for food safety compliance
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAllLogs(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Thermometer className="h-4 w-4" />
            View All Logs
          </button>
          <button
            onClick={() => {
              setSelectedType(undefined)
              setShowLogForm(true)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Log
          </button>
        </div>
      </div>

      {/* Quick Entry Buttons */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Temperature Entry (Click to Log)</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.values(TemperatureType).map((type) => {
            const range = getRangeForType(type)
            return (
              <button
                key={type}
                onClick={() => handleQuickLog(type)}
                className="flex flex-col items-start p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left"
              >
                <Thermometer className="h-5 w-5 text-emerald-600 mb-2" />
                <span className="font-semibold text-gray-900">
                  {getTemperatureTypeDisplay(type)}
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  {range?.min_temp && `≥ ${range.min_temp}°C`}
                  {range?.min_temp && range?.max_temp && ' / '}
                  {range?.max_temp && `≤ ${range.max_temp}°C`}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Recent Logs */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-700">Recent Temperature Logs</h4>
          {outOfRangeCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm font-medium">
              <AlertTriangle className="h-4 w-4" />
              {outOfRangeCount} out of range
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            <p className="mt-2 text-gray-600">Loading logs...</p>
          </div>
        ) : recentLogs.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No temperature logs yet.</p>
            <p className="text-sm text-gray-500 mt-1">Click a button above to add your first log</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Temperature
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recorded At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recorded By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentLogs.map((log) => (
                    <tr
                      key={log.id}
                      className={`hover:bg-gray-50 ${!log.is_within_range ? 'bg-red-50' : ''}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {getTemperatureTypeDisplay(log.temperature_type as TemperatureType)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`font-semibold ${!log.is_within_range ? 'text-red-700' : 'text-gray-900'}`}>
                          {log.temperature_value}°{log.unit === 'celsius' ? 'C' : 'F'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(log.recorded_at).toLocaleString('en-GB', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {log.recorded_by}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {log.is_within_range ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            ✓ OK
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                            ⚠ Out of Range
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showLogForm && (
        <TemperatureLogForm
          preselectedType={selectedType}
          ranges={ranges}
          onSuccess={handleLogSuccess}
          onClose={() => {
            setShowLogForm(false)
            setSelectedType(undefined)
          }}
        />
      )}
    </div>
  )
}
