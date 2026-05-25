import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { ShoppingCart, Package, ReceiptText, BarChart3, Users, Bell } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'

interface AppShellProps { children: ReactNode }

export function AppShell({ children }: AppShellProps) {
  const { user, isAdmin, isCustomer } = useAuth()
  const { itemCount } = useCart()

  const navItems = [
    ...(isCustomer ? [] : [
      { to: '/billing', icon: ShoppingCart, label: 'Billing', badge: itemCount > 0 ? itemCount : null },
      { to: '/products', icon: Package, label: 'Products' },
    ]),
    { to: '/bills', icon: ReceiptText, label: 'Bills' },
    ...(isAdmin ? [
      { to: '/reports', icon: BarChart3, label: 'Reports' },
      { to: '/payments/pending', icon: Bell, label: 'Approvals' },
      { to: '/users', icon: Users, label: 'Users' },
    ] : []),
  ]

  return (
    <div className="min-h-screen bg-surface-muted flex flex-col max-w-md mx-auto">
      {/* Top bar */}
      <header className="bg-white border-b border-surface-border px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="font-semibold text-ink text-base leading-tight">Grocery Billing</h1>
          <p className="text-xs text-ink-muted capitalize">{user?.role} · {user?.displayName}</p>
        </div>
        <img
          src={user?.photoURL ?? undefined}
          alt={user?.displayName}
          className="w-8 h-8 rounded-full bg-surface-border"
        />
      </header>

      {/* Page content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-surface-border z-10">
        <div className="flex">
          {navItems.map(({ to, icon: Icon, label, badge }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs transition-colors relative
                ${isActive ? 'text-primary-600' : 'text-ink-muted'}`
              }
            >
              <div className="relative">
                <Icon size={20} strokeWidth={1.75} />
                {badge != null && (
                  <span className="absolute -top-1.5 -right-1.5 bg-danger text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {badge}
                  </span>
                )}
              </div>
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
