import { useEffect, useState } from 'react';
import {
  Plus,
  Pencil,
  Store,
  Users,
  ChevronDown,
  ChevronUp,
  Check,
} from 'lucide-react';
import { useStores, useUsers, useUserStoreAssignment } from '@/hooks';
import { useAuth } from '@/context/AuthContext';
import { Card, Badge, EmptyState, Spinner } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { StoreFormModal } from '@/components/stores/StoreFormModal';
import { getInitials } from '@/utils/formatters';
import type { Store as StoreType, AppUser } from '@/types';
import toast from 'react-hot-toast';

export function StoreManagementPage() {
  const { user: currentUser } = useAuth();
  const { stores, loading: storesLoading, load: loadStores } = useStores();
  const {
    users,
    loading: usersLoading,
    load: loadUsers,
    updateRole,
  } = useUsers();
  const { assignStore, loading: assigning } = useUserStoreAssignment();

  const [editTarget, setEditTarget] = useState<StoreType | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [expandedStore, setExpandedStore] = useState<string | null>(null);

  useEffect(() => {
    loadStores();
    loadUsers();
  }, [loadStores, loadUsers]);

  const activeStores = stores?.filter((s) => s.isActive) ?? [];

  // Users who can be assigned to a store (non-admin)
  const assignableUsers =
    users?.filter((u) => u.role !== 'admin' && u.uid !== currentUser?.uid) ??
    [];

  const getUsersForStore = (storeId: string) =>
    assignableUsers.filter((u) => u.storeId === storeId);

  const getUnassignedUsers = () => assignableUsers.filter((u) => !u.storeId);

  const handleAssign = async (user: AppUser, storeId: string | null) => {
    // If assigning to a store and user is customer, upgrade to cashier
    let roleUpdated = false;
    if (storeId && user.role === 'customer') {
      const roleResult = await updateRole(user.uid, 'cashier');
      if (!roleResult.success) {
        toast.error(roleResult.error);
        return;
      }
      roleUpdated = true;
    }
    // If removing from store, reset to customer
    if (!storeId && (user.role === 'cashier' || user.role === 'store')) {
      const roleResult = await updateRole(user.uid, 'customer');
      if (!roleResult.success) {
        toast.error(roleResult.error);
        return;
      }
    }

    const result = await assignStore(user.uid, storeId);
    if (result.success) {
      toast.success(
        storeId
          ? `${user.displayName} assigned${roleUpdated ? ' (upgraded to Cashier)' : ''}`
          : `${user.displayName} unassigned`,
      );
      loadUsers();
    } else {
      toast.error(result.error);
    }
  };

  const handleSetManager = async (user: AppUser, storeId: string) => {
    // First assign to store if not already
    if (user.storeId !== storeId) {
      const assignResult = await assignStore(user.uid, storeId);
      if (!assignResult.success) {
        toast.error(assignResult.error);
        return;
      }
    }
    // Promote to store manager
    const roleResult = await updateRole(user.uid, 'store');
    if (roleResult.success) {
      toast.success(`${user.displayName} is now Store Manager`);
      loadUsers();
    } else {
      toast.error(roleResult.error);
    }
  };

  return (
    <div className="px-4 py-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-ink">Stores</h2>
          <p className="text-sm text-ink-muted">
            {activeStores.length} active store
            {activeStores.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setEditTarget(null);
            setShowForm(true);
          }}
        >
          <Plus size={16} /> New Store
        </Button>
      </div>

      {storesLoading && (
        <div className="flex justify-center py-10">
          <Spinner className="w-8 h-8" />
        </div>
      )}

      {!storesLoading && activeStores.length === 0 && (
        <EmptyState
          icon={<Store size={40} />}
          title="No stores yet"
          description="Create your first store to get started"
        />
      )}

      <div className="flex flex-col gap-4">
        {activeStores.map((store) => {
          const storeUsers = getUsersForStore(store.id);
          const manager = storeUsers.find((u) => u.role === 'store');
          const isExpanded = expandedStore === store.id;

          return (
            <Card key={store.id} className="p-0 overflow-hidden">
              {/* Store header */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-ink">{store.name}</p>
                      {manager && (
                        <Badge variant="green">
                          Manager: {manager.displayName.split(' ')[0]}
                        </Badge>
                      )}
                      {!manager && storeUsers.length > 0 && (
                        <Badge variant="yellow">No manager</Badge>
                      )}
                      {storeUsers.length === 0 && (
                        <Badge variant="gray">No staff</Badge>
                      )}
                    </div>
                    {store.address && (
                      <p className="text-xs text-ink-muted mt-0.5">
                        {store.address}
                      </p>
                    )}
                    {store.phone && (
                      <p className="text-xs text-ink-muted">{store.phone}</p>
                    )}
                    <p className="text-xs text-ink-faint mt-1">
                      ID: {store.id}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setEditTarget(store);
                        setShowForm(true);
                      }}
                      className="p-2 rounded-lg text-ink-muted hover:bg-surface-muted"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() =>
                        setExpandedStore(isExpanded ? null : store.id)
                      }
                      className="p-2 rounded-lg text-ink-muted hover:bg-surface-muted"
                    >
                      {isExpanded ? (
                        <ChevronUp size={15} />
                      ) : (
                        <ChevronDown size={15} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Staff summary row */}
                {storeUsers.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                    <Users size={13} className="text-ink-faint" />
                    {storeUsers.map((u) => (
                      <div key={u.uid} className="flex items-center gap-1">
                        {u.photoURL ? (
                          <img
                            src={u.photoURL}
                            alt=""
                            className="w-5 h-5 rounded-full"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center text-[9px] font-bold text-primary-700">
                            {getInitials(u.displayName)}
                          </div>
                        )}
                        <span className="text-xs text-ink-muted">
                          {u.displayName.split(' ')[0]}
                        </span>
                        {u.role === 'store' && (
                          <span className="text-[9px] text-primary-600 font-semibold">
                            MGR
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Expanded: user assignment panel */}
              {isExpanded && (
                <div className="border-t border-surface-border bg-surface-muted">
                  <div className="p-4">
                    <p className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-3">
                      Staff Assignment
                    </p>

                    {/* Current staff */}
                    {storeUsers.length > 0 && (
                      <div className="flex flex-col gap-2 mb-4">
                        <p className="text-xs text-ink-muted font-medium">
                          Assigned staff
                        </p>
                        {storeUsers.map((u) => (
                          <div
                            key={u.uid}
                            className="flex items-center gap-2 bg-white rounded-xl p-2.5"
                          >
                            {u.photoURL ? (
                              <img
                                src={u.photoURL}
                                alt=""
                                className="w-8 h-8 rounded-full shrink-0"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-700 shrink-0">
                                {getInitials(u.displayName)}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-ink truncate">
                                {u.displayName}
                              </p>
                              <p className="text-xs text-ink-muted">
                                {u.email}
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <Badge
                                variant={u.role === 'store' ? 'green' : 'blue'}
                              >
                                {u.role === 'store' ? 'Manager' : 'Cashier'}
                              </Badge>
                              {u.role !== 'store' && (
                                <button
                                  onClick={() => handleSetManager(u, store.id)}
                                  disabled={assigning}
                                  className="text-xs text-primary-600 font-medium border border-primary-600 px-2 py-0.5 rounded-lg hover:bg-primary-50"
                                >
                                  Make Mgr
                                </button>
                              )}
                              <button
                                onClick={() => handleAssign(u, null)}
                                disabled={assigning}
                                className="text-xs text-danger border border-danger px-2 py-0.5 rounded-lg hover:bg-red-50"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Unassigned users to add */}
                    {usersLoading && <Spinner className="w-5 h-5 mx-auto" />}
                    {!usersLoading && getUnassignedUsers().length > 0 && (
                      <div className="flex flex-col gap-2">
                        <p className="text-xs text-ink-muted font-medium">
                          Add from unassigned users
                        </p>
                        {getUnassignedUsers().map((u) => (
                          <div
                            key={u.uid}
                            className="flex items-center gap-2 bg-white rounded-xl p-2.5"
                          >
                            {u.photoURL ? (
                              <img
                                src={u.photoURL}
                                alt=""
                                className="w-8 h-8 rounded-full shrink-0"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-surface-border flex items-center justify-center text-xs font-bold text-ink-muted shrink-0">
                                {getInitials(u.displayName)}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-ink truncate">
                                {u.displayName}
                              </p>
                              <p className="text-xs text-ink-muted capitalize">
                                {u.role}
                              </p>
                            </div>
                            <div className="flex gap-1.5 shrink-0">
                              <button
                                onClick={() => handleAssign(u, store.id)}
                                disabled={assigning}
                                className="flex items-center gap-1 text-xs text-primary-600 font-medium border border-primary-600 px-2 py-1 rounded-lg hover:bg-primary-50"
                              >
                                <Plus size={12} /> Add
                              </button>
                              <button
                                onClick={() => handleSetManager(u, store.id)}
                                disabled={assigning}
                                className="flex items-center gap-1 text-xs text-green-700 font-medium border border-green-600 px-2 py-1 rounded-lg hover:bg-green-50"
                              >
                                <Check size={12} /> Manager
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {!usersLoading &&
                      getUnassignedUsers().length === 0 &&
                      storeUsers.length === 0 && (
                        <p className="text-sm text-ink-muted text-center py-2">
                          No unassigned users. Users appear here after they sign
                          up.
                        </p>
                      )}

                    {!usersLoading &&
                      getUnassignedUsers().length === 0 &&
                      storeUsers.length > 0 && (
                        <p className="text-xs text-ink-faint text-center pt-1">
                          All users are assigned to a store.
                        </p>
                      )}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Self-assignment section for admin */}
      <div className="mt-6">
        <p className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-3">
          Your Store Access (Admin)
        </p>
        <Card>
          <p className="text-sm text-ink mb-3">
            As admin you can operate any store. Pick a default store for your
            billing session:
          </p>
          <div className="flex flex-col gap-2">
            {activeStores.map((store) => {
              const isCurrent = currentUser?.storeId === store.id;
              return (
                <button
                  key={store.id}
                  onClick={async () => {
                    if (isCurrent) return;
                    const result = await assignStore(
                      currentUser!.uid,
                      store.id,
                    );
                    if (result.success) {
                      toast.success(`Switched to ${store.name}`);
                      loadUsers();
                    } else toast.error(result.error);
                  }}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl border transition-colors text-sm
                    ${
                      isCurrent
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-surface-border text-ink hover:bg-surface-muted'
                    }`}
                >
                  <span className="font-medium">{store.name}</span>
                  {isCurrent && (
                    <Check size={16} className="text-primary-600" />
                  )}
                </button>
              );
            })}
            {activeStores.length === 0 && (
              <p className="text-sm text-ink-muted text-center py-2">
                Create a store first
              </p>
            )}
          </div>
        </Card>
      </div>

      {showForm && (
        <StoreFormModal
          store={editTarget}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            loadStores();
          }}
        />
      )}
    </div>
  );
}
