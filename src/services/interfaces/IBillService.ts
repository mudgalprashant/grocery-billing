import type { Bill, CreateBillInput, BillStatus, ReportFilters, DailySummary, ServiceResult } from '@/types'

export interface IBillService {
  createBill(input: CreateBillInput): Promise<ServiceResult<Bill>>
  getBill(storeId: string, id: string): Promise<ServiceResult<Bill | null>>
  getBillByNumber(storeId: string, billNumber: string): Promise<ServiceResult<Bill | null>>
  listBills(storeId: string, filters?: ReportFilters): Promise<ServiceResult<Bill[]>>
  listBillsByCustomer(storeId: string, customerId: string): Promise<ServiceResult<Bill[]>>
  updateBillStatus(storeId: string, id: string, status: BillStatus): Promise<ServiceResult<void>>
  getDailySummary(storeId: string, filters: ReportFilters): Promise<ServiceResult<DailySummary[]>>
  generateBillNumber(storeId: string): Promise<ServiceResult<string>>
}
