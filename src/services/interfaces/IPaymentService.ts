import type { Payment, CreatePaymentInput, ServiceResult } from '@/types'

/**
 * IPaymentService — Single Responsibility: payment tracking only.
 */
export interface IPaymentService {
  registerPayment(input: CreatePaymentInput): Promise<ServiceResult<Payment>>
  getPayment(id: string): Promise<ServiceResult<Payment | null>>
  listPaymentsByBill(billId: string): Promise<ServiceResult<Payment[]>>
  listPendingPayments(): Promise<ServiceResult<Payment[]>>
  approvePayment(id: string, approvedByUserId: string): Promise<ServiceResult<void>>
  rejectPayment(id: string): Promise<ServiceResult<void>>
}
