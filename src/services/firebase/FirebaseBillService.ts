import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc,
  query, where, orderBy, runTransaction, increment,
} from 'firebase/firestore'
import { db, COLLECTIONS } from './firebaseConfig'
import type { IBillService } from '../interfaces/IBillService'
import type { Bill, CreateBillInput, BillStatus, ReportFilters, DailySummary, ServiceResult } from '@/types'
import { format, parseISO, isWithinInterval } from 'date-fns'

export class FirebaseBillService implements IBillService {
  private col = collection(db, COLLECTIONS.BILLS)

  async generateBillNumber(): Promise<ServiceResult<string>> {
    try {
      const counterRef = doc(db, COLLECTIONS.COUNTERS, 'bills')
      let billNumber = ''

      await runTransaction(db, async (tx) => {
        const snap = await tx.get(counterRef)
        const count = snap.exists() ? (snap.data().count as number) : 0
        const next = count + 1
        tx.set(counterRef, { count: next }, { merge: true })
        const year = new Date().getFullYear()
        billNumber = `BILL-${year}-${String(next).padStart(4, '0')}`
      })

      return { success: true, data: billNumber }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  }

  async createBill(input: CreateBillInput): Promise<ServiceResult<Bill>> {
    try {
      const numberResult = await this.generateBillNumber()
      if (!numberResult.success) return numberResult

      const now = new Date().toISOString()
      const bill: Omit<Bill, 'id'> = {
        ...input,
        billNumber: numberResult.data,
        createdAt: now,
        updatedAt: now,
      }

      const ref = await addDoc(this.col, bill)
      return { success: true, data: { id: ref.id, ...bill } }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  }

  async getBill(id: string): Promise<ServiceResult<Bill | null>> {
    try {
      const snap = await getDoc(doc(db, COLLECTIONS.BILLS, id))
      if (!snap.exists()) return { success: true, data: null }
      return { success: true, data: { id: snap.id, ...snap.data() } as Bill }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  }

  async getBillByNumber(billNumber: string): Promise<ServiceResult<Bill | null>> {
    try {
      const q = query(this.col, where('billNumber', '==', billNumber))
      const snap = await getDocs(q)
      if (snap.empty) return { success: true, data: null }
      const d = snap.docs[0]
      return { success: true, data: { id: d.id, ...d.data() } as Bill }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  }

  async listBills(filters?: ReportFilters): Promise<ServiceResult<Bill[]>> {
    try {
      let q = query(this.col, orderBy('createdAt', 'desc'))

      if (filters?.cashierId) {
        q = query(q, where('cashierId', '==', filters.cashierId))
      }
      if (filters?.status) {
        q = query(q, where('status', '==', filters.status))
      }

      const snap = await getDocs(q)
      let bills = snap.docs.map(d => ({ id: d.id, ...d.data() }) as Bill)

      // Date range filter (client-side to avoid composite index requirements)
      if (filters?.from && filters?.to) {
        bills = bills.filter(b =>
          isWithinInterval(parseISO(b.createdAt), {
            start: parseISO(filters.from),
            end: parseISO(filters.to),
          })
        )
      }

      return { success: true, data: bills }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  }

  async listBillsByCustomer(customerId: string): Promise<ServiceResult<Bill[]>> {
    try {
      const q = query(
        this.col,
        where('customerId', '==', customerId),
        orderBy('createdAt', 'desc')
      )
      const snap = await getDocs(q)
      const bills = snap.docs.map(d => ({ id: d.id, ...d.data() }) as Bill)
      return { success: true, data: bills }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  }

  async updateBillStatus(id: string, status: BillStatus): Promise<ServiceResult<void>> {
    try {
      await updateDoc(doc(db, COLLECTIONS.BILLS, id), {
        status,
        updatedAt: new Date().toISOString(),
      })
      return { success: true, data: undefined }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  }

  async getDailySummary(filters: ReportFilters): Promise<ServiceResult<DailySummary[]>> {
    try {
      const billsResult = await this.listBills(filters)
      if (!billsResult.success) return billsResult

      // Group bills by date
      const byDate = new Map<string, Bill[]>()
      for (const bill of billsResult.data) {
        const date = format(parseISO(bill.createdAt), 'yyyy-MM-dd')
        if (!byDate.has(date)) byDate.set(date, [])
        byDate.get(date)!.push(bill)
      }

      const summaries: DailySummary[] = Array.from(byDate.entries()).map(([date, bills]) => ({
        date,
        totalBills: bills.length,
        totalRevenue: bills.reduce((s, b) => s + b.totalAmount, 0),
        totalCollected: bills
          .filter(b => b.status === 'paid')
          .reduce((s, b) => s + b.totalAmount, 0),
        totalPending: bills
          .filter(b => b.status !== 'paid')
          .reduce((s, b) => s + b.totalAmount, 0),
        billsByStatus: {
          unpaid: bills.filter(b => b.status === 'unpaid').length,
          partial: bills.filter(b => b.status === 'partial').length,
          paid: bills.filter(b => b.status === 'paid').length,
        },
      }))

      return { success: true, data: summaries.sort((a, b) => b.date.localeCompare(a.date)) }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  }
}
