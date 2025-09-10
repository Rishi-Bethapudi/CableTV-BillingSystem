import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import apiClient from '@/utils/apiClient'; // axios instance
import type { Customer } from '@/utils/data';
interface AdditionalChargeSectionProps {
  isVisible: boolean;
  customer: Customer;
  onRefresh?: () => void; // optional callback to refresh customer data
}

function AdditionalChargeSection({
  isVisible,
  customer,
  onRefresh,
}: AdditionalChargeSectionProps) {
  const [type, setType] = useState<'charge' | 'discount'>('charge');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const { mutateAsync, isPending } = useMutation<
    any,
    Error,
    { amount: number; note: string }
  >(async (payload) => {
    if (!payload.amount || payload.amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    const res = await apiClient.post(
      `/customers/${customer._id}/additionalCharge`,
      payload
    );
    return res.data;
  });

  const handleSubmit = async () => {
    try {
      await mutateAsync({ amount: Number(amount), note: description });
      toast.success('Additional charge applied successfully');
      setAmount('');
      setDescription('');
      if (onRefresh) onRefresh();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err.message || 'Something went wrong'
      );
    }
  };

  if (!isVisible) return null;

  return (
    <Card className="w-80">
      <CardHeader className="bg-indigo-50 dark:bg-indigo-900/20">
        <CardTitle className="text-lg">Additional Charge</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="space-y-2">
          <Label>Type</Label>
          <Select
            value={type}
            onValueChange={(val) => setType(val as 'charge' | 'discount')}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="charge">Additional Charge</SelectItem>
              <SelectItem value="discount">Discount</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Amount</Label>
          <Input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            placeholder="Enter description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isPending}
          className={`w-full ${
            type === 'charge'
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-green-600 hover:bg-green-700'
          } text-white`}
        >
          {isPending
            ? 'Applying...'
            : `Apply ${type === 'charge' ? 'Charge' : 'Discount'}`}
        </Button>
      </CardContent>
    </Card>
  );
}

export default AdditionalChargeSection;
