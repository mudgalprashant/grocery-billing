import { Store } from 'lucide-react';
import { authService } from '@/services';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

/**
 * Shown when a cashier or store manager has been assigned a role
 * but not yet linked to a store by the admin.
 */
export function NoStorePage() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await authService.signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-surface-muted flex flex-col items-center justify-center px-6 text-center">
      <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Store size={28} className="text-yellow-600" />
      </div>
      <h2 className="text-xl font-bold text-ink mb-2">No store assigned</h2>
      <p className="text-ink-muted text-sm max-w-xs mb-6">
        Your account hasn't been linked to a store yet. Please ask your admin to
        assign you to a store.
      </p>
      <Button variant="secondary" onClick={handleSignOut}>
        Sign out
      </Button>
    </div>
  );
}
