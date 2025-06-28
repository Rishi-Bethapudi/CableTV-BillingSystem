import { useState } from 'react';
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

interface AdditionalChargeSectionProps {
  isVisible: boolean;
}

function AdditionalChargeSection({ isVisible }: AdditionalChargeSectionProps) {
  const [type, setType] = useState('charge');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    console.log('Adding charge/discount:', { type, amount, description });
    setAmount('');
    setDescription('');
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
          <Select value={type} onValueChange={setType}>
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
          className={`w-full ${
            type === 'charge'
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-green-600 hover:bg-green-700'
          } text-white`}
        >
          Apply {type === 'charge' ? 'Charge' : 'Discount'}
        </Button>
      </CardContent>
    </Card>
  );
}

export default AdditionalChargeSection;
