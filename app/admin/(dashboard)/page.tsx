import { getAllOrders, getAllMenuItems } from '../../actions/orders'
import { OrdersTable } from './components/OrdersTable'
import { formatPrice } from '../../constants/currency'
import { AdminTabs } from './components/AdminTabs'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const orders = await getAllOrders()
  const menuItems = await getAllMenuItems()

  const pendingOrders = orders.filter(order => order.status === 'pending')
  const confirmedOrders = orders.filter(order => order.status === 'confirmed')
  const completedOrders = orders.filter(order => order.status === 'completed')
  const cancelledOrders = orders.filter(order => order.status === 'cancelled')

  const totalRevenue = orders
    .filter(order => order.status !== 'cancelled')
    .reduce((sum, order) => sum + order.total_amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage orders and menu items</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
          title="Confirmed" 
          value={confirmedOrders.length} 
          color="green"
          icon="✅"
        />
        <StatCard 
          title="Completed" 
          value={completedOrders.length} 
          color="gray"
          icon="🎉"
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
      <AdminTabs orders={orders} menuItems={menuItems} />
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
  color: 'blue' | 'yellow' | 'green' | 'gray' | 'purple'
  icon: string
}) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    gray: 'bg-gray-50 border-gray-200 text-gray-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
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
