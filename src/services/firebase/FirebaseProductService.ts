import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc,
  query, where, orderBy,
} from 'firebase/firestore'
import { db, storePath } from './firebaseConfig'
import type { IProductService } from '../interfaces/IProductService'
import type { Product, CreateProductInput, UpdateProductInput, ServiceResult } from '@/types'
import { fuzzySearch } from '@/utils/fuzzySearch'

export class FirebaseProductService implements IProductService {
  private col(storeId: string) {
    return collection(db, storePath(storeId, 'products'))
  }

  async listProducts(storeId: string, includeInactive = false): Promise<ServiceResult<Product[]>> {
    try {
      const q = includeInactive
        ? query(this.col(storeId), orderBy('name'))
        : query(this.col(storeId), where('isActive', '==', true), orderBy('name'))
      const snap = await getDocs(q)
      const products = snap.docs.map(d => ({ id: d.id, storeId, ...d.data() }) as Product)
      return { success: true, data: products }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  }

  async getProduct(storeId: string, id: string): Promise<ServiceResult<Product | null>> {
    try {
      const snap = await getDoc(doc(db, storePath(storeId, 'products'), id))
      if (!snap.exists()) return { success: true, data: null }
      return { success: true, data: { id: snap.id, storeId, ...snap.data() } as Product }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  }

  async createProduct(input: CreateProductInput): Promise<ServiceResult<Product>> {
    try {
      const now = new Date().toISOString()
      const { storeId, ...rest } = input
      const data = { ...rest, storeId, createdAt: now, updatedAt: now }
      const ref = await addDoc(this.col(storeId), data)
      return { success: true, data: { id: ref.id, ...data } as Product }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  }

  async updateProduct(storeId: string, id: string, input: UpdateProductInput): Promise<ServiceResult<Product>> {
    try {
      const now = new Date().toISOString()
      await updateDoc(doc(db, storePath(storeId, 'products'), id), { ...input, updatedAt: now })
      const updated = await this.getProduct(storeId, id)
      if (!updated.success || !updated.data) return { success: false, error: 'Product not found after update' }
      return { success: true, data: updated.data }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  }

  async deleteProduct(storeId: string, id: string): Promise<ServiceResult<void>> {
    try {
      await updateDoc(doc(db, storePath(storeId, 'products'), id), {
        isActive: false,
        updatedAt: new Date().toISOString(),
      })
      return { success: true, data: undefined }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  }

  async searchProducts(storeId: string, query_: string): Promise<ServiceResult<Product[]>> {
    try {
      const all = await this.listProducts(storeId, false)
      if (!all.success) return all
      const results = fuzzySearch(all.data, query_)
      return { success: true, data: results }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  }
}
