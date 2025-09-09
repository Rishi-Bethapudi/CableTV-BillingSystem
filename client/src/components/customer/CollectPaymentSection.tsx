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
import type { Customer } from '@/utils/data';

interface CollectPaymentSectionProps {
  customer: Customer;
  isVisible?: boolean;
  onRefresh: () => void;
}
type TransactionResponse = any;
interface CollectPaymentPayload {
  customerId: string;
  amount: number;
  discount: number;
  method: string;
  note: string;
  recordedAt: string;
}
export default function CollectPaymentSection({
  customer,
  onRefresh,
}: CollectPaymentSectionProps) {
  const [paymentAmount, setPaymentAmount] = useState('');
  const [discount, setDiscount] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [comment, setComment] = useState('');
  const [recordTime, setRecordTime] = useState(
    new Date().toISOString().slice(0, 16)
  );

  // state for modal
  const [historyType, setHistoryType] = useState<string | null>(null);

  const { mutate, isPending } = useMutation<
    TransactionResponse,
    Error,
    CollectPaymentPayload
  >({
    mutationFn: async (payload: CollectPaymentPayload) => {
      const res = await apiClient.post('/transactions/collection', payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Payment recorded successfully');
      setPaymentAmount('');
      setDiscount('');
      setPaymentMode('Cash');
      setComment('');
      if (onRefresh) onRefresh();
    },
    onError: (err: any) => {
      console.error('Transaction error:', err);
      toast.error(
        err?.response?.data?.message || err.message || 'Something went wrong'
      );
    },
  });

  const handleRecord = () => {
    if (!paymentAmount) {
      toast.warning('Please enter payment amount');
      return;
    }
    mutate({
      customerId: customer._id,
      amount: Number(paymentAmount) || 0,
      discount: Number(discount) || 0,
      method: paymentMode,
      note: comment,
      recordedAt: new Date(recordTime).toISOString(),
    });
  };

  const discountValue = Number(discount) || 0;
  const paymentValue = Number(paymentAmount) || 0;

  const newBalance = customer.balanceAmount - paymentValue - discountValue;

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
                  subtitle: customer.expiryDate
                    ? `Expiry: ${new Date(
                        customer.expiryDate
                      ).toLocaleDateString()}`
                    : 'No Expiry',
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
                  subtitle: customer.lastPaymentDate
                    ? `Collected on ${new Date(
                        customer.lastPaymentDate
                      ).toLocaleDateString()}`
                    : 'No Payment Recorded',
                },
              ].map(({ key, label, value, subtitle }) => (
                <div
                  key={key}
                  onClick={() => {}}
                  className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex flex-col items-center text-center">
                    <h3 className="text-gray-600 text-sm font-medium mb-3">
                      {label}
                    </h3>

                    <div className="text-2xl font-bold text-gray-900 mb-3">
                      {value}
                    </div>

                    {subtitle && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{subtitle}</span>
                      </div>
                    )}
                  </div>
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
                      <SelectItem value="Cash">CASH</SelectItem>
                      <SelectItem value="UPI">UPI</SelectItem>
                      <SelectItem value="Cheque">Cheque</SelectItem>
                      <SelectItem value="Online">ONLINE</SelectItem>
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
                disabled={isPending}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white flex items-center justify-center gap-2"
              >
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {isPending ? 'Recording...' : 'Record'}
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
        </DialogContent>
      </Dialog>
    </>
  );
}
