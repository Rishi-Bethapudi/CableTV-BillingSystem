import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Customer } from '@/utils/data';

import AddSubscriptionSection from './AddSubscriptionSection';
import ChangePlanSection from './ChangePlanSection';
import RemoveSubscription from './RemoveSubscription';
import SubscriptionTimeline from './SubscriptionTimeline';
import NoSubscription from './NoSubscription';

interface SubscriptionTabProps {
  customer: Customer;
  selectedSubscription?: any;
  onRefresh: () => void;
}

const SubscriptionTab = ({
  customer,
  selectedSubscription,
  onRefresh,
}: SubscriptionTabProps) => {
  return (
    <div className="bg-white rounded-lg border">
      <Tabs defaultValue="add" className="w-full">
        {/* ---------- TAB HEADERS ---------- */}
        <TabsList className="grid grid-cols-4 w-full rounded-none border-b">
          <TabsTrigger value="add">Add Subscription</TabsTrigger>
          <TabsTrigger value="change" disabled={!selectedSubscription}>
            Change Plan
          </TabsTrigger>
          <TabsTrigger value="remove" disabled={!selectedSubscription}>
            Remove
          </TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* ---------- ADD SUBSCRIPTION ---------- */}
        <TabsContent value="add" className="p-4">
          <AddSubscriptionSection customer={customer} onRefresh={onRefresh} />
        </TabsContent>

        {/* ---------- CHANGE PLAN ---------- */}
        <TabsContent value="change" className="p-4">
          {selectedSubscription ? (
            <ChangePlanSection
              customer={customer}
              subscription={selectedSubscription}
              onRefresh={onRefresh}
            />
          ) : (
            <NoSubscription message="Select a subscription to change its plan." />
          )}
        </TabsContent>
        <TabsContent value="remove" className="p-4">
          {selectedSubscription ? (
            <RemoveSubscription
              customer={customer}
              subscription={selectedSubscription}
              onRefresh={onRefresh}
            />
          ) : (
            <NoSubscription message="Select a subscription to remove." />
          )}
        </TabsContent>
        {/* ---------- SUBSCRIPTION HISTORY ---------- */}
        <TabsContent value="history" className="p-4">
          <SubscriptionTimeline customerId={customer._id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SubscriptionTab;
