import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingCart, Package, ReceiptText, BarChart3, Bell, Users, LogOut } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { authService } from '@/services'
import { Card } from '@/components/ui'
import toast from 'react-hot-toast'

interface QuickAction {
  icon: React.ElementType
  label: string
  description: string
  to: string
  color: string
}

export function DashboardPage() {
  const { user, isAdmin, isCustomer } = useAuth()
  const navigate = useNavigate()

  const actions: QuickAction[] = [
    ...(!isCustomer ? [
      { icon: ShoppingCart, label: 'New Bill', description: 'Create a billing session', to: '/billing', color: 'bg-green-50 text-green-700' },
      { icon: Package, label: 'Products', description: 'Manage catalog', to: '/products', color: 'bg-blue-50 text-blue-700' },
    ] : []),
    { icon: ReceiptText, label: 'My Bills', description: 'View bill history', to: '/bills', color: 'bg-purple-50 text-purple-700' },
    ...(isAdmin ? [
      { icon: BarChart3, label: 'Reports', description: 'Sales & revenue', to: '/reports', color: 'bg-orange-50 text-orange-700' },
      { icon: Bell, label: 'Approvals', description: 'Pending payments', to: '/payments/pending', color: 'bg-yellow-50 text-yellow-700' },
      { icon: Users, label: 'Users', description: 'Manage team & roles', to: '/users', color: 'bg-pink-50 text-pink-700' },
    ] : []),
  ]

  const handleSignOut = async () => {
    const result = await authService.signOut()
    if (result.success) navigate('/login', { replace: true })
    else toast.error(result.error)
  }

  return (
    <div className="px-4 py-5">
      {/* Greeting */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-ink-muted text-sm">Good day,</p>
          <h2 className="text-xl font-bold text-ink">{user?.displayName?.split(' ')[0]} 👋</h2>
        </div>
        <button onClick={handleSignOut} className="p-2 rounded-xl text-ink-muted hover:bg-surface-muted">
          <LogOut size={18} />
        </button>
      </div>

      {/* Quick actions grid */}
      <div className="grid grid-cols-2 gap-3">
        {actions.map(({ icon: Icon, label, description, to, color }) => (
          <Card key={to} onClick={() => navigate(to)} className="flex flex-col gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
              <Icon size={20} />
            </div>
            <div>
              <p className="font-semibold text-ink text-sm">{label}</p>
              <p className="text-xs text-ink-muted">{description}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
