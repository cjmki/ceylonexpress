import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatPrice } from '@/app/constants/currency'
import { getVatRate, calculateVatFromGross, VatBreakdown } from '@/lib/vat'

interface ExportOrder {
  id: number
  customer_name: string
  total_amount: number
  delivery_date: string
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
  doc.text('VAT rates: 12% applied to orders before 01/04/2026 · 6% applied from 01/04/2026 (Skatteverket)', 14, 36)

  // --- Build table rows & accumulate VAT totals ---
  let totalGross = 0
  const vatTotals: Record<number, { gross: number; net: number; vatAmount: number; count: number }> = {}

  const tableBody: (string | number)[][] = []

  orders.forEach((order) => {
    const orderDate = new Date(order.created_at).toLocaleDateString('en-GB')
    const deliveryDate = order.delivery_date
      ? new Date(order.delivery_date).toLocaleDateString('en-GB')
      : new Date(order.updated_at).toLocaleDateString('en-GB')

    const rate = getVatRate(order.delivery_date || order.updated_at.slice(0, 10))
    const vat: VatBreakdown = calculateVatFromGross(order.total_amount, rate)
    const rateKey = vat.ratePercent

    totalGross += order.total_amount

    if (!vatTotals[rateKey]) {
      vatTotals[rateKey] = { gross: 0, net: 0, vatAmount: 0, count: 0 }
    }
    vatTotals[rateKey].gross += order.total_amount
    vatTotals[rateKey].net += vat.net
    vatTotals[rateKey].vatAmount += vat.vatAmount
    vatTotals[rateKey].count += 1

    if (order.order_items && order.order_items.length > 0) {
      // First item row carries full order info
      const firstItem = order.order_items[0]
      tableBody.push([
        String(order.id),
        orderDate,
        deliveryDate,
        order.customer_name,
        firstItem.menu_item_name,
        formatPrice(firstItem.menu_item_price),
        String(firstItem.quantity),
        formatPrice(firstItem.subtotal),
        formatPrice(order.total_amount),
        `${vat.ratePercent}%`,
        formatPrice(vat.vatAmount),
        formatPrice(vat.net),
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
          '',
          '',
          '',
        ])
      }
    } else {
      tableBody.push([
        String(order.id),
        orderDate,
        deliveryDate,
        order.customer_name,
        'No items',
        formatPrice(0),
        '0',
        formatPrice(0),
        formatPrice(order.total_amount),
        `${vat.ratePercent}%`,
        formatPrice(vat.vatAmount),
        formatPrice(vat.net),
      ])
    }
  })

  // --- Render table ---
  autoTable(doc, {
    startY: 41,
    head: [
      [
        'Order ID',
        'Order Date',
        'Delivery Date',
        'Customer',
        'Item',
        'Price',
        'Qty',
        'Subtotal',
        'Gross Total',
        'VAT %',
        'VAT Amt',
        'Net Total',
      ],
    ],
    body: tableBody,
    theme: 'grid',
    headStyles: {
      fillColor: [22, 101, 52],   // green-800
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 7,
    },
    bodyStyles: {
      fontSize: 7,
    },
    alternateRowStyles: {
      fillColor: [240, 253, 244], // green-50
    },
    columnStyles: {
      0:  { cellWidth: 14 },                       // Order ID
      1:  { cellWidth: 20 },                       // Order Date
      2:  { cellWidth: 20 },                       // Delivery Date
      3:  { cellWidth: 32 },                       // Customer
      4:  { cellWidth: 44 },                       // Item
      5:  { cellWidth: 20, halign: 'right' },      // Price
      6:  { cellWidth: 10, halign: 'center' },     // Qty
      7:  { cellWidth: 22, halign: 'right' },      // Subtotal
      8:  { cellWidth: 22, halign: 'right' },      // Gross Total
      9:  { cellWidth: 13, halign: 'center' },     // VAT %
      10: { cellWidth: 22, halign: 'right' },      // VAT Amt
      11: { cellWidth: 22, halign: 'right' },      // Net Total
    },
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {
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

  // --- VAT Summary section below the table ---
  let cursorY = (doc as any).lastAutoTable.finalY + 10

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('VAT Summary', 14, cursorY)
  cursorY += 6

  const summaryRates = Object.keys(vatTotals)
    .map(Number)
    .sort((a, b) => b - a) // descending: 12% first, then 6%

  const summaryBody = summaryRates.map((rate) => {
    const t = vatTotals[rate]
    return [
      `${rate}%`,
      String(t.count),
      formatPrice(Math.round(t.gross * 100) / 100),
      formatPrice(Math.round(t.net * 100) / 100),
      formatPrice(Math.round(t.vatAmount * 100) / 100),
    ]
  })

  const totalNet = summaryRates.reduce((sum, r) => sum + vatTotals[r].net, 0)
  const totalVat = summaryRates.reduce((sum, r) => sum + vatTotals[r].vatAmount, 0)

  summaryBody.push([
    'TOTAL',
    String(orders.length),
    formatPrice(Math.round(totalGross * 100) / 100),
    formatPrice(Math.round(totalNet * 100) / 100),
    formatPrice(Math.round(totalVat * 100) / 100),
  ])

  autoTable(doc, {
    startY: cursorY,
    head: [['VAT Rate', 'Orders', 'Gross (incl. VAT)', 'Net (excl. VAT)', 'VAT Collected']],
    body: summaryBody,
    theme: 'grid',
    headStyles: {
      fillColor: [22, 101, 52],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 24 },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 44, halign: 'right' },
      3: { cellWidth: 44, halign: 'right' },
      4: { cellWidth: 44, halign: 'right' },
    },
    didParseCell: (data) => {
      // Bold the TOTAL row
      if (data.row.index === summaryBody.length - 1) {
        data.cell.styles.fontStyle = 'bold'
        data.cell.styles.fillColor = [220, 252, 231] // green-100
      }
    },
    margin: { left: 14, right: 14 },
  })

  // --- Generate filename and trigger download ---
  const filename = `ceylon_express_orders_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}.pdf`

  doc.save(filename)

  return { filename, totalGross, totalNet: Math.round(totalNet * 100) / 100, totalVat: Math.round(totalVat * 100) / 100, orderCount: orders.length }
}
