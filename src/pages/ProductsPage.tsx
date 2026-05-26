import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Package } from 'lucide-react';
import { useProducts } from '@/hooks';
import { useAuth } from '@/context/AuthContext';
import { Card, Badge, EmptyState, Input, Spinner } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/utils/formatters';
import { ProductFormModal } from '@/components/products/ProductFormModal';
import type { Product } from '@/types';
import toast from 'react-hot-toast';

export function ProductsPage() {
  const { isAdmin, storeId } = useAuth();
  const { products, loading, load, remove } = useProducts(storeId);
  const [search, setSearch] = useState('');
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    load(isAdmin);
  }, [load, isAdmin]);

  const filtered =
    products?.filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase()),
    ) ?? [];

  const handleDelete = async (p: Product) => {
    if (!confirm(`Delete "${p.name}"?`)) return;
    const result = await remove(p.id);
    if (result.success) toast.success('Product removed');
    else toast.error(result.error);
  };

  return (
    <div className="px-4 py-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-ink">Products</h2>
        {isAdmin && (
          <Button
            size="sm"
            onClick={() => {
              setEditTarget(null);
              setShowForm(true);
            }}
          >
            <Plus size={16} /> Add
          </Button>
        )}
      </div>

      <Input
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4"
      />

      {loading && (
        <div className="flex justify-center py-10">
          <Spinner className="w-8 h-8" />
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <EmptyState
          icon={<Package size={40} />}
          title="No products yet"
          description="Add your first product to get started"
        />
      )}

      <div className="flex flex-col gap-3">
        {filtered.map((product) => (
          <Card key={product.id} className="flex items-center gap-3">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-12 h-12 rounded-xl object-cover bg-surface-muted"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-surface-muted flex items-center justify-center text-xl">
                🥬
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-ink text-sm truncate">
                {product.name}
              </p>
              <p className="text-xs text-ink-muted">{product.category}</p>
              <p className="text-sm font-semibold text-primary-600 mt-0.5">
                {formatCurrency(product.price)} / {product.unit}
              </p>
            </div>
            {!product.isActive && <Badge variant="gray">Inactive</Badge>}
            {isAdmin && (
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    setEditTarget(product);
                    setShowForm(true);
                  }}
                  className="p-2 rounded-lg text-ink-muted hover:bg-surface-muted"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleDelete(product)}
                  className="p-2 rounded-lg text-ink-muted hover:bg-red-50 hover:text-danger"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </Card>
        ))}
      </div>

      {showForm && (
        <ProductFormModal
          product={editTarget}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            load(isAdmin);
          }}
        />
      )}
    </div>
  );
}
