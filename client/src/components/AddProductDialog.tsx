import { useState } from 'react';
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
import type { ProductForm } from '@/utils/data';
interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddProductDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddProductDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProductForm>({
    name: '',
    category: '',
    customerPrice: '',
    operatorCost: '',
    billingInterval: '30', // default monthly
    isActive: true,
  });

  const handleChange = (field: keyof ProductForm, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      customerPrice: '',
      operatorCost: '',
      billingInterval: '30',
      isActive: true,
    });
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiClient.post('/products', {
        name: formData.name,
        category: formData.category,
        customerPrice: parseFloat(formData.customerPrice),
        operatorCost: formData.operatorCost
          ? parseFloat(formData.operatorCost)
          : 0,
        billingInterval: parseInt(formData.billingInterval, 10),
        isActive: formData.isActive,
      });

      toast.success('Product added successfully');
      onSuccess();
      resetForm();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error adding product:', error);
      const message = error.response?.data?.message || 'Failed to add product';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Create a new product/package for your operator account
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          {/* Product Name */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="col-span-3"
              placeholder="Basic Cable Package"
              required
            />
          </div>

          {/* Category */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleChange('category', value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Basic">Basic</SelectItem>
                <SelectItem value="Premium">Premium</SelectItem>
                <SelectItem value="Add-on">Add-on</SelectItem>
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
              value={formData.customerPrice}
              onChange={(e) => handleChange('customerPrice', e.target.value)}
              className="col-span-3"
              placeholder="299.00"
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
              value={formData.operatorCost}
              onChange={(e) => handleChange('operatorCost', e.target.value)}
              className="col-span-3"
              placeholder="200.00"
            />
          </div>

          {/* Billing Interval */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="billingInterval" className="text-right">
              Billing Interval
            </Label>
            <Select
              value={formData.billingInterval}
              onValueChange={(value) => handleChange('billingInterval', value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select interval" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">Monthly (30 days)</SelectItem>
                <SelectItem value="90">Quarterly (90 days)</SelectItem>
                <SelectItem value="180">Half-Yearly (180 days)</SelectItem>
                <SelectItem value="365">Yearly (365 days)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Switch */}
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
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
