import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { authService } from '@/services';
import { getMagicLinkEmail } from '@/services/firebase/FirebaseAuthService';
import type { AppUser } from '@/types';

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  storeId: string | null;
  isAdmin: boolean;
  isStore: boolean;
  isCashier: boolean;
  isCustomer: boolean;
  refreshUser: () => Promise<void>; // re-fetch user from Firestore (e.g. after store assignment)
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authService.isMagicLinkUrl()) {
      const email = getMagicLinkEmail();
      if (email) {
        authService.completeMagicLinkSignIn(email).then((result) => {
          if (result.success && result.data) setUser(result.data);
          setLoading(false);
        });
        return;
      }
    }
    const unsubscribe = authService.onAuthStateChanged((u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value: AuthContextValue = {
    user,
    loading,
    storeId: user?.storeId ?? null,
    isAdmin: user?.role === 'admin',
    isStore: user?.role === 'store',
    // cashier-level: anyone who can create bills
    isCashier: ['admin', 'store', 'cashier'].includes(user?.role ?? ''),
    isCustomer: user?.role === 'customer',
    refreshUser: async () => {
      const result = await authService.getCurrentUser();
      if (result.success && result.data) setUser(result.data);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
