import React, { useState, useEffect } from 'react';
import { Download, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '../ui/button';
import TransactionBillModal from './TransactionBillModal';
import type { Customer, Transaction } from '@/utils/data';
import apiClient from '@/utils/apiClient';

interface BalanceHistorySectionProps {
  isVisible: boolean;
  customer: Customer;
}

function BalanceHistorySection({
  isVisible,
  customer,
}: BalanceHistorySectionProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [showBillModal, setShowBillModal] = useState(false);
  const [balanceHistory, setBalanceHistory] = useState<Transaction[]>([]);

  // Sample transaction data based on your API structure

  useEffect(() => {
    // Fetch balance history from API if needed
    const fetchBalanceHistory = async () => {
      const res = await apiClient.get(
        `/customers/${customer._id}/transactions?page=${currentPage}`
      );
      setBalanceHistory(res.data);
      console.log(res.data);
      // Add your API call here to fetch real data
    };
    fetchBalanceHistory();
  }, [customer]);
  const handleExport = () => {
    console.log('Exporting balance history...');
    // Implement export functionality
  };

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowBillModal(true);
  };

  const handleDeleteTransaction = (transactionId: string) => {
    console.log('Deleting transaction:', transactionId);
    // Add your delete API call here
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
    });
  };

  if (!isVisible) return null;

  return (
    <>
      <Card className="w-100">
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
                  <TableHead className="text-xs">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {balanceHistory.map((entry, index) => (
                  <TableRow
                    key={entry._id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleTransactionClick(entry)}
                  >
                    <TableCell className="text-xs">
                      {formatDate(entry.createdAt)}
                    </TableCell>
                    <TableCell className="text-xs">{entry.type}</TableCell>
                    <TableCell
                      className={`text-xs ${
                        entry.amount < 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      ₹{Math.abs(entry.amount)}
                    </TableCell>
                    <TableCell className="text-xs">
                      ₹{entry.balanceAfter}
                    </TableCell>
                    <TableCell className="text-xs text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTransaction(entry._id);
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </TableCell>
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

      {/* Transaction Bill Modal */}
      {showBillModal && selectedTransaction && (
        <TransactionBillModal
          transaction={selectedTransaction}
          customer={customer}
          onClose={() => setShowBillModal(false)}
        />
      )}
    </>
  );
}

export default BalanceHistorySection;
