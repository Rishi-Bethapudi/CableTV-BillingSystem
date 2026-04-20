import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Package, Calendar, CreditCard, Loader2, Plus } from 'lucide-react';
import { addDays, addMonths } from 'date-fns';
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
  const [duration, setDuration] = useState<any>(null);
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

  const durationOptions = useMemo(() => {
    if (!selectedProduct) return [];

    const { unit, value } = selectedProduct.billingInterval || {};

    if (unit === 'months') {
      return [1, 2, 3, 6].map((m) => ({
        label: `${m} Month${m > 1 ? 's' : ''}`,
        value: m,
        unit: 'months',
      }));
    }

    return [1, 2, 3, 4].map((x) => ({
      label: `${x * value} Days`,
      value: x * value,
      unit: 'days',
    }));
  }, [selectedProduct]);

  const expiryDate = useMemo(() => {
    if (!startDate || !duration) return null;

    const start = new Date(startDate);
    if (isNaN(start.getTime())) return null;

    return duration.unit === 'months'
      ? addMonths(start, duration.value)
      : addDays(start, duration.value);
  }, [startDate, duration]);

  const handleSubmit = async () => {
    if (!selectedProduct || !duration) {
      toast.error('Please select product and duration');
      return;
    }

    const payload = {
      customerId: customer._id,
      productId: selectedProduct._id,
      startDate,
      durationValue: duration.value, // ✅ actual selected value
      durationUnit: duration.unit, // ✅ actual unit
      note: 'New subscription added by',
    };

    try {
      setSubmitLoading(true);
      await apiClient.post('/subscriptions', payload);
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
            value={duration ? JSON.stringify(duration) : ''}
            onChange={(e) => setDuration(JSON.parse(e.target.value))}
            disabled={!selectedProduct}
          >
            <option value="">Select duration</option>
            {durationOptions.map((opt, i) => (
              <option key={i} value={JSON.stringify(opt)}>
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
            <span>
              {duration.value} {duration.unit}
            </span>
          </div>
          {expiryDate && (
            <div className="flex justify-between">
              <span>Expiry</span>
              <span className="font-bold text-red-500">
                {expiryDate.toLocaleDateString('en-IN')}
              </span>
            </div>
          )}
          <div className="flex justify-between font-semibold">
            <span>Amount</span>
            <span>
              ₹
              {(duration.unit === 'months'
                ? duration.value * selectedProduct.customerPrice
                : (duration.value / 30) * selectedProduct.customerPrice
              ).toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={submitLoading}
        className="
    w-full gap-2 font-semibold
    bg-gradient-to-r from-indigo-500 to-purple-600
    hover:from-indigo-600 hover:to-purple-700
    text-white shadow-md hover:shadow-lg
    transition-all duration-300
  "
      >
        {submitLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Adding...
          </>
        ) : (
          <>
            <Plus className="w-4 h-4" />
            Add Subscription
          </>
        )}
      </Button>
    </div>
  );
};

export default AddSubscriptionSection;
