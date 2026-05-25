import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/context/AuthContext'
import { CartProvider } from '@/context/CartContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AppShell } from '@/components/layout/AppShell'
import { UpdateBanner } from '@/components/layout/UpdateBanner'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { ProductsPage } from '@/pages/ProductsPage'
import { BillingPage } from '@/pages/BillingPage'
import { BillsPage } from '@/pages/BillsPage'
import { ReportsPage } from '@/pages/ReportsPage'
import { PendingApprovalsPage } from '@/pages/PendingApprovalsPage'
import { UsersPage } from '@/pages/UsersPage'

/**
 * App — composes providers and routes.
 * Single Responsibility: routing and layout only.
 *
 * Route access matrix:
 * /login           → public
 * /dashboard       → all authenticated
 * /billing         → admin, cashier
 * /products        → all authenticated (admin can edit)
 * /bills           → all authenticated
 * /reports         → admin only
 * /payments/pending → admin only
 * /users           → admin only
 */
function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected — all roles */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppShell><DashboardPage /></AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/bills"
        element={
          <ProtectedRoute>
            <AppShell><BillsPage /></AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <AppShell><ProductsPage /></AppShell>
          </ProtectedRoute>
        }
      />

      {/* Protected — cashier + admin */}
      <Route
        path="/billing"
        element={
          <ProtectedRoute allowedRoles={['admin', 'cashier']}>
            <AppShell><BillingPage /></AppShell>
          </ProtectedRoute>
        }
      />

      {/* Protected — admin only */}
      <Route
        path="/reports"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AppShell><ReportsPage /></AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/payments/pending"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AppShell><PendingApprovalsPage /></AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AppShell><UsersPage /></AppShell>
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter basename="/grocery-billing">
      <AuthProvider>
        <CartProvider>
          <UpdateBanner />
          <AppRoutes />
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                borderRadius: '12px',
                fontSize: '14px',
                fontFamily: 'DM Sans, sans-serif',
              },
            }}
          />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
