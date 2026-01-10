'use client'

import { useState } from 'react'
import { Pencil, Trash2, Eye } from 'lucide-react'
import { formatPrice } from '../../../constants/currency'
import { deleteMenuItem, updateMenuItem } from '../../../actions/orders'
import { ConfirmModal } from './ConfirmModal'
import { EditMenuItemForm } from './EditMenuItemForm'
import { getMenuCategoryDisplay } from '../../../constants/enums'

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

interface MenuItemsTableProps {
  items: MenuItem[]
  onUpdate: () => void
}

export function MenuItemsTable({ items, onUpdate }: MenuItemsTableProps) {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!selectedItem) return
    
    setIsDeleting(true)
    try {
      const result = await deleteMenuItem(selectedItem.id)
      if (result.success) {
        setShowDeleteModal(false)
        setSelectedItem(null)
        onUpdate()
      } else {
        alert('Failed to delete menu item')
      }
    } catch (error) {
      console.error('Error deleting menu item:', error)
      alert('An error occurred while deleting')
    } finally {
      setIsDeleting(false)
    }
  }

  const toggleAvailability = async (item: MenuItem) => {
    try {
      const result = await updateMenuItem(item.id, { available: !item.available })
      if (result.success) {
        onUpdate()
      } else {
        alert('Failed to update menu item')
      }
    } catch (error) {
      console.error('Error updating menu item:', error)
      alert('An error occurred while updating')
    }
  }

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, MenuItem[]>)

  return (
    <>
      <div className="space-y-8">
        {Object.entries(groupedItems).map(([category, categoryItems]) => (
          <div key={category} className="border-2 border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-6 py-3 border-b-2 border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">{getMenuCategoryDisplay(category)}</h3>
              <p className="text-sm text-gray-600">{categoryItems.length} item{categoryItems.length !== 1 ? 's' : ''}</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categoryItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {item.image_url ? (
                            <img 
                              src={item.image_url} 
                              alt={item.name}
                              className="h-12 w-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-orange-200 to-orange-100 flex items-center justify-center">
                              <span className="text-2xl">🍛</span>
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                            {item.includes && item.includes.length > 0 && (
                              <p className="text-xs text-gray-500">
                                +{item.includes.length} item{item.includes.length !== 1 ? 's' : ''}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <p className="text-sm text-gray-700 line-clamp-2">{item.description}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-bold text-orange-600">{formatPrice(item.price)}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleAvailability(item)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                            item.available
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          {item.available ? 'Available' : 'Unavailable'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedItem(item)
                              setShowViewModal(true)
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedItem(item)
                              setShowEditModal(true)
                            }}
                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedItem(item)
                              setShowDeleteModal(true)
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No menu items yet</p>
            <p className="text-gray-400 text-sm mt-2">Add your first menu item to get started</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedItem && (
        <ConfirmModal
          isOpen={showDeleteModal}
          onCancel={() => {
            if (!isDeleting) {
              setShowDeleteModal(false)
              setSelectedItem(null)
            }
          }}
          onConfirm={handleDelete}
          title="Delete Menu Item"
          message={`Are you sure you want to delete "${selectedItem.name}"? This action cannot be undone.`}
          confirmText={isDeleting ? 'Deleting...' : 'Delete'}
          type="danger"
        />
      )}

      {/* Edit Modal */}
      {showEditModal && selectedItem && (
        <EditMenuItemForm
          item={selectedItem}
          onSuccess={() => {
            setShowEditModal(false)
            setSelectedItem(null)
            onUpdate()
          }}
          onClose={() => {
            setShowEditModal(false)
            setSelectedItem(null)
          }}
        />
      )}

      {/* View Details Modal */}
      {showViewModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setShowViewModal(false)
              setSelectedItem(null)
            }}
          />
          
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8">
            {selectedItem.image_url && (
              <div className="w-full h-64 bg-gray-100 overflow-hidden rounded-t-2xl">
                <img 
                  src={selectedItem.image_url} 
                  alt={selectedItem.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-8">
              <div className="mb-3">
                <span className="inline-block px-3 py-1 bg-orange-100 text-orange-800 text-sm font-semibold rounded-full">
                  {selectedItem.category}
                </span>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {selectedItem.name}
              </h2>

              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                {selectedItem.description}
              </p>

              {selectedItem.includes && selectedItem.includes.length > 0 && (
                <div className="mb-6 p-4 bg-orange-50 rounded-lg border-2 border-orange-100">
                  <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">
                    What's Included:
                  </h3>
                  <ul className="space-y-2">
                    {selectedItem.includes.map((include, index) => (
                      <li 
                        key={index}
                        className="flex items-center gap-2 text-gray-800"
                      >
                        <span className="text-orange-600 flex-shrink-0">•</span>
                        <span className="text-sm">{include}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center justify-between pt-6 border-t-2 border-gray-200">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Price</p>
                  <span className="text-3xl font-bold text-orange-600">
                    {formatPrice(selectedItem.price)}
                  </span>
                </div>
                
                <button
                  onClick={() => {
                    setShowViewModal(false)
                    setSelectedItem(null)
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-900 font-bold rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
