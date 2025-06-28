import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface CustomerData {
  name: string;
  mobile: string;
  area: string;
  address: string;
  email: string;
}

interface CustomerEditSectionProps {
  customer: CustomerData;
  isVisible: boolean;
}

function CustomerEditSection({
  customer,
  isVisible,
}: CustomerEditSectionProps) {
  const [formData, setFormData] = useState({
    name: customer.name,
    mobile: customer.mobile,
    area: customer.area,
    address: customer.address,
    email: customer.email,
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    console.log('Saving customer data:', formData);
  };

  if (!isVisible) return null;

  return (
    <Card className="w-80">
      <CardHeader className="bg-pink-50 dark:bg-pink-900/20">
        <CardTitle className="text-lg">Edit Customer</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="space-y-2">
          <Label>Customer Name</Label>
          <Input
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Mobile Number</Label>
          <Input
            value={formData.mobile}
            onChange={(e) => handleInputChange('mobile', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Area</Label>
          <Input
            value={formData.area}
            onChange={(e) => handleInputChange('area', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Email</Label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Address</Label>
          <Textarea
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            rows={3}
          />
        </div>

        <div className="flex space-x-2">
          <Button
            onClick={handleSave}
            className="flex-1 bg-pink-600 hover:bg-pink-700 text-white"
          >
            Save Changes
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() =>
              setFormData({
                name: customer.name,
                mobile: customer.mobile,
                area: customer.area,
                address: customer.address,
                email: customer.email,
              })
            }
          >
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default CustomerEditSection;
