import jsPDF from 'jspdf'
import type { Bill } from '@/types'
import { formatCurrency, formatDateTime } from './formatters'

/**
 * generateInvoicePDF — Single Responsibility: PDF generation only.
 * Accepts a Bill and returns a jsPDF instance ready to save or share.
 */
export function generateInvoicePDF(bill: Bill, storeName = 'Grocery Store'): jsPDF {
  const pdf = new jsPDF({ unit: 'mm', format: 'a5' })
  const W = 148 // A5 width in mm
  let y = 15

  const line = () => { pdf.setDrawColor(220); pdf.line(10, y, W - 10, y); y += 4 }
  const text = (str: string, x: number, size = 10, bold = false) => {
    pdf.setFontSize(size)
    pdf.setFont('helvetica', bold ? 'bold' : 'normal')
    pdf.text(str, x, y)
  }

  // Header
  text(storeName, W / 2, 16, true)
  pdf.setFontSize(10)
  pdf.setTextColor(100)
  pdf.text('Tax Invoice', W / 2, y + 6, { align: 'center' })
  y += 10
  pdf.setTextColor(0)

  line()

  // Bill meta
  text(`Bill No: ${bill.billNumber}`, 10, 9, true)
  pdf.text(formatDateTime(bill.createdAt), W - 10, y, { align: 'right' })
  y += 5
  text(`Cashier: ${bill.cashierName}`, 10, 9)
  if (bill.customerName) {
    y += 5
    text(`Customer: ${bill.customerName}`, 10, 9)
  }
  y += 4

  line()

  // Items header
  text('Item', 10, 9, true)
  text('Qty', 80, 9, true)
  text('Rate', 100, 9, true)
  text('Amount', 125, 9, true)
  y += 2
  line()

  // Items
  for (const item of bill.items) {
    text(item.product.name, 10, 9)
    text(`${item.quantity} ${item.product.unit}`, 80, 9)
    text(formatCurrency(item.product.price), 100, 9)
    text(formatCurrency(item.subtotal), 125, 9)
    y += 6
  }

  line()

  // Totals
  const addTotal = (label: string, amount: string, bold = false) => {
    text(label, 90, 9, bold)
    pdf.text(amount, W - 10, y, { align: 'right' })
    y += 5
  }

  addTotal('Subtotal', formatCurrency(bill.subtotal))
  if (bill.taxPercent > 0) {
    addTotal(`Tax (${bill.taxPercent}%)`, formatCurrency(bill.taxAmount))
  }
  addTotal('TOTAL', formatCurrency(bill.totalAmount), true)

  y += 2
  line()

  // Status
  pdf.setFontSize(10)
  pdf.setTextColor(bill.status === 'paid' ? 0 : 200)
  pdf.text(`Status: ${bill.status.toUpperCase()}`, W / 2, y, { align: 'center' })
  pdf.setTextColor(0)
  y += 8

  // Footer
  pdf.setFontSize(8)
  pdf.setTextColor(150)
  pdf.text('Thank you for shopping with us!', W / 2, y, { align: 'center' })

  return pdf
}
