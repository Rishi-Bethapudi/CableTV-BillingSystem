// File: components/customer/CustomerMainDetails.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Customer } from '@/utils/data';

interface Props {
  //   customer: Customer;
}

function DetailCard({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <p className="text-sm text-muted-foreground">{title}</p>
      </CardHeader>
      <CardContent>
        <p className="text-base lg:text-lg font-semibold text-foreground">
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

export default function CustomerMainDetails({ customer }) {
  return (
    <div className="space-y-6">
      {/* Card 1: Customer Overview */}

      <Card>
        <CardHeader className="pb-0"></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Balance</TableHead>
                <TableHead className="font-semibold">Last Bill Date</TableHead>
                <TableHead className="font-semibold">Area</TableHead>
                <TableHead className="font-semibold">Mobile</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">
                  ₹{customer.balance}
                </TableCell>
                <TableCell className="font-medium">
                  {new Date(customer.lastBillDate).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </TableCell>
                <TableCell className="font-medium">{customer.area}</TableCell>
                <TableCell className="font-medium">
                  {customer.mobile.replace('+91 ', '')}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="text-lg">Hardware Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">STB Name</TableHead>
                <TableHead className="font-semibold">STB No</TableHead>
                <TableHead className="font-semibold">Card No</TableHead>
                <TableHead className="font-semibold">Membership No</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">
                  {customer.stbName}
                </TableCell>
                <TableCell>{customer.stbNumber}</TableCell>
                <TableCell className="text-slate-400">N/A</TableCell>
                <TableCell>{customer.membershipNo}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
