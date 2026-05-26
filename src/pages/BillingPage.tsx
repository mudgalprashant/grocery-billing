import { useEffect, useState } from 'react'
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react'
import { useProducts, useBills } from '@/hooks'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { Card, EmptyState, Input, Spinner } from '@/components/ui'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/utils/formatters'
import { generateInvoicePDF } from '@/utils/pdfGenerator'
import { fuzzySearch } from '@/utils/fuzzySearch'
import type { Product } from '@/types'
import toast from 'react-hot-toast'

export function BillingPage() {
  const { user, storeId } = useAuth()
  const { products, loading, load } = useProducts(storeId)
  const { items, subtotal, taxPercent, taxAmount, total, addItem, removeItem, updateQty, setTax, clear } = useCart()
  const { create } = useBills(storeId)

  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'products' | 'cart'>('products')
  const [customerName, setCustomerName] = useState('')
  const [billing, setBilling] = useState(false)

  useEffect(() => { load() }, [load])

  const filtered = search.trim()
    ? fuzzySearch(products ?? [], search)
    : (products ?? [])

  const handleCheckout = async () => {
    if (items.length === 0) return toast.error('Add at least one item')
    setBilling(true)
    const result = await create({
      items,
      subtotal,
      taxPercent,
      taxAmount,
      totalAmount: total,
      customerId: null,
      customerName: customerName.trim() || null,
      cashierId: user!.uid,
      cashierName: user!.displayName,
      status: 'unpaid',
    })
    if (!result.success) {
      toast.error(result.error)
      setBilling(false)
      return
    }
    const pdf = generateInvoicePDF(result.data)
    pdf.save(`${result.data.billNumber}.pdf`)
    toast.success(`Bill ${result.data.billNumber} created!`)
    clear()
    setCustomerName('')
    setBilling(false)
    setTab('products')
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Tab switcher */}
      <div className="flex border-b border-surface-border bg-white sticky top-0 z-10">
        {(['products', 'cart'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative capitalize
              ${tab === t ? 'text-primary-600' : 'text-ink-muted'}`}
          >
            {t}
            {t === 'cart' && items.length > 0 && (
              <span className="ml-1 bg-primary-600 text-white text-xs rounded-full px-1.5 py-0.5">
                {items.length}
              </span>
            )}
            {tab === t && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 rounded-full" />}
          </button>
        ))}
      </div>

      {/* Products tab */}
      {tab === 'products' && (
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <Input
            placeholder="Search products… (typos OK)"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="mb-3"
          />
          {loading && <div className="flex justify-center py-8"><Spinner className="w-8 h-8" /></div>}
          {!loading && filtered.length === 0 && (
            <EmptyState icon={<ShoppingCart size={40} />} title="No products found" description="Try a different search or add products first" />
          )}
          <div className="grid grid-cols-2 gap-3">
            {filtered.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                cartQty={items.find(i => i.product.id === product.id)?.quantity ?? 0}
                onAdd={() => addItem(product)}
                onRemove={() => updateQty(product.id, (items.find(i => i.product.id === product.id)?.quantity ?? 1) - 1)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Cart tab */}
      {tab === 'cart' && (
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
          {items.length === 0 && (
            <EmptyState
              icon={<ShoppingCart size={40} />}
              title="Cart is empty"
              description="Switch to Products tab to add items"
            />
          )}

          {items.map(item => (
            <Card key={item.product.id} className="flex items-center gap-3 py-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-ink text-sm truncate">{item.product.name}</p>
                <p className="text-xs text-ink-muted">{formatCurrency(item.product.price)} / {item.product.unit}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQty(item.product.id, item.quantity - 1)}
                  className="w-7 h-7 rounded-lg bg-surface-muted flex items-center justify-center"
                >
                  <Minus size={14} />
                </button>
                <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                <button
                  onClick={() => updateQty(item.product.id, item.quantity + 1)}
                  className="w-7 h-7 rounded-lg bg-surface-muted flex items-center justify-center"
                >
                  <Plus size={14} />
                </button>
                <button
                  onClick={() => removeItem(item.product.id)}
                  className="w-7 h-7 rounded-lg text-danger hover:bg-red-50 flex items-center justify-center ml-1"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <p className="text-sm font-semibold text-ink w-16 text-right">{formatCurrency(item.subtotal)}</p>
            </Card>
          ))}

          {items.length > 0 && (
            <div className="bg-white rounded-2xl border border-surface-border p-4 flex flex-col gap-3 mt-2">
              <Input
                label="Customer name (optional)"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="Walk-in customer"
              />
              <div>
                <label className="text-sm font-medium text-ink block mb-1">Tax %</label>
                <select
                  value={taxPercent}
                  onChange={e => setTax(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-surface-border text-sm focus:outline-none focus:border-primary-600"
                >
                  {[0, 5, 12, 18].map(t => <option key={t} value={t}>{t}%</option>)}
                </select>
              </div>
              <div className="border-t border-surface-border pt-3 flex flex-col gap-1 text-sm">
                <div className="flex justify-between text-ink-muted">
                  <span>Subtotal</span><span>{formatCurrency(subtotal)}</span>
                </div>
                {taxPercent > 0 && (
                  <div className="flex justify-between text-ink-muted">
                    <span>Tax ({taxPercent}%)</span><span>{formatCurrency(taxAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-ink text-base mt-1">
                  <span>Total</span><span>{formatCurrency(total)}</span>
                </div>
              </div>
              <Button onClick={handleCheckout} loading={billing} size="lg" className="w-full">
                Generate Bill & Download PDF
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Product card with inline qty controls ────────────────────────────────

function ProductCard({
  product, cartQty, onAdd, onRemove,
}: {
  product: Product
  cartQty: number
  onAdd: () => void
  onRemove: () => void
}) {
  return (
    <Card className="flex flex-col gap-2 p-3">
      {product.imageUrl
        ? <img src={product.imageUrl} alt={product.name} className="w-full h-24 object-cover rounded-xl" />
        : <div className="w-full h-24 bg-surface-muted rounded-xl flex items-center justify-center text-3xl">🥬</div>
      }
      <div className="flex-1">
        <p className="font-medium text-ink text-sm leading-tight">{product.name}</p>
        {product.description && (
          <p className="text-xs text-ink-faint leading-tight mt-0.5 line-clamp-2">{product.description}</p>
        )}
        <p className="text-xs text-ink-muted mt-0.5">{product.category}</p>
      </div>
      <div className="flex items-center justify-between mt-auto">
        <span className="text-sm font-semibold text-primary-600">{formatCurrency(product.price)}</span>
        {cartQty === 0 ? (
          <button
            onClick={onAdd}
            className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center text-white"
          >
            <Plus size={16} />
          </button>
        ) : (
          <div className="flex items-center gap-1.5">
            <button
              onClick={onRemove}
              className="w-6 h-6 bg-surface-muted rounded-md flex items-center justify-center"
            >
              <Minus size={12} />
            </button>
            <span className="text-sm font-bold text-ink w-4 text-center">{cartQty}</span>
            <button
              onClick={onAdd}
              className="w-6 h-6 bg-primary-600 rounded-md flex items-center justify-center text-white"
            >
              <Plus size={12} />
            </button>
          </div>
        )}
      </div>
    </Card>
  )
}
