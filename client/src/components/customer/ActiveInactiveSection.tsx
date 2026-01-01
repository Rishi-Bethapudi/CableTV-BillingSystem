import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import apiClient from '@/utils/apiClient';
import type { Customer as CustomerData } from '@/utils/data';
import ConfirmationModal from '@/components/customer/ConfirmationModal';

interface ActiveInactiveSectionProps {
  customer: CustomerData;
  isVisible?: boolean;
  onRefresh: () => void;
}

export default function ActiveInactiveSection({
  customer,
  isVisible = true,
  onRefresh,
}: ActiveInactiveSectionProps) {
  const [isActive, setIsActive] = useState(customer.active || false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: async (newStatus: boolean) => {
      const payload = { active: newStatus };
      const res = await apiClient.put(`/customers/${customer._id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success(
        `Customer ${isActive ? 'deactivated' : 'activated'} successfully`
      );
      onRefresh();
    },
    onError: (err: any) => {
      console.error('Status update error:', err);
      toast.error(
        err?.response?.data?.message || err.message || 'Failed to update status'
      );
    },
  });

  const toggleStatus = () => {
    mutate(!isActive);
    setIsActive(!isActive); // optimistic UI
  };

  const openConfirm = () => setConfirmOpen(true);

  if (!isVisible) return null;

  return (
    <>
      <Card className="w-80">
        <CardHeader className="bg-red-50 dark:bg-red-900/20">
          <CardTitle className="text-lg">Customer Status</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {/* Toggle Row */}
          <div className="flex items-center justify-between">
            <Label htmlFor="status-toggle">Customer Active</Label>
            <Switch
              id="status-toggle"
              checked={isActive}
              onCheckedChange={openConfirm} // OPEN CONFIRM MODAL
              disabled={isPending}
            />
          </div>

          {/* Status Text */}
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Current Status</div>
            <div
              className={`text-lg font-bold ${
                isActive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {isActive ? 'Active' : 'Inactive'}
            </div>
          </div>

          {/* Action Button */}
          <Button
            onClick={openConfirm}
            disabled={isPending}
            className={`w-full ${
              isActive
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-green-600 hover:bg-green-700'
            } text-white`}
          >
            {isPending ? 'Updating…' : isActive ? 'Deactivate' : 'Activate'}{' '}
            Customer
          </Button>
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      <ConfirmationModal
        open={confirmOpen}
        title="Confirm Status Change"
        message={`Are you sure you want to ${
          isActive ? 'deactivate' : 'activate'
        } this customer?`}
        onConfirm={() => {
          setConfirmOpen(false);
          toggleStatus();
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
