import { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { storeService } from '@/services';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui';
import type { Store } from '@/types';
import toast from 'react-hot-toast';

interface Props {
  store: Store | null;
  onClose: () => void;
  onSaved: () => void;
}

export function StoreFormModal({ store, onClose, onSaved }: Props) {
  const [name, setName] = useState(store?.name ?? '');
  const [address, setAddress] = useState(store?.address ?? '');
  const [phone, setPhone] = useState(store?.phone ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return toast.error('Store name is required');
    setSaving(true);

    const input = {
      name: name.trim(),
      address: address.trim() || null,
      phone: phone.trim() || null,
      isActive: true,
    };

    const result = store
      ? await storeService.updateStore(store.id, input)
      : await storeService.createStore(input);

    setSaving(false);

    if (result.success) {
      toast.success(store ? 'Store updated' : 'Store created');
      onSaved();
    } else {
      toast.error(result.error);
    }
  };

  const handleDelete = async () => {
    if (!store) return;
    if (
      !confirm(`Deactivate "${store.name}"? Existing data will be preserved.`)
    )
      return;
    setSaving(true);
    const result = await storeService.deleteStore(store.id);
    setSaving(false);
    if (result.success) {
      toast.success('Store deactivated');
      onSaved();
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-t-2xl p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-ink text-lg">
            {store ? 'Edit Store' : 'New Store'}
          </h3>
          <button onClick={onClose} className="p-1 text-ink-muted">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <Input
            label="Store name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sharma General Store"
          />
          <Input
            label="Address (optional)"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. 12 MG Road, Bhopal"
          />
          <Input
            label="Phone (optional)"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. 9876543210"
          />

          <Button
            onClick={handleSave}
            loading={saving}
            size="lg"
            className="w-full mt-1"
          >
            {store ? 'Save Changes' : 'Create Store'}
          </Button>

          {store && (
            <Button
              variant="danger"
              size="md"
              className="w-full"
              onClick={handleDelete}
              loading={saving}
            >
              <Trash2 size={16} /> Deactivate Store
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
