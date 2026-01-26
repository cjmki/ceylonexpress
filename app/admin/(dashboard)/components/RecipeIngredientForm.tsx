'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, Search } from 'lucide-react'
import { getAllStockItems } from '../../../actions/stock'
import { addRecipeIngredient, updateRecipeIngredient } from '../../../actions/recipes'

interface RecipeIngredientFormProps {
  recipeId: number
  ingredient?: any
  onSuccess: () => void
  onClose: () => void
}

export function RecipeIngredientForm({ recipeId, ingredient, onSuccess, onClose }: RecipeIngredientFormProps) {
  const [stockItems, setStockItems] = useState<any[]>([])
  const [filteredItems, setFilteredItems] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    stockItemId: ingredient?.stock_item_id || '',
    quantity: ingredient?.quantity || '',
    unit: ingredient?.unit || '',
    notes: ingredient?.notes || '',
  })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStockItems = async () => {
      setLoading(true)
      const result = await getAllStockItems({ activeOnly: true })
      if (result.success) {
        setStockItems(result.data)
        setFilteredItems(result.data)
      }
      setLoading(false)
    }
    fetchStockItems()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = stockItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredItems(filtered)
    } else {
      setFilteredItems(stockItems)
    }
  }, [searchTerm, stockItems])

  // Auto-fill unit when stock item is selected
  const handleStockItemChange = (stockItemId: string) => {
    const selectedItem = stockItems.find(item => item.id === parseInt(stockItemId))
    setFormData({
      ...formData,
      stockItemId,
      unit: selectedItem?.unit || formData.unit
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const ingredientData = {
        ...formData,
        recipeId,
        stockItemId: parseInt(formData.stockItemId),
        quantity: parseFloat(formData.quantity),
      }

      let result
      if (ingredient) {
        result = await updateRecipeIngredient(ingredient.id, {
          quantity: ingredientData.quantity,
          unit: ingredientData.unit,
          notes: ingredientData.notes || undefined,
        })
      } else {
        result = await addRecipeIngredient(ingredientData)
      }

      if (result.success) {
        onSuccess()
      } else {
        alert(result.error || 'Failed to save ingredient')
      }
    } catch (error) {
      console.error('Error saving ingredient:', error)
      alert('Failed to save ingredient')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex justify-between items-center rounded-t-lg">
          <h2 className="text-xl font-bold">
            {ingredient ? 'Edit Ingredient' : 'Add Ingredient'}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-blue-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Stock Item Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Ingredient *
              </label>
              
              {/* Search */}
              {!ingredient && (
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search stock items..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              {ingredient ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <span className="font-medium text-gray-900">
                    {ingredient.stock_items?.name}
                  </span>
                </div>
              ) : (
                <select
                  required
                  value={formData.stockItemId}
                  onChange={(e) => handleStockItemChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choose an ingredient...</option>
                  {filteredItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.unit})
                    </option>
                  ))}
                </select>
              )}
              
              {filteredItems.length === 0 && searchTerm && (
                <p className="text-sm text-gray-500 mt-2">
                  No stock items found matching "{searchTerm}"
                </p>
              )}
            </div>

            {/* Quantity and Unit */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit *
                </label>
                <input
                  type="text"
                  required
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="g, ml, units"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preparation Notes (Optional)
              </label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., chopped, diced, cooked"
              />
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                💡 <strong>Tip:</strong> The quantity should be per portion as defined in the recipe. The system will calculate total requirements based on order quantities.
              </p>
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
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {saving ? 'Saving...' : (ingredient ? 'Update' : 'Add Ingredient')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
