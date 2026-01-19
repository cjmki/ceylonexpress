'use client'

import { useState, useMemo } from 'react'
import { formatPrice } from '../../../constants/currency'
import { OrderStatus } from '../../../constants/enums'
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, XCircle, CheckCircle, Clock, Calendar } from 'lucide-react'

interface Order {
  id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  delivery_method: string
  delivery_address: string
  delivery_date: string
  delivery_time: string
  total_amount: number
  status: string
  notes: string | null
  created_at: string
  updated_at: string
  order_items: OrderItem[]
}

interface OrderItem {
  id: string
  menu_item_name: string
  menu_item_price: number
  quantity: number
  subtotal: number
}

interface StatisticsManagerProps {
  orders: Order[]
}

export function StatisticsManager({ orders }: StatisticsManagerProps) {
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // Filter orders based on date range (using created_at)
  const filteredOrders = useMemo(() => {
    if (!dateFrom && !dateTo) return orders

    return orders.filter(order => {
      const orderDate = new Date(order.created_at)
      const fromDate = dateFrom ? new Date(dateFrom) : null
      const toDate = dateTo ? new Date(dateTo) : null

      if (fromDate && orderDate < fromDate) return false
      if (toDate) {
        const endOfDay = new Date(toDate)
        endOfDay.setHours(23, 59, 59, 999)
        if (orderDate > endOfDay) return false
      }

      return true
    })
  }, [orders, dateFrom, dateTo])

  // Calculate statistics
  const stats = useMemo(() => {
    const totalOrders = filteredOrders.length
    const pendingOrders = filteredOrders.filter(o => o.status === OrderStatus.PENDING)
    const confirmedOrders = filteredOrders.filter(o => o.status === OrderStatus.CONFIRMED)
    const completedOrders = filteredOrders.filter(o => o.status === OrderStatus.COMPLETED)
    const cancelledOrders = filteredOrders.filter(o => o.status === OrderStatus.CANCELLED)

    // Revenue calculations
    const potentialRevenue = pendingOrders.reduce((sum, o) => sum + o.total_amount, 0) +
                            confirmedOrders.reduce((sum, o) => sum + o.total_amount, 0)
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total_amount, 0)
    
    // Average order value (from completed orders)
    const avgOrderValue = completedOrders.length > 0 
      ? totalRevenue / completedOrders.length 
      : 0

    // Cancellation rate
    const cancellationRate = totalOrders > 0 
      ? (cancelledOrders.length / totalOrders) * 100 
      : 0

    // Delivery vs Pickup
    const deliveryOrders = completedOrders.filter(o => o.delivery_method === 'delivery').length
    const pickupOrders = completedOrders.filter(o => o.delivery_method === 'pickup').length

    // Top selling items (from completed orders only)
    const itemSales: Record<string, { count: number; revenue: number }> = {}
    completedOrders.forEach(order => {
      order.order_items.forEach(item => {
        if (!itemSales[item.menu_item_name]) {
          itemSales[item.menu_item_name] = { count: 0, revenue: 0 }
        }
        itemSales[item.menu_item_name].count += item.quantity
        itemSales[item.menu_item_name].revenue += item.subtotal
      })
    })

    const topItems = Object.entries(itemSales)
      .sort(([, a], [, b]) => b.revenue - a.revenue)
      .slice(0, 5)

    return {
      totalOrders,
      pendingCount: pendingOrders.length,
      confirmedCount: confirmedOrders.length,
      completedCount: completedOrders.length,
      cancelledCount: cancelledOrders.length,
      potentialRevenue,
      totalRevenue,
      avgOrderValue,
      cancellationRate,
      deliveryOrders,
      pickupOrders,
      topItems,
    }
  }, [filteredOrders])

  const handleClearDates = () => {
    setDateFrom('')
    setDateTo('')
  }

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-100">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Date Range Filter</h3>
        </div>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Date
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To Date
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={handleClearDates}
            className="px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            Clear Filters
          </button>
        </div>
        {(dateFrom || dateTo) && (
          <p className="text-sm text-gray-600 mt-3">
            Showing data from {dateFrom || 'beginning'} to {dateTo || 'now'}
          </p>
        )}
      </div>

      {/* Revenue Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Potential Revenue"
          subtitle="Pending + Confirmed orders"
          value={formatPrice(stats.potentialRevenue)}
          icon={<Clock className="h-6 w-6" />}
          color="yellow"
          trend={stats.pendingCount + stats.confirmedCount > 0 ? 'neutral' : 'none'}
        />
        <StatCard
          title="Total Revenue"
          subtitle="Completed orders only"
          value={formatPrice(stats.totalRevenue)}
          icon={<DollarSign className="h-6 w-6" />}
          color="green"
          trend={stats.completedCount > 0 ? 'up' : 'none'}
        />
        <StatCard
          title="Average Order Value"
          subtitle="Per completed order"
          value={formatPrice(stats.avgOrderValue)}
          icon={<ShoppingBag className="h-6 w-6" />}
          color="blue"
          trend="neutral"
        />
      </div>

      {/* Order Status Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatusCard
            title="Total Orders"
            value={stats.totalOrders}
            icon="📦"
            color="blue"
          />
          <StatusCard
            title="Pending"
            value={stats.pendingCount}
            icon="⏳"
            color="yellow"
          />
          <StatusCard
            title="Confirmed"
            value={stats.confirmedCount}
            icon="✅"
            color="green"
          />
          <StatusCard
            title="Completed"
            value={stats.completedCount}
            icon="🎉"
            color="purple"
          />
          <StatusCard
            title="Cancelled"
            value={stats.cancelledCount}
            icon="❌"
            color="red"
          />
        </div>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cancellation Rate & Delivery Method */}
        <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Insights</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div className="flex items-center gap-3">
                <XCircle className="h-6 w-6 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Cancellation Rate</p>
                  <p className="text-xs text-gray-500">Based on all orders</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-red-600">
                {stats.cancellationRate.toFixed(1)}%
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-3">Fulfillment Method</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">🚚 Delivery</span>
                  <span className="text-lg font-bold text-blue-600">{stats.deliveryOrders}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">🏪 Pickup</span>
                  <span className="text-lg font-bold text-blue-600">{stats.pickupOrders}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Selling Items */}
        <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Items</h3>
          {stats.topItems.length > 0 ? (
            <div className="space-y-3">
              {stats.topItems.map(([name, data], index) => (
                <div
                  key={name}
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-orange-600 text-white rounded-full font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{name}</p>
                      <p className="text-xs text-gray-600">{data.count} units sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-orange-600">{formatPrice(data.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <ShoppingBag className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No completed orders yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  title,
  subtitle,
  value,
  icon,
  color,
  trend,
}: {
  title: string
  subtitle: string
  value: string
  icon: React.ReactNode
  color: 'yellow' | 'green' | 'blue'
  trend: 'up' | 'down' | 'neutral' | 'none'
}) {
  const colorClasses = {
    yellow: 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 text-yellow-700',
    green: 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 text-green-700',
    blue: 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 text-blue-700',
  }

  return (
    <div className={`rounded-lg border-2 p-6 ${colorClasses[color]}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="opacity-80">{icon}</div>
        {trend !== 'none' && (
          <div>
            {trend === 'up' && <TrendingUp className="h-5 w-5 text-green-600" />}
            {trend === 'down' && <TrendingDown className="h-5 w-5 text-red-600" />}
          </div>
        )}
      </div>
      <h3 className="text-sm font-medium opacity-80 mb-1">{title}</h3>
      <p className="text-xs opacity-60 mb-2">{subtitle}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  )
}

function StatusCard({
  title,
  value,
  icon,
  color,
}: {
  title: string
  value: number
  icon: string
  color: 'blue' | 'yellow' | 'green' | 'purple' | 'red'
}) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    red: 'bg-red-50 border-red-200 text-red-700',
  }

  return (
    <div className={`rounded-lg border-2 p-4 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-medium opacity-80">{title}</h3>
        <span className="text-xl">{icon}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}
