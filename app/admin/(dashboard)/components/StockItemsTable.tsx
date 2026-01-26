'use client'

import { useState } from 'react'
import { Edit2, TrendingUp, AlertCircle, CheckCircle, History } from 'lucide-react'
import { deleteStockItem } from '../../../actions/stock'
import { ConfirmModal } from './ConfirmModal'
import { StockTransactionsModal } from './StockTransactionsModal'

interface StockItem {
  id: number
  stock_item_id: number
  stock_item_name: string
  description?: string
  unit: string
  current_quantity: number
  minimum_threshold: number
  unit_cost: number | null
  supplier: string | null
  supplier_code: string | null
  storage_location: string | null
  notes: string | null
  allergen_names: string[]
  allergen_icons: string[]
  stock_percentage?: number
  stock_status?: 'OUT_OF_STOCK' | 'CRITICAL' | 'LOW' | 'ADEQUATE'
}

interface StockItemsTableProps {
  items: StockItem[]
  onEdit: (item: any) => void
  onAdjust: (item: any) => void
  onUpdate: () => void
}

export function StockItemsTable({ items, onEdit, onAdjust, onUpdate }: StockItemsTableProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [viewingTransactions, setViewingTransactions] = useState<StockItem | null>(null)

  const handleDelete = async (id: number) => {
    const result = await deleteStockItem(id)
    if (result.success) {
      onUpdate()
    } else {
      alert(result.error || 'Failed to delete stock item')
    }
    setDeletingId(null)
  }

  const getStockStatusColor = (item: StockItem) => {
    if (item.current_quantity === 0) return 'bg-red-100 text-red-800 border-red-300'
    if (item.current_quantity <= item.minimum_threshold * 0.5) return 'bg-orange-100 text-orange-800 border-orange-300'
    if (item.current_quantity <= item.minimum_threshold) return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    return 'bg-green-100 text-green-800 border-green-300'
  }

  const getStockIcon = (item: StockItem) => {
    if (item.current_quantity === 0) return <AlertCircle className="h-4 w-4" />
    if (item.current_quantity <= item.minimum_threshold) return <AlertCircle className="h-4 w-4" />
    return <CheckCircle className="h-4 w-4" />
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Item Name
                </th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Current Stock
                </th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Min. Threshold
                </th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Allergens
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Supplier / SKU
                </th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Unit Cost
                </th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((item) => (
                <tr key={item.id || item.stock_item_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {item.stock_item_name}
                        </div>
                        {item.storage_location && (
                          <div className="text-xs text-gray-500">
                            📍 {item.storage_location}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="text-lg font-bold text-gray-900">
                      {item.current_quantity} {item.unit}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="text-sm text-gray-600">
                      {item.minimum_threshold} {item.unit}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${getStockStatusColor(item)}`}>
                        {getStockIcon(item)}
                        {item.current_quantity === 0 ? 'OUT' : 
                         item.current_quantity <= item.minimum_threshold * 0.5 ? 'CRITICAL' :
                         item.current_quantity <= item.minimum_threshold ? 'LOW' : 'OK'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {item.allergen_icons && item.allergen_icons.length > 0 ? (
                        item.allergen_icons.map((icon, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-800"
                            title={item.allergen_names?.[idx]}
                          >
                            {icon}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">None</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {item.supplier || <span className="text-gray-400">—</span>}
                    </div>
                    {item.supplier_code && (
                      <div className="text-xs text-gray-500 mt-0.5">
                        SKU: {item.supplier_code}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="text-sm font-medium text-gray-900">
                      {item.unit_cost ? `${item.unit_cost.toFixed(2)} SEK` : <span className="text-gray-400">—</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setViewingTransactions(item)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View History"
                      >
                        <History className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onAdjust(item)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Adjust Stock"
                      >
                        <TrendingUp className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onEdit(item)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Item"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeletingId(item.stock_item_id || item.id)}
                        className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deletingId !== null}
        title="Delete Stock Item"
        message="Are you sure you want to delete this stock item? This action cannot be undone."
        confirmText="Delete"
        type="danger"
        onConfirm={() => handleDelete(deletingId!)}
        onCancel={() => setDeletingId(null)}
      />

      {/* Transaction History Modal */}
      {viewingTransactions && (
        <StockTransactionsModal
          stockItem={viewingTransactions}
          onClose={() => setViewingTransactions(null)}
        />
      )}
    </>
  )
}
