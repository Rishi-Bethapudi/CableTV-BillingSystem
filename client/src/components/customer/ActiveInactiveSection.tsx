import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface CustomerData {
  status: string;
}

interface ActiveInactiveSectionProps {
  customer: CustomerData;
  isVisible: boolean;
}

function ActiveInactiveSection({
  customer,
  isVisible,
}: ActiveInactiveSectionProps) {
  const [isActive, setIsActive] = useState(customer.status === 'Active');

  const handleStatusChange = () => {
    console.log('Changing status to:', isActive ? 'Inactive' : 'Active');
  };

  if (!isVisible) return null;

  return (
    <Card className="w-80">
      <CardHeader className="bg-red-50 dark:bg-red-900/20">
        <CardTitle className="text-lg">Customer Status</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="status-toggle">Customer Active</Label>
          <Switch
            id="status-toggle"
            checked={isActive}
            onCheckedChange={setIsActive}
          />
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
          <div className="text-sm text-gray-600">Current Status</div>
          <div
            className={`text-lg font-bold ${
              isActive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {isActive ? 'Active' : 'Inactive'}
          </div>
        </div>

        <Button
          onClick={handleStatusChange}
          className={`w-full ${
            isActive
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-green-600 hover:bg-green-700'
          } text-white`}
        >
          {isActive ? 'Deactivate' : 'Activate'} Customer
        </Button>
      </CardContent>
    </Card>
  );
}

export default ActiveInactiveSection;
