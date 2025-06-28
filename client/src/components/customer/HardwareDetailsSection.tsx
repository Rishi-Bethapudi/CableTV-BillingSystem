import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import exp from 'constants';

interface CustomerData {
  stbName: string;
  stbNumber: string;
  membershipNo: string;
}

interface HardwareDetailsSectionProps {
  customer: CustomerData;
  isVisible: boolean;
}

function HardwareDetailsSection({
  customer,
  isVisible,
}: HardwareDetailsSectionProps) {
  if (!isVisible) return null;

  return (
    <Card className="w-80">
      <CardHeader className="bg-cyan-50 dark:bg-cyan-900/20">
        <CardTitle className="text-lg">Hardware Details</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="space-y-3">
          <div>
            <div className="text-sm text-gray-600">STB Name</div>
            <div className="font-medium">{customer.stbName}</div>
          </div>

          <div>
            <div className="text-sm text-gray-600">STB Number</div>
            <div className="font-medium">{customer.stbNumber}</div>
          </div>

          <div>
            <div className="text-sm text-gray-600">Card Number</div>
            <div className="font-medium text-gray-400">Not Available</div>
          </div>

          <div>
            <div className="text-sm text-gray-600">Membership Number</div>
            <div className="font-medium">{customer.membershipNo}</div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Device</TableHead>
                <TableHead className="text-xs">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="text-xs">Set Top Box</TableCell>
                <TableCell className="text-xs">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Active
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-xs">Smart Card</TableCell>
                <TableCell className="text-xs">
                  <span className="inline-block w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                  N/A
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export default HardwareDetailsSection;
