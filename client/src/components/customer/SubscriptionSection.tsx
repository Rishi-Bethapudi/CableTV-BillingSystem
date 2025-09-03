import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Customer as CustomerData, Product } from '@/utils/data';
import apiClient from '@/utils/apiClient';
import { toast } from 'react-toastify';

interface SubscriptionSectionProps {
  customer: CustomerData;
  isVisible: boolean;
}

function SubscriptionSection({
  customer,
  isVisible,
}: SubscriptionSectionProps) {
  const [plans, setPlans] = useState<Product[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [changing, setChanging] = useState(false);
  const [removing, setRemoving] = useState(false);

  // Fetch plan details using productIds
  useEffect(() => {
    if (!isVisible || !customer?.productId?.length) return;

    const fetchPlans = async () => {
      try {
        setLoadingPlans(true);
        const res = await apiClient.post('/products/byIds', {
          ids: customer.productId,
        });
        setPlans(res.data || []);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Failed to fetch plans');
      } finally {
        setLoadingPlans(false);
      }
    };

    fetchPlans();
  }, [customer?.productId, isVisible]);

  // API call for Change Subscription
  const handleChangeSubscription = async () => {
    try {
      setChanging(true);
      await apiClient.put(`/subscriptions/${customer._id}/change`, {
        // You can pass new productId(s) here
      });
      toast.success('Subscription changed successfully');
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || 'Failed to change subscription'
      );
    } finally {
      setChanging(false);
    }
  };

  // API call for Remove Subscription
  const handleRemoveSubscription = async () => {
    try {
      setRemoving(true);
      await apiClient.delete(`/subscriptions/${customer._id}`);
      toast.success('Subscription removed successfully');
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || 'Failed to remove subscription'
      );
    } finally {
      setRemoving(false);
    }
  };

  if (!isVisible) return null;

  return (
    <Card className="w-full md:w-96">
      <CardHeader className="bg-purple-50 dark:bg-purple-900/20">
        <CardTitle className="text-lg">Current Subscription</CardTitle>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {loadingPlans ? (
          <p className="text-sm text-gray-500">
            Fetching subscription details...
          </p>
        ) : plans.length === 0 ? (
          <p className="text-sm text-gray-500">No active subscription</p>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Status:</span>
              <Badge
                className={
                  customer.active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }
              >
                {customer.active ? 'Active' : 'Inactive'}
              </Badge>
            </div>

            {plans.map((plan) => (
              <div
                key={plan._id}
                className="border rounded-md p-2 bg-slate-50 dark:bg-slate-800"
              >
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Plan:</span>
                  <span className="font-medium">{plan.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Monthly Fee:</span>
                  <span className="font-bold text-lg">₹{plan.price}</span>
                </div>
              </div>
            ))}

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
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-3 mt-4">
          <Button
            onClick={handleChangeSubscription}
            disabled={changing}
            className="w-full md:w-1/2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {changing ? 'Changing...' : 'Change Subscription'}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="w-full md:w-1/2 bg-blue-600 hover:bg-blue-700 text-white">
                Change Subscription
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-56">
              <DropdownMenuItem className="flex justify-between">
                Change From Last Bill Date
                <ChevronRight className="h-4 w-4" />
              </DropdownMenuItem>

              <DropdownMenuItem className="flex justify-between ">
                Change From Today
                <ChevronRight className="h-4 w-4" />
              </DropdownMenuItem>

              <DropdownMenuItem
                className="flex justify-between"
                onClick={() => {
                  console.log('clicked');
                }}
              >
                Change From Any Date
                <ChevronRight className="h-4 w-4" />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            onClick={handleRemoveSubscription}
            disabled={removing}
            variant="destructive"
            className="w-full md:w-1/2"
          >
            {removing ? 'Removing...' : 'Remove Subscription'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default SubscriptionSection;
