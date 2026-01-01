import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from '@/components/ui/dialog';
import { MapPin, LinkIcon, SendHorizonal, Loader2 } from 'lucide-react';

import apiClient from '@/utils/apiClient';
import type { Customer, CollectPaymentPayload } from '@/utils/data';

interface CollectPaymentSectionProps {
  customer: Customer;
  onRefresh: () => void;
}

export default function CollectPaymentSection({
  customer,
  onRefresh,
}: CollectPaymentSectionProps) {
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [comment, setComment] = useState('');
  const [historyType, setHistoryType] = useState<string | null>(null);
  const [recordTime, setRecordTime] = useState(
    new Date().toISOString().slice(0, 16)
  );

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const payload: CollectPaymentPayload = {
        customerId: customer._id,
        amount: Number(paymentAmount),
        method: paymentMode,
        note: comment,
        recordedAt: new Date(recordTime).toISOString(),
      };
      const res = await apiClient.post('/transactions/collection', payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Payment recorded successfully');
      setPaymentAmount('');
      setPaymentMode('Cash');
      setComment('');
      onRefresh?.();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Something went wrong');
    },
  });

  const formattedExpiry = customer.earliestExpiry
    ? new Date(customer.earliestExpiry).toLocaleDateString('en-IN')
    : 'No Expiry';

  const formattedLastPayDate = customer.lastPaymentDate
    ? new Date(customer.lastPaymentDate).toLocaleDateString('en-IN')
    : 'No Payment Recorded';

  const newBalance = customer.balanceAmount - (Number(paymentAmount) || 0);

  const handleRecord = () => {
    if (!paymentAmount) return toast.warning('Enter payment amount');
    mutate();
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader className="bg-blue-50 dark:bg-blue-900/20 py-3 px-4 flex justify-between flex-wrap gap-2">
          <CardTitle className="text-base font-semibold">
            Collect Payment
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            {[
              { icon: MapPin, label: 'Location' },
              { icon: LinkIcon, label: 'Adv Pay Link' },
              { icon: SendHorizonal, label: 'Reminder Msg' },
            ].map(({ icon: Icon, label }) => (
              <Button
                key={label}
                size="sm"
                className="bg-teal-500 text-white"
                onClick={() => toast.info('Coming soon')}
              >
                <Icon className="h-4 w-4 mr-1" />
                {label}
              </Button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Three Summary Cards Stack Vertically */}
            <div className="flex flex-col gap-4">
              {[
                {
                  title: 'Balance Amount',
                  value: `₹${customer.balanceAmount}`,
                  extra: `Expiry: ${formattedExpiry}`,
                  key: 'balance',
                },
                {
                  title: 'Last Bill Amount',
                  value: customer.lastBillAmount
                    ? `₹${customer.lastBillAmount}`
                    : 'N/A',
                  key: 'bill',
                },
                {
                  title: 'Last Payment',
                  value: customer.lastPaymentAmount
                    ? `₹${customer.lastPaymentAmount}`
                    : 'N/A',
                  extra: formattedLastPayDate,
                  key: 'payment',
                },
              ].map(({ title, value, extra, key }) => (
                <div
                  key={key}
                  className="bg-white border rounded-lg p-5 shadow-sm cursor-pointer hover:shadow-md transition"
                  onClick={() => setHistoryType(key)}
                >
                  <p className="text-sm text-gray-500">{title}</p>
                  <p className="text-2xl font-bold my-1">{value}</p>
                  {extra && (
                    <p className="text-xs text-gray-500 mt-1">{extra}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Form (does not stretch full width) */}
            <div className="lg:col-span-2 max-w-2xl mx-auto flex flex-col gap-6">
              <div>
                <Label>Paid Amount</Label>
                <Input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
              </div>

              <div>
                <Label>Mode</Label>
                <select
                  className="border rounded p-2 w-full"
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Online">Online</option>
                </select>
              </div>

              <div>
                <Label>Comment</Label>
                <Textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>

              <div className="bg-slate-50 p-4 rounded text-sm flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  Total Payment: <b>₹{paymentAmount || 0}</b>
                </div>
                <div>
                  New Balance:{' '}
                  <b
                    className={
                      newBalance >= 0 ? 'text-green-600' : 'text-red-600'
                    }
                  >
                    ₹{newBalance}
                  </b>
                </div>
              </div>

              <Button
                disabled={isPending}
                onClick={handleRecord}
                className="w-full flex justify-center gap-2"
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {historyType === 'balance'
                ? 'Balance History'
                : historyType === 'bill'
                ? 'Bill History'
                : 'Payment History'}
            </DialogTitle>
          </DialogHeader>
          {/* future: history table */}
        </DialogContent>
      </Dialog>
    </>
  );
}
