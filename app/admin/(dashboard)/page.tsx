import { getAllOrders, getAllMenuItems } from '../../actions/orders'
import { getAllRecipeCosts } from '../../actions/recipes'
import { OrdersTable } from './components/OrdersTable'
import { formatPrice } from '../../constants/currency'
import { AdminTabs } from './components/AdminTabs'
import { OrderStatus } from '../../constants/enums'

export type MenuItemCostInfo = {
  menuItemId: string
  menuItemName: string
  sellingPrice: number
  costPerPortion: number | null
}

export type IngredientDetail = {
  stockItemName: string
  quantity: number
  unit: string
  unitCost: number
  lineCost: number
}

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const [orders, menuItems, recipeCostsResult] = await Promise.all([
    getAllOrders(),
    getAllMenuItems(),
    getAllRecipeCosts(),
  ])

  // Build a map of recipe_id -> cost_per_portion
  const recipeCostMap: Record<number, number> = {}
  if (recipeCostsResult.success && recipeCostsResult.data) {
    recipeCostsResult.data.forEach((rc: any) => {
      if (rc.recipe_id != null && rc.cost_per_portion != null) {
        recipeCostMap[rc.recipe_id] = rc.cost_per_portion
      }
    })
  }

  // Build menu item cost info array
  const menuItemCostData: MenuItemCostInfo[] = (menuItems || []).map((item: any) => ({
    menuItemId: item.id,
    menuItemName: item.name,
    sellingPrice: item.price,
    costPerPortion: item.recipe_id != null ? (recipeCostMap[item.recipe_id] ?? null) : null,
  }))

  // Build menu_item_id -> ingredient details map (for expandable profitability rows)
  const recipeIngredientsMap: Record<string, IngredientDetail[]> = recipeCostsResult.ingredients || {}
  const menuItemIngredients: Record<string, IngredientDetail[]> = {}
  ;(menuItems || []).forEach((item: any) => {
    if (item.recipe_id != null && recipeIngredientsMap[item.recipe_id]) {
      menuItemIngredients[item.id] = recipeIngredientsMap[item.recipe_id]
    }
  })

  const pendingOrders = orders.filter(order => order.status === OrderStatus.PENDING)
  const confirmedOrders = orders.filter(order => order.status === OrderStatus.CONFIRMED)
  const completedOrders = orders.filter(order => order.status === OrderStatus.COMPLETED)
  const cancelledOrders = orders.filter(order => order.status === OrderStatus.CANCELLED)

  // Potential Revenue: pending + confirmed orders
  const potentialRevenue = orders
    .filter(order => order.status === OrderStatus.PENDING || order.status === OrderStatus.CONFIRMED)
    .reduce((sum, order) => sum + order.total_amount, 0)

  // Total Revenue: completed orders only (actual realized revenue)
  const totalRevenue = orders
    .filter(order => order.status === OrderStatus.COMPLETED)
    .reduce((sum, order) => sum + order.total_amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage orders and menu items</p>
        </div>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Orders" 
          value={orders.length} 
          color="blue"
          icon="📦"
        />
        <StatCard 
          title="Pending" 
          value={pendingOrders.length} 
          color="yellow"
          icon="⏳"
        />
        <StatCard 
          title="Potential Revenue" 
          value={formatPrice(potentialRevenue)} 
          color="orange"
          icon="💵"
        />
        <StatCard 
          title="Total Revenue" 
          value={formatPrice(totalRevenue)} 
          color="purple"
          icon="💰"
        />
      </div>

      {/* Pending Orders Alert */}
      {pendingOrders.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-2xl mr-3">⚠️</span>
            <div>
              <h3 className="text-sm font-medium text-yellow-800">
                {pendingOrders.length} order{pendingOrders.length > 1 ? 's' : ''} awaiting confirmation
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                Please review and confirm pending orders below
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabbed Interface */}
      <AdminTabs orders={orders} menuItems={menuItems} menuItemCostData={menuItemCostData} menuItemIngredients={menuItemIngredients} />
    </div>
  )
}

function StatCard({ 
  title, 
  value, 
  color,
  icon
}: { 
  title: string
  value: number | string
  color: 'blue' | 'yellow' | 'green' | 'gray' | 'purple' | 'orange'
  icon: string
}) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    gray: 'bg-gray-50 border-gray-200 text-gray-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
  }

  return (
    <div className={`rounded-lg border-2 p-6 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium opacity-80">{title}</h3>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-2xl font-bold">
        {typeof value === 'number' ? value : value}
      </p>
    </div>
  )
}
