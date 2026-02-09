import { useEffect, useMemo, useState } from 'react';
import { Package, Calendar, CreditCard } from 'lucide-react';
import apiClient from '@/utils/apiClient';
import { toast } from 'sonner';
import type { Customer } from '@/utils/data';

interface Props {
  customer: Customer;
  onRefresh: () => void;
}

const AddSubscriptionSection = ({ customer, onRefresh }: Props) => {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [duration, setDuration] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // 🔹 Load products once
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get('/products');
        setProducts(res.data || []);
      } catch {
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // 🔹 Duration options based on product billingInterval
  const durationOptions = useMemo(() => {
    if (!selectedProduct) return [];

    const { unit, value } = selectedProduct.billingInterval || {};

    if (unit === 'months') {
      return [1, 2, 3, 6].map((m) => ({
        label: `${m} Month${m > 1 ? 's' : ''}`,
        days: m * 30,
      }));
    }

    // days-based
    return [1, 2, 3, 4].map((x) => ({
      label: `${x * value} Days`,
      days: x * value,
    }));
  }, [selectedProduct]);

  const handleSubmit = async () => {
    if (!selectedProduct || !duration) {
      toast.error('Please select product and duration');
      return;
    }

    const payload = {
      customerId: customer._id,
      productId: selectedProduct._id,
      startDate,
      durationDays: duration,
      billingMode: 'NEW',
      note: 'New subscription added',
    };

    try {
      setSubmitLoading(true);
      await apiClient.post('/transactions/billing', payload);
      toast.success('Subscription added successfully');
      onRefresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add subscription');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 text-lg font-semibold">
        <Package className="w-5 h-5" />
        Add New Subscription
      </div>

      {/* Existing subscriptions */}
      <div>
        <h4 className="text-sm font-medium mb-2">Current Subscriptions</h4>

        {customer.activeSubscriptions?.length ? (
          <div className="space-y-2">
            {customer.activeSubscriptions.map((sub: any) => (
              <div
                key={sub._id}
                className="flex justify-between bg-gray-50 p-3 rounded text-sm"
              >
                <span>{sub.productId?.name}</span>
                <span className="text-gray-600">
                  till {new Date(sub.expiryDate).toLocaleDateString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-500">No active subscriptions</div>
        )}
      </div>

      {/* Product select */}
      <div>
        <label className="text-sm mb-1 block">Select Product</label>
        <select
          className="input-field"
          value={selectedProduct?._id || ''}
          onChange={(e) =>
            setSelectedProduct(products.find((p) => p._id === e.target.value))
          }
        >
          <option value="">Select product</option>
          {products.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name} – ₹{p.customerPrice}
            </option>
          ))}
        </select>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm mb-1 block">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="input-field"
          />
        </div>

        <div>
          <label className="text-sm mb-1 block">Duration</label>
          <select
            className="input-field"
            value={duration || ''}
            onChange={(e) => setDuration(Number(e.target.value))}
            disabled={!selectedProduct}
          >
            <option value="">Select duration</option>
            {durationOptions.map((opt) => (
              <option key={opt.days} value={opt.days}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary */}
      {selectedProduct && duration && (
        <div className="bg-gray-50 p-4 rounded text-sm space-y-1">
          <div className="flex justify-between">
            <span>Product</span>
            <span>{selectedProduct.name}</span>
          </div>
          <div className="flex justify-between">
            <span>Duration</span>
            <span>{duration} days</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Amount</span>
            <span>
              ₹
              {(
                (selectedProduct.customerPrice * duration) /
                (selectedProduct.billingInterval.unit === 'months'
                  ? selectedProduct.billingInterval.value * 30
                  : selectedProduct.billingInterval.value)
              ).toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={submitLoading}
        className="btn-primary w-full"
      >
        {submitLoading ? 'Adding…' : 'Add Subscription'}
      </button>
    </div>
  );
};

export default AddSubscriptionSection;
