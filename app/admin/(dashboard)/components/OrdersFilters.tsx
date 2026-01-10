'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, X, Calendar } from 'lucide-react'
import { ORDER_STATUSES, ORDER_STATUS_DISPLAY_WITH_EMOJI, DeliveryMethod, DELIVERY_METHOD_DISPLAY_WITH_EMOJI } from '../../../constants/enums'

interface OrdersFiltersProps {
  onFilterChange: (filters: OrderFilters) => void
  totalCount: number
}

export interface OrderFilters {
  status: string
  deliveryMethod: string
  searchQuery: string
  dateFrom: string
  dateTo: string
}

export function OrdersFilters({ onFilterChange, totalCount }: OrdersFiltersProps) {
  const [filters, setFilters] = useState<OrderFilters>({
    status: 'all',
    deliveryMethod: 'all',
    searchQuery: '',
    dateFrom: '',
    dateTo: ''
  })
  
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [searchInput, setSearchInput] = useState('')

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, searchQuery: searchInput }))
    }, 500)

    return () => clearTimeout(timer)
  }, [searchInput])

  // Notify parent of filter changes
  useEffect(() => {
    onFilterChange(filters)
  }, [filters, onFilterChange])

  const handleFilterChange = (key: keyof OrderFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearAllFilters = () => {
    setFilters({
      status: 'all',
      deliveryMethod: 'all',
      searchQuery: '',
      dateFrom: '',
      dateTo: ''
    })
    setSearchInput('')
  }

  const hasActiveFilters = 
    filters.status !== 'all' || 
    filters.deliveryMethod !== 'all' || 
    filters.searchQuery !== '' || 
    filters.dateFrom !== '' || 
    filters.dateTo !== ''

  return (
    <div className="space-y-4">
      {/* Search Bar and Quick Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by customer name, email, or phone..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className={`
              appearance-none px-4 py-3 pr-10 rounded-lg font-medium cursor-pointer transition-all
              focus:ring-2 focus:ring-blue-500 focus:outline-none
              ${filters.status === 'all' 
                ? 'bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400' 
                : 'bg-blue-50 border-2 border-blue-300 text-blue-700'
              }
            `}
          >
            <option value="all">All Status</option>
            {ORDER_STATUSES.map(status => (
              <option key={status} value={status}>{ORDER_STATUS_DISPLAY_WITH_EMOJI[status]}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
            showAdvancedFilters || hasActiveFilters
              ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
              : 'bg-gray-100 text-gray-700 border-2 border-gray-300 hover:bg-gray-200'
          }`}
        >
          <Filter className="h-5 w-5" />
          Filters
          {hasActiveFilters && (
            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {Object.values(filters).filter(v => v && v !== 'all').length}
            </span>
          )}
        </button>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Advanced Filters
            </h3>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                <X className="h-4 w-4" />
                Clear All
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Delivery Method Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Method
              </label>
              <select
                value={filters.deliveryMethod}
                onChange={(e) => handleFilterChange('deliveryMethod', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white cursor-pointer"
              >
                <option value="all">All Methods</option>
                <option value={DeliveryMethod.DELIVERY}>{DELIVERY_METHOD_DISPLAY_WITH_EMOJI[DeliveryMethod.DELIVERY]}</option>
                <option value={DeliveryMethod.PICKUP}>{DELIVERY_METHOD_DISPLAY_WITH_EMOJI[DeliveryMethod.PICKUP]}</option>
              </select>
            </div>

            {/* Date From Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                From Date
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Date To Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                To Date
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                min={filters.dateFrom}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm">
        <div className="text-gray-600">
          {hasActiveFilters ? (
            <span>
              Found <span className="font-semibold text-gray-900">{totalCount}</span> order{totalCount !== 1 ? 's' : ''} matching your filters
            </span>
          ) : (
            <span>
              Showing all <span className="font-semibold text-gray-900">{totalCount}</span> order{totalCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
