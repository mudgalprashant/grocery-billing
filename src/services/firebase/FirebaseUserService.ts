import {
  doc, getDoc, setDoc, updateDoc,
  collection, getDocs, serverTimestamp,
} from 'firebase/firestore'
import { db, COLLECTIONS } from './firebaseConfig'
import type { IUserService } from '../interfaces/IUserService'
import type { AppUser, UserRole, ServiceResult } from '@/types'

export class FirebaseUserService implements IUserService {
  private col = collection(db, COLLECTIONS.USERS)

  async upsertUser(
    user: Omit<AppUser, 'role' | 'isActive'> & { role?: UserRole }
  ): Promise<ServiceResult<AppUser>> {
    try {
      const ref = doc(db, COLLECTIONS.USERS, user.uid)
      const snap = await getDoc(ref)

      if (snap.exists()) {
        // User exists — update mutable fields but preserve role
        const existing = snap.data() as AppUser
        const updated: AppUser = {
          ...existing,
          displayName: user.displayName,
          photoURL: user.photoURL,
        }
        await updateDoc(ref, { displayName: user.displayName, photoURL: user.photoURL })
        return { success: true, data: updated }
      }

      // New user — default role is 'customer' unless specified
      // First user to sign up gets 'admin'
      const allUsers = await getDocs(this.col)
      const role: UserRole = user.role ?? (allUsers.empty ? 'admin' : 'customer')

      const newUser: AppUser = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role,
        isActive: true,
        createdAt: new Date().toISOString(),
      }

      await setDoc(ref, { ...newUser, _serverCreatedAt: serverTimestamp() })
      return { success: true, data: newUser }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  }

  async getUser(uid: string): Promise<ServiceResult<AppUser | null>> {
    try {
      const snap = await getDoc(doc(db, COLLECTIONS.USERS, uid))
      if (!snap.exists()) return { success: true, data: null }
      return { success: true, data: snap.data() as AppUser }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  }

  async listUsers(): Promise<ServiceResult<AppUser[]>> {
    try {
      const snap = await getDocs(this.col)
      const users = snap.docs.map(d => d.data() as AppUser)
      return { success: true, data: users }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  }

  async updateUserRole(uid: string, role: UserRole): Promise<ServiceResult<void>> {
    try {
      await updateDoc(doc(db, COLLECTIONS.USERS, uid), { role })
      return { success: true, data: undefined }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  }

  async setUserActive(uid: string, isActive: boolean): Promise<ServiceResult<void>> {
    try {
      await updateDoc(doc(db, COLLECTIONS.USERS, uid), { isActive })
      return { success: true, data: undefined }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  }
}
