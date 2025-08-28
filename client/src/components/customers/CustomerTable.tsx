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
import { Eye, MapPin } from 'lucide-react';

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
      <div className="md:hidden space-y-1">
        {customers.length === 0 ? (
          <div className="text-center text-muted-foreground py-6">
            No customers match your filters.
          </div>
        ) : (
          customers.map((customer, index) => (
            <div
              key={index}
              className="bg-white p-2 w-full rounded-lg shadow-sm flex items-center"
              onClick={() => navigate('details')}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
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
              <div className="flex-1 ml-4">
                <p className="font-semibold text-gray-900">{customer.name}</p>
                <div className="text-xs text-gray-500 flex items-center space-x-2 mt-1">
                  <span>Active</span>
                  <span>|</span>
                  <span>
                    Due Date:{' '}
                    {new Date(customer.expiryDate).toLocaleDateString('en-IN')}
                  </span>
                </div>
                {customer.locality !== 'N/A' && (
                  <div className="text-xs text-gray-500 flex items-center mt-1">
                    <MapPin size={12} className="mr-1" />
                    {customer.locality}
                  </div>
                )}
              </div>
              <div
                className={`px-3 py-1 text-sm font-bold rounded-md ${
                  customer.balanceAmount > 0
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-800 text-white'
                }`}
              >
                ₹{customer.balanceAmount.toLocaleString('en-IN')}
                {customer.balanceAmount > 0 && (
                  <p className="text-xs font-normal text-right">Due</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
