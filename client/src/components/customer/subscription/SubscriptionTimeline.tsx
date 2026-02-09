import { useEffect, useState } from 'react';
import { Package, Calendar, FileText } from 'lucide-react';
import apiClient from '@/utils/apiClient';
import { format } from 'date-fns';

interface Props {
  customerId: string;
}

const statusColor = {
  ACTIVE: 'bg-green-500',
  ENDED: 'bg-gray-400',
  EXPIRED: 'bg-red-500',
};

const SubscriptionTimeline = ({ customerId }: Props) => {
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubs = async () => {
      try {
        const res = await apiClient.get(
          `/subscriptions/customer/${customerId}`,
        );
        setSubs(res.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchSubs();
  }, [customerId]);

  if (loading) {
    return <div className="text-sm text-gray-500">Loading history…</div>;
  }

  if (!subs.length) {
    return (
      <div className="bg-gray-50 p-4 rounded text-sm text-gray-600">
        No subscription history found.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
        <Package className="w-5 h-5" />
        Subscription History
      </h3>

      <div className="relative pl-6 border-l-2 border-gray-200 space-y-8">
        {subs.map((sub, index) => (
          <div key={sub._id} className="relative">
            {/* Timeline Dot */}
            <span
              className={`absolute -left-[11px] top-2 h-4 w-4 rounded-full ${
                statusColor[sub.status]
              }`}
            />

            {/* Card */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {sub.productId?.name}
                  </h4>
                  <p className="text-xs text-gray-500">
                    Renewal #{sub.renewalNumber}
                  </p>
                </div>

                <span
                  className={`text-xs px-2 py-1 rounded font-medium ${
                    sub.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-700'
                      : sub.status === 'ENDED'
                        ? 'bg-gray-200 text-gray-700'
                        : 'bg-red-100 text-red-700'
                  }`}
                >
                  {sub.status}
                </span>
              </div>

              {/* Dates */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Start: {format(new Date(sub.startDate), 'dd MMM yyyy')}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  End: {format(new Date(sub.expiryDate), 'dd MMM yyyy')}
                </span>
              </div>

              {/* Billing */}
              <div className="flex justify-between items-center text-sm">
                <span>
                  Interval:{' '}
                  <strong>
                    {sub.billingInterval.value} {sub.billingInterval.unit}
                  </strong>
                </span>

                {sub.invoiceId && (
                  <span className="flex items-center gap-1 text-gray-500">
                    <FileText className="w-4 h-4" />
                    {sub.invoiceId}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionTimeline;
