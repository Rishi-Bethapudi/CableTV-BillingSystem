import { useEffect, useMemo, useState } from 'react';
import { Calendar, Package, CreditCard, User } from 'lucide-react';
import apiClient from '@/utils/apiClient';
import { toast } from 'sonner';
import type { Customer } from '@/utils/data';

interface Props {
  customer: Customer;
  isVisible: boolean;
  onRefresh: () => void;
}

const RenewSubscription = ({ customer, isVisible, onRefresh }: Props) => {
  const subscriptions = customer.currentSubscriptions || [];

  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState('');
  const [duration, setDuration] = useState<number | null>(null);
  const [toDate, setToDate] = useState('');
  const [renewLoading, setRenewLoading] = useState(false);

  const selectedSub = useMemo(
    () => subscriptions.find((s: any) => s._id === selectedSubId),
    [selectedSubId, subscriptions],
  );

  // 🧠 Billing interval aware options
  const durationOptions = useMemo(() => {
    if (!selectedSub) return [];

    const { unit } = selectedSub.productId.billingInterval;

    return unit === 'months'
      ? [
          { label: '1 Month', value: 30 },
          { label: '2 Months', value: 60 },
          { label: '3 Months', value: 90 },
          { label: '6 Months', value: 180 },
        ]
      : [
          { label: '30 Days', value: 30 },
          { label: '60 Days', value: 60 },
          { label: '90 Days', value: 90 },
          { label: '120 Days', value: 120 },
        ];
  }, [selectedSub]);

  // 🔁 Auto-calc dates
  useEffect(() => {
    if (!selectedSub) return;

    const base =
      new Date(selectedSub.expiryDate) > new Date()
        ? new Date(selectedSub.expiryDate)
        : new Date();

    setFromDate(base.toISOString().split('T')[0]);
  }, [selectedSub]);

  useEffect(() => {
    if (!fromDate || !duration) return;
    const d = new Date(fromDate);
    d.setDate(d.getDate() + duration);
    setToDate(d.toISOString().split('T')[0]);
  }, [fromDate, duration]);

  if (!isVisible) return null;

  // 🚫 No subscriptions case
  if (!subscriptions.length) {
    return (
      <div className="p-6 text-center text-gray-500 bg-white rounded-lg">
        No subscriptions found for this customer.
      </div>
    );
  }

  // 🔥 Renew handler
  const handleRenew = async () => {
    if (!selectedSub || !duration || !fromDate) {
      return toast.error('Please select subscription & duration');
    }

    setRenewLoading(true);
    try {
      await apiClient.post('/transactions/billing', {
        mode: 'RENEW',
        customerId: customer._id,
        productId: selectedSub.productId._id,
        startDate: fromDate,
        durationDays: duration,
        note: 'Renewal',
      });

      toast.success('Subscription renewed successfully');
      onRefresh();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Renewal failed');
    } finally {
      setRenewLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <h2 className="flex items-center gap-2 font-semibold text-lg">
        <Package className="w-4 h-4" /> Renew Subscription
      </h2>

      {/* 🔹 Subscription selector */}
      <div className="space-y-3">
        {subscriptions.map((sub: any) => (
          <label
            key={sub._id}
            className={`block border rounded p-3 cursor-pointer ${
              selectedSubId === sub._id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200'
            }`}
          >
            <input
              type="radio"
              className="mr-2"
              checked={selectedSubId === sub._id}
              onChange={() => setSelectedSubId(sub._id)}
            />
            <span className="font-medium">{sub.productId.name}</span>
            <div className="text-xs text-gray-500">
              Expires on {new Date(sub.expiryDate).toLocaleDateString('en-IN')}
            </div>
          </label>
        ))}
      </div>

      {/* 🔹 Renew form */}
      {selectedSub && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm">Start Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="text-sm">End Date</label>
              <input
                type="date"
                value={toDate}
                readOnly
                className="input-field bg-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="text-sm">Duration</label>
            <select
              value={duration ?? ''}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="input-field"
            >
              <option value="">Select duration</option>
              {durationOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-between items-center border-t pt-4">
            <div className="text-sm text-gray-600 flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Balance: ₹{customer.balanceAmount}
            </div>

            <button
              disabled={renewLoading}
              onClick={handleRenew}
              className="btn-primary bg-blue-600 text-white px-6 py-2 rounded"
            >
              {renewLoading ? 'Renewing…' : 'Renew'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default RenewSubscription;
