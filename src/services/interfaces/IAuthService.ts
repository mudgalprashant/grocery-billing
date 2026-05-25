import type { AppUser, ServiceResult } from '@/types'

/**
 * IAuthService — Interface Segregation + Dependency Inversion Principle
 * Any auth provider (Firebase, Supabase, mock) implements this contract.
 * Components depend on this interface, never on a concrete implementation.
 */
export interface IAuthService {
  /** Sign in with Google OAuth popup */
  signInWithGoogle(): Promise<ServiceResult<AppUser>>

  /** Sign out the current user */
  signOut(): Promise<ServiceResult<void>>

  /** Get the currently signed-in user, or null */
  getCurrentUser(): Promise<ServiceResult<AppUser | null>>

  /**
   * Subscribe to auth state changes.
   * Returns an unsubscribe function.
   */
  onAuthStateChanged(callback: (user: AppUser | null) => void): () => void
}
