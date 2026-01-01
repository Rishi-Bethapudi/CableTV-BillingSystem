import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import apiClient from '@/utils/apiClient';
import type { Customer as CustomerData } from '@/utils/data';
import { useSelector } from 'react-redux';

interface AdditionalItem {
  name: string;
  sellingPrice: number;
  costPrice: number;
  defaultNote?: string;
}

interface AddOnBillSectionProps {
  customer: CustomerData;
  isVisible?: boolean;
  onRefresh: () => void;
}

export default function AddOnBillSection({
  customer,
  isVisible = true,
  onRefresh,
}: AddOnBillSectionProps) {
  const user = useSelector((state: any) => state.auth.user);
  const [items, setItems] = useState<AdditionalItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [price, setPrice] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAddItemForm, setShowAddItemForm] = useState(false);

  // new item inputs
  const [newName, setNewName] = useState('');
  const [newSelling, setNewSelling] = useState('');
  const [newCost, setNewCost] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      // const res = await apiClient.get('/operator/me');
      const res = setItems(user?.additionalItems || []);
    } catch {
      toast.error('Failed to load additional items');
    }
  };

  const handleSelectItem = (index: number) => {
    setSelectedIndex(index);
    const item = items[index];
    setPrice(item.sellingPrice.toString());
    setNote(item.defaultNote || item.name);
  };

  const handleAddItem = async () => {
    if (!newName || !newSelling || !newCost) {
      toast.error('Please fill all fields');
      return;
    }
    try {
      await apiClient.post('/operator/add-item', {
        name: newName,
        sellingPrice: Number(newSelling),
        costPrice: Number(newCost),
      });

      toast.success('Item added');
      setShowAddItemForm(false);
      setNewName('');
      setNewSelling('');
      setNewCost('');
      fetchItems();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to add item');
    }
  };

  const handleSubmit = async () => {
    if (!price) return toast.error('Enter billing amount');

    const payload: any = {
      customerId: customer._id,
      note,
    };

    if (selectedIndex !== null) payload.itemIndex = selectedIndex;
    else payload.amount = Number(price);

    setLoading(true);
    try {
      await apiClient.post('/transactions/addon', payload);
      toast.success('Add-on billing completed');
      onRefresh();
      setSelectedIndex(null);
      setPrice('');
      setNote('');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Billing failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isVisible) return null;
  const newBalance = customer.balanceAmount + (price ? Number(price) : 0);

  return (
    <Card className="w-96">
      <CardHeader className="bg-yellow-50 dark:bg-yellow-900/20">
        <CardTitle className="text-lg">Add On Bill</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Current Balance */}
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
          <div className="text-sm text-gray-500">Current Balance</div>
          <div className="text-2xl font-bold">₹{customer.balanceAmount}</div>
        </div>

        {/* Dropdown item selector */}
        <div className="flex gap-3 items-end">
          {/* Select Item */}
          <div className="flex-1">
            <Label className="mb-1 block text-sm font-medium">
              Select Item
            </Label>
            <select
              value={selectedIndex ?? ''}
              onChange={(e) => handleSelectItem(Number(e.target.value))}
              className="w-full h-10 px-3 rounded-md border shadow-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-sm"
            >
              <option value="">-- Select --</option>
              {items.map((item, i) => (
                <option key={i} value={i}>
                  {item.name} — ₹{item.sellingPrice}
                </option>
              ))}
            </select>
          </div>

          {/* Add New Button */}
          <Button
            variant="outline"
            onClick={() => setShowAddItemForm(!showAddItemForm)}
            className="whitespace-nowrap h-10 px-4 border-yellow-500 text-yellow-700 hover:bg-yellow-100"
          >
            + Add New
          </Button>
        </div>

        {/* New item form */}
        {showAddItemForm && (
          <div className="space-y-2 border p-3 rounded-lg">
            <Label>Item Name</Label>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <Label>Selling Price</Label>
            <Input
              type="number"
              value={newSelling}
              onChange={(e) => setNewSelling(e.target.value)}
            />
            <Label>Cost Price</Label>
            <Input
              type="number"
              value={newCost}
              onChange={(e) => setNewCost(e.target.value)}
            />

            <Button className="w-full mt-2" onClick={handleAddItem}>
              Save Item
            </Button>
          </div>
        )}

        {/* Price */}
        <div className="space-y-2">
          <Label>Price</Label>
          <Input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>

        {/* Note */}
        <div className="space-y-2">
          <Label>Note</Label>
          <Input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional"
          />
        </div>

        {/* New Balance Preview */}
        <div className="bg-slate-50 p-3 rounded-lg flex justify-between">
          <span className="text-sm text-gray-500">New Balance:</span>
          <span className="font-bold text-lg">₹{newBalance}</span>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={loading || !price}
          className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
        >
          {loading ? 'Processing...' : 'Add to Bill'}
        </Button>
      </CardContent>
    </Card>
  );
}
