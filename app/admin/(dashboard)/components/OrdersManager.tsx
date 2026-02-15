'use client'

import { useState, useEffect, useCallback } from 'react'
import { OrdersTable } from './OrdersTable'
import { OrdersFilters, OrderFilters } from './OrdersFilters'
import { Pagination } from './Pagination'
import { getFilteredOrders } from '../../../actions/orders'
import { Loader2, FileDown } from 'lucide-react'
import { OrderStatus } from '../../../constants/enums'
import { generateOrdersPdf } from '@/lib/pdfExport'

interface Order {
  id: number
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
  const [isExporting, setIsExporting] = useState(false)
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

  const handleFilterChange = useCallback((newFilters: OrderFilters) => {
    setFilters(newFilters)
    setCurrentPage(1) // Reset to first page when filters change
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize)
    setCurrentPage(1) // Reset to first page when page size changes
  }, [])

  const handleExport = async () => {
    try {
      setIsExporting(true)

      // Fetch all completed orders with current filters
      const result = await getFilteredOrders({
        page: 1,
        pageSize: 10000,
        status: 'completed',
        deliveryMethod: filters.deliveryMethod !== 'all' ? filters.deliveryMethod : undefined,
        searchQuery: filters.searchQuery || undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
        sortBy: 'updated_at',
        sortOrder: 'desc',
        useCompletionDate: true
      })

      if (result.success && result.data && result.data.length > 0) {
        const { filename, totalRevenue, orderCount } = generateOrdersPdf(result.data)
        alert(`✅ Export successful!\n\nFile: ${filename}\nCompleted Orders: ${orderCount}\nTotal Revenue: ${totalRevenue.toFixed(2)} SEK`)
      } else {
        alert('No completed orders found with the current filters.')
      }
    } catch (error) {
      console.error('Export error:', error)
      alert('Failed to export orders. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters and Export */}
      <div className="space-y-4">
        <OrdersFilters 
          onFilterChange={handleFilterChange}
          totalCount={totalCount}
        />
        
        {/* Export Button */}
        <div className="flex justify-end">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <FileDown className="h-5 w-5" />
                Export Completed Orders to PDF
              </>
            )}
          </button>
        </div>
      </div>

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
          <OrdersTable orders={orders} onOrderUpdate={fetchOrders} />
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
