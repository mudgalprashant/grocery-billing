import type { Payment, CreatePaymentInput, ServiceResult } from '@/types'

export interface IPaymentService {
  registerPayment(input: CreatePaymentInput): Promise<ServiceResult<Payment>>
  getPayment(storeId: string, id: string): Promise<ServiceResult<Payment | null>>
  listPaymentsByBill(storeId: string, billId: string): Promise<ServiceResult<Payment[]>>
  listPendingPayments(storeId: string): Promise<ServiceResult<Payment[]>>
  approvePayment(storeId: string, id: string, approvedByUserId: string): Promise<ServiceResult<void>>
  rejectPayment(storeId: string, id: string): Promise<ServiceResult<void>>
}
