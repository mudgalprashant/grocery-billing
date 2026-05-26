import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import {
  ShoppingCart,
  Package,
  ReceiptText,
  BarChart3,
  Users,
  Bell,
  Store,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { user, isAdmin, isStore, isCustomer } = useAuth();
  const { itemCount } = useCart();

  const navItems = [
    // Billing — cashiers, store managers, admins
    ...(!isCustomer
      ? [
          {
            to: '/billing',
            icon: ShoppingCart,
            label: 'Billing',
            badge: itemCount > 0 ? itemCount : null,
          },
          { to: '/products', icon: Package, label: 'Products' },
        ]
      : []),
    { to: '/bills', icon: ReceiptText, label: 'Bills' },
    // Reports + approvals — store managers and admins
    ...(isAdmin || isStore
      ? [
          { to: '/reports', icon: BarChart3, label: 'Reports' },
          { to: '/payments/pending', icon: Bell, label: 'Approvals' },
        ]
      : []),
    // Users + Stores — admin only
    ...(isAdmin
      ? [
          { to: '/stores', icon: Store, label: 'Stores' },
          { to: '/users', icon: Users, label: 'Users' },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-surface-muted flex flex-col max-w-md mx-auto">
      <header className="bg-white border-b border-surface-border px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="font-semibold text-ink text-base leading-tight">
            Grocery Billing
          </h1>
          <p className="text-xs text-ink-muted capitalize">
            {user?.role === 'store' ? 'Store Manager' : user?.role} ·{' '}
            {user?.displayName}
          </p>
        </div>
        {user?.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName}
            className="w-8 h-8 rounded-full bg-surface-border"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-bold">
            {user?.displayName?.charAt(0).toUpperCase()}
          </div>
        )}
      </header>

      <main className="flex-1 overflow-y-auto pb-20">{children}</main>

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
  );
}
