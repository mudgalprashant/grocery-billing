import { useEffect, useState } from 'react'
import { X, Download, Plus, ImagePlus, CheckCircle, Clock } from 'lucide-react'
import { usePayments, useStorage } from '@/hooks'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input, Badge, Spinner } from '@/components/ui'
import { formatCurrency, formatDate, formatDateTime } from '@/utils/formatters'
import { generateInvoicePDF } from '@/utils/pdfGenerator'
import type { Bill, PaymentMode } from '@/types'
import toast from 'react-hot-toast'

interface Props { bill: Bill; onClose: () => void; onUpdated: () => void }

const MODES: PaymentMode[] = ['cash', 'upi', 'card', 'credit']

export function BillDetailModal({ bill, onClose, onUpdated }: Props) {
  const { user, isCustomer, storeId } = useAuth()
  const { payments, loading, loadByBill, register } = usePayments(storeId)
  const { upload, uploading } = useStorage()

  const [showForm, setShowForm] = useState(false)
  const [mode, setMode] = useState<PaymentMode>('cash')
  const [amount, setAmount] = useState(String(bill.totalAmount))
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadByBill(bill.id) }, [loadByBill, bill.id])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const result = await upload(file, 'receipts')
    if (result.success) setReceiptUrl(result.data)
    else toast.error('Image upload failed')
  }

  const handleRegister = async () => {
    const amt = parseFloat(amount)
    if (isNaN(amt) || amt <= 0) return toast.error('Enter a valid amount')
    setSaving(true)
    const result = await register({
      billId: bill.id,
      billNumber: bill.billNumber,
      amount: amt,
      mode,
      paymentDate,
      receiptImageUrl: receiptUrl,
      registeredBy: isCustomer ? 'customer' : 'store',
      registeredByUserId: user!.uid,
      registeredByUserName: user!.displayName,
      notes: notes.trim() || null,
    })
    setSaving(false)
    if (result.success) {
      toast.success(isCustomer ? 'Payment submitted — awaiting approval' : 'Payment recorded')
      setShowForm(false)
      onUpdated()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="bg-white w-full max-w-md rounded-t-2xl max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-surface-border">
          <div>
            <h3 className="font-bold text-ink">{bill.billNumber}</h3>
            <p className="text-xs text-ink-muted">{formatDateTime(bill.createdAt)}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => generateInvoicePDF(bill).save(`${bill.billNumber}.pdf`)} className="p-2 rounded-lg bg-surface-muted text-ink-muted">
              <Download size={18} />
            </button>
            <button onClick={onClose} className="p-2 text-ink-muted"><X size={18} /></button>
          </div>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {/* Items */}
          <div>
            <p className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-2">Items</p>
            <div className="flex flex-col gap-1.5">
              {bill.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-ink">{item.product.name} × {item.quantity} {item.product.unit}</span>
                  <span className="font-medium shrink-0 ml-2">{formatCurrency(item.subtotal)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-surface-muted rounded-xl p-3 flex flex-col gap-1 text-sm">
            <div className="flex justify-between text-ink-muted">
              <span>Subtotal</span><span>{formatCurrency(bill.subtotal)}</span>
            </div>
            {bill.taxPercent > 0 && (
              <div className="flex justify-between text-ink-muted">
                <span>Tax ({bill.taxPercent}%)</span><span>{formatCurrency(bill.taxAmount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-ink border-t border-surface-border pt-1 mt-1">
              <span>Total</span><span>{formatCurrency(bill.totalAmount)}</span>
            </div>
          </div>

          {/* Payment history */}
          <div>
            <p className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-2">Payments</p>
            {loading && <Spinner className="w-5 h-5" />}
            {!loading && payments?.length === 0 && <p className="text-sm text-ink-muted">No payments recorded yet</p>}
            <div className="flex flex-col gap-2">
              {payments?.map(p => (
                <div key={p.id} className="flex items-start gap-2 text-sm bg-surface-muted rounded-xl p-3">
                  {p.status === 'approved'
                    ? <CheckCircle size={16} className="text-primary-600 mt-0.5 shrink-0" />
                    : <Clock size={16} className="text-warning mt-0.5 shrink-0" />
                  }
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-2">
                      <span className="font-medium">{formatCurrency(p.amount)}</span>
                      <Badge variant={p.status === 'approved' ? 'green' : 'yellow'}>
                        {p.status === 'approved' ? 'Approved' : 'Pending'}
                      </Badge>
                    </div>
                    <p className="text-xs text-ink-muted">{p.mode.toUpperCase()} · {formatDate(p.paymentDate)} · {p.registeredByUserName}</p>
                    {p.notes && <p className="text-xs text-ink-faint mt-0.5">{p.notes}</p>}
                    {p.receiptImageUrl && (
                      <a href={p.receiptImageUrl} target="_blank" rel="noreferrer" className="text-xs text-primary-600 underline">View receipt</a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Register payment */}
          {bill.status !== 'paid' && !showForm && (
            <Button variant="secondary" onClick={() => setShowForm(true)} className="w-full">
              <Plus size={16} /> Register Payment
            </Button>
          )}

          {showForm && (
            <div className="border border-surface-border rounded-xl p-4 flex flex-col gap-3">
              <p className="font-medium text-ink text-sm">Register Payment</p>
              <Input label="Amount (₹)" type="number" value={amount} onChange={e => setAmount(e.target.value)} />
              <div>
                <label className="text-sm font-medium text-ink block mb-1">Payment Mode</label>
                <div className="grid grid-cols-4 gap-2">
                  {MODES.map(m => (
                    <button key={m} onClick={() => setMode(m)}
                      className={`py-2 rounded-xl text-xs font-medium border transition-colors capitalize
                        ${mode === m ? 'bg-primary-600 text-white border-primary-600' : 'border-surface-border text-ink-muted'}`}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <Input label="Payment Date" type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} />
              <Input label="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} placeholder="UPI ref, cheque no, etc." />
              <div>
                <label className="text-sm font-medium text-ink block mb-1">Receipt image (optional)</label>
                <label className="cursor-pointer flex items-center gap-2 text-sm text-primary-600">
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  <ImagePlus size={16} />
                  {uploading ? 'Uploading...' : receiptUrl ? 'Change image' : 'Upload receipt'}
                </label>
                {receiptUrl && <img src={receiptUrl} alt="Receipt" className="mt-2 h-24 rounded-lg object-cover" />}
              </div>
              {isCustomer && (
                <p className="text-xs text-warning bg-yellow-50 rounded-lg p-2">
                  Your payment will be submitted for store approval.
                </p>
              )}
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
                <Button onClick={handleRegister} loading={saving || uploading} className="flex-1">Submit</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
