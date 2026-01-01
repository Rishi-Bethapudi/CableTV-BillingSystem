import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit, Save, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import apiClient from '@/utils/apiClient';
import type { Customer as CustomerData, CustomerDevice } from '@/utils/data';

interface HardwareDetailsSectionProps {
  customer: CustomerData;
  isVisible: boolean;
  onRefresh: () => void;
}

const STATUS_OPTIONS = ['Active', 'Inactive', 'NA'];

export default function HardwareDetailsSection({
  customer,
  isVisible,
  onRefresh,
}: HardwareDetailsSectionProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // always edit first device
  const firstDevice = customer.devices?.[0] || ({} as CustomerDevice);

  const [formData, setFormData] = useState({
    stbNumber: firstDevice.stbNumber || '',
    cardNumber: firstDevice.cardNumber || '',
    deviceModel: firstDevice.deviceModel || '',
    membershipNumber: firstDevice.membershipNumber || '',
    stbStatus: firstDevice.active ? 'Active' : 'Inactive',
    cardStatus: firstDevice.cardNumber ? 'Active' : 'Inactive',
  });

  const handleChange = (field: string, value: string) => {
    setFormData((p) => ({ ...p, [field]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);

    // build updated devices[]
    const updatedFirstDevice: CustomerDevice = {
      ...firstDevice,
      stbNumber: formData.stbNumber,
      cardNumber: formData.cardNumber,
      deviceModel: formData.deviceModel,
      membershipNumber: formData.membershipNumber,
      active: formData.stbStatus === 'Active', // map UI to boolean
    };

    const payload = {
      devices: [updatedFirstDevice, ...(customer.devices?.slice(1) ?? [])],
    };

    try {
      await apiClient.put(`/customers/${customer._id}`, payload);
      toast({ title: 'Success', description: 'Hardware details updated.' });
      setIsEditing(false);
      onRefresh();
    } catch {
      toast({
        title: 'Update Failed',
        description: 'Unable to update hardware details.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      stbNumber: firstDevice.stbNumber || '',
      cardNumber: firstDevice.cardNumber || '',
      deviceModel: firstDevice.deviceModel || '',
      membershipNumber: firstDevice.membershipNumber || '',
      stbStatus: firstDevice.active ? 'Active' : 'Inactive',
      cardStatus: firstDevice.cardNumber ? 'Active' : 'Inactive',
    });
    setIsEditing(false);
  };

  const getStatusIcon = (status: string) => {
    if (status === 'Active')
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (status === 'Inactive')
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    return <AlertCircle className="h-4 w-4 text-gray-400" />;
  };

  if (!isVisible) return null;

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* 🔹 Left Card — Editable Device Fields */}
      <Card className="flex-1 min-w-0">
        <CardHeader>
          <CardTitle className="flex justify-between items-center text-lg">
            <span>Hardware Details</span>
            {isEditing ? (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save
                </Button>
              </div>
            ) : (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" /> Edit
              </Button>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* STB Number */}
            <div>
              <label>STB Number</label>
              {isEditing ? (
                <Input
                  value={formData.stbNumber}
                  onChange={(e) => handleChange('stbNumber', e.target.value)}
                />
              ) : (
                <div className="p-2 bg-gray-50 rounded-md">
                  {firstDevice.stbNumber || '—'}
                </div>
              )}
            </div>

            {/* Card Number */}
            <div>
              <label>Card Number</label>
              {isEditing ? (
                <Input
                  value={formData.cardNumber}
                  onChange={(e) => handleChange('cardNumber', e.target.value)}
                />
              ) : (
                <div className="p-2 bg-gray-50 rounded-md">
                  {firstDevice.cardNumber || '—'}
                </div>
              )}
            </div>

            {/* Model */}
            <div>
              <label>Device Model</label>
              {isEditing ? (
                <Input
                  value={formData.deviceModel}
                  onChange={(e) => handleChange('deviceModel', e.target.value)}
                />
              ) : (
                <div className="p-2 bg-gray-50 rounded-md">
                  {firstDevice.deviceModel || '—'}
                </div>
              )}
            </div>

            {/* Membership No */}
            <div>
              <label>Membership Number</label>
              {isEditing ? (
                <Input
                  value={formData.membershipNumber}
                  onChange={(e) =>
                    handleChange('membershipNumber', e.target.value)
                  }
                />
              ) : (
                <div className="p-2 bg-gray-50 rounded-md">
                  {firstDevice.membershipNumber || '—'}
                </div>
              )}
            </div>

            {/* STB Status */}
            <div>
              <label>STB Status</label>
              {isEditing ? (
                <select
                  className="h-10 border rounded-md px-2"
                  value={formData.stbStatus}
                  onChange={(e) => handleChange('stbStatus', e.target.value)}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              ) : (
                <div className="p-2 bg-gray-50 rounded-md flex items-center gap-2">
                  {getStatusIcon(formData.stbStatus)} {formData.stbStatus}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 🔹 Right Card — Status Overview */}
      <Card className="flex-1 min-w-0 max-w-md">
        <CardHeader>
          <CardTitle className="text-lg">Device Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Set Top Box</TableCell>
                <TableCell className="flex gap-2 items-center">
                  {getStatusIcon(formData.stbStatus)} {formData.stbStatus}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Smart Card</TableCell>
                <TableCell className="flex gap-2 items-center">
                  {getStatusIcon(formData.cardStatus)} {formData.cardStatus}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Connection</TableCell>
                <TableCell className="flex gap-2 items-center">
                  <CheckCircle className="h-4 w-4 text-green-500" /> Active
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
