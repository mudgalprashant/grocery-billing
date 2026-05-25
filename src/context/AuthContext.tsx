import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { authService } from '@/services'
import type { AppUser } from '@/types'

interface AuthContextValue {
  user: AppUser | null
  loading: boolean
  isAdmin: boolean
  isCashier: boolean
  isCustomer: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((u) => {
      setUser(u)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const value: AuthContextValue = {
    user,
    loading,
    isAdmin: user?.role === 'admin',
    isCashier: user?.role === 'cashier' || user?.role === 'admin',
    isCustomer: user?.role === 'customer',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
