import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface CustomerData {
  balance: number;
}

interface AdjustBalanceSectionProps {
  customer: CustomerData;
  isVisible: boolean;
}

function AdjustBalanceSection({
  customer,
  isVisible,
}: AdjustBalanceSectionProps) {
  const [newBalance, setNewBalance] = useState('');
  const [reason, setReason] = useState('');

  const handleAdjust = () => {
    console.log('Adjusting balance:', { newBalance, reason });
    setNewBalance('');
    setReason('');
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
          <div className="text-2xl font-bold">₹{customer.balance}</div>
        </div>

        <div className="space-y-2">
          <Label>New Balance</Label>
          <Input
            type="number"
            placeholder="Enter new balance"
            value={newBalance}
            onChange={(e) => setNewBalance(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Reason</Label>
          <Textarea
            placeholder="Reason for balance adjustment..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
          />
        </div>

        <Button
          onClick={handleAdjust}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white"
        >
          Adjust Balance
        </Button>
      </CardContent>
    </Card>
  );
}

export default AdjustBalanceSection;
