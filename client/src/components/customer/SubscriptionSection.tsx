import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CustomerData {
  status: string;
  lastBillDate: string;
  expiryDate: string;
}

interface SubscriptionSectionProps {
  customer: CustomerData;
  isVisible: boolean;
}

function SubscriptionSection({
  customer,
  isVisible,
}: SubscriptionSectionProps) {
  if (!isVisible) return null;

  return (
    <Card className="w-80">
      <CardHeader className="bg-purple-50 dark:bg-purple-900/20">
        <CardTitle className="text-lg">Current Subscription</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Status:</span>
            <Badge
              className={
                customer.status === 'Active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }
            >
              {customer.status}
            </Badge>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Plan:</span>
            <span className="font-medium">Premium Package</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Last Bill Date:</span>
            <span className="font-medium">
              {new Date(customer.lastBillDate).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Expiry Date:</span>
            <span className="font-medium">
              {new Date(customer.expiryDate).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Monthly Fee:</span>
            <span className="font-bold text-lg">₹350</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default SubscriptionSection;
