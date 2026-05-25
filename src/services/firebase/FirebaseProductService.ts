import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, serverTimestamp,
} from 'firebase/firestore'
import { db, COLLECTIONS } from './firebaseConfig'
import type { IProductService } from '../interfaces/IProductService'
import type { Product, CreateProductInput, UpdateProductInput, ServiceResult } from '@/types'

export class FirebaseProductService implements IProductService {
  private col = collection(db, COLLECTIONS.PRODUCTS)

  async listProducts(includeInactive = false): Promise<ServiceResult<Product[]>> {
    try {
      const q = includeInactive
        ? query(this.col, orderBy('name'))
        : query(this.col, where('isActive', '==', true), orderBy('name'))
      const snap = await getDocs(q)
      const products = snap.docs.map(d => ({ id: d.id, ...d.data() }) as Product)
      return { success: true, data: products }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  }

  async getProduct(id: string): Promise<ServiceResult<Product | null>> {
    try {
      const snap = await getDoc(doc(db, COLLECTIONS.PRODUCTS, id))
      if (!snap.exists()) return { success: true, data: null }
      return { success: true, data: { id: snap.id, ...snap.data() } as Product }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  }

  async createProduct(input: CreateProductInput): Promise<ServiceResult<Product>> {
    try {
      const now = new Date().toISOString()
      const data = { ...input, createdAt: now, updatedAt: now, _ts: serverTimestamp() }
      const ref = await addDoc(this.col, data)
      return { success: true, data: { id: ref.id, ...input, createdAt: now, updatedAt: now } }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  }

  async updateProduct(id: string, input: UpdateProductInput): Promise<ServiceResult<Product>> {
    try {
      const now = new Date().toISOString()
      await updateDoc(doc(db, COLLECTIONS.PRODUCTS, id), { ...input, updatedAt: now })
      const updated = await this.getProduct(id)
      if (!updated.success || !updated.data) return { success: false, error: 'Product not found after update' }
      return { success: true, data: updated.data }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  }

  async deleteProduct(id: string): Promise<ServiceResult<void>> {
    try {
      // Soft delete — preserve billing history
      await updateDoc(doc(db, COLLECTIONS.PRODUCTS, id), {
        isActive: false,
        updatedAt: new Date().toISOString(),
      })
      return { success: true, data: undefined }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  }

  async searchProducts(query_: string): Promise<ServiceResult<Product[]>> {
    // Firestore doesn't support full-text search natively.
    // For v1: fetch all active products and filter client-side.
    // Future: swap with Algolia/Typesense without changing this interface.
    try {
      const all = await this.listProducts(false)
      if (!all.success) return all
      const q = query_.toLowerCase()
      const filtered = all.data.filter(
        p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
      )
      return { success: true, data: filtered }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  }
}
