'use client'

import { useState, useEffect } from 'react'
import { Shield, Thermometer, ClipboardCheck, AlertCircle } from 'lucide-react'
import { CleaningScheduleManager } from './CleaningScheduleManager'
import { TemperatureControlManager } from './TemperatureControlManager'
import { AllergenManager } from './AllergenManager'
import { getHealthSafetyStats } from '../../../actions/health-safety'

type SubTab = 'cleaning' | 'temperature' | 'allergens'

export function HealthSafetyManager() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('cleaning')
  const [stats, setStats] = useState({
    overdueTasks: 0,
    outOfRangeTemperatures: 0,
    tasksDueToday: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    setLoading(true)
    const result = await getHealthSafetyStats()
    if (result.success && result.data) {
      setStats(result.data)
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Tasks Due Today"
          value={stats.tasksDueToday}
          icon={<ClipboardCheck className="h-6 w-6" />}
          color="blue"
        />
        <StatCard
          title="Overdue Tasks"
          value={stats.overdueTasks}
          icon={<Shield className="h-6 w-6" />}
          color={stats.overdueTasks > 0 ? 'red' : 'green'}
        />
        <StatCard
          title="Out of Range (7 days)"
          value={stats.outOfRangeTemperatures}
          icon={<Thermometer className="h-6 w-6" />}
          color={stats.outOfRangeTemperatures > 0 ? 'red' : 'green'}
        />
      </div>

      {/* Sub-tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <div className="flex gap-2 px-6 pt-4">
            <button
              onClick={() => setActiveSubTab('cleaning')}
              className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-t-lg transition-all ${
                activeSubTab === 'cleaning'
                  ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <ClipboardCheck className="h-5 w-5" />
              Cleaning Schedule
              {stats.overdueTasks > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-red-500 text-white rounded-full text-xs font-bold">
                  {stats.overdueTasks}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveSubTab('temperature')}
              className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-t-lg transition-all ${
                activeSubTab === 'temperature'
                  ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Thermometer className="h-5 w-5" />
              Temperature Control
              {stats.outOfRangeTemperatures > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-red-500 text-white rounded-full text-xs font-bold">
                  {stats.outOfRangeTemperatures}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveSubTab('allergens')}
              className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-t-lg transition-all ${
                activeSubTab === 'allergens'
                  ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <AlertCircle className="h-5 w-5" />
              Allergen Management
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeSubTab === 'cleaning' && <CleaningScheduleManager onUpdate={loadStats} />}
          {activeSubTab === 'temperature' && <TemperatureControlManager onUpdate={loadStats} />}
          {activeSubTab === 'allergens' && <AllergenManager />}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string
  value: number
  icon: React.ReactNode
  color: 'blue' | 'green' | 'red'
}) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    red: 'bg-red-50 border-red-200 text-red-700',
  }

  return (
    <div className={`rounded-lg border-2 p-6 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium opacity-80">{title}</h3>
        {icon}
      </div>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  )
}
