// ─── User & Auth ────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'cashier' | 'customer'

export interface AppUser {
  uid: string
  email: string
  displayName: string
  photoURL: string | null
  role: UserRole
  createdAt: string // ISO
  isActive: boolean
}

// ─── Product ─────────────────────────────────────────────────────────────────

export type ProductUnit = 'kg' | 'g' | 'litre' | 'ml' | 'piece' | 'pack' | 'dozen'

export interface Product {
  id: string
  name: string
  price: number        // per unit
  unit: ProductUnit
  category: string
  imageUrl: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type CreateProductInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateProductInput = Partial<CreateProductInput>

// ─── Cart ────────────────────────────────────────────────────────────────────

export interface CartItem {
  product: Product
  quantity: number
  subtotal: number     // price * quantity
}

// ─── Bill ────────────────────────────────────────────────────────────────────

export type BillStatus = 'unpaid' | 'partial' | 'paid'

export interface Bill {
  id: string
  billNumber: string   // Human-readable: BILL-2024-0001
  items: CartItem[]
  subtotal: number
  taxPercent: number
  taxAmount: number
  totalAmount: number
  customerId: string | null
  customerName: string | null
  cashierId: string
  cashierName: string
  status: BillStatus
  createdAt: string
  updatedAt: string
}

export type CreateBillInput = Omit<Bill, 'id' | 'billNumber' | 'createdAt' | 'updatedAt'>

// ─── Payment ─────────────────────────────────────────────────────────────────

export type PaymentMode = 'cash' | 'upi' | 'card' | 'credit'
export type PaymentStatus = 'approved' | 'pending_approval'
export type PaymentRegisteredBy = 'store' | 'customer'

export interface Payment {
  id: string
  billId: string
  billNumber: string
  amount: number
  mode: PaymentMode
  paymentDate: string  // ISO date string (date only, user-selected)
  receiptImageUrl: string | null
  registeredBy: PaymentRegisteredBy
  registeredByUserId: string
  registeredByUserName: string
  status: PaymentStatus
  approvedByUserId: string | null
  approvedAt: string | null
  notes: string | null
  createdAt: string
}

export type CreatePaymentInput = Omit<
  Payment,
  'id' | 'status' | 'approvedByUserId' | 'approvedAt' | 'createdAt'
>

// ─── Reports ─────────────────────────────────────────────────────────────────

export interface DailySummary {
  date: string
  totalBills: number
  totalRevenue: number
  totalCollected: number
  totalPending: number
  billsByStatus: Record<BillStatus, number>
}

export interface ReportFilters {
  from: string  // ISO date
  to: string    // ISO date
  cashierId?: string
  status?: BillStatus
}

// ─── Service result wrapper (Open/Closed: swap implementations freely) ───────

export type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }
