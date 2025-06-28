import { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, LinkIcon, SendHorizonal } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Customer } from '@/utils/data';

interface CollectPaymentSectionProps {
  customer: Customer;
  isVisible?: boolean;
}
type TransactionResponse = any;

export default function CollectPaymentSection({
  customer,
  isVisible,
}: CollectPaymentSectionProps) {
  const [paymentAmount, setPaymentAmount] = useState('');
  const [discount, setDiscount] = useState('');
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [comment, setComment] = useState('');
  const [recordTime, setRecordTime] = useState(
    new Date().toISOString().slice(0, 16)
  );

  const { mutate, isLoading } = useMutation<TransactionResponse, AxiosError>({
    mutationFn: async () => {
      const payload = {
        customerId: customer.id,
        paymentAmount: Number(paymentAmount),
        discount: Number(discount),
        paymentMode,
        comment,
        recordedAt: new Date(recordTime).toISOString(),
      };
      const res = await axios.post('/api/transactions', payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Payment recorded successfully');
      setPaymentAmount('');
      setDiscount('');
      setPaymentMode('CASH');
      setComment('');
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Something went wrong');
    },
  });

  const handleRecord = () => {
    if (!paymentAmount) {
      toast.warning('Please enter payment amount');
      return;
    }
    mutate();
  };

  const newBalance = customer.balance - (parseInt(paymentAmount) || 0);

  return (
    <Card className="w-full">
      <CardHeader className="bg-blue-50 dark:bg-blue-900/20 flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0 py-3 px-4">
        <CardTitle className="text-base font-semibold">
          Collect Payment
        </CardTitle>
        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            className="bg-teal-500 hover:bg-teal-600 text-white px-3 py-1.5"
            onClick={() => toast.info('Coming soon')}
          >
            <MapPin className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only">Customer Location</span>
          </Button>
          <Button
            size="sm"
            className="bg-teal-500 hover:bg-teal-600 text-white px-3 py-1.5"
            onClick={() => toast.info('Coming soon')}
          >
            <LinkIcon className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only">Advance Payment Link</span>
          </Button>
          <Button
            size="sm"
            className="bg-teal-500 hover:bg-teal-600 text-white px-3 py-1.5"
            onClick={() => toast.info('Coming soon')}
          >
            <SendHorizonal className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only">
              Share Reminder Message
            </span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN: Info cards */}
          <div className="flex flex-col sm:flex-row lg:flex-col flex-wrap gap-4">
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg shadow-sm flex-1 min-w-[150px]">
              <Label className="text-sm text-muted-foreground">
                Balance Amount
              </Label>
              <div className="text-xl font-bold">₹{customer.balance}</div>
              <p className="text-xs text-muted-foreground mt-1">Till Date</p>
            </div>
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg shadow-sm flex-1 min-w-[150px]">
              <Label className="text-sm text-muted-foreground">
                Last Bill Amount
              </Label>
              <div className="text-xl font-bold">₹{customer.balance}</div>
            </div>
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg shadow-sm flex-1 min-w-[150px]">
              <Label className="text-sm text-muted-foreground">
                Last Payment
              </Label>
              <div className="text-xl font-bold">₹{customer.lastPayment}</div>
              <p className="text-xs text-muted-foreground mt-1">
                on {customer.lastPaymentDate}
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: Form */}
          <div className="lg:col-span-2 flex flex-col space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Paid Amount</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
              </div>
              <div>
                <Label>Discount</Label>
                <Input
                  placeholder="Discount"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Mode</Label>
                <Select value={paymentMode} onValueChange={setPaymentMode}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">CASH</SelectItem>
                    <SelectItem value="ONLINE">ONLINE</SelectItem>
                    <SelectItem value="CARD">CARD</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Record Time</Label>
                <Input
                  type="datetime-local"
                  value={recordTime}
                  onChange={(e) => setRecordTime(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label>Comment</Label>
              <Textarea
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg flex flex-col md:flex-row justify-between gap-4 text-sm">
              <div className="flex items-center justify-between md:justify-start gap-2">
                <span>Total Payment:</span>
                <span className="font-bold bg-slate-700 text-white px-3 py-1 rounded">
                  ₹ {paymentAmount || 0}
                </span>
              </div>
              <div className="flex items-center justify-between md:justify-start gap-2">
                <span>New Balance:</span>
                <span
                  className={`font-bold px-3 py-1 rounded ${
                    newBalance >= 0
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}
                >
                  ₹ {newBalance}
                </span>
              </div>
            </div>

            <Button
              onClick={handleRecord}
              disabled={isLoading}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white"
            >
              {isLoading ? 'Recording...' : 'Record'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
