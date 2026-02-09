import { useState } from 'react';
import { Card } from '@/components/ui/card';
import type { Customer } from '@/utils/data';
import SubscriptionCard from './subscription/SubscriptionCard';
import SubscriptionTab from './subscription/SubscriptionTab';
import NoSubscription from './subscription/NoSubscription';

interface Props {
  customer: Customer;
  onRefresh: () => void;
}

const SubscriptionSection = ({ customer, onRefresh }: Props) => {
  const [selectedSubId, setSelectedSubId] = useState<string | null>(
    customer.currentSubscriptions?.[0]?._id || null,
  );

  const subscriptions = customer.currentSubscriptions || [];

  const selectedSubscription = subscriptions.find(
    (s) => s._id === selectedSubId,
  );

  return (
    <div className="space-y-6">
      {/* CURRENT SUBSCRIPTIONS */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-3">Current Subscriptions</h3>

        {subscriptions.length === 0 ? (
          <NoSubscription />
        ) : (
          <div className="space-y-3">
            {subscriptions.map((sub) => (
              <SubscriptionCard
                key={sub._id}
                subscription={sub}
                isSelected={sub._id === selectedSubId}
                onSelect={() => setSelectedSubId(sub._id)}
              />
            ))}
          </div>
        )}
      </Card>

      {/* ACTION TABS */}
      <SubscriptionTab
        customer={customer}
        selectedSubscription={selectedSubscription}
        onRefresh={onRefresh}
      />
    </div>
  );
};

export default SubscriptionSection;
