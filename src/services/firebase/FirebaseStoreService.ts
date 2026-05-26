import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
} from 'firebase/firestore';
import { db, COLLECTIONS } from './firebaseConfig';
import type { IStoreService } from '../interfaces/IStoreService';
import type { Store, CreateStoreInput, ServiceResult } from '@/types';

export class FirebaseStoreService implements IStoreService {
  private col = collection(db, COLLECTIONS.STORES);

  async createStore(input: CreateStoreInput): Promise<ServiceResult<Store>> {
    try {
      const now = new Date().toISOString();
      const data = { ...input, createdAt: now };
      const ref = await addDoc(this.col, data);
      return { success: true, data: { id: ref.id, ...data } };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }

  async getStore(id: string): Promise<ServiceResult<Store | null>> {
    try {
      const snap = await getDoc(doc(db, COLLECTIONS.STORES, id));
      if (!snap.exists()) return { success: true, data: null };
      return { success: true, data: { id: snap.id, ...snap.data() } as Store };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }

  async listStores(): Promise<ServiceResult<Store[]>> {
    try {
      const snap = await getDocs(this.col);
      const stores = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Store);
      return { success: true, data: stores };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }

  async updateStore(
    id: string,
    input: Partial<CreateStoreInput>,
  ): Promise<ServiceResult<Store>> {
    try {
      await updateDoc(doc(db, COLLECTIONS.STORES, id), { ...input });
      const result = await this.getStore(id);
      if (!result.success || !result.data)
        return { success: false, error: 'Store not found' };
      return { success: true, data: result.data };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }

  async deleteStore(id: string): Promise<ServiceResult<void>> {
    try {
      // Soft delete — preserve historical data
      await updateDoc(doc(db, COLLECTIONS.STORES, id), { isActive: false });
      return { success: true, data: undefined };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }
}
