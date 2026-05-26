import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db, storePath } from './firebaseConfig';
import type { IPaymentService } from '../interfaces/IPaymentService';
import type { Payment, CreatePaymentInput, ServiceResult } from '@/types';

export class FirebasePaymentService implements IPaymentService {
  private col(storeId: string) {
    return collection(db, storePath(storeId, 'payments'));
  }

  async registerPayment(
    input: CreatePaymentInput,
  ): Promise<ServiceResult<Payment>> {
    try {
      const now = new Date().toISOString();
      const status =
        input.registeredBy === 'store' ? 'approved' : 'pending_approval';
      const payment: Omit<Payment, 'id'> = {
        ...input,
        status,
        approvedByUserId: null,
        approvedAt: null,
        createdAt: now,
      };
      const ref = await addDoc(this.col(input.storeId), payment);
      return { success: true, data: { id: ref.id, ...payment } };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }

  async getPayment(
    storeId: string,
    id: string,
  ): Promise<ServiceResult<Payment | null>> {
    try {
      const snap = await getDoc(doc(db, storePath(storeId, 'payments'), id));
      if (!snap.exists()) return { success: true, data: null };
      return {
        success: true,
        data: { id: snap.id, ...snap.data() } as Payment,
      };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }

  async listPaymentsByBill(
    storeId: string,
    billId: string,
  ): Promise<ServiceResult<Payment[]>> {
    try {
      const q = query(
        this.col(storeId),
        where('billId', '==', billId),
        orderBy('createdAt', 'desc'),
      );
      const snap = await getDocs(q);
      return {
        success: true,
        data: snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Payment),
      };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }

  async listPendingPayments(
    storeId: string,
  ): Promise<ServiceResult<Payment[]>> {
    try {
      const q = query(
        this.col(storeId),
        where('status', '==', 'pending_approval'),
        orderBy('createdAt', 'desc'),
      );
      const snap = await getDocs(q);
      return {
        success: true,
        data: snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Payment),
      };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }

  async approvePayment(
    storeId: string,
    id: string,
    approvedByUserId: string,
  ): Promise<ServiceResult<void>> {
    try {
      await updateDoc(doc(db, storePath(storeId, 'payments'), id), {
        status: 'approved',
        approvedByUserId,
        approvedAt: new Date().toISOString(),
      });
      return { success: true, data: undefined };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }

  async rejectPayment(
    storeId: string,
    id: string,
  ): Promise<ServiceResult<void>> {
    try {
      await updateDoc(doc(db, storePath(storeId, 'payments'), id), {
        status: 'rejected',
      });
      return { success: true, data: undefined };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }
}
