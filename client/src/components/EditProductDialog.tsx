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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Product {
  id: string;
  product_code: string;
  name: string;
  description: string | null;
  monthly_price: number;
  installation_fee: number | null;
  category: string;
  is_active: boolean;
}

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
  const [formData, setFormData] = useState({
    product_code: '',
    name: '',
    description: '',
    monthly_price: '',
    installation_fee: '',
    category: '',
    is_active: true,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        product_code: product.product_code,
        name: product.name,
        description: product.description || '',
        monthly_price: product.monthly_price.toString(),
        installation_fee: (product.installation_fee || 0).toString(),
        category: product.category,
        is_active: product.is_active,
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('products')
        .update({
          product_code: formData.product_code,
          name: formData.name,
          description: formData.description || null,
          monthly_price: parseFloat(formData.monthly_price),
          installation_fee: formData.installation_fee
            ? parseFloat(formData.installation_fee)
            : 0,
          category: formData.category,
          is_active: formData.is_active,
        })
        .eq('id', product.id);

      if (error) throw error;

      toast.success('Product updated successfully');
      onSuccess();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="product_code" className="text-right">
              Product Code
            </Label>
            <Input
              id="product_code"
              value={formData.product_code}
              onChange={(e) =>
                setFormData({ ...formData, product_code: e.target.value })
              }
              className="col-span-3"
              required
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="col-span-3"
              required
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData({ ...formData, category: value })
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Basic">Basic</SelectItem>
                <SelectItem value="Standard">Standard</SelectItem>
                <SelectItem value="Premium">Premium</SelectItem>
                <SelectItem value="Add-on">Add-on</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="monthly_price" className="text-right">
              Monthly Price
            </Label>
            <Input
              id="monthly_price"
              type="number"
              step="0.01"
              value={formData.monthly_price}
              onChange={(e) =>
                setFormData({ ...formData, monthly_price: e.target.value })
              }
              className="col-span-3"
              required
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="installation_fee" className="text-right">
              Installation Fee
            </Label>
            <Input
              id="installation_fee"
              type="number"
              step="0.01"
              value={formData.installation_fee}
              onChange={(e) =>
                setFormData({ ...formData, installation_fee: e.target.value })
              }
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="col-span-3"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="is_active" className="text-right">
              Active
            </Label>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_active: checked })
              }
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
