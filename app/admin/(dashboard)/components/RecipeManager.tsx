'use client'

import { useState, useEffect, useCallback } from 'react'
import { getAllRecipesWithAllergens } from '../../../actions/recipes'
import { Loader2, Plus, ChefHat, Clock, DollarSign } from 'lucide-react'
import { RecipeForm } from './RecipeForm'
import { RecipeCard } from './RecipeCard'
import { RecipeDetailsModal } from './RecipeDetailsModal'

export function RecipeManager() {
  const [recipes, setRecipes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState<any>(null)
  const [viewingRecipe, setViewingRecipe] = useState<any>(null)

  const fetchRecipes = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getAllRecipesWithAllergens()
      if (result.success) {
        setRecipes(result.data)
      }
    } catch (error) {
      console.error('Error fetching recipes:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRecipes()
  }, [fetchRecipes])

  const handleFormSuccess = () => {
    setShowAddForm(false)
    setEditingRecipe(null)
    fetchRecipes()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
        <span className="ml-3 text-gray-600">Loading recipes...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Recipes"
          value={recipes.length}
          icon={<ChefHat className="h-6 w-6" />}
          color="orange"
        />
        <StatCard
          title="With Allergens"
          value={recipes.filter(r => r.allergen_count > 0).length}
          icon={<span className="text-2xl">⚠️</span>}
          color="yellow"
        />
        <StatCard
          title="Menu Items Linked"
          value={0}
          icon={<span className="text-2xl">🍽️</span>}
          color="green"
        />
      </div>

      {/* Header with Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Recipe Library</h2>
          <p className="text-sm text-gray-600 mt-1">Create and manage recipes with ingredient lists</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition-colors shadow-md hover:shadow-lg"
        >
          <Plus className="h-5 w-5" />
          Add Recipe
        </button>
      </div>

      {/* Recipes Grid */}
      {recipes.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">👨‍🍳</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No recipes yet</h3>
          <p className="text-gray-600">Create your first recipe to start tracking ingredients and allergens</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.recipe_id}
              recipe={recipe}
              onView={() => setViewingRecipe(recipe)}
              onEdit={() => setEditingRecipe(recipe)}
              onUpdate={fetchRecipes}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {(showAddForm || editingRecipe) && (
        <RecipeForm
          recipe={editingRecipe}
          onSuccess={handleFormSuccess}
          onClose={() => {
            setShowAddForm(false)
            setEditingRecipe(null)
          }}
        />
      )}

      {/* Recipe Details Modal (Read-Only View) */}
      {viewingRecipe && (
        <RecipeDetailsModal
          recipeId={viewingRecipe.recipe_id}
          onClose={() => setViewingRecipe(null)}
          onEdit={() => {
            setEditingRecipe(viewingRecipe)
            setViewingRecipe(null)
          }}
        />
      )}
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string
  value: number
  icon: React.ReactNode
  color: 'orange' | 'yellow' | 'green'
}) {
  const colorClasses = {
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    green: 'bg-green-50 border-green-200 text-green-700',
  }

  return (
    <div className={`rounded-lg border-2 p-6 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium opacity-80">{title}</h3>
        {icon}
      </div>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  )
}
