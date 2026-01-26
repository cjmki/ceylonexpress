'use client'

import { useState, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'
import { createStockItem, updateStockItem, getStockItemAllergens, setStockAllergens } from '../../../actions/stock'
import { getAllAllergens } from '../../../actions/allergens'

interface StockItemFormProps {
  item?: any
  onSuccess: () => void
  onClose: () => void
}

export function StockItemForm({ item, onSuccess, onClose }: StockItemFormProps) {
  const [formData, setFormData] = useState({
    name: item?.stock_item_name || item?.name || '',
    description: item?.description || '',
    unit: item?.unit || 'g',
    currentQuantity: item?.current_quantity?.toString() || '0',
    minimumThreshold: item?.minimum_threshold?.toString() || '0',
    unitCost: item?.unit_cost || '',
    supplier: item?.supplier || '',
    supplierCode: item?.supplier_code || '',
    storageLocation: item?.storage_location || '',
    notes: item?.notes || '',
  })
  
  const [selectedAllergens, setSelectedAllergens] = useState<number[]>([])
  const [availableAllergens, setAvailableAllergens] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      
      // Fetch allergens
      const allergensResult = await getAllAllergens({ activeOnly: true })
      if (allergensResult.success) {
        setAvailableAllergens(allergensResult.data)
      }
      
      // If editing, fetch current allergens
      if (item) {
        const stockItemId = item.stock_item_id || item.id
        const itemAllergensResult = await getStockItemAllergens(stockItemId)
        if (itemAllergensResult.success) {
          const allergenIds = itemAllergensResult.data.map((a: any) => a.allergen_id)
          setSelectedAllergens(allergenIds)
        }
      }
      
      setLoading(false)
    }
    
    fetchData()
  }, [item])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const itemData = {
        ...formData,
        currentQuantity: parseFloat(formData.currentQuantity) || 0,
        minimumThreshold: parseFloat(formData.minimumThreshold) || 0,
        unitCost: formData.unitCost ? parseFloat(formData.unitCost as any) : undefined,
      }

      let result
      if (item) {
        const stockItemId = item.stock_item_id || item.id
        result = await updateStockItem(stockItemId, itemData)
      } else {
        result = await createStockItem(itemData)
      }

      if (result.success) {
        // Update allergens
        const stockItemId = result.data?.id || item?.stock_item_id || item?.id
        if (stockItemId) {
          await setStockAllergens(stockItemId, selectedAllergens)
        }
        
        onSuccess()
      } else {
        alert(result.error || 'Failed to save stock item')
      }
    } catch (error) {
      console.error('Error saving stock item:', error)
      alert('Failed to save stock item')
    } finally {
      setSaving(false)
    }
  }

  const toggleAllergen = (allergenId: number) => {
    setSelectedAllergens(prev =>
      prev.includes(allergenId)
        ? prev.filter(id => id !== allergenId)
        : [...prev, allergenId]
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            {item ? 'Edit Stock Item' : 'Add Stock Item'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
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
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Basmati Rice"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit *
                  </label>
                  <select
                    required
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="g">Grams (g)</option>
                    <option value="kg">Kilograms (kg)</option>
                    <option value="ml">Milliliters (ml)</option>
                    <option value="l">Liters (l)</option>
                    <option value="units">Units</option>
                    <option value="pieces">Pieces</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Additional details about this item..."
                />
              </div>
            </div>

            {/* Stock Levels */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Stock Levels</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Quantity
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.currentQuantity}
                    onChange={(e) => setFormData({ ...formData, currentQuantity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Threshold
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.minimumThreshold}
                    onChange={(e) => setFormData({ ...formData, minimumThreshold: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Alert when stock falls below this level</p>
                </div>
              </div>
            </div>

            {/* Supplier Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Supplier & Cost</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Supplier
                  </label>
                  <input
                    type="text"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Supplier name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU / Product Code
                  </label>
                  <input
                    type="text"
                    value={formData.supplierCode}
                    onChange={(e) => setFormData({ ...formData, supplierCode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="SKU or product code"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit Cost (SEK)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.unitCost}
                    onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Cost per unit"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Storage Location
                </label>
                <input
                  type="text"
                  value={formData.storageLocation}
                  onChange={(e) => setFormData({ ...formData, storageLocation: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Fridge A, Dry Store, Shelf 3"
                />
              </div>
            </div>

            {/* Allergens */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Allergen Information</h3>
              <p className="text-sm text-gray-600">Select all allergens present in this ingredient</p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableAllergens.map((allergen) => (
                  <label
                    key={allergen.id}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedAllergens.includes(allergen.id)
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedAllergens.includes(allergen.id)}
                      onChange={() => toggleAllergen(allergen.id)}
                      className="rounded text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-lg">{allergen.icon_emoji}</span>
                    <span className="text-sm font-medium text-gray-700">
                      {allergen.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Any additional notes..."
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
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {saving ? 'Saving...' : (item ? 'Update Item' : 'Add Item')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
