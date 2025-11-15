import { useState } from 'react';
import { ArrowLeft, Trash } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import apiClient from '@/utils/apiClient';
import ConfirmationModal from './ConfirmationModal';
import type { Customer } from '@/utils/data';

export default function CustomerHeader({ customer }: { customer: Customer }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showToggleModal, setShowToggleModal] = useState(false);

  const deleteCustomer = useMutation({
    mutationFn: () => apiClient.delete(`/customers/${customer._id}`),
    onSuccess: () => {
      toast.success('Customer deleted successfully');
      window.location.href = '/customers';
    },
    onError: () => toast.error('Failed to delete customer'),
  });

  const toggleActive = useMutation({
    mutationFn: () =>
      apiClient.patch(`/customers/${customer._id}/toggle-active`, {
        active: !customer.active,
      }),
    onSuccess: () => {
      toast.success(
        `Customer marked as ${customer.active ? 'Inactive' : 'Active'}`
      );
      window.location.reload();
    },
    onError: () => toast.error('Failed to update customer status'),
  });

  const expiryText = customer.earliestExpiry
    ? new Date(customer.earliestExpiry).toLocaleDateString('en-IN')
    : 'N/A';
  const isExpired =
    customer.earliestExpiry && new Date(customer.earliestExpiry) < new Date();
  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link to="/customers">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
        </Link>

        <div className="flex-1 flex justify-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white truncate max-w-full">
            {customer?.name}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {customer.earliestExpiry && (
            <span
              className={`text-sm font-medium ${
                isExpired ? 'text-red-600' : 'text-gray-700'
              }`}
            >
              {isExpired ? 'Expired: ' : 'Expiry: '} {expiryText}
            </span>
          )}

          <Button
            variant={customer.active ? 'outline' : 'secondary'}
            size="sm"
            onClick={() => setShowToggleModal(true)}
          >
            {customer.active ? 'Active' : 'Inactive'}
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash className="h-4 w-4 mr-2" /> Delete
          </Button>
        </div>
      </div>

      <ConfirmationModal
        open={showDeleteModal}
        message="Are you sure you want to delete this customer?"
        onConfirm={() => deleteCustomer.mutate()}
        onCancel={() => setShowDeleteModal(false)}
      />

      <ConfirmationModal
        open={showToggleModal}
        message={`Are you sure you want to set this customer as ${
          customer.active ? 'Inactive' : 'Active'
        }?`}
        onConfirm={() => toggleActive.mutate()}
        onCancel={() => setShowToggleModal(false)}
      />
    </>
  );
}
