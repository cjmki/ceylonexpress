'use client'

import React, { useState, useMemo } from 'react'
import { formatPrice } from '../../../constants/currency'
import { OrderStatus } from '../../../constants/enums'
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, XCircle, CheckCircle, Clock, Calendar, AlertTriangle, Receipt, PieChart, ChevronDown, ChevronRight } from 'lucide-react'

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
  menu_item_id: string
  menu_item_name: string
  menu_item_price: number
  quantity: number
  subtotal: number
}

interface MenuItemCostInfo {
  menuItemId: string
  menuItemName: string
  sellingPrice: number
  costPerPortion: number | null
}

interface IngredientDetail {
  stockItemName: string
  quantity: number
  unit: string
  unitCost: number
  lineCost: number
}

interface StatisticsManagerProps {
  orders: Order[]
  menuItemCostData: MenuItemCostInfo[]
  menuItemIngredients: Record<string, IngredientDetail[]>
}

export function StatisticsManager({ orders, menuItemCostData, menuItemIngredients }: StatisticsManagerProps) {
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const toggleExpanded = (menuItemId: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev)
      if (next.has(menuItemId)) {
        next.delete(menuItemId)
      } else {
        next.add(menuItemId)
      }
      return next
    })
  }

  // Build a cost lookup map: menu_item_id -> cost_per_portion
  const costMap = useMemo(() => {
    const map: Record<string, number | null> = {}
    menuItemCostData.forEach(item => {
      map[item.menuItemId] = item.costPerPortion
    })
    return map
  }, [menuItemCostData])

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

    // Cost calculations (from completed orders only)
    let totalCost = 0
    let uncostedItemCount = 0
    let totalItemCount = 0

    // Per-item profitability tracking (by menu_item_id)
    const itemProfitability: Record<string, {
      menuItemId: string
      name: string
      sellingPrice: number
      costPerPortion: number
      unitsSold: number
      totalRevenue: number
      totalCost: number
    }> = {}

    completedOrders.forEach(order => {
      order.order_items.forEach(item => {
        totalItemCount += item.quantity
        const cost = costMap[item.menu_item_id]
        
        if (cost != null) {
          const itemCost = cost * item.quantity
          totalCost += itemCost

          // Track per-item profitability
          if (!itemProfitability[item.menu_item_id]) {
            itemProfitability[item.menu_item_id] = {
              menuItemId: item.menu_item_id,
              name: item.menu_item_name,
              sellingPrice: item.menu_item_price,
              costPerPortion: cost,
              unitsSold: 0,
              totalRevenue: 0,
              totalCost: 0,
            }
          }
          itemProfitability[item.menu_item_id].unitsSold += item.quantity
          itemProfitability[item.menu_item_id].totalRevenue += item.subtotal
          itemProfitability[item.menu_item_id].totalCost += itemCost
        } else {
          uncostedItemCount += item.quantity
        }
      })
    })

    const profit = totalRevenue - totalCost
    const profitMargin = totalRevenue > 0 
      ? ((totalRevenue - totalCost) / totalRevenue) * 100 
      : 0

    // Sort per-item data by total profit descending
    const itemProfitList = Object.values(itemProfitability)
      .map(item => ({
        ...item,
        profitPerUnit: item.sellingPrice - item.costPerPortion,
        margin: item.sellingPrice > 0 
          ? ((item.sellingPrice - item.costPerPortion) / item.sellingPrice) * 100 
          : 0,
        totalProfit: item.totalRevenue - item.totalCost,
      }))
      .sort((a, b) => b.totalProfit - a.totalProfit)

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
      totalCost,
      profit,
      profitMargin,
      uncostedItemCount,
      totalItemCount,
      itemProfitList,
      cancellationRate,
      deliveryOrders,
      pickupOrders,
      topItems,
    }
  }, [filteredOrders, costMap])

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

      {/* Cost & Profit Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost & Profit Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="Total Cost (Approx.)"
            subtitle="Based on recipe ingredient costs"
            value={formatPrice(stats.totalCost)}
            icon={<Receipt className="h-6 w-6" />}
            color="red"
            trend="neutral"
          />
          <StatCard
            title="Estimated Profit"
            subtitle="Revenue minus ingredient costs"
            value={formatPrice(stats.profit)}
            icon={<DollarSign className="h-6 w-6" />}
            color={stats.profit >= 0 ? 'green' : 'red'}
            trend={stats.profit > 0 ? 'up' : stats.profit < 0 ? 'down' : 'none'}
          />
          <StatCard
            title="Profit Margin"
            subtitle="(Revenue - Cost) / Revenue"
            value={`${stats.profitMargin.toFixed(1)}%`}
            icon={<PieChart className="h-6 w-6" />}
            color={stats.profitMargin >= 50 ? 'green' : stats.profitMargin >= 20 ? 'blue' : 'red'}
            trend={stats.profitMargin >= 50 ? 'up' : stats.profitMargin < 20 ? 'down' : 'neutral'}
          />
        </div>
        {stats.uncostedItemCount > 0 && (
          <div className="mt-3 flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>
              {stats.uncostedItemCount} of {stats.totalItemCount} item units sold have no linked recipe — cost may be underestimated.
            </span>
          </div>
        )}
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

      {/* Per-Item Profitability Table */}
      <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Item Profitability</h3>
        <p className="text-sm text-gray-500 mb-4">Only items with linked recipes (costed items) from completed orders</p>
        
        {stats.itemProfitList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-3 font-semibold text-gray-700">Item</th>
                  <th className="text-right py-3 px-3 font-semibold text-gray-700">Price</th>
                  <th className="text-right py-3 px-3 font-semibold text-gray-700">Cost</th>
                  <th className="text-right py-3 px-3 font-semibold text-gray-700">Profit/Unit</th>
                  <th className="text-right py-3 px-3 font-semibold text-gray-700">Margin</th>
                  <th className="text-right py-3 px-3 font-semibold text-gray-700">Units Sold</th>
                  <th className="text-right py-3 px-3 font-semibold text-gray-700">Total Profit</th>
                </tr>
              </thead>
              <tbody>
                {stats.itemProfitList.map((item) => {
                  const isExpanded = expandedItems.has(item.menuItemId)
                  const ingredients = menuItemIngredients[item.menuItemId] || []
                  const hasIngredients = ingredients.length > 0

                  return (
                    <React.Fragment key={item.menuItemId}>
                      <tr
                        className={`border-b border-gray-100 transition-colors ${hasIngredients ? 'cursor-pointer hover:bg-gray-50' : ''} ${isExpanded ? 'bg-gray-50' : ''}`}
                        onClick={() => hasIngredients && toggleExpanded(item.menuItemId)}
                      >
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            {hasIngredients && (
                              <span className="text-gray-400 flex-shrink-0">
                                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                              </span>
                            )}
                            <p className="font-medium text-gray-900">{item.name}</p>
                          </div>
                        </td>
                        <td className="text-right py-3 px-3 text-gray-700">
                          {formatPrice(item.sellingPrice)}
                        </td>
                        <td className="text-right py-3 px-3 text-gray-700">
                          {formatPrice(item.costPerPortion)}
                        </td>
                        <td className="text-right py-3 px-3">
                          <span className={item.profitPerUnit >= 0 ? 'text-green-700' : 'text-red-700'}>
                            {formatPrice(item.profitPerUnit)}
                          </span>
                        </td>
                        <td className="text-right py-3 px-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                            item.margin >= 50
                              ? 'bg-green-100 text-green-800'
                              : item.margin >= 20
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {item.margin.toFixed(1)}%
                          </span>
                        </td>
                        <td className="text-right py-3 px-3 text-gray-700 font-medium">
                          {item.unitsSold}
                        </td>
                        <td className="text-right py-3 px-3">
                          <span className={`font-bold ${item.totalProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                            {formatPrice(item.totalProfit)}
                          </span>
                        </td>
                      </tr>
                      {isExpanded && hasIngredients && (
                        <tr>
                          <td colSpan={7} className="p-0">
                            <div className="bg-gray-50 border-y border-gray-200 px-6 py-3 ml-6">
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Recipe Ingredients</p>
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="text-gray-500">
                                    <th className="text-left py-1.5 pr-3 font-medium">Ingredient</th>
                                    <th className="text-right py-1.5 px-3 font-medium">Quantity</th>
                                    <th className="text-right py-1.5 px-3 font-medium">Unit Cost</th>
                                    <th className="text-right py-1.5 pl-3 font-medium">Line Cost</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {ingredients.map((ing, idx) => (
                                    <tr key={idx} className="border-t border-gray-100">
                                      <td className="py-1.5 pr-3 text-gray-700">{ing.stockItemName}</td>
                                      <td className="text-right py-1.5 px-3 text-gray-600">
                                        {ing.quantity} {ing.unit}
                                      </td>
                                      <td className="text-right py-1.5 px-3 text-gray-600">
                                        {ing.unitCost > 0 ? `${ing.unitCost.toFixed(4)} SEK/${ing.unit}` : '-'}
                                      </td>
                                      <td className="text-right py-1.5 pl-3 font-medium text-gray-700">
                                        {ing.lineCost > 0 ? formatPrice(ing.lineCost) : '-'}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                                <tfoot>
                                  <tr className="border-t border-gray-300">
                                    <td colSpan={3} className="py-1.5 pr-3 font-semibold text-gray-700">Total per portion</td>
                                    <td className="text-right py-1.5 pl-3 font-bold text-gray-900">
                                      {formatPrice(ingredients.reduce((sum, ing) => sum + ing.lineCost, 0))}
                                    </td>
                                  </tr>
                                </tfoot>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-300 bg-gray-50">
                  <td className="py-3 px-3 font-bold text-gray-900" colSpan={5}>
                    Total (Costed Items)
                  </td>
                  <td className="text-right py-3 px-3 font-bold text-gray-900">
                    {stats.itemProfitList.reduce((sum, item) => sum + item.unitsSold, 0)}
                  </td>
                  <td className="text-right py-3 px-3">
                    <span className={`font-bold ${
                      stats.itemProfitList.reduce((sum, item) => sum + item.totalProfit, 0) >= 0
                        ? 'text-green-700'
                        : 'text-red-700'
                    }`}>
                      {formatPrice(stats.itemProfitList.reduce((sum, item) => sum + item.totalProfit, 0))}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Receipt className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No costed items sold yet</p>
            <p className="text-xs mt-1">Link recipes to menu items to see profitability data</p>
          </div>
        )}
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
  color: 'yellow' | 'green' | 'blue' | 'red' | 'orange'
  trend: 'up' | 'down' | 'neutral' | 'none'
}) {
  const colorClasses = {
    yellow: 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 text-yellow-700',
    green: 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 text-green-700',
    blue: 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 text-blue-700',
    red: 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200 text-red-700',
    orange: 'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 text-orange-700',
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
