'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, Package } from 'lucide-react'
import { createStockItem, updateStockItem, getStockItemAllergens, setStockAllergens } from '../../../actions/stock'
import { getAllAllergens } from '../../../actions/allergens'

interface StockItemFormProps {
  item?: any
  onSuccess: () => void
  onClose: () => void
}

// Helper to get a value from item regardless of field name variant
function getField(item: any, ...keys: string[]) {
  if (!item) return undefined
  for (const key of keys) {
    if (item[key] !== undefined && item[key] !== null) return item[key]
  }
  return undefined
}

export function StockItemForm({ item, onSuccess, onClose }: StockItemFormProps) {
  const isEditing = !!item

  const [formData, setFormData] = useState({
    name: getField(item, 'stock_item_name', 'name') ?? '',
    description: getField(item, 'description') ?? '',
    unit: getField(item, 'unit') ?? 'g',
    currentQuantity: getField(item, 'current_quantity', 'currentQuantity')?.toString() ?? '0',
    minimumThreshold: getField(item, 'minimum_threshold', 'minimumThreshold')?.toString() ?? '0',
    unitCost: getField(item, 'unit_cost', 'unitCost')?.toString() ?? '',
    supplier: getField(item, 'supplier') ?? '',
    supplierCode: getField(item, 'supplier_code', 'supplierCode') ?? '',
    storageLocation: getField(item, 'storage_location', 'storageLocation') ?? '',
    notes: getField(item, 'notes') ?? '',
  })

  // Purchase calculator fields — pre-fill when editing from stored values
  const existingQty = getField(item, 'current_quantity', 'currentQuantity')
  const existingCost = getField(item, 'unit_cost', 'unitCost')
  const [packageSize, setPackageSize] = useState(
    isEditing && existingQty ? existingQty.toString() : ''
  )
  const [numberOfPackages, setNumberOfPackages] = useState(
    isEditing && existingQty ? '1' : ''
  )
  const [totalPrice, setTotalPrice] = useState(
    isEditing && existingQty && existingCost
      ? (existingQty * existingCost).toFixed(2)
      : ''
  )

  // Derived calculations
  const pkgSize = parseFloat(packageSize)
  const numPkgs = parseFloat(numberOfPackages)
  const price = parseFloat(totalPrice)
  const totalQuantity = pkgSize > 0 && numPkgs > 0 ? pkgSize * numPkgs : null
  const calculatedUnitCost = totalQuantity && price > 0 ? price / totalQuantity : null

  // The unit cost to display: calculated from purchase fields, or the stored value
  const displayUnitCost = calculatedUnitCost !== null
    ? calculatedUnitCost
    : formData.unitCost ? parseFloat(formData.unitCost as any) : null

  // Sync calculated cost into formData
  useEffect(() => {
    if (calculatedUnitCost !== null) {
      setFormData(prev => ({ ...prev, unitCost: calculatedUnitCost.toFixed(4) }))
    }
  }, [calculatedUnitCost])

  // For new items, auto-fill current quantity from purchase total
  useEffect(() => {
    if (totalQuantity !== null && !isEditing) {
      setFormData(prev => ({ ...prev, currentQuantity: totalQuantity.toString() }))
    }
  }, [totalQuantity, isEditing])

  const [selectedAllergens, setSelectedAllergens] = useState<number[]>([])
  const [availableAllergens, setAvailableAllergens] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      const allergensResult = await getAllAllergens({ activeOnly: true })
      if (allergensResult.success) {
        setAvailableAllergens(allergensResult.data)
      }

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

  const unitLabel = formData.unit

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-5 flex justify-between items-center rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {isEditing ? 'Edit Stock Item' : 'Add Stock Item'}
              </h2>
              {isEditing && (
                <p className="text-sm text-gray-500">{formData.name}</p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
            <div className="px-8 py-6 space-y-8">

              {/* ── Section 1: Basic Information ── */}
              <section className="space-y-5">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Basic Information</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Item Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="e.g., Suruduru Samba Rice"
                  />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Unit *</label>
                    <select
                      required
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="g">Grams (g)</option>
                      <option value="kg">Kilograms (kg)</option>
                      <option value="ml">Milliliters (ml)</option>
                      <option value="l">Liters (l)</option>
                      <option value="units">Units</option>
                      <option value="pieces">Pieces</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Storage Location</label>
                    <input
                      type="text"
                      value={formData.storageLocation}
                      onChange={(e) => setFormData({ ...formData, storageLocation: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="e.g., Dry Store, Shelf 3"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Optional details about this item..."
                  />
                </div>
              </section>

              <hr className="border-gray-200" />

              {/* ── Section 2: Purchase Details (from invoice) ── */}
              <section className="space-y-5">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Purchase Details</h3>
                  <p className="text-xs text-gray-400 mt-1">Enter values from your invoice to auto-calculate unit cost</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Per Package ({unitLabel})
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={packageSize}
                      onChange={(e) => setPackageSize(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="e.g., 400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      No. of Packages
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={numberOfPackages}
                      onChange={(e) => setNumberOfPackages(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="e.g., 4"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Total Price (SEK)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={totalPrice}
                      onChange={(e) => setTotalPrice(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="e.g., 100"
                    />
                  </div>
                </div>

                {/* Auto-calculated summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div className={`rounded-lg px-4 py-3 border ${totalQuantity !== null ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="text-xs text-gray-500 font-medium mb-0.5">Total Quantity</div>
                    <div className={`text-lg font-bold ${totalQuantity !== null ? 'text-green-800' : 'text-gray-300'}`}>
                      {totalQuantity !== null ? `${totalQuantity.toLocaleString()} ${unitLabel}` : '—'}
                    </div>
                    {totalQuantity !== null && (
                      <div className="text-xs text-green-600">{packageSize} × {numberOfPackages}</div>
                    )}
                  </div>
                  <div className={`rounded-lg px-4 py-3 border ${displayUnitCost !== null ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="text-xs text-gray-500 font-medium mb-0.5">Unit Cost</div>
                    <div className={`text-lg font-bold ${displayUnitCost !== null ? 'text-green-800' : 'text-gray-300'}`}>
                      {displayUnitCost !== null ? `${displayUnitCost.toFixed(4)} SEK/${unitLabel}` : '—'}
                    </div>
                    {calculatedUnitCost !== null && totalQuantity !== null && (
                      <div className="text-xs text-green-600">{totalPrice} ÷ {totalQuantity.toLocaleString()}</div>
                    )}
                  </div>
                </div>
              </section>

              <hr className="border-gray-200" />

              {/* ── Section 3: Stock Levels ── */}
              <section className="space-y-5">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Stock Levels</h3>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Current Quantity ({unitLabel})
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.currentQuantity}
                      onChange={(e) => setFormData({ ...formData, currentQuantity: e.target.value })}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        totalQuantity !== null && !isEditing ? 'bg-green-50 border-green-300' : 'border-gray-300'
                      }`}
                    />
                    {totalQuantity !== null && !isEditing && (
                      <p className="text-xs text-green-600 mt-1">Auto-filled from purchase</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Minimum Threshold ({unitLabel})
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.minimumThreshold}
                      onChange={(e) => setFormData({ ...formData, minimumThreshold: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                    <p className="text-xs text-gray-400 mt-1">Alert when stock falls below this</p>
                  </div>
                </div>

              </section>

              <hr className="border-gray-200" />

              {/* ── Section 4: Supplier ── */}
              <section className="space-y-5">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Supplier</h3>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Supplier Name</label>
                    <input
                      type="text"
                      value={formData.supplier}
                      onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="e.g., Willys, ICA"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">SKU / Product Code</label>
                    <input
                      type="text"
                      value={formData.supplierCode}
                      onChange={(e) => setFormData({ ...formData, supplierCode: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Optional"
                    />
                  </div>
                </div>
              </section>

              <hr className="border-gray-200" />

              {/* ── Section 5: Allergens ── */}
              <section className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Allergens</h3>

                {availableAllergens.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {availableAllergens.map((allergen) => (
                      <label
                        key={allergen.id}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 cursor-pointer transition-all text-sm ${
                          selectedAllergens.includes(allergen.id)
                            ? 'border-orange-400 bg-orange-50 text-orange-800'
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedAllergens.includes(allergen.id)}
                          onChange={() => toggleAllergen(allergen.id)}
                          className="rounded text-orange-600 focus:ring-orange-500 h-3.5 w-3.5"
                        />
                        <span>{allergen.icon_emoji}</span>
                        <span className="font-medium">{allergen.name}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No allergens configured</p>
                )}
              </section>

              <hr className="border-gray-200" />

              {/* ── Section 6: Notes ── */}
              <section>
                <label className="block text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Any additional notes..."
                />
              </section>
            </div>

            {/* ── Footer Actions ── */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-8 py-4 flex justify-end gap-3 rounded-b-2xl">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="px-6 py-2.5 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors shadow-sm"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {saving ? 'Saving...' : (isEditing ? 'Update Item' : 'Add Item')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
