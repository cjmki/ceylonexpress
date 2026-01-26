'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Minus, Search } from 'lucide-react'
import { createMenuItem } from '../../../actions/orders'
import { linkRecipeToMenuItem } from '../../../actions/recipes'
import { getAllRecipesWithAllergens } from '../../../actions/recipes'
import { formatPrice } from '../../../constants/currency'
import { MENU_CATEGORIES, MENU_CATEGORY_DISPLAY, MenuCategory } from '../../../constants/enums'

interface AddMenuItemFormProps {
  onSuccess: () => void
  onClose: () => void
}

export function AddMenuItemForm({ onSuccess, onClose }: AddMenuItemFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<{
    name: string
    description: string
    price: string
    category: MenuCategory
    image_url: string
    available: boolean
    has_limited_availability: boolean
    pre_orders_only: boolean
    minimum_order_quantity: string
  }>({
    name: '',
    description: '',
    price: '',
    category: MENU_CATEGORIES[0],
    image_url: '',
    available: true,
    has_limited_availability: false,
    pre_orders_only: false,
    minimum_order_quantity: '1'
  })
  const [includes, setIncludes] = useState<string[]>([''])
  
  // Recipe & Allergen state
  const [availableRecipes, setAvailableRecipes] = useState<any[]>([])
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null)
  const [recipeAllergens, setRecipeAllergens] = useState<any[]>([])
  const [allergenInfoProvided, setAllergenInfoProvided] = useState(false)
  const [recipeSearchTerm, setRecipeSearchTerm] = useState('')
  const [showRecipeDropdown, setShowRecipeDropdown] = useState(false)

  // Fetch available recipes
  useEffect(() => {
    const fetchRecipes = async () => {
      const result = await getAllRecipesWithAllergens()
      if (result.success) {
        setAvailableRecipes(result.data)
      }
    }
    fetchRecipes()
  }, [])

  // Handle recipe selection
  const handleRecipeSelect = (recipe: any) => {
    setSelectedRecipeId(recipe.recipe_id)
    setRecipeAllergens(recipe.allergens || [])
    setRecipeSearchTerm(recipe.recipe_name)
    setShowRecipeDropdown(false)
  }

  const clearRecipe = () => {
    setSelectedRecipeId(null)
    setRecipeAllergens([])
    setRecipeSearchTerm('')
    setAllergenInfoProvided(false)
  }

  const filteredRecipes = availableRecipes.filter(recipe =>
    recipe.recipe_name.toLowerCase().includes(recipeSearchTerm.toLowerCase())
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

      const moq = parseInt(formData.minimum_order_quantity)
      if (isNaN(moq) || moq < 1) {
        setError('Please enter a valid minimum order quantity (at least 1)')
        setIsSubmitting(false)
        return
      }

      const result = await createMenuItem({
        name: formData.name,
        description: formData.description,
        price: price,
        category: formData.category,
        image_url: formData.image_url || undefined,
        available: formData.available,
        includes: filteredIncludes.length > 0 ? filteredIncludes : undefined,
        has_limited_availability: formData.has_limited_availability,
        pre_orders_only: formData.pre_orders_only,
        minimum_order_quantity: moq
      })

      if (result.success && result.data) {
        // Link recipe if selected
        if (selectedRecipeId) {
          const linkResult = await linkRecipeToMenuItem(
            result.data.id,
            selectedRecipeId,
            allergenInfoProvided
          )
          if (!linkResult.success) {
            console.error('Failed to link recipe:', linkResult.error)
            // Don't fail the whole operation, just log it
          }
        }
        
        onSuccess()
      } else {
        setError(result.error || 'Failed to create menu item')
      }
    } catch (err) {
      console.error('Error creating menu item:', err)
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6 rounded-t-2xl flex justify-between items-center flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Add New Menu Item</h2>
            <p className="text-gray-600 text-sm mt-1">Fill in the details below to add a new item to the menu</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-6 w-6 text-gray-700" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
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

          {/* Price, Category, and MOQ */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

            <div>
              <label htmlFor="minimum_order_quantity" className="block text-sm font-semibold text-gray-900 mb-2">
                Min Order Qty <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="minimum_order_quantity"
                required
                min="1"
                step="1"
                value={formData.minimum_order_quantity}
                onChange={(e) => setFormData({ ...formData, minimum_order_quantity: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="1"
              />
              <p className="mt-2 text-xs text-gray-600">
                📦 Minimum portions per order
              </p>
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

          {/* Recipe & Allergens */}
          <div className="space-y-4 p-6 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border-2 border-orange-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">📖</span>
              <h3 className="text-lg font-bold text-gray-900">Recipe & Allergens</h3>
            </div>

            {/* Recipe Selection */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Link Recipe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={recipeSearchTerm}
                  onChange={(e) => {
                    setRecipeSearchTerm(e.target.value)
                    setShowRecipeDropdown(true)
                  }}
                  onFocus={() => setShowRecipeDropdown(true)}
                  placeholder="Search recipes..."
                  className="w-full pl-10 pr-10 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                {selectedRecipeId && (
                  <button
                    type="button"
                    onClick={clearRecipe}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* Dropdown */}
              {showRecipeDropdown && recipeSearchTerm && (
                <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredRecipes.length > 0 ? (
                    filteredRecipes.map((recipe) => (
                      <button
                        key={recipe.recipe_id}
                        type="button"
                        onClick={() => handleRecipeSelect(recipe)}
                        className="w-full px-4 py-3 text-left hover:bg-orange-50 transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-semibold text-gray-900">{recipe.recipe_name}</div>
                        {recipe.allergens && recipe.allergens.length > 0 && (
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {recipe.allergens.map((allergen: any) => (
                              <span key={allergen.allergen_id} className="text-xs">
                                {allergen.icon_emoji}
                              </span>
                            ))}
                          </div>
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-500">
                      No recipes found
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Selected Recipe Allergens */}
            {selectedRecipeId && recipeAllergens.length > 0 && (
              <div className="bg-white rounded-lg p-4 border-2 border-orange-300">
                <p className="text-sm font-semibold text-gray-900 mb-3">
                  ⚠️ Allergens in this recipe:
                </p>
                <div className="flex flex-wrap gap-2">
                  {recipeAllergens.map((allergen) => (
                    <div
                      key={allergen.allergen_id}
                      className="flex items-center gap-2 px-3 py-2 bg-orange-100 border-2 border-orange-300 rounded-lg"
                    >
                      <span className="text-lg">{allergen.icon_emoji}</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {allergen.allergen_name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Allergen Info Provided Checkbox */}
            {selectedRecipeId && (
              <div className="flex items-start gap-3 p-4 bg-white rounded-lg border-2 border-green-200">
                <input
                  type="checkbox"
                  id="allergen_info_provided"
                  checked={allergenInfoProvided}
                  onChange={(e) => setAllergenInfoProvided(e.target.checked)}
                  className="w-5 h-5 text-green-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-green-500 mt-0.5"
                />
                <label htmlFor="allergen_info_provided" className="text-sm">
                  <span className="font-bold text-gray-900">
                    ✓ Allergen information provided to customers
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* Available Toggle */}
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
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

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="has_limited_availability"
                checked={formData.has_limited_availability}
                onChange={(e) => setFormData({ ...formData, has_limited_availability: e.target.checked })}
                className="w-5 h-5 text-orange-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
              />
              <label htmlFor="has_limited_availability" className="text-sm font-semibold text-gray-900">
                Has limited availability (capacity limits per date)
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="pre_orders_only"
                checked={formData.pre_orders_only}
                onChange={(e) => setFormData({ ...formData, pre_orders_only: e.target.checked })}
                className="w-5 h-5 text-orange-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
              />
              <label htmlFor="pre_orders_only" className="text-sm font-semibold text-gray-900">
                Pre-orders only (no same-day orders)
              </label>
            </div>

            {formData.has_limited_availability && (
              <p className="text-xs text-gray-600 mt-2 pl-8">
                💡 After creating, use the Edit form to set up availability schedules for specific dates
              </p>
            )}
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
              {isSubmitting ? 'Creating...' : 'Create Menu Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
