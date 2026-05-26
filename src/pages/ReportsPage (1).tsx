import { useEffect, useState } from 'react'
import { BarChart3 } from 'lucide-react'
import { billService } from '@/services'
import { useAuth } from '@/context/AuthContext'
import { Card, Spinner, EmptyState } from '@/components/ui'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { subDays, format } from 'date-fns'
import type { DailySummary } from '@/types'

export function ReportsPage() {
  const { storeId } = useAuth()
  const [summaries, setSummaries] = useState<DailySummary[]>([])
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState<'7' | '30' | '90'>('7')

  useEffect(() => {
    if (!storeId) return
    const load = async () => {
      setLoading(true)
      const result = await billService.getDailySummary(storeId, {
        from: format(subDays(new Date(), parseInt(range)), 'yyyy-MM-dd') + 'T00:00:00.000Z',
        to: new Date().toISOString(),
      })
      if (result.success) setSummaries(result.data)
      setLoading(false)
    }
    load()
  }, [range, storeId])

  const totals = summaries.reduce(
    (acc, s) => ({
      revenue: acc.revenue + s.totalRevenue,
      collected: acc.collected + s.totalCollected,
      pending: acc.pending + s.totalPending,
      bills: acc.bills + s.totalBills,
    }),
    { revenue: 0, collected: 0, pending: 0, bills: 0 }
  )

  return (
    <div className="px-4 py-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-ink">Reports</h2>
        <div className="flex gap-1 bg-surface-muted rounded-xl p-1">
          {(['7', '30', '90'] as const).map(d => (
            <button
              key={d}
              onClick={() => setRange(d)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors
                ${range === d ? 'bg-white shadow-card text-ink' : 'text-ink-muted'}`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        {[
          { label: 'Revenue', value: formatCurrency(totals.revenue), color: 'text-primary-600' },
          { label: 'Collected', value: formatCurrency(totals.collected), color: 'text-blue-600' },
          { label: 'Pending', value: formatCurrency(totals.pending), color: 'text-warning' },
          { label: 'Bills', value: String(totals.bills), color: 'text-ink' },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <p className="text-xs text-ink-muted">{label}</p>
            <p className={`text-xl font-bold mt-1 ${color}`}>{value}</p>
          </Card>
        ))}
      </div>

      {loading && <div className="flex justify-center py-8"><Spinner className="w-8 h-8" /></div>}

      {!loading && summaries.length === 0 && (
        <EmptyState icon={<BarChart3 size={40} />} title="No data yet" description="Bills will show up here" />
      )}

      <p className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-3">Daily Breakdown</p>
      <div className="flex flex-col gap-3">
        {summaries.map(s => (
          <Card key={s.date}>
            <div className="flex justify-between items-start mb-2">
              <p className="font-medium text-ink text-sm">{formatDate(s.date + 'T00:00:00.000Z')}</p>
              <p className="font-bold text-ink">{formatCurrency(s.totalRevenue)}</p>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-ink-muted">
              <span>{s.totalBills} bills</span>
              <span className="text-primary-600">↑ {formatCurrency(s.totalCollected)} collected</span>
              {s.totalPending > 0 && <span className="text-warning">{formatCurrency(s.totalPending)} pending</span>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
