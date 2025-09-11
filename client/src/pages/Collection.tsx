import { useState, useRef, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import * as XLSX from 'xlsx';
import { CollectionFilters } from '@/components/collection/CollectionFilters';
import { CollectionSummaryCard } from '@/components/collection/CollectionSummaryCard';
import { DailyReportTable } from '@/components/collection/DailyReportTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import apiClient from '../utils/apiClient'; // make sure you have apiClient setup
import { Disc } from 'lucide-react';

const CollectionDashboard = () => {
  const [activeTab, setActiveTab] = useState('summary');
  const [filters, setFilters] = useState<any>({});
  const [transactionData, setTransactionData] = useState<any>({});
  const [totals, setTotals] = useState<any>({
    customers: 0,
    amount: 0,
    totalPayment: 0,
    discount: 0,
  });

  // --- Fetch collection data from API ---
  const fetchCollectionData = async () => {
    try {
      const params: any = {};
      // Only include filters that have a value
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.agent && filters.agent !== 'all')
        params.agent = filters.agent;
      if (filters.area && filters.area !== 'all') params.area = filters.area;
      if (filters.payment && filters.payment !== 'all')
        params.payment = filters.payment;
      if (filters.dataShow && filters.dataShow !== 'all')
        params.dataShow = filters.dataShow;

      const { data } = await apiClient.get('/reports/collections', { params });
      setTransactionData(data.report);
      setTotals(data.totals);
    } catch (error) {
      console.error('Error fetching collections:', error);
      setTransactionData({});
    }
  };

  useEffect(() => {
    fetchCollectionData();
  }, [filters]);

  // --- Filter data locally if needed ---
  const applyFilters = () => {
    if (!transactionData || Object.keys(transactionData).length === 0)
      return {};

    return Object.fromEntries(
      Object.entries(transactionData).filter(([date, data]) => {
        // Filter by date range if available
        if (filters.startDate && filters.endDate) {
          const txDate = new Date(date);
          const start = new Date(filters.startDate);
          const end = new Date(filters.endDate);
          if (txDate < start || txDate > end) return false;
        }

        // Filter customer details
        data.customerDetails = data.customerDetails.filter((cust: any) => {
          if (
            filters.agent &&
            filters.agent !== 'all' &&
            cust.collectedBy !== filters.agent
          )
            return false;
          if (
            filters.area &&
            filters.area !== 'all' &&
            cust.area !== filters.area
          )
            return false;
          if (filters.payment && filters.payment !== 'all') {
            const isOnline = cust.portalRecharge;
            if (filters.payment === 'Cash' && isOnline) return false;
            if (filters.payment === 'online' && !isOnline) return false;
          }
          if (filters.dataShow === 'paid' && cust.paidAmount <= 0) return false;
          if (filters.dataShow === 'pending' && cust.currentBalance <= 0)
            return false;
          return true;
        });

        return true;
      })
    );
  };

  const filteredData = applyFilters();

  const handleFilterChange = (filterName: string, value: any) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
  };

  const handleReset = () => {
    setFilters({});
  };
  const renderByMethod = (method: string) => {
    return Object.entries(filteredData).map(([date, data]) => {
      const filtered = data.customerDetails.filter((c) => c.method === method);
      if (!filtered.length) return null;

      return (
        <DailyReportTable
          key={date}
          date={date}
          data={{ ...data, customerDetails: filtered }}
        />
      );
    });
  };

  // --- Excel export ---
  const handleExcelExport = () => {
    const rows: any[] = [];
    Object.entries(filteredData).forEach(([date, data]) => {
      data.customerDetails.forEach((c) => {
        rows.push({
          Date: date,
          Name: c.name,
          Area: c.area,
          PrevBalance: c.previousBalance,
          Paid: c.paidAmount,
          Discount: c.discount,
          CurrBalance: c.currentBalance,
          CollectedBy: c.collectedBy,
          CustomerCode: c.customerCode,
          StbNo: c.stbNo,
          CardNo: c.cardNo,
          Method: c.method,
        });
      });
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Collection');
    XLSX.writeFile(wb, 'collection-report.xlsx');
  };

  // --- Print ---
  const printRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-full mx-auto p-3">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Collection</h1>
        </div>

        {/* Filters */}
        <CollectionFilters
          onFilterChange={handleFilterChange}
          onReset={handleReset}
        />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <CollectionSummaryCard title="Total Paid" amount={totals?.amount} />
          <CollectionSummaryCard
            title="Total Payments"
            amount={totals?.totalPayment}
          />
        </div>

        {/* Tabs */}
        <Tabs
          defaultValue="summary"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="online">Online</TabsTrigger>
            <TabsTrigger value="Cash">Cash</TabsTrigger>
            <TabsTrigger value="area">Area Wise</TabsTrigger>
          </TabsList>

          <div ref={printRef}>
            {/* SUMMARY TAB */}
            <TabsContent value="summary" className="mt-6">
              {Object.entries(filteredData).map(([date, data]) => (
                <DailyReportTable key={date} date={date} data={data} />
              ))}
            </TabsContent>

            {/* ONLINE TAB */}
            <TabsContent value="online" className="mt-6">
              {renderByMethod('Online')}
            </TabsContent>

            {/* CASH TAB */}
            <TabsContent value="Cash" className="mt-6">
              {renderByMethod('Cash')}
            </TabsContent>

            {/* AREA WISE TAB */}
            <TabsContent value="area" className="mt-6">
              {Object.entries(filteredData).map(([date, data]) => (
                <Card key={date} className="mb-4">
                  <CardContent className="p-4">
                    <h2 className="font-bold text-gray-700 mb-2">{date}</h2>
                    {Object.entries(data.areas).map(([area, areaData]) => (
                      <div key={area} className="mb-4">
                        <h3 className="font-semibold text-gray-600 mb-1">
                          {area}
                        </h3>
                        <table className="w-full border-collapse text-xs">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="border p-1">Mode</th>
                              <th className="border p-1">Customers</th>
                              <th className="border p-1">Amount</th>
                              <th className="border p-1">Discount</th>
                              <th className="border p-1">Payment</th>
                            </tr>
                          </thead>
                          <tbody>
                            {areaData.modes.map((m, i) => (
                              <tr key={i}>
                                <td className="border p-1">{m.mode}</td>
                                <td className="border p-1">{m.customers}</td>
                                <td className="border p-1">₹{m.amount}</td>
                                <td className="border p-1">₹{m.discount}</td>
                                <td className="border p-1">₹{m.payment}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </div>
        </Tabs>

        {/* Export / Print Buttons */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleExcelExport}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Export Excel
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Print
          </button>
        </div>
      </div>
    </div>
  );
};

export default CollectionDashboard;
