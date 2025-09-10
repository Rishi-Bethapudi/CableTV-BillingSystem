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
import type { Customer as CustomerData } from '@/utils/data';

interface HardwareDetailsSectionProps {
  customer: CustomerData;
  isVisible: boolean;
  onRefresh: () => void;
}

function HardwareDetailsSection({
  customer,
  isVisible,
  onRefresh,
}: HardwareDetailsSectionProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    stbName: customer.stbName,
    stbNumber: customer.stbNumber,
    cardNumber: customer.cardNumber || '',
    // membershipNo: customer.membershipNo,
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await apiClient.put(`/customers/${customer._id}`, formData);
      setIsEditing(false);
      toast({
        title: 'Success',
        description: 'Hardware details updated successfully',
      });
      onRefresh();
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: 'Failed to update hardware details',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      stbName: customer.stbName,
      stbNumber: customer.stbNumber,
      cardNumber: customer.cardNumber || '',
      // membershipNo: customer.membershipNo,
    });
    setIsEditing(false);
  };

  const getStatusIcon = (status: string = '') => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('active')) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (statusLower.includes('inactive') || statusLower.includes('na')) {
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
    return <AlertCircle className="h-4 w-4 text-gray-400" />;
  };

  const getStatusText = (status: string = '') => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('active')) return 'Active';
    if (statusLower.includes('inactive')) return 'Inactive';
    if (statusLower.includes('na')) return 'Not Available';
    return 'Unknown';
  };

  if (!isVisible) return null;

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Hardware Details Card */}
      <Card className="flex-1 min-w-0">
        <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20">
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Hardware Details</span>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* STB Name Field */}
            <div className="space-y-1">
              <label className="text-sm text-gray-600 font-medium">
                STB Name
              </label>
              {isEditing ? (
                <Input
                  value={formData.stbName}
                  onChange={(e) => handleInputChange('stbName', e.target.value)}
                  className="h-10"
                  disabled={isLoading}
                />
              ) : (
                <div className="font-medium p-2 bg-gray-50 rounded-md min-h-10 flex items-center">
                  {customer.stbName}
                </div>
              )}
            </div>

            {/* STB Number Field */}
            <div className="space-y-1">
              <label className="text-sm text-gray-600 font-medium">
                STB Number
              </label>
              {isEditing ? (
                <Input
                  value={formData.stbNumber}
                  onChange={(e) =>
                    handleInputChange('stbNumber', e.target.value)
                  }
                  className="h-10"
                  disabled={isLoading}
                />
              ) : (
                <div className="font-medium p-2 bg-gray-50 rounded-md min-h-10 flex items-center">
                  {customer.stbNumber}
                </div>
              )}
            </div>

            {/* Card Number Field */}
            <div className="space-y-1">
              <label className="text-sm text-gray-600 font-medium">
                Card Number
              </label>
              {isEditing ? (
                <Input
                  value={formData.cardNumber}
                  onChange={(e) =>
                    handleInputChange('cardNumber', e.target.value)
                  }
                  className="h-10"
                  disabled={isLoading}
                  placeholder="Enter card number"
                />
              ) : (
                <div className="font-medium p-2 bg-gray-50 rounded-md min-h-10 flex items-center">
                  {customer.cardNumber || 'Not Available'}
                </div>
              )}
            </div>

            {/* Membership Number Field */}
            {/* <div className="space-y-1">
              <label className="text-sm text-gray-600 font-medium">
                Membership Number
              </label>
              {isEditing ? (
                <Input
                  value={formData.membershipNo}
                  onChange={(e) =>
                    handleInputChange('membershipNo', e.target.value)
                  }
                  className="h-10"
                  disabled={isLoading}
                />
              ) : (
                <div className="font-medium p-2 bg-gray-50 rounded-md min-h-10 flex items-center">
                  {customer.membershipNo}
                </div>
              )}
            </div> */}
          </div>
        </CardContent>
      </Card>

      {/* Status Card */}
      <Card className="flex-1 min-w-0 max-w-md">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20">
          <CardTitle className="text-lg">Device Status</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Device</TableHead>
                <TableHead className="text-xs">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="text-xs font-medium">
                  Set Top Box
                </TableCell>
                <TableCell className="text-xs">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(customer.stbStatus)}
                    {getStatusText(customer.stbStatus)}
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-xs font-medium">
                  Smart Card
                </TableCell>
                <TableCell className="text-xs">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(customer.cardStatus)}
                    {getStatusText(customer.cardStatus)}
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-xs font-medium">
                  Connection
                </TableCell>
                <TableCell className="text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Active
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-xs font-medium">
                  Signal Quality
                </TableCell>
                <TableCell className="text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Excellent
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default HardwareDetailsSection;
