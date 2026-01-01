import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import apiClient from '@/utils/apiClient';
import type { Customer } from '@/utils/data';
import { Loader2 } from 'lucide-react';

interface CustomerEditSectionProps {
  customer: Customer;
  isVisible: boolean;
  onUpdate?: (updatedCustomer: Customer) => Promise<void>; // optional & safe
}

export default function CustomerEditSection({
  customer,
  isVisible,
  onUpdate,
}: CustomerEditSectionProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const firstDevice = customer?.devices?.[0] || {};

  const [formData, setFormData] = useState({
    name: customer.name,
    contactNumber: customer.contactNumber,
    locality: customer.locality,
    billingAddress: customer.billingAddress,
    remark: customer.remark || '',
    active: customer.active,
    stbName: firstDevice.deviceModel || '',
    stbNumber: firstDevice.stbNumber || '',
    cardNumber: firstDevice.cardNumber || '',
    additionalCharge: customer.defaultExtraCharge || 0,
    discount: customer.defaultDiscount || 0,
  });

  // Detect unsaved changes
  const [isDirty, setIsDirty] = useState(false);
  useEffect(() => {
    const current = JSON.stringify(formData);
    const original = JSON.stringify({
      name: customer.name,
      contactNumber: customer.contactNumber,
      locality: customer.locality,
      billingAddress: customer.billingAddress,
      remark: customer.remark || '',
      active: customer.active,
      stbName: firstDevice.deviceModel || '',
      stbNumber: firstDevice.stbNumber || '',
      cardNumber: firstDevice.cardNumber || '',
      additionalCharge: customer.defaultExtraCharge || 0,
      discount: customer.defaultDiscount || 0,
    });
    setIsDirty(current !== original);
  }, [formData, customer]);

  const handleChange = (field: string, value: any) =>
    setFormData((p) => ({ ...p, [field]: value }));

  const validate = () => {
    if (!formData.name.trim()) return 'Name is required';
    if (!formData.contactNumber.trim()) return 'Mobile number is required';
    if (!formData.locality.trim()) return 'Locality is required';
    if (!formData.billingAddress.trim()) return 'Billing address is required';
    return null;
  };

  const handleSave = async () => {
    const validationError = validate();
    if (validationError) {
      toast({
        title: 'Missing Fields',
        description: validationError,
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        name: formData.name,
        contactNumber: formData.contactNumber,
        locality: formData.locality,
        billingAddress: formData.billingAddress,
        remark: formData.remark,
        active: formData.active,
        defaultExtraCharge: formData.additionalCharge,
        defaultDiscount: formData.discount,
        devices: [
          {
            deviceModel: formData.stbName,
            stbNumber: formData.stbNumber,
            cardNumber: formData.cardNumber,
            active: true,
          },
        ],
      };

      const res = await apiClient.put(`/customers/${customer._id}`, payload);

      if (typeof onUpdate === 'function') await onUpdate(res.data);
      setIsDirty(false);

      toast({
        title: 'Success',
        description: 'Customer details updated successfully.',
      });
    } catch (error) {
      console.error('Update Error:', error);
      toast({
        title: 'Update Failed',
        description: 'Unable to update customer details.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (isDirty && !confirm('You have unsaved changes. Discard?')) return;
    setFormData({
      name: customer.name,
      contactNumber: customer.contactNumber,
      locality: customer.locality,
      billingAddress: customer.billingAddress,
      remark: customer.remark || '',
      active: customer.active,
      stbName: firstDevice.deviceModel || '',
      stbNumber: firstDevice.stbNumber || '',
      cardNumber: firstDevice.cardNumber || '',
      additionalCharge: customer.defaultExtraCharge || 0,
      discount: customer.defaultDiscount || 0,
    });
    setIsDirty(false);
  };

  if (!isVisible) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Personal Info */}
      <Card>
        <CardHeader className="bg-blue-50 dark:bg-blue-900/20">
          <CardTitle className="text-lg">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <InputField
            label="Customer Name *"
            value={formData.name}
            onChange={(v) => handleChange('name', v)}
          />
          <InputField
            label="Mobile Number *"
            value={formData.contactNumber}
            onChange={(v) => handleChange('contactNumber', v)}
          />
          <InputField
            label="Locality *"
            value={formData.locality}
            onChange={(v) => handleChange('locality', v)}
          />
          <TextAreaField
            label="Billing Address *"
            value={formData.billingAddress}
            onChange={(v) => handleChange('billingAddress', v)}
          />
          <TextAreaField
            label="Remarks"
            value={formData.remark}
            onChange={(v) => handleChange('remark', v)}
          />
        </CardContent>
      </Card>

      {/* Hardware / Service */}
      <Card>
        <CardHeader className="bg-green-50 dark:bg-green-900/20">
          <CardTitle className="text-lg">STB / Smart Card Details</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <InputField
            label="STB Model"
            value={formData.stbName}
            onChange={(v) => handleChange('stbName', v)}
          />
          <InputField
            label="STB Number"
            value={formData.stbNumber}
            onChange={(v) => handleChange('stbNumber', v)}
          />
          <InputField
            label="Card Number"
            value={formData.cardNumber}
            onChange={(v) => handleChange('cardNumber', v)}
          />
          <InputField
            label="Additional Charges (₹)"
            type="number"
            value={formData.additionalCharge}
            onChange={(v) => handleChange('additionalCharge', Number(v))}
          />
          <InputField
            label="Discount (₹)"
            type="number"
            value={formData.discount}
            onChange={(v) => handleChange('discount', Number(v))}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="lg:col-span-2 flex justify-end space-x-4 pt-4">
        <Button variant="outline" onClick={handleReset} disabled={isLoading}>
          Reset
        </Button>
        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 min-w-24"
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

/** Reusable Inputs */
const InputField = ({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: any;
  onChange: (v: any) => void;
  type?: string;
}) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      type={type}
    />
  </div>
);

const TextAreaField = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: any;
  onChange: (v: any) => void;
}) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    <Textarea
      value={value}
      rows={3}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);
