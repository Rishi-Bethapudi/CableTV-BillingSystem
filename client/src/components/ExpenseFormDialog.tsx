
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';

interface ExpenseFormDialogProps {
  categories: string[];
  paymentMethods: string[];
  onExpenseAdded?: () => void;
}

export function ExpenseFormDialog({ categories, paymentMethods, onExpenseAdded }: ExpenseFormDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { register, handleSubmit, reset, setValue } = useForm();

  const onSubmitExpense = (values: any) => {
    console.log('Form submitted:', values);
    
    const expenseData = {
      description: values.description || '',
      amount: values.amount || 0,
      category: values.category || '',
      expense_date: values.expense_date || new Date().toISOString().split('T')[0],
      expense_number: values.expense_number || `EXP${Date.now()}`,
      payment_method: values.payment_method || '',
      vendor_name: values.vendor_name || '',
      receipt_number: values.receipt_number || '',
      notes: values.notes || ''
    };

    supabase
      .from('expenses')
      .insert(expenseData)
      .then(({ data, error }) => {
        if (error) {
          console.error('Error creating expense:', error);
        } else {
          console.log('Expense created successfully:', data);
          setIsDialogOpen(false);
          reset();
          onExpenseAdded?.();
        }
      });
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
          <DialogDescription>
            Create a new expense record.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" placeholder="Expense description" {...register('description')} />
          </div>
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="amount">Amount</Label>
            <Input type="number" id="amount" placeholder="0.00" {...register('amount')} />
          </div>
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="category">Category</Label>
            <Select onValueChange={(value) => setValue('category', value)} defaultValue={''}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="expense_date">Expense Date</Label>
            <Input type="date" id="expense_date" {...register('expense_date')} />
          </div>
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="payment_method">Payment Method</Label>
            <Select onValueChange={(value) => setValue('payment_method', value)} defaultValue={''}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a payment method" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method} value={method}>{method}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="vendor_name">Vendor Name</Label>
            <Input id="vendor_name" placeholder="Vendor name" {...register('vendor_name')} />
          </div>
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="receipt_number">Receipt Number</Label>
            <Input id="receipt_number" placeholder="Receipt number" {...register('receipt_number')} />
          </div>
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" placeholder="Additional notes" {...register('notes')} />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit(onSubmitExpense)}>
            Save Expense
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
