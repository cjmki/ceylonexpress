'use client'

import { useState } from 'react'
import { X, Loader2, Plus, Minus, RefreshCw, Trash2 } from 'lucide-react'
import { adjustStock } from '../../../actions/stock'

interface StockAdjustmentModalProps {
  item: any
  onSuccess: () => void
  onClose: () => void
}

export function StockAdjustmentModal({ item, onSuccess, onClose }: StockAdjustmentModalProps) {
  const [transactionType, setTransactionType] = useState<'RESTOCK' | 'USAGE' | 'ADJUSTMENT' | 'WASTE'>('RESTOCK')
  const [quantityChange, setQuantityChange] = useState<string>('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const currentQuantity = item.current_quantity || 0
  const unit = item.unit
  const stockItemId = item.stock_item_id || item.id

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!quantityChange || parseFloat(quantityChange) === 0) {
      alert('Please enter a valid quantity')
      return
    }

    setSaving(true)

    try {
      const changeValue = parseFloat(quantityChange)
      const adjustedChange = (transactionType === 'USAGE' || transactionType === 'WASTE') 
        ? -Math.abs(changeValue)  // Negative for usage/waste
        : Math.abs(changeValue)    // Positive for restock/adjustment

      const result = await adjustStock({
        stockItemId,
        quantityChange: adjustedChange,
        transactionType,
        notes,
        createdBy: 'admin', // TODO: Get from auth context
      })

      if (result.success) {
        onSuccess()
      } else {
        alert(result.error || 'Failed to adjust stock')
      }
    } catch (error) {
      console.error('Error adjusting stock:', error)
      alert('Failed to adjust stock')
    } finally {
      setSaving(false)
    }
  }

  const newQuantity = () => {
    if (!quantityChange) return currentQuantity
    const change = parseFloat(quantityChange)
    if (transactionType === 'USAGE' || transactionType === 'WASTE') {
      return currentQuantity - change
    }
    return currentQuantity + change
  }

  const getTypeIcon = () => {
    switch (transactionType) {
      case 'RESTOCK': return <Plus className="h-5 w-5" />
      case 'USAGE': return <Minus className="h-5 w-5" />
      case 'ADJUSTMENT': return <RefreshCw className="h-5 w-5" />
      case 'WASTE': return <Trash2 className="h-5 w-5" />
    }
  }

  const getTypeColor = () => {
    switch (transactionType) {
      case 'RESTOCK': return 'bg-green-600 hover:bg-green-700'
      case 'USAGE': return 'bg-blue-600 hover:bg-blue-700'
      case 'ADJUSTMENT': return 'bg-purple-600 hover:bg-purple-700'
      case 'WASTE': return 'bg-red-600 hover:bg-red-700'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex justify-between items-center rounded-t-lg">
          <div>
            <h2 className="text-xl font-bold">Adjust Stock</h2>
            <p className="text-sm text-blue-100 mt-1">{item.stock_item_name || item.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-blue-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Current Stock Display */}
          <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Current Stock</div>
              <div className="text-4xl font-bold text-gray-900">
                {currentQuantity} <span className="text-2xl text-gray-500">{unit}</span>
              </div>
              {item.minimum_threshold > 0 && (
                <div className="text-xs text-gray-500 mt-2">
                  Minimum: {item.minimum_threshold} {unit}
                </div>
              )}
            </div>
          </div>

          {/* Transaction Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transaction Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTransactionType('RESTOCK')}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 font-semibold transition-all ${
                  transactionType === 'RESTOCK'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                <Plus className="h-5 w-5" />
                Restock
              </button>
              <button
                type="button"
                onClick={() => setTransactionType('USAGE')}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 font-semibold transition-all ${
                  transactionType === 'USAGE'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                <Minus className="h-5 w-5" />
                Usage
              </button>
              <button
                type="button"
                onClick={() => setTransactionType('ADJUSTMENT')}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 font-semibold transition-all ${
                  transactionType === 'ADJUSTMENT'
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                <RefreshCw className="h-5 w-5" />
                Adjustment
              </button>
              <button
                type="button"
                onClick={() => setTransactionType('WASTE')}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 font-semibold transition-all ${
                  transactionType === 'WASTE'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                <Trash2 className="h-5 w-5" />
                Waste
              </button>
            </div>
          </div>

          {/* Quantity Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity {transactionType === 'USAGE' || transactionType === 'WASTE' ? 'to Remove' : 'to Add'}
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={quantityChange}
                onChange={(e) => setQuantityChange(e.target.value)}
                className="w-full px-4 py-3 pr-16 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-semibold"
                placeholder="0.00"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                {unit}
              </span>
            </div>
          </div>

          {/* New Quantity Preview */}
          {quantityChange && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-blue-700 font-medium mb-1">New Stock Level</div>
                  <div className="text-3xl font-bold text-blue-900">
                    {newQuantity().toFixed(2)} <span className="text-xl text-blue-600">{unit}</span>
                  </div>
                </div>
                <div className={`text-2xl font-bold ${
                  newQuantity() < 0 ? 'text-red-600' :
                  newQuantity() <= item.minimum_threshold ? 'text-orange-600' :
                  'text-green-600'
                }`}>
                  {transactionType === 'USAGE' || transactionType === 'WASTE' ? '-' : '+'}
                  {parseFloat(quantityChange).toFixed(2)}
                </div>
              </div>
              {newQuantity() < 0 && (
                <div className="mt-3 text-sm text-red-700 font-medium">
                  ⚠️ Warning: This will result in negative stock!
                </div>
              )}
              {newQuantity() > 0 && newQuantity() <= item.minimum_threshold && (
                <div className="mt-3 text-sm text-orange-700 font-medium">
                  ⚠️ Warning: Stock will be below minimum threshold
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add any additional notes about this transaction..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-6 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || newQuantity() < 0}
              className={`px-6 py-2 text-white rounded-lg font-semibold disabled:opacity-50 flex items-center gap-2 ${getTypeColor()}`}
            >
              {getTypeIcon()}
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                `Confirm ${transactionType.charAt(0) + transactionType.slice(1).toLowerCase()}`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
