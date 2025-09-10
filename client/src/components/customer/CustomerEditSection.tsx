import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import apiClient from '@/utils/apiClient';
import type { Customer } from '@/utils/data';

interface CustomerEditSectionProps {
  customer: Customer;
  isVisible: boolean;
  onUpdate: (updatedCustomer: Partial<Customer>) => Promise<void>;
}

function CustomerEditSection({
  customer,
  isVisible,
  onUpdate,
}: CustomerEditSectionProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: customer.name,
    mobile: customer.mobile,
    locality: customer.locality,
    billingAddress: customer.billingAddress,
    email: customer.email || '',
    stbName: customer.stbName,
    stbNumber: customer.stbNumber,
    cardNumber: customer.cardNumber,
    connectionStartDate: customer.connectionStartDate
      ? new Date(customer.connectionStartDate)
      : new Date(),
    expiryDate: customer.expiryDate
      ? new Date(customer.expiryDate)
      : new Date(),
    additionalCharge: customer.additionalCharge,
    discount: customer.discount,
    remark: customer.remark,
    active: customer.active,
  });

  const handleInputChange = (
    field: string,
    value: string | number | boolean | Date
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      return await apiClient.put(`/customers/${customer._id}`, {
        ...formData,
        connectionStartDate: formData.connectionStartDate?.toISOString(),
        expiryDate: formData.expiryDate?.toISOString(),
      });

      toast({
        title: 'Success',
        description: 'Customer details updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: 'Failed to update customer details',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: customer.name,
      mobile: customer.mobile,
      locality: customer.locality,
      billingAddress: customer.billingAddress,
      email: customer?.email || '',
      stbName: customer.stbName,
      stbNumber: customer.stbNumber,
      cardNumber: customer.cardNumber,
      connectionStartDate: customer.connectionStartDate
        ? new Date(customer.connectionStartDate)
        : new Date(),
      expiryDate: customer.expiryDate
        ? new Date(customer.expiryDate)
        : new Date(),
      additionalCharge: customer.additionalCharge,
      discount: customer.discount,
      remark: customer.remark,
      active: customer.active,
    });
  };

  if (!isVisible) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Personal Information Card */}
      <Card>
        <CardHeader className="bg-blue-50 dark:bg-blue-900/20">
          <CardTitle className="text-lg">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Customer Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter customer name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile Number *</Label>
            <Input
              id="mobile"
              value={formData.mobile}
              onChange={(e) => handleInputChange('mobile', e.target.value)}
              placeholder="Enter mobile number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter email address"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="locality">Area/Locality *</Label>
            <Input
              id="locality"
              value={formData.locality}
              onChange={(e) => handleInputChange('locality', e.target.value)}
              placeholder="Enter area or locality"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="billingAddress">Billing Address *</Label>
            <Textarea
              id="billingAddress"
              value={formData.billingAddress}
              onChange={(e) =>
                handleInputChange('billingAddress', e.target.value)
              }
              placeholder="Enter complete billing address"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Account Status</Label>
            <Select
              value={formData.active ? 'active' : 'inactive'}
              onValueChange={(value) =>
                handleInputChange('active', value === 'active')
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Service Information Card */}
      <Card>
        <CardHeader className="bg-green-50 dark:bg-green-900/20">
          <CardTitle className="text-lg">Service Information</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stbName">STB Name</Label>
              <Input
                id="stbName"
                value={formData.stbName}
                onChange={(e) => handleInputChange('stbName', e.target.value)}
                placeholder="STB model"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stbNumber">STB Number</Label>
              <Input
                id="stbNumber"
                value={formData.stbNumber}
                onChange={(e) => handleInputChange('stbNumber', e.target.value)}
                placeholder="STB serial number"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input
              id="cardNumber"
              value={formData.cardNumber}
              onChange={(e) => handleInputChange('cardNumber', e.target.value)}
              placeholder="Smart card number"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Connection Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !formData.connectionStartDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.connectionStartDate ? (
                      format(formData.connectionStartDate, 'PPP')
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.connectionStartDate}
                    onSelect={(date) =>
                      date && handleInputChange('connectionStartDate', date)
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Expiry Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !formData.expiryDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.expiryDate ? (
                      format(formData.expiryDate, 'PPP')
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.expiryDate}
                    onSelect={(date) =>
                      date && handleInputChange('expiryDate', date)
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="additionalCharge">Additional Charges (₹)</Label>
              <Input
                id="additionalCharge"
                type="number"
                value={formData.additionalCharge}
                onChange={(e) =>
                  handleInputChange(
                    'additionalCharge',
                    parseFloat(e.target.value) || 0
                  )
                }
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount">Discount (₹)</Label>
              <Input
                id="discount"
                type="number"
                value={formData.discount}
                onChange={(e) =>
                  handleInputChange('discount', parseFloat(e.target.value) || 0)
                }
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="remark">Remarks</Label>
            <Textarea
              id="remark"
              value={formData.remark}
              onChange={(e) => handleInputChange('remark', e.target.value)}
              placeholder="Additional notes or comments"
              rows={2}
            />
          </div>

          {/* Read-only fields */}
          <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Customer Code:</span>
              <span className="font-medium">{customer.customerCode}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Balance Amount:</span>
              <span className="font-medium text-red-600">
                ₹{customer.balanceAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Last Payment:</span>
              <span className="font-medium">
                ₹{customer.lastPaymentAmount.toFixed(2)}
              </span>
            </div>
            {customer.lastPaymentDate && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Last Payment Date:
                </span>
                <span className="font-medium text-xs">
                  {new Date(customer.lastPaymentDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="lg:col-span-2 flex justify-end space-x-4 pt-4">
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={isLoading}
          className="min-w-24"
        >
          Reset
        </Button>
        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="min-w-24 bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </div>
  );
}

export default CustomerEditSection;
