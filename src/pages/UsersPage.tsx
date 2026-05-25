import { useEffect } from 'react'
import { Users } from 'lucide-react'
import { useUsers } from '@/hooks'
import { useAuth } from '@/context/AuthContext'
import { Card, Badge, EmptyState, Spinner } from '@/components/ui'
import { getInitials } from '@/utils/formatters'
import type { UserRole } from '@/types'
import toast from 'react-hot-toast'

const roleBadge: Record<UserRole, 'red' | 'blue' | 'gray'> = {
  admin: 'red',
  cashier: 'blue',
  customer: 'gray',
}

export function UsersPage() {
  const { user: currentUser } = useAuth()
  const { users, loading, load, updateRole, setActive } = useUsers()

  useEffect(() => { load() }, [load])

  const handleRoleChange = async (uid: string, role: UserRole) => {
    const result = await updateRole(uid, role)
    if (result.success) toast.success('Role updated')
    else toast.error(result.error)
  }

  const handleToggleActive = async (uid: string, isActive: boolean) => {
    const result = await setActive(uid, !isActive)
    if (result.success) toast.success(isActive ? 'User deactivated' : 'User activated')
    else toast.error(result.error)
  }

  return (
    <div className="px-4 py-5">
      <h2 className="text-lg font-bold text-ink mb-1">Users</h2>
      <p className="text-sm text-ink-muted mb-4">Manage team members and roles</p>

      {loading && <div className="flex justify-center py-10"><Spinner className="w-8 h-8" /></div>}

      {!loading && (!users || users.length === 0) && (
        <EmptyState icon={<Users size={40} />} title="No users yet" description="Users appear here after first sign-in" />
      )}

      <div className="flex flex-col gap-3">
        {users?.map(u => (
          <Card key={u.uid}>
            <div className="flex items-center gap-3 mb-3">
              {u.photoURL
                ? <img src={u.photoURL} alt={u.displayName} className="w-10 h-10 rounded-full" />
                : <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
                    {getInitials(u.displayName)}
                  </div>
              }
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-ink text-sm truncate">{u.displayName}</p>
                  {!u.isActive && <Badge variant="gray">Inactive</Badge>}
                </div>
                <p className="text-xs text-ink-muted truncate">{u.email}</p>
              </div>
              <Badge variant={roleBadge[u.role]}>{u.role}</Badge>
            </div>

            {u.uid !== currentUser?.uid && (
              <div className="flex gap-2">
                <select
                  value={u.role}
                  onChange={e => handleRoleChange(u.uid, e.target.value as UserRole)}
                  className="flex-1 px-3 py-2 rounded-xl border border-surface-border text-xs focus:outline-none"
                >
                  <option value="customer">Customer</option>
                  <option value="cashier">Cashier</option>
                  <option value="admin">Admin</option>
                </select>
                <button
                  onClick={() => handleToggleActive(u.uid, u.isActive)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border
                    ${u.isActive
                      ? 'border-danger text-danger hover:bg-red-50'
                      : 'border-primary-600 text-primary-600 hover:bg-primary-50'
                    }`}
                >
                  {u.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
