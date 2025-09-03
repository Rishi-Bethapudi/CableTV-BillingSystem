import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, LinkIcon, SendHorizonal, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import apiClient from '@/utils/apiClient';
import { Customer } from '@/utils/data';

interface CollectPaymentSectionProps {
  customer: Customer;
  isVisible?: boolean;
}
type TransactionResponse = any;

export default function CollectPaymentSection({
  customer,
}: CollectPaymentSectionProps) {
  const [paymentAmount, setPaymentAmount] = useState('');
  const [discount, setDiscount] = useState('');
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [comment, setComment] = useState('');
  const [recordTime, setRecordTime] = useState(
    new Date().toISOString().slice(0, 16)
  );

  // state for modal
  const [historyType, setHistoryType] = useState<string | null>(null);

  const { mutate, isLoading } = useMutation<TransactionResponse, Error>({
    mutationFn: async () => {
      const payload = {
        customerId: customer._id,
        paymentAmount: Number(paymentAmount),
        discount: Number(discount),
        paymentMode,
        comment,
        recordedAt: new Date(recordTime).toISOString(),
      };
      const res = await apiClient.post('/transactions', payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Payment recorded successfully');
      setPaymentAmount('');
      setDiscount('');
      setPaymentMode('CASH');
      setComment('');
    },
    onError: (err: any) => {
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

  const newBalance =
    customer.balanceAmount -
    (Number(paymentAmount) || 0) -
    (Number(discount) || 0);

  // Dummy history data (replace with API later)
  const historyData = {
    balance: [
      { date: '2025-09-01', action: 'Added Recharge', amount: 400 },
      { date: '2025-08-15', action: 'Collected Payment', amount: -200 },
    ],
    bill: [
      { date: '2025-08-01', action: 'Monthly Bill', amount: 250 },
      { date: '2025-07-01', action: 'Monthly Bill', amount: 250 },
    ],
    payment: [
      { date: '2025-08-10', action: 'Cash Payment', amount: 200 },
      { date: '2025-07-12', action: 'UPI Payment', amount: 250 },
    ],
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader className="bg-blue-50 dark:bg-blue-900/20 flex flex-col md:flex-row md:items-center md:justify-between py-3 px-4">
          <CardTitle className="text-base font-semibold">
            Collect Payment
          </CardTitle>
          <div className="flex gap-2 flex-wrap">
            {[
              { icon: MapPin, label: 'Customer Location' },
              { icon: LinkIcon, label: 'Advance Payment Link' },
              { icon: SendHorizonal, label: 'Share Reminder Message' },
            ].map(({ icon: Icon, label }) => (
              <Button
                key={label}
                size="sm"
                className="bg-teal-500 hover:bg-teal-600 text-white px-3 py-1.5 flex items-center gap-1"
                onClick={() => toast.info('Coming soon')}
              >
                <Icon className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only">{label}</span>
              </Button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Info cards (clickable) */}
            <div className="flex flex-col sm:flex-row lg:flex-col flex-wrap gap-4">
              {[
                {
                  key: 'balance',
                  label: 'Balance Amount',
                  value: `₹${customer.balanceAmount}`,
                  sub: 'Till Date',
                },
                {
                  key: 'bill',
                  label: 'Last Bill Amount',
                  value: `₹${customer.balanceAmount}`,
                },
                {
                  key: 'payment',
                  label: 'Last Payment',
                  value: `₹${customer.lastPaymentAmount}`,
                  sub: `on ${customer.lastPaymentDate}`,
                },
              ].map(({ key, label, value, sub }) => (
                <div
                  key={key}
                  onClick={() => setHistoryType(key)}
                  className="cursor-pointer bg-slate-100 dark:bg-slate-800 p-4 rounded-lg shadow-sm flex-1 min-w-[150px] min-h-[100px] flex flex-col justify-center hover:ring-2 hover:ring-blue-500 transition"
                >
                  <Label className="text-sm text-muted-foreground">
                    {label}
                  </Label>
                  <div className="text-xl font-bold">{value}</div>
                  {sub && (
                    <p className="text-xs text-muted-foreground mt-1">{sub}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Form */}
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
                <div className="flex items-center gap-2">
                  <span>Total Payment:</span>
                  <span className="font-bold bg-slate-700 text-white px-3 py-1 rounded">
                    ₹ {paymentAmount || 0}
                  </span>
                </div>
                <div className="flex items-center gap-2">
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
                className="w-full bg-slate-800 hover:bg-slate-900 text-white flex items-center justify-center gap-2"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isLoading ? 'Recording...' : 'Record'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History Modal */}
      <Dialog open={!!historyType} onOpenChange={() => setHistoryType(null)}>
        <DialogContent className="max-w-lg w-full">
          <DialogHeader>
            <DialogTitle>
              {historyType === 'balance'
                ? 'Balance History'
                : historyType === 'bill'
                ? 'Bill History'
                : 'Payment History'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {historyType &&
              historyData[historyType as keyof typeof historyData].map(
                (item, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center border-b pb-2 text-sm"
                  >
                    <div>
                      <p className="font-medium">{item.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.date}
                      </p>
                    </div>
                    <span
                      className={`font-bold ${
                        item.amount >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {item.amount >= 0 ? '+' : ''}₹{item.amount}
                    </span>
                  </div>
                )
              )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
