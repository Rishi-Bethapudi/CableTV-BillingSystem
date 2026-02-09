import { useEffect, useMemo, useState } from 'react';
import { Package, Calendar, ArrowRight } from 'lucide-react';
import apiClient from '@/utils/apiClient';
import { toast } from 'sonner';
import type { Customer } from '@/utils/data';

interface Props {
  customer: Customer;
  subscription: any;
  onRefresh: () => void;
}

const ChangePlanSection = ({ customer, onRefresh }: Props) => {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedSub, setSelectedSub] = useState<any>(null);
  const [newProduct, setNewProduct] = useState<any>(null);
  const [startMode, setStartMode] = useState<'today' | 'expiry' | 'custom'>(
    'expiry',
  );
  const [customDate, setCustomDate] = useState('');
  const [duration, setDuration] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Load products once
  useEffect(() => {
    apiClient.get('/products').then((res) => setProducts(res.data || []));
  }, []);

  // Calculate start date
  const startDate = useMemo(() => {
    if (!selectedSub) return null;

    if (startMode === 'today') return new Date().toISOString().split('T')[0];

    if (startMode === 'expiry')
      return new Date(selectedSub.expiryDate).toISOString().split('T')[0];

    return customDate || null;
  }, [startMode, customDate, selectedSub]);

  // Duration options from product
  const durationOptions = useMemo(() => {
    if (!newProduct) return [];
    const { unit, value } = newProduct.billingInterval;

    if (unit === 'months') {
      return [1, 2, 3, 6].map((m) => ({
        label: `${m} Month${m > 1 ? 's' : ''}`,
        days: m * 30,
      }));
    }

    return [1, 2, 3, 4].map((x) => ({
      label: `${x * value} Days`,
      days: x * value,
    }));
  }, [newProduct]);

  const handleChangePlan = async () => {
    if (!selectedSub || !newProduct || !startDate || !duration) {
      toast.error('Please complete all fields');
      return;
    }

    try {
      setLoading(true);

      // 1️⃣ End old subscription
      await apiClient.patch(`/subscriptions/${selectedSub._id}/end`, {
        endDate: startDate,
      });

      // 2️⃣ Create new subscription
      await apiClient.post('/transactions/billing', {
        customerId: customer._id,
        productId: newProduct._id,
        startDate,
        durationDays: duration,
        billingMode: 'CHANGE',
        note: `Changed plan from ${selectedSub.productId.name}`,
      });

      toast.success('Plan changed successfully');
      onRefresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to change plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <ArrowRight className="w-5 h-5" />
        Change Subscription Plan
      </div>

      {/* Select subscription */}
      <div>
        <label className="text-sm mb-1 block">Current Subscription</label>
        <select
          className="input-field"
          value={selectedSub?._id || ''}
          onChange={(e) =>
            setSelectedSub(
              customer.activeSubscriptions.find(
                (s: any) => s._id === e.target.value,
              ),
            )
          }
        >
          <option value="">Select subscription</option>
          {customer.activeSubscriptions.map((s: any) => (
            <option key={s._id} value={s._id}>
              {s.productId?.name} (till{' '}
              {new Date(s.expiryDate).toLocaleDateString('en-IN')})
            </option>
          ))}
        </select>
      </div>

      {/* New product */}
      <div>
        <label className="text-sm mb-1 block">New Plan</label>
        <select
          className="input-field"
          value={newProduct?._id || ''}
          onChange={(e) =>
            setNewProduct(products.find((p) => p._id === e.target.value))
          }
        >
          <option value="">Select new plan</option>
          {products.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name} – ₹{p.customerPrice}
            </option>
          ))}
        </select>
      </div>

      {/* Start mode */}
      <div>
        <label className="text-sm mb-1 block">Effective From</label>
        <div className="flex gap-3">
          {['today', 'expiry', 'custom'].map((m) => (
            <button
              key={m}
              onClick={() => setStartMode(m as any)}
              className={`px-3 py-1 rounded border ${
                startMode === m ? 'bg-blue-600 text-white' : 'bg-gray-100'
              }`}
            >
              {m.toUpperCase()}
            </button>
          ))}
        </div>
        {startMode === 'custom' && (
          <input
            type="date"
            className="input-field mt-2"
            value={customDate}
            onChange={(e) => setCustomDate(e.target.value)}
          />
        )}
      </div>

      {/* Duration */}
      <div>
        <label className="text-sm mb-1 block">Duration</label>
        <select
          className="input-field"
          value={duration || ''}
          onChange={(e) => setDuration(Number(e.target.value))}
          disabled={!newProduct}
        >
          <option value="">Select duration</option>
          {durationOptions.map((d) => (
            <option key={d.days} value={d.days}>
              {d.label}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleChangePlan}
        disabled={loading}
        className="btn-primary w-full"
      >
        {loading ? 'Changing…' : 'Change Plan'}
      </button>
    </div>
  );
};

export default ChangePlanSection;
