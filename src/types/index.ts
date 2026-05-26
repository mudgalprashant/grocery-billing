// ─── User & Auth ────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'store' | 'cashier' | 'customer';

/**
 * Role hierarchy:
 * admin   — super-admin, manages stores and global settings
 * store   — store manager, full access within their store
 * cashier — billing only within their store
 * customer — view own bills, register payments
 *
 * Multi-store: each user belongs to a storeId.
 * admin role has storeId = null (cross-store access).
 */
export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  role: UserRole;
  storeId: string | null; // null for global admin
  createdAt: string;
  isActive: boolean;
}

// ─── Store ───────────────────────────────────────────────────────────────────

export interface Store {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  createdAt: string;
  isActive: boolean;
}

export type CreateStoreInput = Omit<Store, 'id' | 'createdAt'>;

// ─── Product ─────────────────────────────────────────────────────────────────

export type ProductUnit =
  | 'kg'
  | 'g'
  | 'litre'
  | 'ml'
  | 'piece'
  | 'pack'
  | 'dozen';

export interface Product {
  id: string;
  storeId: string;
  name: string;
  description: string | null;
  price: number;
  unit: ProductUnit;
  category: string;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CreateProductInput = Omit<
  Product,
  'id' | 'createdAt' | 'updatedAt'
>;
export type UpdateProductInput = Partial<Omit<CreateProductInput, 'storeId'>>;

// ─── Cart ────────────────────────────────────────────────────────────────────

export interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

// ─── Bill ────────────────────────────────────────────────────────────────────

export type BillStatus = 'unpaid' | 'partial' | 'paid';

export interface Bill {
  id: string;
  storeId: string;
  billNumber: string;
  items: CartItem[];
  subtotal: number;
  taxPercent: number;
  taxAmount: number;
  totalAmount: number;
  customerId: string | null;
  customerName: string | null;
  cashierId: string;
  cashierName: string;
  status: BillStatus;
  createdAt: string;
  updatedAt: string;
}

export type CreateBillInput = Omit<
  Bill,
  'id' | 'billNumber' | 'createdAt' | 'updatedAt'
>;

// ─── Payment ─────────────────────────────────────────────────────────────────

export type PaymentMode = 'cash' | 'upi' | 'card' | 'credit';
export type PaymentStatus = 'approved' | 'pending_approval';
export type PaymentRegisteredBy = 'store' | 'customer';

export interface Payment {
  id: string;
  storeId: string;
  billId: string;
  billNumber: string;
  amount: number;
  mode: PaymentMode;
  paymentDate: string;
  receiptImageUrl: string | null;
  registeredBy: PaymentRegisteredBy;
  registeredByUserId: string;
  registeredByUserName: string;
  status: PaymentStatus;
  approvedByUserId: string | null;
  approvedAt: string | null;
  notes: string | null;
  createdAt: string;
}

export type CreatePaymentInput = Omit<
  Payment,
  'id' | 'status' | 'approvedByUserId' | 'approvedAt' | 'createdAt'
>;

// ─── Reports ─────────────────────────────────────────────────────────────────

export interface DailySummary {
  date: string;
  totalBills: number;
  totalRevenue: number;
  totalCollected: number;
  totalPending: number;
  billsByStatus: Record<BillStatus, number>;
}

export interface ReportFilters {
  from: string;
  to: string;
  cashierId?: string;
  status?: BillStatus;
}

// ─── Service result wrapper ───────────────────────────────────────────────────

export type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
