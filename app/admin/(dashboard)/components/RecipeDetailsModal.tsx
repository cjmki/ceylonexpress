'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, Clock, ChefHat, DollarSign } from 'lucide-react'
import { getRecipeWithDetails } from '../../../actions/recipes'
import { formatPrice } from '../../../constants/currency'

interface RecipeDetailsModalProps {
  recipeId: number
  onClose: () => void
  onEdit: () => void
}

export function RecipeDetailsModal({ recipeId, onClose, onEdit }: RecipeDetailsModalProps) {
  const [recipeDetails, setRecipeDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecipeDetails()
  }, [recipeId])

  const fetchRecipeDetails = async () => {
    setLoading(true)
    const result = await getRecipeWithDetails(recipeId)
    if (result.success) {
      setRecipeDetails(result.data)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
        </div>
      </div>
    )
  }

  if (!recipeDetails) {
    return null
  }

  const { recipe, ingredients, allergens, cost } = recipeDetails
  const totalTime = (recipe.preparation_time || 0) + (recipe.cooking_time || 0)

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white px-6 py-4 flex justify-between items-center">
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{recipe.name}</h2>
              {recipe.description && (
                <p className="text-orange-100 mt-1">{recipe.description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-orange-100 ml-4"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Recipe Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {recipe.portion_size && (
                <InfoCard
                  icon={<ChefHat className="h-5 w-5" />}
                  label="Portion Size"
                  value={recipe.portion_size}
                />
              )}
              {totalTime > 0 && (
                <InfoCard
                  icon={<Clock className="h-5 w-5" />}
                  label="Total Time"
                  value={`${totalTime} min`}
                />
              )}
              <InfoCard
                icon={<span className="text-xl">📦</span>}
                label="Ingredients"
                value={ingredients.length.toString()}
              />
              <InfoCard
                icon={<DollarSign className="h-5 w-5" />}
                label="Est. Cost"
                value={cost.total_cost > 0 ? formatPrice(cost.total_cost) : '—'}
              />
            </div>

            {/* Allergen Information */}
            {allergens.allergen_count > 0 && (
              <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
                <h3 className="text-sm font-bold text-orange-900 mb-2 flex items-center gap-2">
                  ⚠️ Allergen Information
                </h3>
                <div className="flex flex-wrap gap-2">
                  {allergens.allergen_names?.map((name: string, idx: number) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 border border-orange-300"
                    >
                      {allergens.allergen_icons?.[idx]} {name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Ingredients Section */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Ingredients</h3>

              {ingredients.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                  <p className="text-gray-600">No ingredients in this recipe</p>
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                          Ingredient
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase">
                          Quantity
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {ingredients.map((ingredient: any) => (
                        <tr key={ingredient.id}>
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-900">
                              {ingredient.stock_items?.name}
                            </div>
                            {ingredient.notes && (
                              <div className="text-xs text-gray-500">{ingredient.notes}</div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="font-semibold text-gray-900">
                              {ingredient.quantity} {ingredient.unit}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Instructions */}
            {recipe.instructions && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Instructions</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700">
                    {recipe.instructions}
                  </pre>
                </div>
              </div>
            )}

            {/* Notes */}
            {recipe.notes && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Chef's Notes</h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700">{recipe.notes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between">
            <button
              onClick={onEdit}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700"
            >
              Edit Recipe
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="flex items-center gap-2 text-gray-600 mb-1">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <div className="text-lg font-bold text-gray-900">{value}</div>
    </div>
  )
}
