import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  type User,
} from 'firebase/auth';
import { auth } from './firebaseConfig';
import type { IAuthService } from '../interfaces/IAuthService';
import type { AppUser, ServiceResult } from '@/types';
import { FirebaseUserService } from './FirebaseUserService';

// Magic link email is stored locally so we can complete sign-in on redirect
const MAGIC_LINK_EMAIL_KEY = 'grocery_billing_magic_link_email';

// Action code settings for magic link — points back to the app
const actionCodeSettings = {
  url: `${window.location.origin}${import.meta.env.BASE_URL}`,
  handleCodeInApp: true,
};

const userService = new FirebaseUserService();

/** Convert a Firebase User to AppUser via Firestore profile */
async function toAppUser(firebaseUser: User): Promise<AppUser | null> {
  const result = await userService.getUser(firebaseUser.uid);
  if (!result.success || !result.data) return null;
  return result.data;
}

/** Upsert profile then return AppUser */
async function upsertAndReturn(
  firebaseUser: User,
  displayName?: string,
): Promise<ServiceResult<AppUser>> {
  const result = await userService.upsertUser({
    uid: firebaseUser.uid,
    email: firebaseUser.email ?? '',
    displayName:
      displayName ?? firebaseUser.displayName ?? firebaseUser.email ?? 'User',
    photoURL: firebaseUser.photoURL,
    storeId: null,
    createdAt: new Date().toISOString(),
  });
  return result;
}

export class FirebaseAuthService implements IAuthService {
  private googleProvider = new GoogleAuthProvider();

  // ── Google ──────────────────────────────────────────────────────────────

  async signInWithGoogle(): Promise<ServiceResult<AppUser>> {
    try {
      await setPersistence(auth, browserLocalPersistence);
      const result = await signInWithPopup(auth, this.googleProvider);
      return upsertAndReturn(result.user);
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }

  // ── Email + Password ─────────────────────────────────────────────────────

  async signInWithEmailPassword(
    email: string,
    password: string,
  ): Promise<ServiceResult<AppUser>> {
    try {
      await setPersistence(auth, browserLocalPersistence);
      const result = await signInWithEmailAndPassword(auth, email, password);
      return upsertAndReturn(result.user);
    } catch (err) {
      const msg =
        (err as { code?: string }).code === 'auth/invalid-credential'
          ? 'Incorrect email or password.'
          : (err as Error).message;
      return { success: false, error: msg };
    }
  }

  async registerWithEmailPassword(
    email: string,
    password: string,
    displayName: string,
  ): Promise<ServiceResult<AppUser>> {
    try {
      await setPersistence(auth, browserLocalPersistence);
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      // Set display name on the Firebase Auth profile
      await updateProfile(result.user, { displayName });
      return upsertAndReturn(result.user, displayName);
    } catch (err) {
      const msg =
        (err as { code?: string }).code === 'auth/email-already-in-use'
          ? 'An account with this email already exists. Try signing in.'
          : (err as Error).message;
      return { success: false, error: msg };
    }
  }

  // ── Magic Link ───────────────────────────────────────────────────────────

  async sendMagicLink(email: string): Promise<ServiceResult<void>> {
    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      // Save email so we can complete sign-in when user returns
      localStorage.setItem(MAGIC_LINK_EMAIL_KEY, email);
      return { success: true, data: undefined };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }

  isMagicLinkUrl(): boolean {
    return isSignInWithEmailLink(auth, window.location.href);
  }

  async completeMagicLinkSignIn(
    email: string,
  ): Promise<ServiceResult<AppUser | null>> {
    try {
      if (!this.isMagicLinkUrl()) return { success: true, data: null };
      await setPersistence(auth, browserLocalPersistence);
      const result = await signInWithEmailLink(
        auth,
        email,
        window.location.href,
      );
      localStorage.removeItem(MAGIC_LINK_EMAIL_KEY);
      // Clean up URL
      window.history.replaceState(null, '', window.location.pathname);
      return upsertAndReturn(result.user);
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }

  // ── Common ───────────────────────────────────────────────────────────────

  async signOut(): Promise<ServiceResult<void>> {
    try {
      await firebaseSignOut(auth);
      return { success: true, data: undefined };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }

  async getCurrentUser(): Promise<ServiceResult<AppUser | null>> {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return { success: true, data: null };
      const appUser = await toAppUser(firebaseUser);
      return { success: true, data: appUser };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }

  onAuthStateChanged(callback: (user: AppUser | null) => void): () => void {
    return firebaseOnAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        callback(null);
        return;
      }
      const appUser = await toAppUser(firebaseUser);
      callback(appUser);
    });
  }
}

// Export the stored magic link email so AuthContext can access it
export const getMagicLinkEmail = () =>
  localStorage.getItem(MAGIC_LINK_EMAIL_KEY);
