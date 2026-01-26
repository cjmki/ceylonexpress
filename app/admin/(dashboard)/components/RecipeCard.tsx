'use client'

import { Eye, Edit2, Clock, AlertCircle } from 'lucide-react'
import { deleteRecipe } from '../../../actions/recipes'
import { useState } from 'react'
import { ConfirmModal } from './ConfirmModal'

interface RecipeCardProps {
  recipe: any
  onView: () => void
  onEdit: () => void
  onUpdate: () => void
}

export function RecipeCard({ recipe, onView, onEdit, onUpdate }: RecipeCardProps) {
  const [deletingRecipe, setDeletingRecipe] = useState(false)

  const handleDelete = async () => {
    const result = await deleteRecipe(recipe.recipe_id)
    if (result.success) {
      onUpdate()
    } else {
      alert(result.error || 'Failed to delete recipe')
    }
    setDeletingRecipe(false)
  }

  const totalTime = (recipe.preparation_time || 0) + (recipe.cooking_time || 0)

  return (
    <>
      <div className="bg-white rounded-lg shadow-md border-2 border-gray-200 hover:shadow-lg transition-all overflow-hidden group">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4">
          <h3 className="text-lg font-bold truncate">{recipe.recipe_name}</h3>
          {recipe.portion_size && (
            <p className="text-sm text-orange-100 mt-1">Serves: {recipe.portion_size}</p>
          )}
        </div>

        {/* Body */}
        <div className="p-4 space-y-3">
          {/* Time Info */}
          {totalTime > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>{totalTime} minutes total</span>
            </div>
          )}

          {/* Allergens */}
          <div>
            <div className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Allergens:
            </div>
            <div className="flex flex-wrap gap-2">
              {recipe.allergen_count > 0 ? (
                recipe.allergen_icons?.slice(0, 5).map((icon: string, idx: number) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-800"
                    title={recipe.allergen_names?.[idx]}
                  >
                    {icon}
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-400">None</span>
              )}
              {recipe.allergen_count > 5 && (
                <span className="text-xs text-gray-500 font-medium">
                  +{recipe.allergen_count - 5} more
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-3 border-t border-gray-200">
            <button
              onClick={onView}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-medium text-sm transition-colors"
            >
              <Eye className="h-4 w-4" />
              View
            </button>
            <button
              onClick={onEdit}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 font-medium text-sm transition-colors"
            >
              <Edit2 className="h-4 w-4" />
              Edit
            </button>
            <button
              onClick={() => setDeletingRecipe(true)}
              className="px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 font-medium text-sm transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      {deletingRecipe && (
        <ConfirmModal
          title="Delete Recipe"
          message={`Are you sure you want to delete "${recipe.recipe_name}"? This action cannot be undone.`}
          confirmText="Delete"
          confirmStyle="danger"
          onConfirm={handleDelete}
          onCancel={() => setDeletingRecipe(false)}
        />
      )}
    </>
  )
}
