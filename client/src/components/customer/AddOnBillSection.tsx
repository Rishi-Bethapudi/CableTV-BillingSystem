import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import apiClient from '@/utils/apiClient';
import type { Customer as CustomerData } from '@/utils/data';

interface AddOnBillSectionProps {
  customer: CustomerData;
  isVisible?: boolean;
  onRefresh: () => void;
}

export default function AddOnBillSection({
  customer,
  isVisible = true,
  onRefresh,
}: AddOnBillSectionProps) {
  const [item, setItem] = useState('');
  const [price, setPrice] = useState('');

  // Mutation to add addon
  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (!item || !price) {
        throw new Error('Item description and price are required');
      }
      const payload = {
        productId: item,
        note: `Added: ₹${price}`,
      };
      const res = await apiClient.post(
        `/customers/${customer._id}/add-on`,
        payload
      );
      return res.data;
    },
    onSuccess: () => {
      toast.success('Item added to bill successfully');
      setItem('');
      setPrice('');
      onRefresh(); // refresh customer data
    },
    onError: (err: any) => {
      console.error('Add-on error:', err);
      toast.error(
        err?.response?.data?.message || err.message || 'Something went wrong'
      );
    },
  });

  if (!isVisible) return null;

  const newBalance = customer.balanceAmount + (parseInt(price) || 0);

  return (
    <Card className="w-80">
      <CardHeader className="bg-yellow-50 dark:bg-yellow-900/20">
        <CardTitle className="text-lg">Add On Bill</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
          <div className="text-sm text-gray-600">Current Balance</div>
          <div className="text-2xl font-bold">₹{customer.balanceAmount}</div>
        </div>

        <div className="space-y-2">
          <Label>Item/Product ID</Label>
          <Input
            placeholder="Enter product ID"
            value={item}
            onChange={(e) => setItem(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Price</Label>
          <Input
            type="number"
            placeholder="Enter price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>

        <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
          <div className="flex justify-between items-center">
            <span>New Balance:</span>
            <span className="font-bold">₹{newBalance}</span>
          </div>
        </div>

        <Button
          onClick={() => mutate()}
          disabled={isPending}
          className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
        >
          {isPending ? 'Adding...' : 'Add to Bill'}
        </Button>
      </CardContent>
    </Card>
  );
}
