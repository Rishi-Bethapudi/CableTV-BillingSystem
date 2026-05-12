// AgentPerformance.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  X,
  Printer,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { SectionCard, fmtINR, fmtDate, fmtTime } from '../Atoms';
import * as XLSX from 'xlsx';

const PERF_PAGE_SIZE = 6;

// Mock transactions data
const MOCK_TRANSACTIONS = Array.from({ length: 18 }, (_, i) => ({
  id: `TXN-${String(1000 + i).padStart(4, '0')}`,
  transactionId: `IVO${11076 + i}`,
  customer: [
    'C. Ramesh',
    'P. Latha',
    'K. Suresh',
    'M. Anand',
    'S. Devi',
    'R. Pillai',
  ][i % 6],
  customerCode: [
    '100740915',
    '100740916',
    '100740917',
    '100740918',
    '100740919',
    '100740920',
  ][i % 6],
  customerPhone: [
    '6309436569',
    '9441995758',
    '9876543210',
    '9123456789',
    '9988776655',
    '9876543211',
  ][i % 6],
  customerAddress: [
    'Colony Lane 1, Kandrapadu',
    'Main Road, OBK V Palem',
    'GNR Towers, Gannavaram',
    'Prasadampadu, Vijayawada',
    'Temple Street, Nuzvid',
    'Bus Stand Road, Eluru',
  ][i % 6],
  area: ['Kandrapadu', 'OBK V Palem', 'Gannavaram'][i % 3],
  amount: [499, 699, 349, 849, 249, 599][i % 6],
  item: [
    'APSFL Basic',
    'APSFL Premium',
    'APSFL Standard',
    'APSFL Basic Plus',
    'APSFL Family',
    'APSFL Basic',
  ][i % 6],
  date: new Date(Date.now() - i * 86400000 * 0.7).toISOString(),
  mode: ['Cash', 'UPI', 'Online', 'Card', 'NEFT'][i % 5],
  status: i % 7 === 0 ? 'pending' : 'collected',
  invoiceDate: '07-May-2026',
  billingPeriod: '07-May-2026 to 05-Jun-2026',
  stbName: 'DASAN - Corpus',
  stbId: `DSNW202de${String(100 + i).slice(1)}`,
}));

// Bill Preview Component
function BillPreviewModal({ transaction, open, onClose }) {
  if (!transaction) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center justify-between">
            <span>Invoice Details</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="gap-1.5"
            >
              <Printer size={14} /> Print
            </Button>
          </DialogTitle>
          <DialogDescription>
            Invoice #{transaction.transactionId}
          </DialogDescription>
        </DialogHeader>

        {/* Bill UI - Matching the screenshot */}
        <div className="space-y-4 mt-4 p-4 border rounded-lg">
          {/* Header */}
          <div className="text-center border-b pb-4">
            <h2 className="text-lg font-bold">MAHI COMMUNICATIONS</h2>
            <p className="text-xs text-gray-600 mt-1">
              KANDRAPADU, O B K V PALEM
              <br />
              GNR Towers Road, SER Center, Prasadampadu,
              <br />
              currency nagar, Vijayawada, Andhra Pradesh 521108, India
              <br />
              Phone: 9441995758 | GST: N/A | Phone Pay No: 9441775758
            </p>
          </div>

          {/* Invoice Info */}
          <div className="flex justify-between text-sm">
            <div>
              <p>
                <span className="font-semibold">Invoice No:</span>{' '}
                {transaction.transactionId}
              </p>
              <p>
                <span className="font-semibold">Invoice Date:</span>{' '}
                {transaction.invoiceDate}
              </p>
            </div>
          </div>

          {/* Bill To */}
          <div className="border-t border-b py-3 text-sm">
            <p className="font-semibold">Bill To:</p>
            <p>{transaction.customer}</p>
            <p>{transaction.customerAddress}</p>
            <p>
              <span className="font-semibold">Customer Code:</span>{' '}
              {transaction.customerCode}
            </p>
            <p>
              <span className="font-semibold">Phone:</span>{' '}
              {transaction.customerPhone}
            </p>
            <p>
              <span className="font-semibold">Date:</span>{' '}
              {transaction.billingPeriod}
            </p>
            <p>
              <span className="font-semibold">Created By:</span> MAHI
              COMMUNICATIONS
            </p>
          </div>

          {/* Items Table */}
          <table className="w-full text-sm border">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left p-2">S.No.</th>
                <th className="text-left p-2">Item</th>
                <th className="text-left p-2">Quantity</th>
                <th className="text-left p-2">HSN Code</th>
                <th className="text-left p-2">GST</th>
                <th className="text-right p-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-2">1</td>
                <td className="p-2">{transaction.item}</td>
                <td className="p-2">1</td>
                <td className="p-2">-</td>
                <td className="p-2">₹0</td>
                <td className="p-2 text-right">{fmtINR(transaction.amount)}</td>
              </tr>
            </tbody>
          </table>

          {/* Hardware Detail */}
          <div className="border-t pt-3 text-sm">
            <p className="font-semibold">Hardware Detail:</p>
            <p>Stb Name: {transaction.stbName}</p>
            <p>Stb: {transaction.stbId}</p>
            <p>Mem. no: {transaction.customerCode}</p>
          </div>

          {/* Footer */}
          <div className="border-t pt-3 text-xs text-gray-500">
            <p>Payment On {fmtDate(transaction.date)}</p>
            <p>Recorded On {fmtDate(transaction.date)}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Export Options Dialog
function ExportOptionsDialog({ open, onClose, onExport, collections }) {
  const [selectedOption, setSelectedOption] = useState('all');

  const exportOptions = [
    {
      value: 'all',
      label: 'All Collections',
      description: 'Export entire collection history',
    },
    {
      value: 'month',
      label: 'This Month',
      description: 'Export current month collections',
    },
    {
      value: 'today',
      label: 'Today',
      description: "Export today's collections",
    },
  ];

  const handleExport = () => {
    let dataToExport = [];
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const today = now.toDateString();

    switch (selectedOption) {
      case 'today':
        dataToExport = collections.filter(
          (c) => new Date(c.date).toDateString() === today,
        );
        break;
      case 'month':
        dataToExport = collections.filter((c) => {
          const date = new Date(c.date);
          return (
            date.getMonth() === currentMonth &&
            date.getFullYear() === currentYear
          );
        });
        break;
      default:
        dataToExport = [...collections];
    }

    const excelData = dataToExport.map((txn) => ({
      'Transaction ID': txn.transactionId,
      'Customer Name': txn.customer,
      'Customer Code': txn.customerCode,
      Phone: txn.customerPhone,
      Area: txn.area,
      Item: txn.item,
      Amount: txn.amount,
      Date: fmtDate(txn.date),
      Time: fmtTime(txn.date),
      'Payment Mode': txn.mode,
      Status: txn.status === 'collected' ? 'Collected' : 'Pending',
      'Billing Period': txn.billingPeriod,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    const filename = `collections_${selectedOption}_${fmtDate(new Date().toISOString())}.xlsx`;
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Collections');
    XLSX.writeFile(workbook, filename);

    onExport(selectedOption);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">
            Export Collections
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Select which collections to export to Excel
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {exportOptions.map((option) => (
            <label
              key={option.value}
              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedOption === option.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
              onClick={() => setSelectedOption(option.value)}
            >
              <div className="flex items-center h-5">
                <input
                  type="radio"
                  name="exportOption"
                  value={option.value}
                  checked={selectedOption === option.value}
                  onChange={() => setSelectedOption(option.value)}
                  className="w-4 h-4 text-blue-600"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {option.label}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {option.description}
                </p>
              </div>
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleExport}
            className="bg-slate-900 hover:bg-slate-700 text-white gap-1.5"
          >
            <Download size={14} />
            Export
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function CollectionPerformanceCard({ agent }) {
  const s = agent.stats;
  const [page, setPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showBillModal, setShowBillModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const totalPages = Math.ceil(MOCK_TRANSACTIONS.length / PERF_PAGE_SIZE);
  const paginated = MOCK_TRANSACTIONS.slice(
    (page - 1) * PERF_PAGE_SIZE,
    page * PERF_PAGE_SIZE,
  );

  const handleViewBill = (transaction) => {
    setSelectedTransaction(transaction);
    setShowBillModal(true);
  };

  const handleExport = (option) => {
    console.log(`Exported ${option} collections`);
  };

  // Summary cards - Updated to show more relevant info
  const summaryCards = [
    {
      label: 'Total Collections',
      value: s.totalCollections.toLocaleString(),
      amount: fmtINR(s.totalAmountCollected),
      color: 'border-slate-200 bg-gradient-to-br from-slate-50 to-white',
      icon: TrendingUp,
    },
    {
      label: 'This Month',
      value: s.monthCollections,
      amount: fmtINR(s.monthAmount),
      color: 'border-blue-200 bg-blue-50',
    },
    {
      label: 'Today',
      value: s.todayCollections,
      amount: fmtINR(s.todayAmount),
      color: 'border-emerald-200 bg-emerald-50',
    },
    {
      label: 'Pending',
      value: s.pendingCollections,
      amount: '',
      color: 'border-amber-200 bg-amber-50',
    },
    {
      label: 'Avg/Day',
      value: s.avgDailyCollections,
      amount: '',
      color: 'border-violet-200 bg-violet-50',
    },
  ];

  return (
    <>
      <SectionCard
        title="Collection Performance"
        icon={TrendingUp}
        description="Transactions and collection analytics"
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowExportModal(true)}
            className="gap-1.5 h-8 text-xs"
          >
            <Download size={12} />
            Export
          </Button>
        }
      >
        {/* Summary Cards - Updated Layout */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          {summaryCards.map(({ label, value, amount, color, icon: Icon }) => (
            <div
              key={label}
              className={`rounded-xl border p-3 ${color} hover:shadow-md transition-all cursor-pointer`}
            >
              {Icon && <Icon size={16} className="text-slate-500 mb-2" />}
              <p className="text-lg font-bold text-slate-900">{value}</p>
              <p className="text-xs font-medium text-slate-600 mt-1">{label}</p>
              {amount && (
                <p className="text-xs text-slate-500 mt-0.5 font-semibold">
                  {amount}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Transactions — Desktop table with clickable rows */}
        <div className="hidden sm:block">
          <div className="rounded-xl border border-slate-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {[
                    'Transaction ID',
                    'Customer',
                    'Area',
                    'Amount',
                    'Date',
                    'Mode',
                    'Status',
                    'Action',
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((txn) => (
                  <tr
                    key={txn.id}
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors group"
                  >
                    <td className="px-3 py-2.5 font-mono text-xs text-slate-600">
                      {txn.transactionId}
                    </td>
                    <td className="px-3 py-2.5 font-medium text-slate-800">
                      {txn.customer}
                    </td>
                    <td className="px-3 py-2.5 text-slate-500">{txn.area}</td>
                    <td className="px-3 py-2.5 font-semibold text-slate-900">
                      {fmtINR(txn.amount)}
                    </td>
                    <td className="px-3 py-2.5 text-slate-500">
                      {fmtDate(txn.date)}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                        {txn.mode}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          txn.status === 'collected'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {txn.status === 'collected' ? 'Collected' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewBill(txn)}
                        className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Eye size={14} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Transactions — Mobile cards with click to view bill */}
        <div className="sm:hidden space-y-2">
          {paginated.map((txn) => (
            <div
              key={txn.id}
              className="border border-slate-100 rounded-xl p-3 active:bg-slate-50 cursor-pointer"
              onClick={() => handleViewBill(txn)}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {txn.customer}
                  </p>
                  <p className="text-xs text-slate-400">
                    {txn.transactionId} · {fmtDate(txn.date)}
                  </p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    txn.status === 'collected'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {txn.status === 'collected' ? 'Collected' : 'Pending'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900">
                    {fmtINR(txn.amount)}
                  </span>
                  <span className="text-xs text-slate-400 ml-2">
                    {txn.area}
                  </span>
                </div>
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {txn.mode}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
            <span className="text-xs text-slate-400">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft size={13} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight size={13} />
              </Button>
            </div>
          </div>
        )}
      </SectionCard>

      {/* Bill Preview Modal */}
      <BillPreviewModal
        transaction={selectedTransaction}
        open={showBillModal}
        onClose={() => {
          setShowBillModal(false);
          setSelectedTransaction(null);
        }}
      />

      {/* Export Options Modal */}
      <ExportOptionsDialog
        open={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
        collections={MOCK_TRANSACTIONS}
      />
    </>
  );
}
