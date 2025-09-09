import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-toastify';
import type { Customer as CustomerData } from '@/utils/data';
import apiClient from '@/utils/apiClient';

interface AdjustBalanceSectionProps {
  customer: CustomerData;
  isVisible: boolean;
  onRefresh?: () => void;
}

function AdjustBalanceSection({
  customer,
  isVisible,
  onRefresh,
}: AdjustBalanceSectionProps) {
  const [newBalance, setNewBalance] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const handleAdjust = async () => {
    if (!newBalance) return;

    try {
      setLoading(true);

      const currentBalance = customer.balanceAmount;
      const targetBalance = parseFloat(newBalance);

      // Compute amount difference
      const amount = Math.abs(targetBalance - currentBalance);
      const type = targetBalance > currentBalance ? 'credit' : 'debit';

      await apiClient.post(`/customers/${customer._id}/adjust-balance`, {
        amount,
        type,
        note: reason,
      });

      // toast({
      //   title: 'Success',
      //   description: 'Balance adjusted successfully.',
      //   variant: 'default',
      // });
      toast.success('Balance adjusted successfully.');
      // 🔄 Refresh parent data
      onRefresh();

      setNewBalance('');
      setReason('');
    } catch (error: any) {
      console.error('Error adjusting balance:', error);
      toast.error(
        error?.response?.data?.message || 'Failed to adjust balance.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <Card className="w-80">
      <CardHeader className="bg-orange-50 dark:bg-orange-900/20">
        <CardTitle className="text-lg">Adjust Balance</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
          <div className="text-sm text-gray-600">Current Balance</div>
          <div className="text-2xl font-bold">₹{customer.balanceAmount}</div>
        </div>

        <div className="space-y-2">
          <Label>New Balance</Label>
          <Input
            type="number"
            placeholder="Enter new balance"
            value={newBalance}
            onChange={(e) => setNewBalance(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label>Reason</Label>
          <Textarea
            placeholder="Reason for balance adjustment..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            disabled={loading}
          />
        </div>

        <Button
          onClick={handleAdjust}
          disabled={loading}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white"
        >
          {loading ? 'Adjusting...' : 'Adjust Balance'}
        </Button>
      </CardContent>
    </Card>
  );
}

export default AdjustBalanceSection;
