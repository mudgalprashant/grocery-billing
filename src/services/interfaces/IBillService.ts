import type { Bill, CreateBillInput, BillStatus, ReportFilters, DailySummary, ServiceResult } from '@/types'

/**
 * IBillService — Single Responsibility: bill lifecycle only.
 */
export interface IBillService {
  createBill(input: CreateBillInput): Promise<ServiceResult<Bill>>
  getBill(id: string): Promise<ServiceResult<Bill | null>>
  getBillByNumber(billNumber: string): Promise<ServiceResult<Bill | null>>
  listBills(filters?: ReportFilters): Promise<ServiceResult<Bill[]>>
  listBillsByCustomer(customerId: string): Promise<ServiceResult<Bill[]>>
  updateBillStatus(id: string, status: BillStatus): Promise<ServiceResult<void>>
  getDailySummary(filters: ReportFilters): Promise<ServiceResult<DailySummary[]>>
  generateBillNumber(): Promise<ServiceResult<string>>
}
