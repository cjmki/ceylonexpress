'use client'

import { useState, useEffect, useCallback } from 'react'
import { OrdersTable } from './OrdersTable'
import { OrdersFilters, OrderFilters } from './OrdersFilters'
import { Pagination } from './Pagination'
import { getFilteredOrders } from '../../../actions/orders'
import { Loader2 } from 'lucide-react'

interface Order {
  id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  delivery_method: string
  delivery_address: string
  delivery_date: string
  delivery_time: string
  total_amount: number
  status: string
  created_at: string
  notes?: string
  order_items: Array<{
    id: string
    menu_item_name: string
    menu_item_price: number
    quantity: number
    subtotal: number
  }>
}

export function OrdersManager() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [filters, setFilters] = useState<OrderFilters>({
    status: 'all',
    deliveryMethod: 'all',
    searchQuery: '',
    dateFrom: '',
    dateTo: ''
  })

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getFilteredOrders({
        page: currentPage,
        pageSize,
        status: filters.status,
        deliveryMethod: filters.deliveryMethod,
        searchQuery: filters.searchQuery,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        sortBy: 'created_at',
        sortOrder: 'desc'
      })

      if (result.success) {
        setOrders(result.data)
        setTotalCount(result.totalCount)
        setTotalPages(result.totalPages)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }, [currentPage, pageSize, filters])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const handleFilterChange = (newFilters: OrderFilters) => {
    setFilters(newFilters)
    setCurrentPage(1) // Reset to first page when filters change
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setCurrentPage(1) // Reset to first page when page size changes
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <OrdersFilters 
        onFilterChange={handleFilterChange}
        totalCount={totalCount}
      />

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Loading orders...</span>
        </div>
      )}

      {/* Orders Table */}
      {!loading && orders.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <OrdersTable orders={orders} />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalCount={totalCount}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      )}

      {/* Empty State */}
      {!loading && orders.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-600">
            {filters.status !== 'all' || filters.deliveryMethod !== 'all' || filters.searchQuery || filters.dateFrom || filters.dateTo
              ? 'Try adjusting your filters to see more results.'
              : 'Orders will appear here once customers place them.'}
          </p>
        </div>
      )}
    </div>
  )
}
