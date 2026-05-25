import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * Replace these values with your own from:
 * Firebase Console → Project Settings → Your apps → SDK setup and configuration
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Prevent re-initialization during hot module reload
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);

// Firestore collection names — single source of truth
export const COLLECTIONS = {
  USERS: 'users',
  PRODUCTS: 'products',
  BILLS: 'bills',
  PAYMENTS: 'payments',
  COUNTERS: 'counters', // for bill number generation
  META: 'meta', // for app-wide settings and sentinels
} as const;
