import { useState, useCallback } from 'react';
import {
  productService,
  billService,
  paymentService,
  userService,
  storageService,
  storeService,
} from '@/services';
import type {
  Product,
  CreateProductInput,
  UpdateProductInput,
  Bill,
  CreateBillInput,
  ReportFilters,
  Payment,
  CreatePaymentInput,
  AppUser,
  UserRole,
  Store,
  CreateStoreInput,
} from '@/types';

// ─── Generic async hook ────────────────────────────────────────────────────

export function useAsync<T>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (
      fn: () => Promise<
        { success: true; data: T } | { success: false; error: string }
      >,
    ) => {
      setLoading(true);
      setError(null);
      const result = await fn();
      if (result.success) setData(result.data);
      else setError(result.error);
      setLoading(false);
      return result;
    },
    [],
  );

  return { data, loading, error, run, setData };
}

// ─── Products ─────────────────────────────────────────────────────────────

export function useProducts(storeId: string | null) {
  const { data, loading, error, run, setData } = useAsync<Product[]>();

  const load = useCallback(
    (includeInactive = false) => {
      if (!storeId)
        return Promise.resolve({
          success: false as const,
          error: 'No store selected',
        });
      return run(() => productService.listProducts(storeId, includeInactive));
    },
    [run, storeId],
  );

  const create = useCallback(
    async (input: Omit<CreateProductInput, 'storeId'>) => {
      if (!storeId)
        return { success: false as const, error: 'No store selected' };
      const result = await productService.createProduct({ ...input, storeId });
      if (result.success)
        setData((prev) => (prev ? [result.data, ...prev] : [result.data]));
      return result;
    },
    [setData, storeId],
  );

  const update = useCallback(
    async (id: string, input: UpdateProductInput) => {
      if (!storeId)
        return { success: false as const, error: 'No store selected' };
      const result = await productService.updateProduct(storeId, id, input);
      if (result.success)
        setData(
          (prev) => prev?.map((p) => (p.id === id ? result.data : p)) ?? null,
        );
      return result;
    },
    [setData, storeId],
  );

  const remove = useCallback(
    async (id: string) => {
      if (!storeId)
        return { success: false as const, error: 'No store selected' };
      const result = await productService.deleteProduct(storeId, id);
      if (result.success)
        setData((prev) => prev?.filter((p) => p.id !== id) ?? null);
      return result;
    },
    [setData, storeId],
  );

  const search = useCallback(
    (query: string) => {
      if (!storeId)
        return Promise.resolve({
          success: false as const,
          error: 'No store selected',
        });
      return run(() => productService.searchProducts(storeId, query));
    },
    [run, storeId],
  );

  return {
    products: data,
    loading,
    error,
    load,
    create,
    update,
    remove,
    search,
  };
}

// ─── Bills ────────────────────────────────────────────────────────────────

export function useBills(storeId: string | null) {
  const { data, loading, error, run } = useAsync<Bill[]>();

  const load = useCallback(
    (filters?: ReportFilters) => {
      if (!storeId)
        return Promise.resolve({
          success: false as const,
          error: 'No store selected',
        });
      return run(() => billService.listBills(storeId, filters));
    },
    [run, storeId],
  );

  const create = useCallback(
    (input: Omit<CreateBillInput, 'storeId'>) => {
      if (!storeId)
        return Promise.resolve({
          success: false as const,
          error: 'No store selected',
        });
      return billService.createBill({ ...input, storeId });
    },
    [storeId],
  );

  return { bills: data, loading, error, load, create };
}

// ─── Payments ─────────────────────────────────────────────────────────────

export function usePayments(storeId: string | null) {
  const { data, loading, error, run, setData } = useAsync<Payment[]>();

  const loadByBill = useCallback(
    (billId: string) => {
      if (!storeId)
        return Promise.resolve({
          success: false as const,
          error: 'No store selected',
        });
      return run(() => paymentService.listPaymentsByBill(storeId, billId));
    },
    [run, storeId],
  );

  const loadPending = useCallback(() => {
    if (!storeId)
      return Promise.resolve({
        success: false as const,
        error: 'No store selected',
      });
    return run(() => paymentService.listPendingPayments(storeId));
  }, [run, storeId]);

  const register = useCallback(
    async (input: Omit<CreatePaymentInput, 'storeId'>) => {
      if (!storeId)
        return { success: false as const, error: 'No store selected' };
      const result = await paymentService.registerPayment({
        ...input,
        storeId,
      });
      if (result.success)
        setData((prev) => (prev ? [result.data, ...prev] : [result.data]));
      return result;
    },
    [setData, storeId],
  );

  const approve = useCallback(
    async (id: string, userId: string) => {
      if (!storeId)
        return { success: false as const, error: 'No store selected' };
      const result = await paymentService.approvePayment(storeId, id, userId);
      if (result.success) {
        setData(
          (prev) =>
            prev?.map((p) =>
              p.id === id
                ? {
                    ...p,
                    status: 'approved' as const,
                    approvedByUserId: userId,
                    approvedAt: new Date().toISOString(),
                  }
                : p,
            ) ?? null,
        );
      }
      return result;
    },
    [setData, storeId],
  );

  const reject = useCallback(
    async (id: string) => {
      if (!storeId)
        return { success: false as const, error: 'No store selected' };
      const result = await paymentService.rejectPayment(storeId, id);
      if (result.success)
        setData((prev) => prev?.filter((p) => p.id !== id) ?? null);
      return result;
    },
    [setData, storeId],
  );

  return {
    payments: data,
    loading,
    error,
    loadByBill,
    loadPending,
    register,
    approve,
    reject,
  };
}

// ─── Users ────────────────────────────────────────────────────────────────

export function useUsers() {
  const { data, loading, error, run, setData } = useAsync<AppUser[]>();

  const load = useCallback(() => run(() => userService.listUsers()), [run]);

  const updateRole = useCallback(
    async (uid: string, role: UserRole) => {
      const result = await userService.updateUserRole(uid, role);
      if (result.success)
        setData(
          (prev) =>
            prev?.map((u) => (u.uid === uid ? { ...u, role } : u)) ?? null,
        );
      return result;
    },
    [setData],
  );

  const setActive = useCallback(
    async (uid: string, isActive: boolean) => {
      const result = await userService.setUserActive(uid, isActive);
      if (result.success)
        setData(
          (prev) =>
            prev?.map((u) => (u.uid === uid ? { ...u, isActive } : u)) ?? null,
        );
      return result;
    },
    [setData],
  );

  return { users: data, loading, error, load, updateRole, setActive };
}

// ─── Stores ───────────────────────────────────────────────────────────────

export function useStores() {
  const { data, loading, error, run, setData } = useAsync<Store[]>();

  const load = useCallback(() => run(() => storeService.listStores()), [run]);

  const create = useCallback(
    async (input: CreateStoreInput) => {
      const result = await storeService.createStore(input);
      if (result.success)
        setData((prev) => (prev ? [result.data, ...prev] : [result.data]));
      return result;
    },
    [setData],
  );

  return { stores: data, loading, error, load, create };
}

// ─── Storage ──────────────────────────────────────────────────────────────

export function useStorage() {
  const [uploading, setUploading] = useState(false);

  const upload = useCallback(async (file: File, folder: string) => {
    setUploading(true);
    const result = await storageService.uploadFile(file, folder);
    setUploading(false);
    return result;
  }, []);

  return { uploading, upload };
}

// ─── Store assignment on users ────────────────────────────────────────────
// Extend useUsers with updateStore method

export function useUserStoreAssignment() {
  const [loading, setLoading] = useState(false);

  const assignStore = useCallback(
    async (uid: string, storeId: string | null) => {
      setLoading(true);
      const result = await userService.updateUserStore(uid, storeId);
      setLoading(false);
      return result;
    },
    [],
  );

  return { loading, assignStore };
}
