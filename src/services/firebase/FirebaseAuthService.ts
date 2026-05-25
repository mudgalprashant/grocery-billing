import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  type User,
} from 'firebase/auth'
import { auth } from './firebaseConfig'
import type { IAuthService } from '../interfaces/IAuthService'
import type { AppUser, ServiceResult } from '@/types'
import { FirebaseUserService } from './FirebaseUserService'

const toAppUser = async (firebaseUser: User): Promise<AppUser | null> => {
  const userService = new FirebaseUserService()
  const result = await userService.getUser(firebaseUser.uid)
  if (!result.success || !result.data) return null
  return result.data
}

/**
 * FirebaseAuthService — implements IAuthService using Firebase Auth.
 * Swap this class for SupabaseAuthService without changing any component.
 */
export class FirebaseAuthService implements IAuthService {
  private provider = new GoogleAuthProvider()

  async signInWithGoogle(): Promise<ServiceResult<AppUser>> {
    try {
      // Persist login across browser sessions
      await setPersistence(auth, browserLocalPersistence)
      const result = await signInWithPopup(auth, this.provider)
      const firebaseUser = result.user

      // Upsert user profile in Firestore
      const userService = new FirebaseUserService()
      const upsertResult = await userService.upsertUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email ?? '',
        displayName: firebaseUser.displayName ?? 'Unknown',
        photoURL: firebaseUser.photoURL,
        isActive: true,
        createdAt: new Date().toISOString(),
      })

      if (!upsertResult.success) return upsertResult

      return { success: true, data: upsertResult.data }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  }

  async signOut(): Promise<ServiceResult<void>> {
    try {
      await firebaseSignOut(auth)
      return { success: true, data: undefined }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  }

  async getCurrentUser(): Promise<ServiceResult<AppUser | null>> {
    try {
      const firebaseUser = auth.currentUser
      if (!firebaseUser) return { success: true, data: null }
      const appUser = await toAppUser(firebaseUser)
      return { success: true, data: appUser }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  }

  onAuthStateChanged(callback: (user: AppUser | null) => void): () => void {
    return firebaseOnAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        callback(null)
        return
      }
      const appUser = await toAppUser(firebaseUser)
      callback(appUser)
    })
  }
}
