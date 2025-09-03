import { useState } from 'react';
import { ArrowLeft, Trash } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';
import ConfirmationModal from './ConfirmationModal';

interface Customer {
  id: string | number;
  name: string;
  active: boolean;
  expiryDate?: string;
}

interface Props {
  customer: Customer;
}

export default function CustomerHeader({ customer }: Props) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showToggleModal, setShowToggleModal] = useState(false);

  const getStatusColor = (active: boolean) =>
    active
      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';

  // Delete mutation
  const deleteCustomer = useMutation({
    mutationFn: async () => await axios.delete(`/api/customers/${customer.id}`),
    onSuccess: () => {
      toast.success('Customer deleted successfully');
      window.location.href = '/customers';
    },
    onError: () => toast.error('Failed to delete customer'),
  });

  // Toggle active mutation
  const toggleActive = useMutation({
    mutationFn: async () => {
      const newStatus = !customer.active;
      await axios.patch(`/api/customers/${customer.id}/toggle-active`, {
        active: newStatus,
      });
      return newStatus;
    },
    onSuccess: (newStatus) => {
      toast.success(`Customer marked as ${newStatus ? 'Active' : 'Inactive'}`);
      window.location.reload();
    },
    onError: () => toast.error('Failed to update customer status'),
  });

  const formatExpiryDate = (date?: string) =>
    date
      ? new Date(date).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : 'N/A';

  const isExpired = () =>
    customer.expiryDate ? new Date(customer.expiryDate) < new Date() : false;

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Back */}
        <div className="flex items-center gap-2">
          <Link to="/customers">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
          </Link>
        </div>

        {/* Name */}
        <div className="flex-1 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white">
            {customer.name}
          </h1>
        </div>

        {/* Expiry → Active → Delete */}
        <div className="flex items-center gap-4 justify-end">
          {/* Expiry */}
          {customer.active && customer.expiryDate && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Expiry: {formatExpiryDate(customer.expiryDate)}
            </span>
          )}
          {!customer.active && customer.expiryDate && isExpired() && (
            <span className="text-sm font-medium text-red-600 dark:text-red-400">
              Expired on: {formatExpiryDate(customer.expiryDate)}
            </span>
          )}

          {/* Active Button */}
          <Button
            variant={customer.active ? 'outline' : 'secondary'}
            size="sm"
            onClick={() => setShowToggleModal(true)}
          >
            {customer.active ? 'Active' : 'Inactive'}
          </Button>

          {/* Delete Button */}
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash className="h-4 w-4 mr-2" /> Delete
          </Button>
        </div>
      </div>

      {/* Modals */}
      <ConfirmationModal
        open={showDeleteModal}
        message="Are you sure you want to delete this customer?"
        onConfirm={() => {
          deleteCustomer.mutate();
          setShowDeleteModal(false);
        }}
        onCancel={() => setShowDeleteModal(false)}
      />

      <ConfirmationModal
        open={showToggleModal}
        message={`Are you sure you want to ${
          customer.active ? 'mark as inactive' : 'mark as active'
        } this customer?`}
        onConfirm={() => {
          toggleActive.mutate();
          setShowToggleModal(false);
        }}
        onCancel={() => setShowToggleModal(false)}
      />
    </>
  );
}
