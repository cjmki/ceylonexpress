'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, TrendingUp, TrendingDown, RefreshCw, Trash2, Package } from 'lucide-react'
import { getStockTransactions } from '../../../actions/stock'

interface StockTransactionsModalProps {
  stockItem: any
  onClose: () => void
}

export function StockTransactionsModal({ stockItem, onClose }: StockTransactionsModalProps) {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const stockItemId = stockItem.stock_item_id || stockItem.id

  useEffect(() => {
    fetchTransactions()
  }, [dateFrom, dateTo])

  const fetchTransactions = async () => {
    setLoading(true)
    const result = await getStockTransactions({
      stockItemId,
      dateFrom,
      dateTo,
      limit: 50,
    })

    if (result.success) {
      setTransactions(result.data)
    }
    setLoading(false)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'RESTOCK': return <TrendingUp className="h-4 w-4" />
      case 'USAGE': return <TrendingDown className="h-4 w-4" />
      case 'ADJUSTMENT': return <RefreshCw className="h-4 w-4" />
      case 'WASTE': return <Trash2 className="h-4 w-4" />
      case 'DELIVERY': return <Package className="h-4 w-4" />
      default: return <RefreshCw className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'RESTOCK': return 'bg-green-100 text-green-800 border-green-300'
      case 'USAGE': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'ADJUSTMENT': return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'WASTE': return 'bg-red-100 text-red-800 border-red-300'
      case 'DELIVERY': return 'bg-indigo-100 text-indigo-800 border-indigo-300'
      case 'INITIAL': return 'bg-gray-100 text-gray-800 border-gray-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-700 to-gray-800 text-white px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Transaction History</h2>
            <p className="text-sm text-gray-300 mt-1">{stockItem.stock_item_name || stockItem.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No transactions yet</h3>
              <p className="text-gray-600">Transaction history will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${getTypeColor(transaction.transaction_type)}`}>
                          {getTypeIcon(transaction.transaction_type)}
                          {transaction.transaction_type}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(transaction.created_at)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mb-2">
                        <div>
                          <div className="text-xs text-gray-500">Before</div>
                          <div className="text-lg font-semibold text-gray-700">
                            {transaction.quantity_before} {stockItem.unit}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Change</div>
                          <div className={`text-lg font-bold ${
                            transaction.quantity_change > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.quantity_change > 0 ? '+' : ''}
                            {transaction.quantity_change} {stockItem.unit}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">After</div>
                          <div className="text-lg font-semibold text-gray-900">
                            {transaction.quantity_after} {stockItem.unit}
                          </div>
                        </div>
                      </div>

                      {transaction.notes && (
                        <div className="mt-2 text-sm text-gray-600 bg-gray-50 rounded p-2">
                          <span className="font-medium">Note:</span> {transaction.notes}
                        </div>
                      )}

                      {transaction.reference_type && (
                        <div className="mt-2 text-xs text-gray-500">
                          Reference: {transaction.reference_type}
                          {transaction.reference_id && ` #${transaction.reference_id}`}
                        </div>
                      )}
                    </div>

                    <div className="text-right ml-4">
                      <div className="text-xs text-gray-500">By</div>
                      <div className="text-sm font-medium text-gray-700">
                        {transaction.created_by}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
