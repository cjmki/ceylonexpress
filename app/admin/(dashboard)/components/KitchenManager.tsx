'use client'

import { useState, useEffect, useCallback } from 'react'
import { getFilteredOrders } from '../../../actions/orders'
import { getMenuItemIngredientsForOrders, calculateIngredientRequirements } from '../../../actions/recipes'
import { Loader2, ChefHat, Calendar, Beef, Archive, Package, AlertTriangle } from 'lucide-react'
import { OrderStatus } from '../../../constants/enums'
import { formatPrice } from '../../../constants/currency'
import { RecipeManager } from './RecipeManager'
import { StockManager } from './StockManager'

type SubTab = 'orders' | 'recipes' | 'stock'

interface IngredientRequirement {
  stock_item_id: number
  stock_item_name: string
  total_quantity_needed: number
  unit: string
  current_stock: number
  minimum_threshold: number
}

interface MenuItemIngredients {
  menu_item_id: string
  menu_item_name: string
  total_portions: number
  ingredients: Array<{
    stock_item_id: number
    stock_item_name: string
    quantity_per_portion: number
    unit: string
    total_needed: number
    current_stock: number
    minimum_threshold: number
  }>
}

interface OrderItem {
  id: string
  menu_item_name: string
  menu_item_price: number
  quantity: number
  subtotal: number
}

interface Order {
  id: number
  customer_name: string
  customer_phone: string
  delivery_method: string
  delivery_address: string
  delivery_date: string
  delivery_time: string
  total_amount: number
  status: string
  notes?: string
  order_items: OrderItem[]
}

interface ItemSummary {
  itemName: string
  quantities: Record<string, number> // date -> quantity
  totalQuantity: number
}

export function KitchenManager() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('orders')
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const fetchConfirmedOrders = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getFilteredOrders({
        page: 1,
        pageSize: 10000, // Get all confirmed orders
        status: OrderStatus.CONFIRMED,
        sortBy: 'delivery_date',
        sortOrder: 'asc'
      })

      if (result.success) {
        setOrders(result.data)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchConfirmedOrders()
  }, [fetchConfirmedOrders])

  return (
    <div className="space-y-6">
      {/* Sub-Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveSubTab('orders')}
          className={`flex items-center gap-2 px-4 py-3 font-semibold transition-all ${
            activeSubTab === 'orders'
              ? 'text-green-700 border-b-2 border-green-700'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <ChefHat className="h-4 w-4" />
          Kitchen Orders
          {orders.length > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              activeSubTab === 'orders'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-200 text-gray-700'
            }`}>
              {orders.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('recipes')}
          className={`flex items-center gap-2 px-4 py-3 font-semibold transition-all ${
            activeSubTab === 'recipes'
              ? 'text-amber-700 border-b-2 border-amber-700'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Beef className="h-4 w-4" />
          Recipes
        </button>

        <button
          onClick={() => setActiveSubTab('stock')}
          className={`flex items-center gap-2 px-4 py-3 font-semibold transition-all ${
            activeSubTab === 'stock'
              ? 'text-purple-700 border-b-2 border-purple-700'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Archive className="h-4 w-4" />
          Stock
        </button>
      </div>

      {/* Sub-Tab Content */}
      {activeSubTab === 'orders' && <KitchenOrdersContent orders={orders} loading={loading} />}
      {activeSubTab === 'recipes' && <RecipeManager />}
      {activeSubTab === 'stock' && <StockManager />}
    </div>
  )
}

// Kitchen Orders Content Component
function KitchenOrdersContent({ orders, loading }: { orders: Order[], loading: boolean }) {
  const [menuItemIngredients, setMenuItemIngredients] = useState<MenuItemIngredients[]>([])
  const [ingredientRequirements, setIngredientRequirements] = useState<IngredientRequirement[]>([])
  const [loadingIngredients, setLoadingIngredients] = useState(false)

  // Calculate item summary grouped by date - MUST be before early returns
  const itemSummary: ItemSummary[] = React.useMemo(() => {
    const summaryMap = new Map<string, ItemSummary>()

    orders.forEach(order => {
      order.order_items.forEach(item => {
        const existing = summaryMap.get(item.menu_item_name)
        
        if (existing) {
          existing.quantities[order.delivery_date] = 
            (existing.quantities[order.delivery_date] || 0) + item.quantity
          existing.totalQuantity += item.quantity
        } else {
          summaryMap.set(item.menu_item_name, {
            itemName: item.menu_item_name,
            quantities: { [order.delivery_date]: item.quantity },
            totalQuantity: item.quantity
          })
        }
      })
    })

    return Array.from(summaryMap.values()).sort((a, b) => 
      a.itemName.localeCompare(b.itemName)
    )
  }, [orders])

  // Get unique dates sorted - MUST be before early returns
  const uniqueDates = React.useMemo(() => {
    const dates = new Set(orders.map(o => o.delivery_date))
    return Array.from(dates).sort()
  }, [orders])

  useEffect(() => {
    const fetchIngredients = async () => {
      if (orders.length === 0) return
      
      setLoadingIngredients(true)
      try {
        const orderIds = orders.map(o => o.id)
        
        // Fetch menu item-specific ingredients
        const menuItemResult = await getMenuItemIngredientsForOrders(orderIds)
        if (menuItemResult.success) {
          setMenuItemIngredients(menuItemResult.data)
        }
        
        // Fetch total ingredients
        const totalResult = await calculateIngredientRequirements(orderIds)
        if (totalResult.success) {
          setIngredientRequirements(totalResult.data)
        }
      } catch (error) {
        console.error('Error fetching ingredient requirements:', error)
      } finally {
        setLoadingIngredients(false)
      }
    }

    fetchIngredients()
  }, [orders])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        <span className="ml-3 text-gray-600">Loading kitchen orders...</span>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <div className="text-6xl mb-4">👨‍🍳</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No confirmed orders</h3>
        <p className="text-gray-600">
          Confirmed orders will appear here for kitchen preparation
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Item Summary Section (with Ingredient Requirements) */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow-md border-2 border-green-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <ChefHat className="h-7 w-7 text-green-700" />
          <div>
            <h2 className="text-2xl font-bold text-green-900">Preparation Summary</h2>
            <p className="text-sm text-green-700 mt-1">
              Menu items and ingredient requirements for confirmed orders
            </p>
          </div>
          {loadingIngredients && (
            <Loader2 className="h-5 w-5 animate-spin text-green-600 ml-auto" />
          )}
        </div>

        {/* Menu Items Table */}
        <div className="bg-white rounded-lg shadow-sm border border-green-200 overflow-hidden mb-6">
          <div className="bg-green-600 text-white px-4 py-2">
            <h3 className="font-bold text-sm">Menu Items by Date</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-green-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left font-bold">Menu Item</th>
                  {uniqueDates.map(date => (
                    <th key={date} className="px-4 py-3 text-center font-bold">
                      <div className="flex flex-col items-center">
                        <Calendar className="h-4 w-4 mb-1" />
                        <span className="text-xs">{formatDate(date)}</span>
                      </div>
                    </th>
                  ))}
                  {uniqueDates.length > 1 && (
                    <th className="px-4 py-3 text-center font-bold bg-green-700">
                      Total
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {itemSummary.map((item, idx) => (
                  <tr 
                    key={item.itemName}
                    className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                  >
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {item.itemName}
                    </td>
                    {uniqueDates.map(date => (
                      <td key={date} className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center min-w-[40px] px-3 py-1.5 rounded-full text-sm font-bold bg-green-100 text-green-800">
                          {item.quantities[date] || '-'}
                        </span>
                      </td>
                    ))}
                    {uniqueDates.length > 1 && (
                      <td className="px-4 py-3 text-center bg-green-50">
                        <span className="inline-flex items-center justify-center min-w-[40px] px-3 py-1.5 rounded-full text-sm font-bold bg-green-600 text-white">
                          {item.totalQuantity}
                        </span>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ingredient Requirements by Menu Item */}
        {menuItemIngredients.length > 0 && (
          <div className="space-y-4">
            <div className="bg-blue-600 text-white px-4 py-2 rounded-t-lg">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Package className="h-4 w-4" />
                Ingredient Requirements by Menu Item
              </h3>
            </div>

            {/* Show ingredients for each menu item that has a recipe */}
            {menuItemIngredients.map((menuItem) => (
              <div key={menuItem.menu_item_id} className="bg-white rounded-lg border-2 border-blue-200 overflow-hidden">
                <div className="bg-blue-100 px-4 py-2 border-b border-blue-200">
                  <h4 className="font-bold text-blue-900">
                    {menuItem.menu_item_name}
                    <span className="ml-2 text-sm font-normal text-blue-700">
                      ({menuItem.total_portions} {menuItem.total_portions === 1 ? 'portion' : 'portions'})
                    </span>
                  </h4>
                </div>
                <div className="p-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 text-gray-700">Ingredient</th>
                        <th className="text-center py-2 text-gray-700">Per Portion</th>
                        <th className="text-center py-2 text-gray-700">Total Needed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {menuItem.ingredients.map((ing) => (
                        <tr key={ing.stock_item_id} className="border-b border-gray-100 last:border-0">
                          <td className="py-2 text-gray-900">{ing.stock_item_name}</td>
                          <td className="text-center py-2 text-gray-600">
                            {ing.quantity_per_portion.toFixed(2)} {ing.unit}
                          </td>
                          <td className="text-center py-2">
                            <span className="font-semibold text-blue-900">
                              {ing.total_needed.toFixed(2)} {ing.unit}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

            {/* Total Ingredients Summary */}
            <div className="bg-white rounded-lg border-2 border-green-300 overflow-hidden mt-6">
              <div className="bg-green-600 text-white px-4 py-2">
                <h4 className="font-bold flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  TOTAL INGREDIENTS REQUIRED
                </h4>
              </div>
              <div className="p-4">
                <table className="w-full">
                  <thead className="border-b-2 border-gray-200">
                    <tr>
                      <th className="text-left py-2 font-bold text-gray-900">Ingredient</th>
                      <th className="text-center py-2 font-bold text-gray-900">Total Needed</th>
                      <th className="text-center py-2 font-bold text-gray-900">Current Stock</th>
                      <th className="text-center py-2 font-bold text-gray-900">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {ingredientRequirements.map((ingredient) => {
                      const isSufficient = ingredient.current_stock >= ingredient.total_quantity_needed
                      const isLow = ingredient.current_stock <= ingredient.minimum_threshold
                      const remaining = ingredient.current_stock - ingredient.total_quantity_needed
                      
                      return (
                        <tr 
                          key={ingredient.stock_item_id}
                          className={`${
                            !isSufficient ? 'bg-red-50' : isLow ? 'bg-yellow-50' : ''
                          }`}
                        >
                          <td className="py-3 font-semibold text-gray-900">
                            {ingredient.stock_item_name}
                          </td>
                          <td className="text-center py-3">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-800">
                              {ingredient.total_quantity_needed.toFixed(2)} {ingredient.unit}
                            </span>
                          </td>
                          <td className="text-center py-3">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                              !isSufficient 
                                ? 'bg-red-100 text-red-800' 
                                : isLow 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {ingredient.current_stock.toFixed(2)} {ingredient.unit}
                            </span>
                          </td>
                          <td className="text-center py-3">
                            {!isSufficient ? (
                              <div className="flex items-center justify-center gap-1 text-red-700 font-bold text-sm">
                                <AlertTriangle className="h-4 w-4" />
                                SHORT {Math.abs(remaining).toFixed(2)} {ingredient.unit}
                              </div>
                            ) : isLow ? (
                              <div className="flex items-center justify-center gap-1 text-yellow-700 font-semibold text-sm">
                                <AlertTriangle className="h-4 w-4" />
                                Low Stock
                              </div>
                            ) : (
                              <div className="text-green-700 font-semibold text-sm">
                                ✓ Sufficient
                              </div>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {ingredientRequirements.some(i => i.current_stock < i.total_quantity_needed) && (
                <div className="mx-4 mb-4 p-3 bg-red-100 border-2 border-red-300 rounded-lg">
                  <div className="flex items-center gap-2 text-red-900">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="font-bold text-sm">
                      Warning: Some ingredients are insufficient for confirmed orders. Restock immediately!
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* KOT Grid Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Kitchen Order Tickets</h2>
          <span className="px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-800">
            {orders.length} {orders.length === 1 ? 'order' : 'orders'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {orders.map(order => (
            <KitchenOrderTicket key={order.id} order={order} />
          ))}
        </div>
      </div>
    </div>
  )
}

// Kitchen Order Ticket Component
function KitchenOrderTicket({ order }: { order: Order }) {
  return (
    <div className="bg-white rounded-lg shadow-lg border-2 border-gray-300 overflow-hidden hover:shadow-xl transition-shadow flex flex-col h-full">
      {/* Header */}
      <div className="bg-green-600 text-white px-4 py-3">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-xs font-medium opacity-90">Order #</div>
            <div className="text-2xl font-bold">{order.id}</div>
          </div>
          <div className="text-right">
            <div className="text-xs opacity-90">{formatDate(order.delivery_date)}</div>
            <div className="text-sm font-bold">{formatTime(order.delivery_time)}</div>
          </div>
        </div>
      </div>

      {/* Customer Info */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="text-sm font-bold text-gray-900 truncate">
          {order.customer_name}
        </div>
        <div className="text-xs text-gray-600 mt-0.5">
          {order.customer_phone}
        </div>
        <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800">
          {order.delivery_method === 'delivery' ? '🚚' : '🏪'} {order.delivery_method.toUpperCase()}
        </div>
      </div>

      {/* Order Items */}
      <div className="px-4 py-3 flex-grow">
        <div className="space-y-2">
          {order.order_items.map((item, idx) => (
            <div 
              key={item.id} 
              className="flex justify-between items-start py-2 border-b border-gray-100 last:border-0"
            >
              <div className="flex-1">
                <div className="font-semibold text-gray-900 text-sm leading-tight">
                  {item.menu_item_name}
                </div>
              </div>
              <div className="ml-3 flex-shrink-0">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-600 text-white font-bold text-sm">
                  {item.quantity}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="px-4 py-3 bg-yellow-50 border-t border-yellow-200">
          <div className="text-xs font-semibold text-yellow-900 mb-1">SPECIAL NOTES:</div>
          <div className="text-xs text-yellow-800">{order.notes}</div>
        </div>
      )}

      {/* Delivery Address (for delivery orders) - Always at bottom */}
      {order.delivery_method === 'delivery' && order.delivery_address && (
        <div className="px-4 py-2 bg-blue-50 border-t border-blue-200 mt-auto">
          <div className="text-xs font-semibold text-blue-900 mb-1">DELIVERY TO:</div>
          <div className="text-xs text-blue-800 leading-tight">{order.delivery_address}</div>
        </div>
      )}
    </div>
  )
}

// Utility functions
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const options: Intl.DateTimeFormatOptions = { 
    month: 'short', 
    day: 'numeric',
    weekday: 'short'
  }
  return date.toLocaleDateString('en-US', options)
}

function formatTime(timeString: string): string {
  const timeMap: Record<string, string> = {
    'breakfast': 'Breakfast',
    'lunch': 'Lunch',
    'dinner': 'Dinner'
  }
  return timeMap[timeString.toLowerCase()] || timeString
}

// Import React for useMemo
import * as React from 'react'
