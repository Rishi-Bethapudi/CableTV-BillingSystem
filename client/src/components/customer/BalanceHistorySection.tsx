import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Download } from 'lucide-react';

interface BalanceHistorySectionProps {
  isVisible: boolean;
}

function BalanceHistorySection({ isVisible }: BalanceHistorySectionProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Sample data
  const balanceHistory = [
    {
      date: '2025-06-01',
      type: 'Payment',
      amount: -350,
      balance: 0,
      description: 'Monthly Payment',
    },
    {
      date: '2025-05-01',
      type: 'Payment',
      amount: -350,
      balance: 350,
      description: 'Monthly Payment',
    },
    {
      date: '2025-04-15',
      type: 'Charge',
      amount: 50,
      balance: 700,
      description: 'Additional Service',
    },
    {
      date: '2025-04-01',
      type: 'Payment',
      amount: -350,
      balance: 650,
      description: 'Monthly Payment',
    },
    {
      date: '2025-03-01',
      type: 'Payment',
      amount: -350,
      balance: 1000,
      description: 'Monthly Payment',
    },
  ];

  const handleExport = () => {
    console.log('Exporting balance history...');
  };

  if (!isVisible) return null;

  return (
    <Card className="w-80">
      <CardHeader className="bg-gray-50 dark:bg-gray-900/20">
        <CardTitle className="text-lg flex items-center justify-between">
          Balance History
          <Button size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-96 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Date</TableHead>
                <TableHead className="text-xs">Type</TableHead>
                <TableHead className="text-xs">Amount</TableHead>
                <TableHead className="text-xs">Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {balanceHistory.map((entry, index) => (
                <TableRow key={index}>
                  <TableCell className="text-xs">
                    {new Date(entry.date).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                    })}
                  </TableCell>
                  <TableCell className="text-xs">{entry.type}</TableCell>
                  <TableCell
                    className={`text-xs ${
                      entry.amount < 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    ₹{Math.abs(entry.amount)}
                  </TableCell>
                  <TableCell className="text-xs">₹{entry.balance}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="p-4 border-t">
          <div className="flex justify-between items-center text-sm">
            <span>Page {currentPage} of 1</span>
            <div className="space-x-2">
              <Button size="sm" variant="outline" disabled>
                Previous
              </Button>
              <Button size="sm" variant="outline" disabled>
                Next
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default BalanceHistorySection;
