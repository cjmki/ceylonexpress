'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, Plus, Trash2, Search } from 'lucide-react'
import { createRecipe, updateRecipe, getRecipeIngredients, addRecipeIngredient, updateRecipeIngredient, deleteRecipeIngredient } from '../../../actions/recipes'
import { getAllStockItems } from '../../../actions/stock'

interface RecipeFormProps {
  recipe?: any
  onSuccess: () => void
  onClose: () => void
}

export function RecipeForm({ recipe, onSuccess, onClose }: RecipeFormProps) {
  const [formData, setFormData] = useState({
    name: recipe?.recipe_name || '',
    description: recipe?.description || '',
    portionSize: recipe?.portion_size || '',
    preparationTime: recipe?.preparation_time || '',
    cookingTime: recipe?.cooking_time || '',
    instructions: recipe?.instructions || '',
    notes: recipe?.notes || '',
  })
  
  const [ingredients, setIngredients] = useState<any[]>([])
  const [stockItems, setStockItems] = useState<any[]>([])
  const [showIngredientInput, setShowIngredientInput] = useState(false)
  const [ingredientForm, setIngredientForm] = useState({
    stockItemId: '',
    quantity: '',
    unit: '',
    notes: ''
  })
  const [saving, setSaving] = useState(false)
  const [loadingIngredients, setLoadingIngredients] = useState(false)
  const [savedRecipeId, setSavedRecipeId] = useState<number | null>(recipe?.recipe_id || null)

  useEffect(() => {
    const fetchData = async () => {
      // Fetch stock items
      const stockResult = await getAllStockItems({ activeOnly: true })
      if (stockResult.success) {
        setStockItems(stockResult.data)
      }

      // Fetch existing ingredients if editing
      if (recipe?.recipe_id) {
        setLoadingIngredients(true)
        const ingredientsResult = await getRecipeIngredients(recipe.recipe_id)
        if (ingredientsResult.success) {
          setIngredients(ingredientsResult.data)
        }
        setLoadingIngredients(false)
      }
    }
    fetchData()
  }, [recipe])

  const handleAddIngredient = async () => {
    if (!ingredientForm.stockItemId || !ingredientForm.quantity || !ingredientForm.unit) {
      alert('Please fill in required fields')
      return
    }

    if (!savedRecipeId) {
      alert('Please save the recipe first')
      return
    }

    const result = await addRecipeIngredient({
      recipeId: savedRecipeId,
      stockItemId: parseInt(ingredientForm.stockItemId),
      quantity: parseFloat(ingredientForm.quantity),
      unit: ingredientForm.unit,
      notes: ingredientForm.notes || undefined
    })

    if (result.success) {
      const ingredientsResult = await getRecipeIngredients(savedRecipeId)
      if (ingredientsResult.success) {
        setIngredients(ingredientsResult.data)
      }
      setIngredientForm({ stockItemId: '', quantity: '', unit: '', notes: '' })
      setShowIngredientInput(false)
    } else {
      alert(result.error || 'Failed to add ingredient')
    }
  }

  const handleDeleteIngredient = async (ingredientId: number) => {
    const result = await deleteRecipeIngredient(ingredientId)
    if (result.success && savedRecipeId) {
      const ingredientsResult = await getRecipeIngredients(savedRecipeId)
      if (ingredientsResult.success) {
        setIngredients(ingredientsResult.data)
      }
    } else {
      alert(result.error || 'Failed to delete ingredient')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const recipeData = {
        ...formData,
        preparationTime: formData.preparationTime ? parseInt(formData.preparationTime as any) : undefined,
        cookingTime: formData.cookingTime ? parseInt(formData.cookingTime as any) : undefined,
      }

      let result
      if (recipe) {
        result = await updateRecipe(recipe.recipe_id, recipeData)
      } else {
        result = await createRecipe(recipeData)
        if (result.success && result.data) {
          setSavedRecipeId(result.data.id)
        }
      }

      if (result.success) {
        if (!recipe) {
          // For new recipes, don't close immediately - let user add ingredients
          alert('Recipe saved! Now you can add ingredients below.')
        } else {
          onSuccess()
        }
      } else {
        alert(result.error || 'Failed to save recipe')
      }
    } catch (error) {
      console.error('Error saving recipe:', error)
      alert('Failed to save recipe')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-orange-600 to-orange-700 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {recipe ? 'Edit Recipe' : 'Add New Recipe'}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-orange-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recipe Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="e.g., Chicken Curry"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Brief description of the dish..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Portion Size
                </label>
                <input
                  type="text"
                  value={formData.portionSize}
                  onChange={(e) => setFormData({ ...formData, portionSize: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="e.g., 4 servings"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prep Time (min)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.preparationTime}
                  onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="15"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cook Time (min)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.cookingTime}
                  onChange={(e) => setFormData({ ...formData, cookingTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="45"
                />
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Instructions</h3>
            
            <div>
              <textarea
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono text-sm"
                placeholder="1. Heat oil in a large pan...&#10;2. Add curry leaves and spices...&#10;3. Add chicken and cook..."
              />
              <p className="text-xs text-gray-500 mt-1">Number each step for clarity</p>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Any chef's notes, tips, or variations..."
            />
          </div>

          {/* Ingredients Section */}
          <div className="space-y-4 border-t-2 border-gray-200 pt-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Ingredients</h3>
              <button
                type="button"
                onClick={() => setShowIngredientInput(!showIngredientInput)}
                disabled={!savedRecipeId}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-4 w-4" />
                Add Ingredient
              </button>
            </div>

            {!savedRecipeId && !recipe && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                💡 Save the recipe first to add ingredients
              </div>
            )}

            {/* Add Ingredient Input */}
            {showIngredientInput && savedRecipeId && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock Item *</label>
                    <select
                      value={ingredientForm.stockItemId}
                      onChange={(e) => {
                        const item = stockItems.find(s => s.id === parseInt(e.target.value))
                        setIngredientForm({...ingredientForm, stockItemId: e.target.value, unit: item?.unit || ''})
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="">Select ingredient...</option>
                      {stockItems.map(item => (
                        <option key={item.id} value={item.id}>{item.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={ingredientForm.quantity}
                        onChange={(e) => setIngredientForm({...ingredientForm, quantity: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
                      <input
                        type="text"
                        value={ingredientForm.unit}
                        onChange={(e) => setIngredientForm({...ingredientForm, unit: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleAddIngredient}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowIngredientInput(false)
                      setIngredientForm({stockItemId: '', quantity: '', unit: '', notes: ''})
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-sm hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Ingredients List */}
            {ingredients.length > 0 && (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left font-bold text-gray-700">Ingredient</th>
                      <th className="px-4 py-2 text-center font-bold text-gray-700">Quantity</th>
                      <th className="px-4 py-2 text-right font-bold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {ingredients.map((ing: any) => (
                      <tr key={ing.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2">{ing.stock_items?.name || 'Unknown'}</td>
                        <td className="px-4 py-2 text-center font-semibold">{ing.quantity} {ing.unit}</td>
                        <td className="px-4 py-2 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteIngredient(ing.id)}
                            className="text-red-600 hover:bg-red-50 p-1 rounded"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
              className="px-6 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? 'Saving...' : (recipe ? 'Update Recipe' : 'Save Recipe')}
            </button>
            {(recipe || savedRecipeId) && (
              <button
                type="button"
                onClick={onSuccess}
                className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
              >
                Done
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
