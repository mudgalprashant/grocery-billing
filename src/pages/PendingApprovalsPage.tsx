import { useEffect } from 'react';
import { Bell, CheckCircle, XCircle } from 'lucide-react';
import { usePayments } from '@/hooks';
import { useAuth } from '@/context/AuthContext';
import { Card, Badge, EmptyState, Spinner } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate, formatDateTime } from '@/utils/formatters';
import toast from 'react-hot-toast';

export function PendingApprovalsPage() {
  const { user } = useAuth();
  const { storeId } = useAuth();
  const { payments, loading, loadPending, approve, reject } =
    usePayments(storeId);

  useEffect(() => {
    loadPending();
  }, [loadPending]);

  const handleApprove = async (id: string) => {
    const result = await approve(id, user!.uid);
    if (result.success) toast.success('Payment approved');
    else toast.error(result.error);
  };

  const handleReject = async (id: string) => {
    if (!confirm('Reject this payment?')) return;
    const result = await reject(id);
    if (result.success) toast.success('Payment rejected');
    else toast.error(result.error);
  };

  return (
    <div className="px-4 py-5">
      <h2 className="text-lg font-bold text-ink mb-1">Pending Approvals</h2>
      <p className="text-sm text-ink-muted mb-4">
        Customer-submitted payments awaiting your review
      </p>

      {loading && (
        <div className="flex justify-center py-10">
          <Spinner className="w-8 h-8" />
        </div>
      )}

      {!loading && (!payments || payments.length === 0) && (
        <EmptyState
          icon={<Bell size={40} />}
          title="All clear!"
          description="No pending payment approvals"
        />
      )}

      <div className="flex flex-col gap-3">
        {payments?.map((payment) => (
          <Card key={payment.id}>
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-semibold text-ink">{payment.billNumber}</p>
                <p className="text-xs text-ink-muted">
                  by {payment.registeredByUserName}
                </p>
                <p className="text-xs text-ink-faint">
                  {formatDateTime(payment.createdAt)}
                </p>
              </div>
              <Badge variant="yellow">Pending</Badge>
            </div>

            <div className="bg-surface-muted rounded-xl p-3 mb-3 flex flex-col gap-1 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-muted">Amount</span>
                <span className="font-bold text-ink">
                  {formatCurrency(payment.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Mode</span>
                <span className="capitalize">{payment.mode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Date</span>
                <span>{formatDate(payment.paymentDate)}</span>
              </div>
              {payment.notes && (
                <div className="flex justify-between">
                  <span className="text-ink-muted">Notes</span>
                  <span className="text-right max-w-[60%]">
                    {payment.notes}
                  </span>
                </div>
              )}
            </div>

            {payment.receiptImageUrl && (
              <a
                href={payment.receiptImageUrl}
                target="_blank"
                rel="noreferrer"
                className="block mb-3"
              >
                <img
                  src={payment.receiptImageUrl}
                  alt="Receipt"
                  className="w-full h-32 object-cover rounded-xl"
                />
                <p className="text-xs text-primary-600 mt-1 text-center">
                  Tap to view full image
                </p>
              </a>
            )}

            <div className="flex gap-2">
              <Button
                variant="danger"
                size="sm"
                className="flex-1"
                onClick={() => handleReject(payment.id)}
              >
                <XCircle size={16} /> Reject
              </Button>
              <Button
                size="sm"
                className="flex-1"
                onClick={() => handleApprove(payment.id)}
              >
                <CheckCircle size={16} /> Approve
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
