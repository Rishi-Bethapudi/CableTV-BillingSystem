// File: components/customer/CustomerHeader.tsx
import { ArrowLeft, Trash } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';

interface Props {
  customer: {
    id: number;
    name: string;
    status: string;
  };
}

export default function CustomerHeader({ customer }: Props) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'expired':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    }
  };

  const deleteCustomer = useMutation({
    mutationFn: async () => {
      await axios.delete(`/api/customers/${customer.id}`);
    },
    onSuccess: () => {
      toast.success('Customer deleted successfully');
      window.location.href = '/customers';
    },
    onError: () => {
      toast.error('Failed to delete customer');
    },
  });

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this customer?')) {
      deleteCustomer.mutate();
    }
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <Link to="/customers">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
        </Link>
      </div>
      <div className="flex-1 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white">
          {customer.name}
        </h1>
      </div>
      <div className="flex items-center gap-2 justify-end">
        <Badge className={getStatusColor(customer.status)}>
          {customer.status}
        </Badge>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          //   disabled={deleteCustomer.isLoading}
        >
          <Trash className="h-4 w-4 mr-2" /> Delete
        </Button>
      </div>
    </div>
  );
}
