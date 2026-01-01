import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import apiClient from '@/utils/apiClient';
import type { ProductForm, Product } from '@/utils/data';

interface EditProductDialogProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditProductDialog({
  product,
  open,
  onOpenChange,
  onSuccess,
}: EditProductDialogProps) {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<ProductForm>({
    name: '',
    productCode: '',
    planType: '',
    customerPrice: '',
    operatorCost: '',
    billingIntervalValue: '30',
    billingIntervalUnit: 'days',
    isActive: true,
  });

  // Initialize form when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        productCode: product.productCode,
        name: product.name,
        planType: product.planType, // FIXED
        customerPrice: product.customerPrice.toString(),
        operatorCost: product.operatorCost.toString(),
        billingIntervalValue: product.billingInterval.value.toString(),
        billingIntervalUnit: product.billingInterval.unit,
        isActive: product.isActive,
      });
    }
  }, [product]);

  const handleChange = (field: keyof ProductForm, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiClient.put(`/products/${product._id}`, {
        productCode: formData.productCode,
        name: formData.name,
        planType: formData.planType, // FIXED
        customerPrice: parseFloat(formData.customerPrice),
        operatorCost: parseFloat(formData.operatorCost) || 0,
        billingInterval: {
          value: parseInt(formData.billingIntervalValue, 10),
          unit: formData.billingIntervalUnit,
        },
        isActive: formData.isActive,
      });

      toast.success('Product updated successfully');
      onSuccess();
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast.error(error.response?.data?.message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>
            Update the cable TV package or service details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          {/* Product Code */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="productCode" className="text-right">
              Product Code
            </Label>
            <Input
              id="productCode"
              value={formData.productCode}
              onChange={(e) => handleChange('productCode', e.target.value)}
              className="col-span-3"
              required
            />
          </div>

          {/* Name */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="col-span-3"
              required
            />
          </div>

          {/* Plan Type */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="planType" className="text-right">
              Plan Type
            </Label>
            <Select
              value={formData.planType}
              onValueChange={(value) => handleChange('planType', value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select Plan Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BASE">Base Pack</SelectItem>
                <SelectItem value="ADDON">Addon Pack</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Customer Price */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="customerPrice" className="text-right">
              Customer Price
            </Label>
            <Input
              id="customerPrice"
              type="number"
              step="0.01"
              min="0"
              value={formData.customerPrice}
              onChange={(e) => handleChange('customerPrice', e.target.value)}
              className="col-span-3"
              required
            />
          </div>

          {/* Operator Cost */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="operatorCost" className="text-right">
              Operator Cost
            </Label>
            <Input
              id="operatorCost"
              type="number"
              step="0.01"
              min="0"
              value={formData.operatorCost}
              onChange={(e) => handleChange('operatorCost', e.target.value)}
              className="col-span-3"
            />
          </div>

          {/* Billing Interval */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="billingInterval" className="text-right">
              Billing Interval
            </Label>
            <div className="col-span-3 flex gap-2">
              <Input
                type="number"
                min={1}
                max={31}
                value={formData.billingIntervalValue}
                onChange={(e) =>
                  handleChange('billingIntervalValue', e.target.value)
                }
                className="w-1/2"
                required
              />
              <Select
                value={formData.billingIntervalUnit}
                onValueChange={(value) =>
                  handleChange('billingIntervalUnit', value)
                }
              >
                <SelectTrigger className="w-1/2">
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="days">Days</SelectItem>
                  <SelectItem value="months">Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="isActive" className="text-right">
              Active
            </Label>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => handleChange('isActive', checked)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
