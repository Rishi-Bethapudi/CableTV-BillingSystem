import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Customer } from '@/types/customer.types';

interface Props {
  customers: Customer[];
  loading?: boolean;
  onSort?: (field: string, order: 'asc' | 'desc') => void;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
}

const SortIcon = ({
  active,
  order,
}: {
  active: boolean;
  order: 'asc' | 'desc' | undefined;
}) => (active ? (order === 'asc' ? '▲' : '▼') : null);

export default function CustomerTable({
  customers = [],
  loading,
  onSort,
  sortField,
  sortOrder,
}: Props) {
  const navigate = useNavigate();
  const toggleSort = (field: string) => {
    if (!onSort) return;
    const direction =
      sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
    onSort(field, direction);
  };

  if (loading)
    return (
      <p className="text-center text-muted-foreground py-6">
        Loading customers...
      </p>
    );

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => toggleSort('name')}
            >
              Name <SortIcon active={sortField === 'name'} order={sortOrder} />
            </TableHead>
            <TableHead>Devices</TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => toggleSort('balanceAmount')}
            >
              Balance{' '}
              <SortIcon
                active={sortField === 'balanceAmount'}
                order={sortOrder}
              />
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => toggleSort('locality')}
            >
              Area{' '}
              <SortIcon active={sortField === 'locality'} order={sortOrder} />
            </TableHead>
            <TableHead>Last Payment</TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => toggleSort('earliestExpiry')}
            >
              Expiry{' '}
              <SortIcon
                active={sortField === 'earliestExpiry'}
                order={sortOrder}
              />
            </TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {customers.length === 0 && (
            <TableRow>
              <TableCell
                className="text-center py-6 text-muted-foreground"
                colSpan={8}
              >
                No customers match your filters.
              </TableCell>
            </TableRow>
          )}

          {customers.map((c) => {
            const expired =
              c.earliestExpiry && new Date(c.earliestExpiry) < new Date();
            return (
              <TableRow
                key={c._id}
                className="cursor-pointer hover:bg-muted"
                onClick={() => navigate(`/customers/${c._id}`)}
              >
                <TableCell>{c.customerCode}</TableCell>
                <TableCell>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-muted-foreground text-xs">
                    {c.contactNumber}
                  </div>
                </TableCell>
                <TableCell className="text-xs">
                  {c.devices?.map((d, i) => (
                    <div key={i}>
                      {d.deviceModel && `${d.deviceModel} `}
                      {d.stbNumber && `STB:${d.stbNumber} `}
                      {d.cardNumber && `Card:${d.cardNumber}`}
                    </div>
                  ))}
                </TableCell>
                <TableCell
                  className={
                    c.balanceAmount > 0 ? 'text-red-600' : 'text-green-600'
                  }
                >
                  ₹{c.balanceAmount.toLocaleString('en-IN')}
                </TableCell>
                <TableCell>{c.locality}</TableCell>
                <TableCell>
                  ₹{(c.lastPaymentAmount ?? 0).toLocaleString('en-IN')}
                </TableCell>
                <TableCell className={expired ? 'text-red-600' : ''}>
                  {c.earliestExpiry
                    ? new Date(c.earliestExpiry).toLocaleDateString('en-IN')
                    : 'N/A'}
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      expired
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-800'
                    }
                  >
                    {expired ? 'Expired' : 'Active'}
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
