import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import apiClient from '@/utils/apiClient';
import { toast } from 'sonner';

interface Props {
  customer: any;
  subscription: any;
}

const RemoveSubscription = ({ customer, subscription }: Props) => {
  const handleRemove = async () => {
    if (!confirm('Are you sure you want to remove this subscription?')) return;

    try {
      await apiClient.post('/subscriptions/remove', {
        customerId: customer._id,
        subscriptionId: subscription._id,
      });

      toast.success('Subscription removed successfully');
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || 'Failed to remove subscription',
      );
    }
  };

  return (
    <div className="border border-red-200 bg-red-50 rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-2 text-red-700">
        <AlertTriangle className="h-5 w-5" />
        <h4 className="font-semibold">Remove Subscription</h4>
      </div>

      <p className="text-sm text-red-700">
        This will stop the subscription immediately. Billing will NOT be
        reversed.
      </p>

      <div className="text-sm">
        <strong>Plan:</strong> {subscription.productId?.name}
      </div>

      <Button variant="destructive" onClick={handleRemove}>
        Remove Subscription
      </Button>
    </div>
  );
};

export default RemoveSubscription;
