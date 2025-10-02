import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Customer } from '@/utils/data';
import { MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  customers: Customer[];
  loading?: boolean;
  onSortChange?: (field: string) => void;
  onOrderChange?: (order: 'asc' | 'desc') => void;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
}

export default function CustomerTable({
  customers,
  loading,
  onSortChange,
  onOrderChange,
  sortField,
  sortOrder,
}: Props) {
  const navigate = useNavigate();

  const handleSort = (field: string) => {
    if (!onSortChange || !onOrderChange) return;

    // Toggle order if same field is clicked
    const newOrder =
      sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
    onSortChange(field);
    onOrderChange(newOrder);
  };

  if (loading) {
    return (
      <div className="text-center text-muted-foreground py-6">
        Loading customers...
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block rounded-md border overflow-x-auto">
        <Table className="min-w-full table-auto">
          <TableHeader>
            <TableRow>
              <TableHead>Customer Code</TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort('name')}
              >
                Name{' '}
                {sortField === 'name' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </TableHead>
              <TableHead>Hardware</TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort('balanceAmount')}
              >
                Balance{' '}
                {sortField === 'balanceAmount'
                  ? sortOrder === 'asc'
                    ? '↑'
                    : '↓'
                  : ''}
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort('locality')}
              >
                Area{' '}
                {sortField === 'locality'
                  ? sortOrder === 'asc'
                    ? '↑'
                    : '↓'
                  : ''}
              </TableHead>
              <TableHead>Last Bill Amount</TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort('earliestExpiry')}
              >
                Expires{' '}
                {sortField === 'earliestExpiry'
                  ? sortOrder === 'asc'
                    ? '↑'
                    : '↓'
                  : ''}
              </TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {customers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-6 text-muted-foreground"
                >
                  No customers match your filters.
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => {
                const isExpired =
                  new Date(customer?.earliestExpiry) < new Date();
                return (
                  <TableRow
                    key={customer._id}
                    className="group cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    onClick={() =>
                      navigate(`/customers/${customer._id}`, {
                        state: { customer },
                      })
                    }
                  >
                    <TableCell className="py-2 px-2 text-sm">
                      {customer.customerCode}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {customer.mobile}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-2 px-2 text-xs text-gray-700">
                      <div className="flex flex-col gap-0.5">
                        {customer.stbName && (
                          <span>STB: {customer.stbName}</span>
                        )}
                        {customer.stbNumber && (
                          <span>STB No: {customer.stbNumber}</span>
                        )}
                        {customer.cardNumber && (
                          <span>Card: {customer.cardNumber}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell
                      className={`py-2 px-2 text-sm font-semibold ${
                        customer.balanceAmount < 0
                          ? 'text-red-600'
                          : 'text-green-600'
                      }`}
                    >
                      ₹{customer.balanceAmount.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell className="py-2 px-2 text-sm">
                      {customer.locality}
                    </TableCell>
                    <TableCell className="py-2 px-2 text-sm">
                      ₹{customer.lastPaymentAmount.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell
                      className={`py-2 px-2 text-sm font-medium ${
                        isExpired ? 'text-red-600' : 'text-gray-800'
                      }`}
                    >
                      {new Date(customer?.earliestExpiry).toLocaleDateString(
                        'en-IN'
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          customer.active && !isExpired
                            ? 'default'
                            : 'destructive'
                        }
                        className={`px-2 py-1 text-sm ${
                          customer.active && !isExpired
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {customer.active && !isExpired ? 'Active' : 'Expired'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-1">
        {customers.length === 0 ? (
          <div className="text-center text-muted-foreground py-6">
            No customers match your filters.
          </div>
        ) : (
          customers.map((customer, index) => (
            <div
              key={customer._id}
              className="bg-white p-1.5 w-full rounded-lg shadow-sm flex items-center"
              onClick={() => navigate(`/customers/${customer._id}`)}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                  [
                    'bg-blue-500',
                    'bg-purple-500',
                    'bg-orange-500',
                    'bg-teal-500',
                  ][index % 4]
                }`}
              >
                {customer.name.charAt(0)}
              </div>

              <div className="flex-1 ml-3">
                <p className="font-semibold text-gray-900 truncate max-w-[120px]">
                  {customer.name}
                </p>
                <div className="text-xs flex items-center space-x-2 mt-0.5">
                  <span
                    className={
                      customer.active ? 'text-green-600' : 'text-red-600'
                    }
                  >
                    {customer.active ? 'Active' : 'Expired'}
                  </span>
                  <span className="text-gray-500">|</span>
                  <span
                    className={
                      customer.active ? 'text-gray-500' : 'text-red-600'
                    }
                  >
                    Due:{' '}
                    {new Date(customer?.earliestExpiry).toLocaleDateString(
                      'en-IN'
                    )}
                  </span>
                </div>

                {customer.locality !== 'N/A' && (
                  <div className="text-xs text-gray-500 flex items-center mt-0.5 truncate max-w-[100px]">
                    <MapPin size={12} className="mr-1 shrink-0" />
                    {customer.locality}
                  </div>
                )}
              </div>

              <div
                className={`px-2 py-0.5 text-xs font-bold rounded-md mr-2 ${
                  customer.balanceAmount > 0
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                ₹{customer.balanceAmount.toLocaleString('en-IN')}
                <p className="text-[10px] font-normal text-right">
                  {customer.balanceAmount > 0 ? 'Due' : 'Adv'}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
