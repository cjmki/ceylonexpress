import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatPrice } from '@/app/constants/currency'

interface ExportOrder {
  id: number
  customer_name: string
  total_amount: number
  created_at: string
  updated_at: string
  order_items: Array<{
    menu_item_name: string
    menu_item_price: number
    quantity: number
    subtotal: number
  }>
}

export function generateOrdersPdf(orders: ExportOrder[]) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  // --- Title ---
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Ceylon Express - Completed Orders Report', 14, 18)

  // --- Report metadata ---
  const now = new Date()
  const reportDate = now.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Generated: ${reportDate}`, 14, 26)
  doc.text(`Total Orders: ${orders.length}`, 14, 31)

  // --- Build table rows ---
  let totalRevenue = 0
  const tableBody: (string | number)[][] = []

  orders.forEach((order) => {
    const orderDate = new Date(order.created_at).toLocaleDateString('en-GB')
    const completedDate = new Date(order.updated_at).toLocaleDateString('en-GB')

    totalRevenue += order.total_amount

    if (order.order_items && order.order_items.length > 0) {
      // First item row carries full order info
      const firstItem = order.order_items[0]
      tableBody.push([
        String(order.id),
        orderDate,
        completedDate,
        order.customer_name,
        firstItem.menu_item_name,
        formatPrice(firstItem.menu_item_price),
        String(firstItem.quantity),
        formatPrice(firstItem.subtotal),
        formatPrice(order.total_amount),
      ])

      // Remaining items – leave order-level columns blank
      for (let i = 1; i < order.order_items.length; i++) {
        const item = order.order_items[i]
        tableBody.push([
          '',
          '',
          '',
          '',
          item.menu_item_name,
          formatPrice(item.menu_item_price),
          String(item.quantity),
          formatPrice(item.subtotal),
          '',
        ])
      }
    } else {
      tableBody.push([
        String(order.id),
        orderDate,
        completedDate,
        order.customer_name,
        'No items',
        formatPrice(0),
        '0',
        formatPrice(0),
        formatPrice(order.total_amount),
      ])
    }
  })

  // --- Render table ---
  autoTable(doc, {
    startY: 36,
    head: [
      [
        'Order ID',
        'Order Date',
        'Completed',
        'Customer',
        'Item',
        'Price',
        'Qty',
        'Subtotal',
        'Order Total',
      ],
    ],
    body: tableBody,
    theme: 'grid',
    headStyles: {
      fillColor: [22, 101, 52],   // green-800
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: [240, 253, 244], // green-50
    },
    columnStyles: {
      0: { cellWidth: 18 },  // Order ID
      1: { cellWidth: 24 },  // Order Date
      2: { cellWidth: 24 },  // Completed
      3: { cellWidth: 36 },  // Customer
      4: { cellWidth: 50 },  // Item
      5: { cellWidth: 24, halign: 'right' },  // Price
      6: { cellWidth: 14, halign: 'center' }, // Qty
      7: { cellWidth: 28, halign: 'right' },  // Subtotal
      8: { cellWidth: 28, halign: 'right' },  // Order Total
    },
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {
      // Footer with page number on every page
      const pageCount = (doc as any).internal.getNumberOfPages()
      const pageNumber = (doc as any).internal.getCurrentPageInfo().pageNumber
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text(
        `Page ${pageNumber} of ${pageCount}`,
        data.settings.margin.left,
        doc.internal.pageSize.height - 8,
      )
    },
  })

  // --- Total revenue row below the table ---
  const finalY = (doc as any).lastAutoTable.finalY + 8
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(`Total Revenue: ${formatPrice(totalRevenue)}`, 14, finalY)

  // --- Generate filename and trigger download ---
  const filename = `CeylonExpress_Orders_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}.pdf`

  doc.save(filename)

  return { filename, totalRevenue, orderCount: orders.length }
}
