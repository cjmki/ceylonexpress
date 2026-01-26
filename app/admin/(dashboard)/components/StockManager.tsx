'use client'

import { useState, useEffect, useCallback } from 'react'
import { getAllStockItemsWithAllergens, getLowStockItems } from '../../../actions/stock'
import { Loader2, Plus, AlertTriangle, Package, TrendingDown } from 'lucide-react'
import { StockItemForm } from './StockItemForm'
import { StockItemsTable } from './StockItemsTable'
import { StockAdjustmentModal } from './StockAdjustmentModal'

export function StockManager() {
  const [stockItems, setStockItems] = useState<any[]>([])
  const [lowStockItems, setLowStockItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [adjustingItem, setAdjustingItem] = useState<any>(null)
  const [filterView, setFilterView] = useState<'all' | 'low'>('all')

  const fetchStockItems = useCallback(async () => {
    setLoading(true)
    try {
      const [itemsResult, lowStockResult] = await Promise.all([
        getAllStockItemsWithAllergens(),
        getLowStockItems()
      ])

      if (itemsResult.success) {
        setStockItems(itemsResult.data)
      }
      
      if (lowStockResult.success) {
        setLowStockItems(lowStockResult.data)
      }
    } catch (error) {
      console.error('Error fetching stock items:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStockItems()
  }, [fetchStockItems])

  const handleFormSuccess = () => {
    setShowAddForm(false)
    setEditingItem(null)
    fetchStockItems()
  }

  const handleAdjustmentSuccess = () => {
    setAdjustingItem(null)
    fetchStockItems()
  }

  const displayItems = filterView === 'low' ? lowStockItems : stockItems

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Loading stock items...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Alert Banner for Low Stock */}
      {lowStockItems.length > 0 && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-red-900">
                {lowStockItems.length} item{lowStockItems.length > 1 ? 's' : ''} below minimum threshold
              </h3>
              <p className="text-sm text-red-700 mt-1">
                Please restock items marked in red to avoid running out
              </p>
            </div>
            <button
              onClick={() => setFilterView('low')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold text-sm"
            >
              View Low Stock
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Items"
          value={stockItems.length}
          icon={<Package className="h-6 w-6" />}
          color="blue"
        />
        <StatCard
          title="Low Stock Items"
          value={lowStockItems.length}
          icon={<TrendingDown className="h-6 w-6" />}
          color={lowStockItems.length > 0 ? 'red' : 'green'}
        />
        <StatCard
          title="Out of Stock"
          value={lowStockItems.filter(item => item.current_quantity === 0).length}
          icon={<AlertTriangle className="h-6 w-6" />}
          color="red"
        />
      </div>

      {/* Header with Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Stock Inventory</h2>
          <p className="text-sm text-gray-600 mt-1">Manage ingredients and stock levels</p>
        </div>
        <div className="flex gap-3">
          {/* Filter Buttons */}
          <div className="flex gap-2 mr-3">
            <button
              onClick={() => setFilterView('all')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                filterView === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Items ({stockItems.length})
            </button>
            <button
              onClick={() => setFilterView('low')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                filterView === 'low'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Low Stock ({lowStockItems.length})
            </button>
          </div>
          
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
          >
            <Plus className="h-5 w-5" />
            Add Stock Item
          </button>
        </div>
      </div>

      {/* Stock Items Table */}
      {displayItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {filterView === 'low' ? 'No low stock items' : 'No stock items yet'}
          </h3>
          <p className="text-gray-600">
            {filterView === 'low' 
              ? 'All stock items are at adequate levels' 
              : 'Add your first stock item to start tracking inventory'}
          </p>
        </div>
      ) : (
        <StockItemsTable
          items={displayItems}
          onEdit={setEditingItem}
          onAdjust={setAdjustingItem}
          onUpdate={fetchStockItems}
        />
      )}

      {/* Add/Edit Form Modal */}
      {(showAddForm || editingItem) && (
        <StockItemForm
          item={editingItem}
          onSuccess={handleFormSuccess}
          onClose={() => {
            setShowAddForm(false)
            setEditingItem(null)
          }}
        />
      )}

      {/* Stock Adjustment Modal */}
      {adjustingItem && (
        <StockAdjustmentModal
          item={adjustingItem}
          onSuccess={handleAdjustmentSuccess}
          onClose={() => setAdjustingItem(null)}
        />
      )}
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
