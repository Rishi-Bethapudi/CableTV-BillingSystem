
import { MoreHorizontal, Receipt, Edit, Trash2, FileText, Download, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface Expense {
  id: number;
  expenseNumber: string;
  date: string;
  category: string;
  vendor: string | null;
  paymentMethod: string;
  amount: number;
  description: string;
  receiptNumber: string | null;
  notes: string;
}

interface ExpenseTableProps {
  expenses: Expense[];
  searchTerm: string;
  categoryFilter: string;
  paymentMethodFilter: string;
  onClearFilters: () => void;
}

export function ExpenseTable({ 
  expenses, 
  searchTerm, 
  categoryFilter, 
  paymentMethodFilter, 
  onClearFilters 
}: ExpenseTableProps) {
  if (expenses.length === 0) {
    return (
      <Card>
        <CardContent className="p-0">
          <div className="text-center py-12">
            <Receipt className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              No expenses found
            </h3>
            <p className="text-slate-500 mb-4">
              {searchTerm || categoryFilter !== 'all' || paymentMethodFilter !== 'all' 
                ? 'Try adjusting your search criteria or clear filters.' 
                : 'Get started by adding your first expense.'
              }
            </p>
            {(searchTerm || categoryFilter !== 'all' || paymentMethodFilter !== 'all') && (
              <Button variant="outline" onClick={onClearFilters} className="mr-2">
                Clear Filters
              </Button>
            )}
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Expense #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>
                    <div className="font-medium">{expense.expenseNumber}</div>
                  </TableCell>
                  <TableCell>
                    {new Date(expense.date).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </TableCell>
                  <TableCell>{expense.category}</TableCell>
                  <TableCell>{expense.vendor}</TableCell>
                  <TableCell>{expense.paymentMethod}</TableCell>
                  <TableCell>₹{expense.amount}</TableCell>
                  <TableCell>{expense.description}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <FileText className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Expense
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          Download Receipt
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
