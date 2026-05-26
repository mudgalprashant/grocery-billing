import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

export const auth = getAuth(app)
export const db = getFirestore(app)

/**
 * Firestore data model (multi-store):
 *
 * /meta/admin_exists          — first-user sentinel
 * /users/{uid}                — user profiles (global)
 * /stores/{storeId}           — store records
 * /stores/{storeId}/products  — store-scoped products
 * /stores/{storeId}/bills     — store-scoped bills
 * /stores/{storeId}/payments  — store-scoped payments
 * /stores/{storeId}/counters  — bill number counters
 */
export const COLLECTIONS = {
  META: 'meta',
  USERS: 'users',
  STORES: 'stores',
  // Sub-collections under /stores/{storeId}/
  PRODUCTS: 'products',
  BILLS: 'bills',
  PAYMENTS: 'payments',
  COUNTERS: 'counters',
} as const

/** Helper — returns path to a store sub-collection */
export const storePath = (storeId: string, sub: 'products' | 'bills' | 'payments' | 'counters') =>
  `${COLLECTIONS.STORES}/${storeId}/${sub}`
