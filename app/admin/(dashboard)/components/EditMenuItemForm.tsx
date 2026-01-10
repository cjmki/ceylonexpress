'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Minus } from 'lucide-react'
import { updateMenuItem } from '../../../actions/orders'
import { formatPrice } from '../../../constants/currency'
import { MENU_CATEGORIES, MENU_CATEGORY_DISPLAY, MenuCategory, isMenuCategory } from '../../../constants/enums'

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

interface EditMenuItemFormProps {
  item: MenuItem
  onSuccess: () => void
  onClose: () => void
}

export function EditMenuItemForm({ item, onSuccess, onClose }: EditMenuItemFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Ensure category is always a valid MenuCategory value
  const validCategory = isMenuCategory(item.category) ? item.category : MenuCategory.MAINS
  
  const [formData, setFormData] = useState({
    name: item.name,
    description: item.description,
    price: item.price.toString(),
    category: validCategory,
    image_url: item.image_url || '',
    available: item.available
  })
  const [includes, setIncludes] = useState<string[]>(
    item.includes && item.includes.length > 0 ? item.includes : ['']
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      // Validate
      if (!formData.name || !formData.description || !formData.price) {
        setError('Please fill in all required fields')
        setIsSubmitting(false)
        return
      }

      const price = parseFloat(formData.price)
      if (isNaN(price) || price <= 0) {
        setError('Please enter a valid price')
        setIsSubmitting(false)
        return
      }

      // Filter out empty includes
      const filteredIncludes = includes.filter(item => item.trim() !== '')

      const result = await updateMenuItem(item.id, {
        name: formData.name,
        description: formData.description,
        price: price,
        category: formData.category,
        image_url: formData.image_url || undefined,
        available: formData.available,
        includes: filteredIncludes.length > 0 ? filteredIncludes : undefined
      })

      if (result.success) {
        onSuccess()
      } else {
        setError(result.error || 'Failed to update menu item')
      }
    } catch (err) {
      console.error('Error updating menu item:', err)
      setError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const addIncludeField = () => {
    setIncludes([...includes, ''])
  }

  const removeIncludeField = (index: number) => {
    setIncludes(includes.filter((_, i) => i !== index))
  }

  const updateIncludeField = (index: number, value: string) => {
    const newIncludes = [...includes]
    newIncludes[index] = value
    setIncludes(newIncludes)
  }

  const pricePreview = formData.price ? parseFloat(formData.price) : 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-2xl flex justify-between items-center z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Edit Menu Item</h2>
            <p className="text-gray-600 text-sm mt-1">Update the details for "{item.name}"</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-6 w-6 text-gray-700" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm font-semibold">{error}</p>
            </div>
          )}

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
              Item Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="e.g., Chicken Kottu"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              placeholder="Describe the dish..."
            />
          </div>

          {/* Price and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="price" className="block text-sm font-semibold text-gray-900 mb-2">
                Price (SEK) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="price"
                required
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="0.00"
              />
              {pricePreview > 0 && (
                <p className="mt-2 text-sm text-gray-600">
                  Preview: <span className="font-bold text-orange-600">{formatPrice(pricePreview)}</span>
                </p>
              )}
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-semibold text-gray-900 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="category"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as MenuCategory })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white cursor-pointer font-medium text-gray-900 hover:border-gray-400 transition-colors"
                >
                  {MENU_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{MENU_CATEGORY_DISPLAY[cat]}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label htmlFor="image_url" className="block text-sm font-semibold text-gray-900 mb-2">
              Image URL <span className="text-gray-500 text-xs font-normal">(optional)</span>
            </label>
            <input
              type="url"
              id="image_url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="https://example.com/image.jpg"
            />
            {formData.image_url && (
              <div className="mt-3">
                <p className="text-xs text-gray-600 mb-2">Image Preview:</p>
                <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                  <img 
                    src={formData.image_url} 
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23999"%3EInvalid URL%3C/text%3E%3C/svg%3E'
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* What's Included */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              What's Included <span className="text-gray-500 text-xs font-normal">(optional)</span>
            </label>
            <div className="space-y-2">
              {includes.map((include, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={include}
                    onChange={(e) => updateIncludeField(index, e.target.value)}
                    className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="e.g., Rice, Curry, Papadum"
                  />
                  {includes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIncludeField(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Minus className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addIncludeField}
                className="flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 font-semibold"
              >
                <Plus className="h-4 w-4" />
                Add Item
              </button>
            </div>
          </div>

          {/* Available Toggle */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="available"
              checked={formData.available}
              onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
              className="w-5 h-5 text-orange-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
            />
            <label htmlFor="available" className="text-sm font-semibold text-gray-900">
              Available for ordering
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Updating...' : 'Update Menu Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
