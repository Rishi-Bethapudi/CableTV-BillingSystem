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
import { toast } from 'react-toastify';
import TransactionBillModal from './TransactionBillModal';
import type { Customer, Transaction } from '@/utils/data';
import apiClient from '@/utils/apiClient';

interface BalanceHistorySectionProps {
  isVisible: boolean;
  customer: Customer;
  onRefresh: () => void;
}

interface PaginationInfo {
  total: number;
  page: number;
  pages: number;
  limit: number;
}

interface TransactionsResponse {
  transactions: Transaction[];
  pagination: PaginationInfo;
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
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    pages: 1,
    limit: 10,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isVisible && customer._id) {
      fetchTransactions();
    }
  }, [customer._id, currentPage, isVisible]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<TransactionsResponse>(
        `/customers/${customer._id}/transactions`,
        {
          params: {
            page: currentPage,
            limit: 15,
          },
        }
      );

      setBalanceHistory(response.data.transactions);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      // Handle error (show toast message, etc.)
      toast.error('Failed to load transactions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    console.log('Exporting balance history...');
    // Implement export functionality
  };

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowBillModal(true);
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    try {
      await apiClient.delete(`/transactions/${transactionId}`);
      // Refresh the transactions list
      fetchTransactions();
      // Show success message
      console.log('Transaction deleted successfully');
    } catch (error) {
      console.error('Error deleting transaction:', error);
      // Show error message
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setCurrentPage(newPage);
    }
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
            <Button size="sm" onClick={handleExport} disabled={loading}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">
                Loading transactions...
              </p>
            </div>
          ) : (
            <>
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
                    {balanceHistory.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center py-8 text-gray-500"
                        >
                          No transactions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      balanceHistory.map((entry) => (
                        <TableRow
                          key={entry._id}
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => handleTransactionClick(entry)}
                        >
                          <TableCell className="text-xs">
                            {formatDate(entry.createdAt)}
                          </TableCell>
                          <TableCell className="text-xs">
                            {entry.type}
                          </TableCell>
                          <TableCell
                            className={`text-xs ${
                              entry.amount < 0
                                ? 'text-green-600'
                                : 'text-red-600'
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
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="p-4 border-t">
                <div className="flex justify-between items-center text-sm">
                  <span>
                    Page {currentPage} of {pagination.pages}
                  </span>
                  <div className="space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === pagination.pages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
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
