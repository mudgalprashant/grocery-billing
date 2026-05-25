import { useEffect, useState } from 'react'
import { ReceiptText, ChevronRight } from 'lucide-react'
import { useBills } from '@/hooks'
import { useAuth } from '@/context/AuthContext'
import { Card, Badge, EmptyState, Spinner } from '@/components/ui'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { BillDetailModal } from '@/components/billing/BillDetailModal'
import type { Bill, BillStatus } from '@/types'

const statusBadge: Record<BillStatus, 'red' | 'yellow' | 'green'> = {
  unpaid: 'red',
  partial: 'yellow',
  paid: 'green',
}

export function BillsPage() {
  const { user, isCustomer } = useAuth()
  const { bills, loading, load } = useBills()
  const [selected, setSelected] = useState<Bill | null>(null)

  useEffect(() => {
    if (isCustomer && user) {
      // Customers see their bills only (filtered by customerId in future)
      load()
    } else {
      load()
    }
  }, [load, user, isCustomer])

  return (
    <div className="px-4 py-5">
      <h2 className="text-lg font-bold text-ink mb-4">Bills</h2>

      {loading && <div className="flex justify-center py-10"><Spinner className="w-8 h-8" /></div>}

      {!loading && (!bills || bills.length === 0) && (
        <EmptyState icon={<ReceiptText size={40} />} title="No bills yet" description="Bills will appear here after checkout" />
      )}

      <div className="flex flex-col gap-3">
        {bills?.map(bill => (
          <Card key={bill.id} onClick={() => setSelected(bill)} className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="font-semibold text-ink text-sm">{bill.billNumber}</p>
                <Badge variant={statusBadge[bill.status]}>{bill.status}</Badge>
              </div>
              <p className="text-xs text-ink-muted">{bill.customerName ?? 'Walk-in'} · {bill.cashierName}</p>
              <p className="text-xs text-ink-faint">{formatDate(bill.createdAt)}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-ink">{formatCurrency(bill.totalAmount)}</p>
              <ChevronRight size={16} className="text-ink-faint ml-auto mt-1" />
            </div>
          </Card>
        ))}
      </div>

      {selected && (
        <BillDetailModal
          bill={selected}
          onClose={() => setSelected(null)}
          onUpdated={() => load()}
        />
      )}
    </div>
  )
}
