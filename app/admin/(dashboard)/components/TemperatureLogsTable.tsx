'use client'

import { useState, useEffect } from 'react'
import { Calendar, AlertTriangle, Filter } from 'lucide-react'
import { getAllTemperatureLogs } from '../../../actions/health-safety'
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

export function TemperatureLogsTable() {
  const [logs, setLogs] = useState<TemperatureLog[]>([])
  const [loading, setLoading] = useState(true)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [outOfRangeOnly, setOutOfRangeOnly] = useState(false)

  useEffect(() => {
    // Set default date range to last 30 days
    const today = new Date()
    const thirtyDaysAgo = new Date(today)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    setDateFrom(thirtyDaysAgo.toISOString().split('T')[0])
    setDateTo(today.toISOString().split('T')[0])
  }, [])

  useEffect(() => {
    if (dateFrom && dateTo) {
      loadLogs()
    }
  }, [dateFrom, dateTo, selectedType, outOfRangeOnly])

  const loadLogs = async () => {
    setLoading(true)
    const result = await getAllTemperatureLogs({
      dateFrom,
      dateTo,
      temperatureType: selectedType === 'all' ? undefined : selectedType,
      outOfRangeOnly,
      limit: 500,
    })
    if (result.success && result.data) {
      setLogs(result.data)
    }
    setLoading(false)
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const outOfRangeCount = logs.filter(log => !log.is_within_range).length

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Temperature Logs</h3>
        {outOfRangeCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm font-medium">
            <AlertTriangle className="h-4 w-4" />
            {outOfRangeCount} out of range
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Date Range:</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">From:</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">To:</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Type:</span>
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">All Types</option>
            {Object.values(TemperatureType).map((type) => (
              <option key={type} value={type}>
                {getTemperatureTypeDisplay(type)}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={outOfRangeOnly}
              onChange={(e) => setOutOfRangeOnly(e.target.checked)}
              className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-sm text-gray-700">Out of range only</span>
          </label>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <p className="mt-2 text-gray-600">Loading logs...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No logs found for the selected filters.</p>
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
                    Order/Batch
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
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
                      {formatDateTime(log.recorded_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {log.recorded_by}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {log.order_id ? `Order #${log.order_id}` : log.batch_date ? formatDate(log.batch_date) : '-'}
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
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {log.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="text-sm text-gray-600 text-center">
        Showing {logs.length} log{logs.length !== 1 ? 's' : ''}
      </div>
    </div>
  )
}
