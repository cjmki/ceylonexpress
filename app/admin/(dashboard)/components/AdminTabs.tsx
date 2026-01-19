'use client'

import { useState } from 'react'
import { Plus, Package, UtensilsCrossed, ChefHat, BarChart3 } from 'lucide-react'
import { OrdersManager } from './OrdersManager'
import { MenuItemsTable } from './MenuItemsTable'
import { KitchenManager } from './KitchenManager'
import { StatisticsManager } from './StatisticsManager'
import { AddMenuItemForm } from './AddMenuItemForm'
import { useRouter } from 'next/navigation'
import { OrderStatus } from '../../../constants/enums'

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

interface AdminTabsProps {
  orders: Order[]
  menuItems: MenuItem[]
}

type Tab = 'orders' | 'menu' | 'kitchen' | 'statistics'

export function AdminTabs({ orders, menuItems }: AdminTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('orders')
  const [showAddMenuForm, setShowAddMenuForm] = useState(false)
  const router = useRouter()

  const handleMenuUpdate = () => {
    setShowAddMenuForm(false)
    router.refresh()
  }

  // Count confirmed orders
  const confirmedOrdersCount = orders.filter(order => order.status === OrderStatus.CONFIRMED).length

  return (
    <>
      <div className="bg-white rounded-lg shadow">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <div className="flex gap-2 px-6 pt-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-t-lg transition-all whitespace-nowrap ${
                activeTab === 'orders'
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Package className="h-5 w-5" />
              Orders
              <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === 'orders'
                  ? 'bg-blue-200 text-blue-800'
                  : 'bg-gray-200 text-gray-700'
              }`}>
                {orders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('menu')}
              className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-t-lg transition-all whitespace-nowrap ${
                activeTab === 'menu'
                  ? 'bg-orange-50 text-orange-700 border-b-2 border-orange-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <UtensilsCrossed className="h-5 w-5" />
              Menu Items
              <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === 'menu'
                  ? 'bg-orange-200 text-orange-800'
                  : 'bg-gray-200 text-gray-700'
              }`}>
                {menuItems.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('kitchen')}
              className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-t-lg transition-all whitespace-nowrap ${
                activeTab === 'kitchen'
                  ? 'bg-green-50 text-green-700 border-b-2 border-green-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <ChefHat className="h-5 w-5" />
              Kitchen
              <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === 'kitchen'
                  ? 'bg-green-200 text-green-800'
                  : 'bg-gray-200 text-gray-700'
              }`}>
                {confirmedOrdersCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('statistics')}
              className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-t-lg transition-all whitespace-nowrap ${
                activeTab === 'statistics'
                  ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <BarChart3 className="h-5 w-5" />
              Statistics
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'orders' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Orders Management</h2>
                  <p className="text-sm text-gray-600 mt-1">View, filter, and manage customer orders</p>
                </div>
              </div>

              <OrdersManager />
            </div>
          )}

          {activeTab === 'menu' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Menu Items</h2>
                  <p className="text-sm text-gray-600 mt-1">Manage your restaurant's menu</p>
                </div>
                <button
                  onClick={() => setShowAddMenuForm(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition-colors shadow-md hover:shadow-lg"
                >
                  <Plus className="h-5 w-5" />
                  Add Menu Item
                </button>
              </div>

              <MenuItemsTable items={menuItems} onUpdate={() => router.refresh()} />
            </div>
          )}

          {activeTab === 'kitchen' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Kitchen Dashboard</h2>
                  <p className="text-sm text-gray-600 mt-1">View confirmed orders and preparation summary</p>
                </div>
              </div>

              <KitchenManager />
            </div>
          )}

          {activeTab === 'statistics' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Business Statistics</h2>
                <p className="text-sm text-gray-600 mt-1">Overview of your restaurant's performance</p>
              </div>

              <StatisticsManager orders={orders} />
            </div>
          )}
        </div>
      </div>

      {/* Add Menu Item Modal */}
      {showAddMenuForm && (
        <AddMenuItemForm
          onSuccess={handleMenuUpdate}
          onClose={() => setShowAddMenuForm(false)}
        />
      )}
    </>
  )
}
