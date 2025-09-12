import { Button } from '@/components/ui/button';
import { Eye, Download } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Expense } from '@/utils/data';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
interface ExpenseTableProps {
  expenses: Expense[];
  loading: boolean;
  searchTerm: string;
  categoryFilter: string;
  paymentMethodFilter: string;
  onClearFilters: () => void;
}

export function ExpenseTable({
  expenses,
  loading,
  searchTerm,
  categoryFilter,
  paymentMethodFilter,
  onClearFilters,
}: ExpenseTableProps) {
  console.log('Rendering ExpenseTable with expenses:', expenses);
  const handleDownloadReceipt = (expense: Expense) => {
    // Simulate receipt download
    console.log(`Downloading receipt for expense:`, expense);
    toast.info(`Downloading receipt for ${expense.expenseNumber}`);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-12 bg-slate-200 dark:bg-slate-700 rounded"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Expense #</TableHead>
              <TableHead className="whitespace-nowrap">Date</TableHead>
              <TableHead className="whitespace-nowrap">Category</TableHead>
              <TableHead className="whitespace-nowrap hidden sm:table-cell">
                Vendor
              </TableHead>
              <TableHead className="whitespace-nowrap hidden md:table-cell">
                Payment Method
              </TableHead>
              <TableHead className="whitespace-nowrap text-right">
                Amount
              </TableHead>
              <TableHead className="whitespace-nowrap hidden lg:table-cell">
                Description
              </TableHead>
              <TableHead className="whitespace-nowrap text-center">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell className="font-medium whitespace-nowrap">
                  {expense.expenseNumber}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {format(new Date(expense.expenseDate), 'do MMM yy')}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-xs">
                    {expense.category}
                  </span>
                </TableCell>
                <TableCell className="whitespace-nowrap hidden sm:table-cell">
                  {expense.vendor || '-'}
                </TableCell>
                <TableCell className="whitespace-nowrap hidden md:table-cell">
                  {expense.paymentMethod}
                </TableCell>
                <TableCell className="text-right font-semibold whitespace-nowrap">
                  ₹{expense.amount.toLocaleString()}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="truncate max-w-xs">{expense.description}</div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-center space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDownloadReceipt(expense)}
                      className="h-8 w-8"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        /* View details */
                      }}
                      className="h-8 w-8"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
