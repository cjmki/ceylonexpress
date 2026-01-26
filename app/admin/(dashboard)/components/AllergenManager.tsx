'use client'

import { useState, useEffect, useCallback } from 'react'
import { getAllAllergens, updateAllergen } from '../../../actions/allergens'
import { Loader2, Edit2, Check, X } from 'lucide-react'

export function AllergenManager() {
  const [allergens, setAllergens] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({ name: '', description: '', iconEmoji: '' })

  const fetchAllergens = useCallback(async () => {
    setLoading(true)
    const result = await getAllAllergens({ activeOnly: false })
    if (result.success) {
      setAllergens(result.data)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchAllergens()
  }, [fetchAllergens])

  const startEdit = (allergen: any) => {
    setEditingId(allergen.id)
    setEditForm({
      name: allergen.name,
      description: allergen.description || '',
      iconEmoji: allergen.icon_emoji || ''
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({ name: '', description: '', iconEmoji: '' })
  }

  const saveEdit = async (allergenId: number) => {
    const result = await updateAllergen(allergenId, editForm)
    if (result.success) {
      fetchAllergens()
      cancelEdit()
    } else {
      alert(result.error || 'Failed to update allergen')
    }
  }

  const toggleActive = async (allergenId: number, currentStatus: boolean) => {
    const result = await updateAllergen(allergenId, { isActive: !currentStatus })
    if (result.success) {
      fetchAllergens()
    } else {
      alert(result.error || 'Failed to toggle allergen status')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        <span className="ml-3 text-gray-600">Loading allergens...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
        <h3 className="text-sm font-bold text-green-900 mb-2 flex items-center gap-2">
          ℹ️ EU 14 Allergen List
        </h3>
        <p className="text-sm text-green-800">
          These are the 14 allergens required by EU law to be declared on food labels. 
          Allergens are automatically calculated from recipe ingredients and displayed to customers.
        </p>
      </div>

      {/* Allergens Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Icon
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {allergens.map((allergen) => (
                <tr key={allergen.id} className={`hover:bg-gray-50 ${!allergen.is_active ? 'opacity-50' : ''}`}>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-semibold text-gray-600">
                      {allergen.display_order}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {editingId === allergen.id ? (
                      <input
                        type="text"
                        value={editForm.iconEmoji}
                        onChange={(e) => setEditForm({ ...editForm, iconEmoji: e.target.value })}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                        placeholder="🌾"
                      />
                    ) : (
                      <span className="text-2xl">{allergen.icon_emoji}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === allergen.id ? (
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full px-3 py-1 border border-gray-300 rounded"
                      />
                    ) : (
                      <div className="text-sm font-semibold text-gray-900">
                        {allergen.name}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === allergen.id ? (
                      <input
                        type="text"
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        className="w-full px-3 py-1 border border-gray-300 rounded"
                      />
                    ) : (
                      <div className="text-sm text-gray-600">
                        {allergen.description || '—'}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex px-2 py-1 text-xs font-mono font-bold bg-gray-100 text-gray-700 rounded">
                      {allergen.code}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => toggleActive(allergen.id, allergen.is_active)}
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                        allergen.is_active
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {allergen.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {editingId === allergen.id ? (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => saveEdit(allergen.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEdit(allergen)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-bold text-gray-900 mb-2">Note:</h4>
        <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
          <li>These allergens are automatically tracked through recipe ingredients</li>
          <li>Inactive allergens won't appear in customer-facing menus</li>
          <li>Changes to allergen information apply to all menu items using that allergen</li>
        </ul>
      </div>
    </div>
  )
}
