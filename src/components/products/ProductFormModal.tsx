import { useState } from 'react'
import { X, ImagePlus } from 'lucide-react'
import { useProducts, useStorage } from '@/hooks'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui'
import type { Product, ProductUnit } from '@/types'
import toast from 'react-hot-toast'

const UNITS: ProductUnit[] = ['kg', 'g', 'litre', 'ml', 'piece', 'pack', 'dozen']
const CATEGORIES = ['Vegetables', 'Fruits', 'Dairy', 'Grains', 'Beverages', 'Snacks', 'Cleaning', 'Personal Care', 'Other']

interface Props {
  product: Product | null
  onClose: () => void
  onSaved: () => void
}

export function ProductFormModal({ product, onClose, onSaved }: Props) {
  const { create, update } = useProducts()
  const { upload, uploading } = useStorage()

  const [name, setName] = useState(product?.name ?? '')
  const [price, setPrice] = useState(String(product?.price ?? ''))
  const [unit, setUnit] = useState<ProductUnit>(product?.unit ?? 'piece')
  const [category, setCategory] = useState(product?.category ?? CATEGORIES[0])
  const [imageUrl, setImageUrl] = useState<string | null>(product?.imageUrl ?? null)
  const [saving, setSaving] = useState(false)

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const result = await upload(file, 'products')
    if (result.success) setImageUrl(result.data)
    else toast.error('Image upload failed')
  }

  const handleSave = async () => {
    if (!name.trim() || !price) return toast.error('Fill in all required fields')
    const priceNum = parseFloat(price)
    if (isNaN(priceNum) || priceNum <= 0) return toast.error('Enter a valid price')

    setSaving(true)
    const input = { name: name.trim(), price: priceNum, unit, category, imageUrl, isActive: true }

    const result = product
      ? await update(product.id, input)
      : await create(input)

    setSaving(false)

    if (result.success) {
      toast.success(product ? 'Product updated' : 'Product added')
      onSaved()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={onClose}>
      <div
        className="bg-white w-full max-w-md rounded-t-2xl p-5 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-ink text-lg">{product ? 'Edit Product' : 'Add Product'}</h3>
          <button onClick={onClose} className="p-1 text-ink-muted"><X size={20} /></button>
        </div>

        <div className="flex flex-col gap-4">
          {/* Image upload */}
          <div>
            <label className="text-sm font-medium text-ink block mb-1">Photo (optional)</label>
            <div className="flex items-center gap-3">
              {imageUrl
                ? <img src={imageUrl} alt="" className="w-16 h-16 rounded-xl object-cover" />
                : <div className="w-16 h-16 rounded-xl bg-surface-muted flex items-center justify-center text-2xl">🥬</div>
              }
              <label className="cursor-pointer">
                <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
                <span className="flex items-center gap-1.5 text-sm text-primary-600 font-medium">
                  <ImagePlus size={16} />
                  {uploading ? 'Uploading...' : 'Upload image'}
                </span>
              </label>
            </div>
          </div>

          <Input label="Product name *" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Basmati Rice" />

          <Input label="Price (₹) *" type="number" min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g. 120" />

          <div>
            <label className="text-sm font-medium text-ink block mb-1">Unit *</label>
            <select
              value={unit}
              onChange={e => setUnit(e.target.value as ProductUnit)}
              className="w-full px-3 py-2.5 rounded-xl border border-surface-border text-sm focus:outline-none focus:border-primary-600"
            >
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-ink block mb-1">Category *</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-surface-border text-sm focus:outline-none focus:border-primary-600"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <Button onClick={handleSave} loading={saving || uploading} size="lg" className="w-full mt-2">
            {product ? 'Save Changes' : 'Add Product'}
          </Button>
        </div>
      </div>
    </div>
  )
}
