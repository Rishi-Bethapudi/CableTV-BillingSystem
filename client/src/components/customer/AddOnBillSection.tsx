import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CustomerData {
  balance: number;
}

interface AddOnBillSectionProps {
  customer: CustomerData;
  isVisible: boolean;
}

function AddOnBillSection({ customer, isVisible }: AddOnBillSectionProps) {
  const [item, setItem] = useState('');
  const [price, setPrice] = useState('');

  const handleAddToBill = () => {
    console.log('Adding to bill:', { item, price });
    setItem('');
    setPrice('');
  };

  if (!isVisible) return null;

  return (
    <Card className="w-80">
      <CardHeader className="bg-yellow-50 dark:bg-yellow-900/20">
        <CardTitle className="text-lg">Add On Bill</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
          <div className="text-sm text-gray-600">Current Balance</div>
          <div className="text-2xl font-bold">₹{customer.balance}</div>
        </div>

        <div className="space-y-2">
          <Label>Item Description</Label>
          <Input
            placeholder="Enter item description"
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
            <span className="font-bold">
              ₹{customer.balance + (parseInt(price) || 0)}
            </span>
          </div>
        </div>

        <Button
          onClick={handleAddToBill}
          className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
        >
          Add to Bill
        </Button>
      </CardContent>
    </Card>
  );
}

export default AddOnBillSection;
