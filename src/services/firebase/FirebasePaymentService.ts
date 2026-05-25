import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc,
  query, where, orderBy,
} from 'firebase/firestore'
import { db, COLLECTIONS } from './firebaseConfig'
import type { IPaymentService } from '../interfaces/IPaymentService'
import type { Payment, CreatePaymentInput, ServiceResult } from '@/types'

export class FirebasePaymentService implements IPaymentService {
  private col = collection(db, COLLECTIONS.PAYMENTS)

  async registerPayment(input: CreatePaymentInput): Promise<ServiceResult<Payment>> {
    try {
      const now = new Date().toISOString()
      // Store-registered payments are auto-approved; customer payments need approval
      const status = input.registeredBy === 'store' ? 'approved' : 'pending_approval'

      const payment: Omit<Payment, 'id'> = {
        ...input,
        status,
        approvedByUserId: null,
        approvedAt: null,
        createdAt: now,
      }

      const ref = await addDoc(this.col, payment)
      return { success: true, data: { id: ref.id, ...payment } }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  }

  async getPayment(id: string): Promise<ServiceResult<Payment | null>> {
    try {
      const snap = await getDoc(doc(db, COLLECTIONS.PAYMENTS, id))
      if (!snap.exists()) return { success: true, data: null }
      return { success: true, data: { id: snap.id, ...snap.data() } as Payment }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  }

  async listPaymentsByBill(billId: string): Promise<ServiceResult<Payment[]>> {
    try {
      const q = query(this.col, where('billId', '==', billId), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      const payments = snap.docs.map(d => ({ id: d.id, ...d.data() }) as Payment)
      return { success: true, data: payments }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  }

  async listPendingPayments(): Promise<ServiceResult<Payment[]>> {
    try {
      const q = query(
        this.col,
        where('status', '==', 'pending_approval'),
        orderBy('createdAt', 'desc')
      )
      const snap = await getDocs(q)
      const payments = snap.docs.map(d => ({ id: d.id, ...d.data() }) as Payment)
      return { success: true, data: payments }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  }

  async approvePayment(id: string, approvedByUserId: string): Promise<ServiceResult<void>> {
    try {
      await updateDoc(doc(db, COLLECTIONS.PAYMENTS, id), {
        status: 'approved',
        approvedByUserId,
        approvedAt: new Date().toISOString(),
      })
      return { success: true, data: undefined }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  }

  async rejectPayment(id: string): Promise<ServiceResult<void>> {
    try {
      // Soft reject — keep record, mark as rejected
      await updateDoc(doc(db, COLLECTIONS.PAYMENTS, id), {
        status: 'rejected',
      })
      return { success: true, data: undefined }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  }
}
