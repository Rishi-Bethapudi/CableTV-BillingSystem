import { useState, useRef, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import * as XLSX from 'xlsx';
import { CollectionFilters } from '../components/collection/CollectionFilters';
import { CollectionSummaryCard } from '../components/collection/CollectionSummaryCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';
import { DailyReportTable } from '../components/collection/DailyReportTable';

const CollectionDashboard = () => {
  const [activeTab, setActiveTab] = useState('summary');
  const [filters, setFilters] = useState({
    status: 'all',
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    endDate: new Date(),
    agent: 'all',
    area: 'all',
    payment: 'all',
  });
  const [filteredData, setFilteredData] = useState({});

  // Sample data structure based on the images
  const transactionData = {
    '06-Sep-2025': {
      summary: { customers: 1, amount: 380, discount: 0, totalPayment: 380 },
      areas: {
        Kandrapadu: {
          modes: [
            {
              mode: 'PhonePe',
              customers: 1,
              amount: 380,
              discount: 0,
              payment: 380,
            },
          ],
        },
      },
      customerDetails: [
        {
          name: 'Veera Reddy Induri',
          area: 'Kandrapadu',
          previousBalance: 380,
          paidAmount: 380,
          discount: 0,
          currentBalance: 0,
          collectedBy: 'MAHI COMMUNICATIONS',
          customerCode: '100574412',
          stbNo: 'DSNW20307748',
          cardNo: 'YA05201BY23423',
          portalRecharge: false,
        },
      ],
    },
    '04-Sep-2025': {
      summary: { customers: 1, amount: 350, discount: 0, totalPayment: 350 },
      areas: {
        OBKVP: {
          modes: [
            {
              mode: 'PhonePe',
              customers: 1,
              amount: 350,
              discount: 0,
              payment: 350,
            },
          ],
        },
      },
      customerDetails: [
        {
          name: 'Suresh Tulluri',
          area: 'OBKVP',
          previousBalance: 1800,
          paidAmount: 350,
          discount: 0,
          currentBalance: 1450,
          collectedBy: 'MAHI COMMUNICATIONS',
          customerCode: '200301428',
          stbNo: 'RLGM38AE5890',
          cardNo: '',
          portalRecharge: false,
        },
      ],
    },
    '03-Sep-2025': {
      summary: { customers: 7, amount: 4450, discount: 0, totalPayment: 4450 },
      areas: {
        Kandrapadu: {
          modes: [
            {
              mode: 'CASH',
              customers: 1,
              amount: 1500,
              discount: 0,
              payment: 1500,
            },
            {
              mode: 'PhonePe',
              customers: 4,
              amount: 2100,
              discount: 0,
              payment: 2100,
            },
          ],
        },
        OBKVP: {
          modes: [
            {
              mode: 'CASH',
              customers: 1,
              amount: 450,
              discount: 0,
              payment: 450,
            },
            {
              mode: 'PhonePe',
              customers: 1,
              amount: 400,
              discount: 0,
              payment: 400,
            },
          ],
        },
      },
      customerDetails: [
        {
          name: 'Venkata Lakshmi Induri',
          area: 'Kandrapadu',
          previousBalance: 1000,
          paidAmount: 700,
          discount: 0,
          currentBalance: 300,
          collectedBy: 'MAHI COMMUNICATIONS',
          customerCode: '43362',
          stbNo: 'ZTEGCFD97221',
          cardNo: '',
          portalRecharge: false,
        },
        {
          name: 'Venugopal Krishnasai',
          area: 'Kandrapadu',
          previousBalance: 350,
          paidAmount: 350,
          discount: 0,
          currentBalance: 0,
          collectedBy: 'MAHI COMMUNICATIONS',
          customerCode: '101851270',
          stbNo: 'DSNW26462ze8',
          cardNo: 'MK4RRG431F1617',
          portalRecharge: false,
        },
        {
          name: 'Sample Customer 3',
          area: 'Kandrapadu',
          previousBalance: 600,
          paidAmount: 600,
          discount: 0,
          currentBalance: 0,
          collectedBy: 'MAHI COMMUNICATIONS',
          customerCode: '12345',
          stbNo: 'TEST123',
          cardNo: 'CARD123',
          portalRecharge: true,
        },
        {
          name: 'Sample Customer 4',
          area: 'OBKVP',
          previousBalance: 450,
          paidAmount: 450,
          discount: 0,
          currentBalance: 0,
          collectedBy: 'MAHI COMMUNICATIONS',
          customerCode: '67890',
          stbNo: 'TEST456',
          cardNo: '',
          portalRecharge: false,
        },
        {
          name: 'Sample Customer 5',
          area: 'OBKVP',
          previousBalance: 400,
          paidAmount: 400,
          discount: 0,
          currentBalance: 0,
          collectedBy: 'MAHI COMMUNICATIONS',
          customerCode: '11111',
          stbNo: 'TEST789',
          cardNo: 'CARD456',
          portalRecharge: true,
        },
      ],
    },
    '01-Sep-2025': {
      summary: { customers: 2, amount: 1550, discount: 0, totalPayment: 1550 },
      areas: {
        Kandrapadu: {
          modes: [
            {
              mode: 'PhonePe',
              customers: 1,
              amount: 500,
              discount: 0,
              payment: 500,
            },
          ],
        },
        OBKVP: {
          modes: [
            {
              mode: 'PhonePe',
              customers: 1,
              amount: 1050,
              discount: 0,
              payment: 1050,
            },
          ],
        },
      },
      customerDetails: [
        {
          name: 'Venkata Reddy Pallerla',
          area: 'Kandrapadu',
          previousBalance: 500,
          paidAmount: 500,
          discount: 0,
          currentBalance: 0,
          collectedBy: 'MAHI COMMUNICATIONS',
          customerCode: '43661',
          stbNo: 'RLGM3BADC1C0',
          cardNo: '',
          portalRecharge: false,
        },
        {
          name: 'Chenna Kesavulu G',
          area: 'OBKVP',
          previousBalance: 1050,
          paidAmount: 1050,
          discount: 0,
          currentBalance: 0,
          collectedBy: 'MAHI COMMUNICATIONS',
          customerCode: '200270839',
          stbNo: 'DSNW20227c40',
          cardNo: 'KK070518QT49564',
          portalRecharge: false,
        },
      ],
    },
  };

  // Apply filters when they change
  useEffect(() => {
    const applyFilters = () => {
      if (!filters) return transactionData;

      return Object.fromEntries(
        Object.entries(transactionData)
          .filter(([dateStr]) => {
            // Parse date string to Date object
            const dateParts = dateStr.split('-');
            const day = parseInt(dateParts[0]);
            const month = new Date(
              Date.parse(dateParts[1] + ' 1, 2025')
            ).getMonth();
            const year = parseInt(dateParts[2]);
            const txDate = new Date(year, month, day);

            // Date filter
            if (filters.startDate && txDate < filters.startDate) return false;
            if (filters.endDate && txDate > filters.endDate) return false;
            return true;
          })
          .map(([date, data]: [string, any]) => {
            // Apply customer filters
            const filteredCustomerDetails = data.customerDetails.filter(
              (cust: any) => {
                if (
                  filters.agent !== 'all' &&
                  cust.collectedBy !== filters.agent
                )
                  return false;
                if (filters.area !== 'all' && cust.area !== filters.area)
                  return false;
                if (filters.payment !== 'all') {
                  const isOnline = cust.portalRecharge;
                  if (filters.payment === 'cash' && isOnline) return false;
                  if (filters.payment === 'online' && !isOnline) return false;
                }
                if (filters.status === 'paid' && cust.paidAmount <= 0)
                  return false;
                if (filters.status === 'pending' && cust.currentBalance <= 0)
                  return false;
                return true;
              }
            );

            // Recalculate summary based on filtered customers
            const customers = filteredCustomerDetails.length;
            const amount = filteredCustomerDetails.reduce(
              (sum: number, cust: any) => sum + cust.previousBalance,
              0
            );
            const discount = filteredCustomerDetails.reduce(
              (sum: number, cust: any) => sum + cust.discount,
              0
            );
            const totalPayment = filteredCustomerDetails.reduce(
              (sum: number, cust: any) => sum + cust.paidAmount,
              0
            );

            // Recalculate areas based on filtered customers
            const areas: any = {};
            filteredCustomerDetails.forEach((cust: any) => {
              if (!areas[cust.area]) {
                areas[cust.area] = { modes: [] };
              }

              // Find or create mode entry
              const modeName = cust.portalRecharge ? 'Online' : 'Cash';
              let modeEntry = areas[cust.area].modes.find(
                (m: any) => m.mode === modeName
              );

              if (!modeEntry) {
                modeEntry = {
                  mode: modeName,
                  customers: 0,
                  amount: 0,
                  discount: 0,
                  payment: 0,
                };
                areas[cust.area].modes.push(modeEntry);
              }

              modeEntry.customers += 1;
              modeEntry.amount += cust.previousBalance;
              modeEntry.discount += cust.discount;
              modeEntry.payment += cust.paidAmount;
            });

            return [
              date,
              {
                summary: { customers, amount, discount, totalPayment },
                areas,
                customerDetails: filteredCustomerDetails,
              },
            ];
          })
      );
    };

    setFilteredData(applyFilters());
  }, [filters]);

  const handleExcelExport = () => {
    const rows = [];
    Object.entries(filteredData).forEach(([date, data]: [string, any]) => {
      data.customerDetails.forEach((c: any) => {
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
          Portal: c.portalRecharge ? 'Online' : 'Cash',
        });
      });
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Collection');
    XLSX.writeFile(wb, 'collection-report.xlsx');
  };

  // Calculate totals for summary cards
  const totalPaid = Object.values(filteredData).reduce(
    (sum: number, data: any) => sum + data.summary.totalPayment,
    0
  );

  const totalPayments = Object.values(filteredData).reduce(
    (sum: number, data: any) => sum + data.summary.customers,
    0
  );

  // --- PRINT ---
  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-full mx-auto p-3">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Collection</h1>
          <div className="flex gap-2">
            <Button
              onClick={handleExcelExport}
              className="flex items-center gap-1"
            >
              <Download size={16} />
              Export
            </Button>
            <Button onClick={handlePrint} className="flex items-center gap-1">
              <Printer size={16} />
              Print
            </Button>
          </div>
        </div>

        <CollectionFilters onFilterChange={setFilters} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <CollectionSummaryCard title="Total Paid" amount={totalPaid} />
          <CollectionSummaryCard
            title="Total Payments"
            amount={totalPayments}
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
            <TabsTrigger value="cash">Cash</TabsTrigger>
            <TabsTrigger value="area">Area Wise</TabsTrigger>
          </TabsList>

          <div ref={printRef}>
            {/* SUMMARY TAB */}
            <TabsContent value="summary" className="mt-6">
              {Object.entries(filteredData).map(
                ([date, data]: [string, any]) => (
                  <DailyReportTable key={date} date={date} data={data} />
                )
              )}
            </TabsContent>

            {/* ONLINE TAB */}
            <TabsContent value="online" className="mt-6">
              {Object.entries(filteredData).map(
                ([date, data]: [string, any]) => {
                  const online = data.customerDetails.filter(
                    (c: any) => c.portalRecharge
                  );
                  if (!online.length) return null;
                  return (
                    <DailyReportTable
                      key={date}
                      date={date}
                      data={{ ...data, customerDetails: online }}
                    />
                  );
                }
              )}
            </TabsContent>

            {/* CASH TAB */}
            <TabsContent value="cash" className="mt-6">
              {Object.entries(filteredData).map(
                ([date, data]: [string, any]) => {
                  const cash = data.customerDetails.filter(
                    (c: any) => !c.portalRecharge
                  );
                  if (!cash.length) return null;
                  return (
                    <DailyReportTable
                      key={date}
                      date={date}
                      data={{ ...data, customerDetails: cash }}
                    />
                  );
                }
              )}
            </TabsContent>

            {/* AREA WISE TAB */}
            <TabsContent value="area" className="mt-6">
              {Object.entries(filteredData).map(
                ([date, data]: [string, any]) => (
                  <Card key={date} className="mb-4">
                    <CardContent className="p-4">
                      <h2 className="font-bold text-gray-700 mb-2">{date}</h2>
                      {Object.entries(data.areas).map(
                        ([area, areaData]: [string, any]) => (
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
                                {areaData.modes.map((m: any, i: number) => (
                                  <tr key={i}>
                                    <td className="border p-1">{m.mode}</td>
                                    <td className="border p-1">
                                      {m.customers}
                                    </td>
                                    <td className="border p-1">₹{m.amount}</td>
                                    <td className="border p-1">
                                      ₹{m.discount}
                                    </td>
                                    <td className="border p-1">₹{m.payment}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )
                      )}
                    </CardContent>
                  </Card>
                )
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default CollectionDashboard;
