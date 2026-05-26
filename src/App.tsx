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
import { NoStorePage } from '@/pages/NoStorePage'
import { StoreManagementPage } from '@/pages/StoreManagementPage'

export default function App() {
  return (
    <BrowserRouter basename="/grocery-billing">
      <AuthProvider>
        <CartProvider>
          <UpdateBanner />
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/no-store" element={<NoStorePage />} />

            {/* All authenticated */}
            <Route path="/dashboard" element={
              <ProtectedRoute><AppShell><DashboardPage /></AppShell></ProtectedRoute>
            } />
            <Route path="/bills" element={
              <ProtectedRoute><AppShell><BillsPage /></AppShell></ProtectedRoute>
            } />
            <Route path="/products" element={
              <ProtectedRoute><AppShell><ProductsPage /></AppShell></ProtectedRoute>
            } />

            {/* Cashier + store + admin */}
            <Route path="/billing" element={
              <ProtectedRoute allowedRoles={['admin', 'store', 'cashier']}>
                <AppShell><BillingPage /></AppShell>
              </ProtectedRoute>
            } />

            {/* Store manager + admin */}
            <Route path="/reports" element={
              <ProtectedRoute allowedRoles={['admin', 'store']}>
                <AppShell><ReportsPage /></AppShell>
              </ProtectedRoute>
            } />
            <Route path="/payments/pending" element={
              <ProtectedRoute allowedRoles={['admin', 'store']}>
                <AppShell><PendingApprovalsPage /></AppShell>
              </ProtectedRoute>
            } />

            {/* Admin only */}
            <Route path='/stores' element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AppShell><StoreManagementPage /></AppShell>
              </ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AppShell><UsersPage /></AppShell>
              </ProtectedRoute>
            } />

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>

          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: { borderRadius: '12px', fontSize: '14px', fontFamily: 'DM Sans, sans-serif' },
            }}
          />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
