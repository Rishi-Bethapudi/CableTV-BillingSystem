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
import InvoicePDFModal from './InvoicePDFModal';
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

export default function BalanceHistorySection({
  isVisible,
  customer,
  onRefresh,
}: BalanceHistorySectionProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [showBillModal, setShowBillModal] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    pages: 1,
    limit: 15,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isVisible && customer._id) fetchTransactions();
  }, [customer._id, currentPage, isVisible]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(
        `/customers/${customer._id}/transactions`,
        { params: { page: currentPage, limit: 15 } }
      );

      setTransactions(res.data.transactions);
      setPagination(res.data.pagination);
    } catch {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const openPDFModal = (transaction: Transaction, e: any) => {
    e.stopPropagation();
    setSelectedTransaction(transaction);
    setShowBillModal(true);
  };

  const handleDeleteTransaction = async (transactionId: string, e: any) => {
    e.stopPropagation();
    if (!window.confirm('Delete this transaction?')) return;

    try {
      await apiClient.delete(`/transactions/${transactionId}`);
      toast.success('Transaction deleted');
      fetchTransactions();
      onRefresh();
    } catch {
      toast.error('Failed to delete transaction');
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.pages) setCurrentPage(page);
  };

  if (!isVisible) return null;

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  return (
    <>
      <Card className="w-full">
        <CardHeader className="bg-gray-50 dark:bg-gray-900/20">
          <CardTitle className="text-lg flex items-center justify-between">
            Balance History
            <Button size="sm" disabled={loading}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-sm">Loading...</div>
          ) : (
            <>
              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {transactions.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center py-8 text-gray-500"
                        >
                          No transactions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      transactions.map((t) => (
                        <TableRow
                          key={t._id}
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={(e) => openPDFModal(t, e)}
                        >
                          <TableCell>{formatDate(t.createdAt)}</TableCell>
                          <TableCell>{t.type}</TableCell>
                          <TableCell
                            className={
                              t.amount < 0 ? 'text-green-600' : 'text-red-600'
                            }
                          >
                            ₹{Math.abs(t.amount)}
                          </TableCell>
                          <TableCell>₹{t.balanceAfter}</TableCell>

                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-0 h-6 w-6"
                              onClick={(e) => handleDeleteTransaction(t._id, e)}
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

              {/* Pagination */}
              <div className="p-4 border-t flex justify-between text-sm">
                <span>
                  Page {pagination.page} of {pagination.pages}
                </span>
                <div className="space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pagination.page === 1}
                    onClick={() => handlePageChange(pagination.page - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pagination.page === pagination.pages}
                    onClick={() => handlePageChange(pagination.page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* PDF Modal */}
      {showBillModal && selectedTransaction && (
        <InvoicePDFModal
          open={showBillModal}
          onClose={() => setShowBillModal(false)}
          transactionId={selectedTransaction._id}
        />
      )}
    </>
  );
}
