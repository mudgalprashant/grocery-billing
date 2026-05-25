import { useState, useCallback } from 'react'
import { productService, billService, paymentService, userService, storageService } from '@/services'
import type {
  Product, CreateProductInput, UpdateProductInput,
  Bill, CreateBillInput, ReportFilters,
  Payment, CreatePaymentInput,
  AppUser, UserRole,
} from '@/types'

// ─── Generic async hook ────────────────────────────────────────────────────

export function useAsync<T>() {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = useCallback(async (fn: () => Promise<{ success: true; data: T } | { success: false; error: string }>) => {
    setLoading(true)
    setError(null)
    const result = await fn()
    if (result.success) {
      setData(result.data)
    } else {
      setError(result.error)
    }
    setLoading(false)
    return result
  }, [])

  return { data, loading, error, run, setData }
}

// ─── Products ─────────────────────────────────────────────────────────────

export function useProducts() {
  const { data, loading, error, run, setData } = useAsync<Product[]>()

  const load = useCallback((includeInactive = false) =>
    run(() => productService.listProducts(includeInactive)), [run])

  const create = useCallback(async (input: CreateProductInput) => {
    const result = await productService.createProduct(input)
    if (result.success) setData(prev => prev ? [result.data, ...prev] : [result.data])
    return result
  }, [setData])

  const update = useCallback(async (id: string, input: UpdateProductInput) => {
    const result = await productService.updateProduct(id, input)
    if (result.success) setData(prev => prev?.map(p => p.id === id ? result.data : p) ?? null)
    return result
  }, [setData])

  const remove = useCallback(async (id: string) => {
    const result = await productService.deleteProduct(id)
    if (result.success) setData(prev => prev?.filter(p => p.id !== id) ?? null)
    return result
  }, [setData])

  const search = useCallback((query: string) =>
    run(() => productService.searchProducts(query)), [run])

  return { products: data, loading, error, load, create, update, remove, search }
}

// ─── Bills ────────────────────────────────────────────────────────────────

export function useBills() {
  const { data, loading, error, run } = useAsync<Bill[]>()

  const load = useCallback((filters?: ReportFilters) =>
    run(() => billService.listBills(filters)), [run])

  const create = useCallback((input: CreateBillInput) =>
    billService.createBill(input), [])

  return { bills: data, loading, error, load, create }
}

// ─── Payments ─────────────────────────────────────────────────────────────

export function usePayments() {
  const { data, loading, error, run, setData } = useAsync<Payment[]>()

  const loadByBill = useCallback((billId: string) =>
    run(() => paymentService.listPaymentsByBill(billId)), [run])

  const loadPending = useCallback(() =>
    run(() => paymentService.listPendingPayments()), [run])

  const register = useCallback(async (input: CreatePaymentInput) => {
    const result = await paymentService.registerPayment(input)
    if (result.success) setData(prev => prev ? [result.data, ...prev] : [result.data])
    return result
  }, [setData])

  const approve = useCallback(async (id: string, userId: string) => {
    const result = await paymentService.approvePayment(id, userId)
    if (result.success) {
      setData(prev => prev?.map(p => p.id === id
        ? { ...p, status: 'approved', approvedByUserId: userId, approvedAt: new Date().toISOString() }
        : p) ?? null)
    }
    return result
  }, [setData])

  const reject = useCallback(async (id: string) => {
    const result = await paymentService.rejectPayment(id)
    if (result.success) setData(prev => prev?.filter(p => p.id !== id) ?? null)
    return result
  }, [setData])

  return { payments: data, loading, error, loadByBill, loadPending, register, approve, reject }
}

// ─── Users ────────────────────────────────────────────────────────────────

export function useUsers() {
  const { data, loading, error, run, setData } = useAsync<AppUser[]>()

  const load = useCallback(() => run(() => userService.listUsers()), [run])

  const updateRole = useCallback(async (uid: string, role: UserRole) => {
    const result = await userService.updateUserRole(uid, role)
    if (result.success) setData(prev => prev?.map(u => u.uid === uid ? { ...u, role } : u) ?? null)
    return result
  }, [setData])

  const setActive = useCallback(async (uid: string, isActive: boolean) => {
    const result = await userService.setUserActive(uid, isActive)
    if (result.success) setData(prev => prev?.map(u => u.uid === uid ? { ...u, isActive } : u) ?? null)
    return result
  }, [setData])

  return { users: data, loading, error, load, updateRole, setActive }
}

// ─── Storage ──────────────────────────────────────────────────────────────

export function useStorage() {
  const [uploading, setUploading] = useState(false)

  const upload = useCallback(async (file: File, folder: string) => {
    setUploading(true)
    const result = await storageService.uploadFile(file, folder)
    setUploading(false)
    return result
  }, [])

  return { uploading, upload }
}
