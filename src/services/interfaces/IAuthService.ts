import type { AppUser, ServiceResult } from '@/types';

/**
 * IAuthService — Interface Segregation + Dependency Inversion Principle.
 * Any auth provider implements this contract.
 */
export interface IAuthService {
  /** Sign in with Google OAuth popup */
  signInWithGoogle(): Promise<ServiceResult<AppUser>>;

  /** Sign in with email and password */
  signInWithEmailPassword(
    email: string,
    password: string,
  ): Promise<ServiceResult<AppUser>>;

  /** Register a new account with email and password */
  registerWithEmailPassword(
    email: string,
    password: string,
    displayName: string,
  ): Promise<ServiceResult<AppUser>>;

  /** Send a magic link (passwordless) to the given email */
  sendMagicLink(email: string): Promise<ServiceResult<void>>;

  /**
   * Complete magic link sign-in.
   * Call on app load — checks if current URL is a magic link.
   * Returns null if URL is not a magic link.
   */
  completeMagicLinkSignIn(
    email: string,
  ): Promise<ServiceResult<AppUser | null>>;

  /** Check if the current URL is a magic link redirect */
  isMagicLinkUrl(): boolean;

  /** Sign out the current user */
  signOut(): Promise<ServiceResult<void>>;

  /** Get the currently signed-in user, or null */
  getCurrentUser(): Promise<ServiceResult<AppUser | null>>;

  /** Subscribe to auth state changes. Returns an unsubscribe function. */
  onAuthStateChanged(callback: (user: AppUser | null) => void): () => void;
}
