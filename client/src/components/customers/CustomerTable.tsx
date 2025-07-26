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
import { Eye } from 'lucide-react';

import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

interface Props {
  customers: Customer[];
}

export default function CustomerTable({ customers }: Props) {
  const navigate = useNavigate();

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Area</TableHead>
              <TableHead>Last Bill Amount</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-6 text-muted-foreground"
                >
                  No customers match your filters.
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => (
                <TableRow
                  key={customer._id}
                  className="group cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  onClick={() => navigate(`/customers/${customer._id}`)}
                >
                  <TableCell>{customer.customerCode}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {customer.mobile}
                        </div>
                      </div>

                      {/* Show eye icon only on hover */}
                      <Eye
                        className="ml-2 h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation(); // prevent row click
                          navigate(`/customers/${customer._id}`);
                        }}
                      />
                    </div>
                  </TableCell>

                  <TableCell>{customer.balanceAmount}</TableCell>
                  <TableCell>{customer.locality}</TableCell>
                  <TableCell>{customer.lastPaymentAmount}</TableCell>
                  <TableCell>
                    {new Date(customer.expiryDate).toLocaleDateString('en-IN')}
                  </TableCell>
                  <TableCell>
                    <Badge variant={customer.active ? 'default' : 'secondary'}>
                      {customer.active ? 'Active' : 'Expired'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {customers.length === 0 ? (
          <div className="text-center text-muted-foreground py-6">
            No customers match your filters.
          </div>
        ) : (
          customers.map((customer) => (
            <Link
              key={customer.sCode}
              to={`/customers/${customer.sCode}`}
              className="block rounded-lg border p-4 shadow-sm bg-white dark:bg-slate-900 hover:shadow-md transition"
            >
              <div className="flex justify-between items-center mb-2">
                <div className="font-semibold text-lg">
                  {customer.firstName} {customer.lastName}
                </div>
                <Badge
                  variant={
                    customer.status === 'Active' ? 'default' : 'secondary'
                  }
                >
                  {customer.status}
                </Badge>
              </div>

              <div className="text-sm text-muted-foreground mb-2">
                📞 {customer.phone}
              </div>

              {/* Grid for details */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <div>
                  <span className="font-medium">💳 Balance:</span> ₹
                  {customer.balance}
                </div>
                <div>
                  <span className="font-medium">🏠 Area:</span> {customer.area}
                </div>
                <div>
                  <span className="font-medium">🧾 Bill:</span> ₹
                  {customer.lastBillAmount}
                </div>
                <div>
                  <span className="font-medium">⏰ Exp:</span>{' '}
                  {new Date(customer.expired).toLocaleDateString('en-IN')}
                </div>
              </div>

              <div className="text-xs text-muted-foreground mt-2">
                Code: {customer.sCode}
              </div>
            </Link>
          ))
        )}
      </div>
    </>
  );
}
