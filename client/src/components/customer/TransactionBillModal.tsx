import React, { useRef, useEffect } from 'react';
import {
  X,
  Printer,
  Download,
  Receipt,
  Building2,
  User,
  Calendar,
  CreditCard,
  Hash,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Customer, Transaction } from '@/utils/data';

interface TransactionBillModalProps {
  transaction: Transaction;
  customer: Customer;
  onClose: () => void;
}

function TransactionBillModal({
  transaction,
  customer,
  onClose,
}: TransactionBillModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  const handlePrintBill = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const billContent =
      document.getElementById('bill-content')?.innerHTML || '';

    printWindow.document.write(`
      <html>
        <head>
          <title>Transaction Bill - ${transaction.receiptNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .bill-header { text-align: center; margin-bottom: 30px; }
            .bill-details { margin-bottom: 20px; }
            .detail-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
            .amount { font-size: 18px; font-weight: bold; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>${billContent}</body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Handle click outside to close modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);

    // Prevent body scrolling when modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        ref={modalRef}
        className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Transaction Bill
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4" id="bill-content">
          {/* Bill Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Building2 className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-800">
                Cable TV Services
              </h1>
            </div>
            <p className="text-sm text-gray-600">Transaction Receipt</p>
          </div>

          {/* Receipt Details */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 flex items-center gap-1">
                <Hash className="h-4 w-4" />
                Receipt No:
              </span>
              <span className="font-semibold">{transaction.receiptNumber}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 flex items-center gap-1">
                <FileText className="h-4 w-4" />
                Invoice ID:
              </span>
              <span className="font-semibold">{transaction.invoiceId}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Date & Time:
              </span>
              <div className="text-right">
                <div className="font-semibold">
                  {formatDate(transaction.createdAt)}
                </div>
                <div className="text-xs text-gray-500">
                  {formatTime(transaction.createdAt)}
                </div>
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="border-t border-b py-4 mb-4">
            <h3 className="font-semibold mb-2 flex items-center gap-1">
              <User className="h-4 w-4" />
              Customer Details
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Name:</span>
                <span className="font-medium">{customer.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Customer ID:</span>
                <span className="font-mono text-sm">
                  {transaction.customerId.slice(-8)}
                </span>
              </div>
              {customer.mobile && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Phone:</span>
                  <span>{customer.mobile}</span>
                </div>
              )}
            </div>
          </div>

          {/* Transaction Details */}
          <div className="space-y-3 mb-6">
            <h3 className="font-semibold flex items-center gap-1">
              <CreditCard className="h-4 w-4" />
              Transaction Details
            </h3>

            <div className="bg-gray-50 p-3 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Type:</span>
                <span
                  className={`font-medium px-2 py-1 rounded text-xs ${
                    transaction.type === 'Payment'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {transaction.type}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Method:</span>
                <span className="font-medium">{transaction.method}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Collected By:</span>
                <span className="font-medium">
                  {transaction.collectedBy.name}
                </span>
              </div>

              {transaction.note && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Note:</span>
                  <span className="font-medium text-right max-w-32 text-sm">
                    {transaction.note}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Amount Summary */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Balance Before:</span>
              <span>₹{transaction.balanceBefore}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Transaction Amount:</span>
              <span
                className={`font-semibold ${
                  transaction.amount < 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {transaction.amount < 0 ? '-' : '+'}₹
                {Math.abs(transaction.amount)}
              </span>
            </div>

            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Balance After:</span>
              <span>₹{transaction.balanceAfter}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6 pt-4 border-t text-xs text-gray-500">
            <p>Thank you for your business!</p>
            <p>Generated on {formatDate(new Date().toISOString())}</p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex gap-3 p-4 border-t bg-gray-50">
          <Button
            onClick={handlePrintBill}
            className="flex-1 flex items-center justify-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button
            onClick={handleDownloadPDF}
            className="flex-1 flex items-center justify-center gap-2"
            variant="secondary"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>
    </div>
  );
}

export default TransactionBillModal;
