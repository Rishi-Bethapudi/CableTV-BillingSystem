
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddProductDialog({ open, onOpenChange, onSuccess }: AddProductDialogProps) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('products')
        .insert({
          product_code: formData.product_code,
          name: formData.name,
          description: formData.description || null,
          monthly_price: parseFloat(formData.monthly_price),
          installation_fee: formData.installation_fee ? parseFloat(formData.installation_fee) : 0,
          category: formData.category,
          is_active: formData.is_active,
        });

      if (error) throw error;

      toast.success('Product added successfully');
      onSuccess();
      
      // Reset form
      setFormData({
        product_code: '',
        name: '',
        description: '',
        monthly_price: '',
        installation_fee: '',
        category: '',
        is_active: true,
      });
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Failed to add product');
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
            Create a new cable TV package or service
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
              onChange={(e) => setFormData({ ...formData, product_code: e.target.value })}
              className="col-span-3"
              placeholder="PKG-001"
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
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="col-span-3"
              placeholder="Basic Cable Package"
              required
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select category" />
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
              onChange={(e) => setFormData({ ...formData, monthly_price: e.target.value })}
              className="col-span-3"
              placeholder="299.00"
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
              onChange={(e) => setFormData({ ...formData, installation_fee: e.target.value })}
              className="col-span-3"
              placeholder="500.00"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="col-span-3"
              placeholder="Package description..."
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
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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
