import { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import * as XLSX from 'xlsx';
import { CollectionFilters } from '@/components/collection/CollectionFilters';
import { CollectionSummaryCard } from '@/components/collection/CollectionSummaryCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';

const TestCollection = () => {
  const [activeTab, setActiveTab] = useState('summary');
  const [filters, setFilters] = useState<any>(null);

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

  // fetchCollectionData(){
  //   // Fetch data from server based on filters
  // }
  // useEffect(() => {
  //   fetchCollectionData();
  // }, [filters]);
  const applyFilters = () => {
    if (!filters) return transactionData;

    return Object.fromEntries(
      Object.entries(transactionData).filter(([date, data]) => {
        const txDate = new Date(date);
        const start = new Date(filters.startDate);
        const end = new Date(filters.endDate);

        // Date filter
        if (txDate < start || txDate > end) return false;

        // Customer filters (apply inside details)
        data.customerDetails = data.customerDetails.filter((cust: any) => {
          if (filters.agent !== 'all' && cust.collectedBy !== filters.agent)
            return false;
          if (filters.area !== 'all' && cust.area !== filters.area)
            return false;
          if (filters.payment !== 'all') {
            const isOnline = cust.portalRecharge;
            if (filters.payment === 'cash' && isOnline) return false;
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
  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
  };

  const handleReset = () => {
    setFilters({
      dateRange: '1 September 2025 to 30 September 2025',
      agent: 'Select Agent',
      area: 'Select Area',
      paymentMode: 'Select Payment Mode',
    });
  };

  const handleExcelExport = () => {
    const rows = [];
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
          Portal: c.portalRecharge ? 'Online' : 'Cash',
        });
      });
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Collection');
    XLSX.writeFile(wb, 'collection-report.xlsx');
  };

  // --- PRINT ---
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
        <CollectionFilters onFilterChange={setFilters} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <CollectionSummaryCard title="Total Paid" amount={33950} />
          <CollectionSummaryCard title="Total Payments" amount={33950} />
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
              {Object.entries(filteredData).map(([date, data]) => (
                <DailyReportTable key={date} date={date} data={data} />
              ))}
            </TabsContent>

            {/* ONLINE TAB */}
            <TabsContent value="online" className="mt-6">
              {Object.entries(filteredData).map(([date, data]) => {
                const online = data.customerDetails.filter(
                  (c) => c.portalRecharge
                );
                if (!online.length) return null;
                return (
                  <DailyReportTable
                    key={date}
                    date={date}
                    data={{ ...data, customerDetails: online }}
                  />
                );
              })}
            </TabsContent>

            {/* CASH TAB */}
            <TabsContent value="cash" className="mt-6">
              {Object.entries(filteredData).map(([date, data]) => {
                const cash = data.customerDetails.filter(
                  (c) => !c.portalRecharge
                );
                if (!cash.length) return null;
                return (
                  <DailyReportTable
                    key={date}
                    date={date}
                    data={{ ...data, customerDetails: cash }}
                  />
                );
              })}
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
      </div>
    </div>
  );
};

const DailyReportTable = ({ date, data }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm mb-4 overflow-x-auto">
      <table className="w-full min-w-max border-collapse">
        {/* Row 1: Date Header (full width, 12 columns) */}
        <thead>
          <tr>
            <th
              colSpan={12}
              className="bg-slate-800 text-white p-2 text-center font-semibold text-sm"
            >
              {date}
            </th>
          </tr>
        </thead>

        {/* Row 2: Summary Header (12 columns split: 3+3+3+3) */}
        <thead>
          <tr className="bg-gray-50">
            <th
              colSpan={3}
              className="p-2 text-left font-semibold text-gray-800 border border-gray-200 text-xs"
            >
              Customers: {data.summary.customers}
            </th>
            <th
              colSpan={3}
              className="p-2 text-left font-semibold text-gray-800 border border-gray-200 text-xs"
            >
              Amount: ₹{data.summary.amount}
            </th>
            <th
              colSpan={3}
              className="p-2 text-left font-semibold text-gray-800 border border-gray-200 text-xs"
            >
              Discount: ₹{data.summary.discount}
            </th>
            <th
              colSpan={3}
              className="p-2 text-left font-semibold text-gray-800 border border-gray-200 text-xs"
            >
              Total Payment: ₹{data.summary.totalPayment}
            </th>
          </tr>
        </thead>

        {/* Row 3: Main Content (12 columns: 4 for areas + 8 for customer details) */}
        <tbody>
          <tr>
            {/* Left Column: AreaWiseTable (4 columns) */}
            <td
              colSpan={4}
              className="p-2 bg-gray-50 border border-gray-200 align-top"
            >
              <div className="space-y-2">
                {Object.entries(data.areas).map(([area, areaData]) => (
                  <div key={area} className="bg-gray-100 rounded p-1">
                    <div className="font-semibold text-gray-800 mb-1 bg-gray-200 p-1 rounded text-xs text-center">
                      {area}
                    </div>

                    <table className="w-full border-collapse bg-white rounded text-xs">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 p-1 text-xs font-medium">
                            Mode
                          </th>
                          <th className="border border-gray-300 p-1 text-xs font-medium">
                            Cust
                          </th>
                          <th className="border border-gray-300 p-1 text-xs font-medium">
                            Amt
                          </th>
                          <th className="border border-gray-300 p-1 text-xs font-medium">
                            Disc
                          </th>
                          <th className="border border-gray-300 p-1 text-xs font-medium">
                            Pay
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {areaData.modes.map((mode, index) => (
                          <tr key={index}>
                            <td className="border border-gray-300 p-1 text-xs">
                              {mode.mode}
                            </td>
                            <td className="border border-gray-300 p-1 text-xs text-center">
                              {mode.customers}
                            </td>
                            <td className="border border-gray-300 p-1 text-xs">
                              ₹{mode.amount}
                            </td>
                            <td className="border border-gray-300 p-1 text-xs">
                              ₹{mode.discount}
                            </td>
                            <td className="border border-gray-300 p-1 text-xs">
                              ₹{mode.payment}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-yellow-100 font-semibold">
                          <td className="border border-gray-300 p-1 text-xs">
                            Total
                          </td>
                          <td className="border border-gray-300 p-1 text-xs text-center">
                            {areaData.modes.reduce(
                              (sum, mode) => sum + mode.customers,
                              0
                            )}
                          </td>
                          <td className="border border-gray-300 p-1 text-xs">
                            ₹
                            {areaData.modes.reduce(
                              (sum, mode) => sum + mode.amount,
                              0
                            )}
                          </td>
                          <td className="border border-gray-300 p-1 text-xs">
                            ₹
                            {areaData.modes.reduce(
                              (sum, mode) => sum + mode.discount,
                              0
                            )}
                          </td>
                          <td className="border border-gray-300 p-1 text-xs">
                            ₹
                            {areaData.modes.reduce(
                              (sum, mode) => sum + mode.payment,
                              0
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </td>

            {/* Right Column: CustomerDetails (8 columns) */}
            <td colSpan={8} className="p-2 border border-gray-200 align-top">
              <div className="text-gray-800 font-medium mb-2 text-xs">
                Customer Details
              </div>
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-1 text-left font-semibold text-gray-800 border border-gray-200 text-xs min-w-24">
                      Name
                    </th>
                    <th className="p-1 text-left font-semibold text-gray-800 border border-gray-200 text-xs min-w-16">
                      Area
                    </th>
                    <th className="p-1 text-left font-semibold text-gray-800 border border-gray-200 text-xs min-w-16">
                      Prev Bal
                    </th>
                    <th className="p-1 text-left font-semibold text-gray-800 border border-gray-200 text-xs min-w-16">
                      Paid
                    </th>
                    <th className="p-1 text-left font-semibold text-gray-800 border border-gray-200 text-xs min-w-12">
                      Disc
                    </th>
                    <th className="p-1 text-left font-semibold text-gray-800 border border-gray-200 text-xs min-w-16">
                      Curr Bal
                    </th>
                    <th className="p-1 text-left font-semibold text-gray-800 border border-gray-200 text-xs min-w-24">
                      Collected By
                    </th>
                    <th className="p-1 text-left font-semibold text-gray-800 border border-gray-200 text-xs min-w-20">
                      Cust Code
                    </th>
                    <th className="p-1 text-left font-semibold text-gray-800 border border-gray-200 text-xs min-w-20">
                      Stb No
                    </th>
                    <th className="p-1 text-left font-semibold text-gray-800 border border-gray-200 text-xs min-w-20">
                      Card No
                    </th>
                    <th className="p-1 text-left font-semibold text-gray-800 border border-gray-200 text-xs min-w-12">
                      Portal
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.customerDetails.map((customer, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="p-1 border border-gray-100 text-xs">
                        <a
                          href="#"
                          className="text-blue-600 hover:underline"
                          onClick={(e) => e.preventDefault()}
                        >
                          {customer.name}
                        </a>
                      </td>
                      <td className="p-1 border border-gray-100 text-xs">
                        {customer.area}
                      </td>
                      <td className="p-1 border border-gray-100 text-xs">
                        ₹{customer.previousBalance}
                      </td>
                      <td className="p-1 border border-gray-100 text-xs">
                        ₹{customer.paidAmount}
                      </td>
                      <td className="p-1 border border-gray-100 text-xs">
                        ₹{customer.discount}
                      </td>
                      <td
                        className={`p-1 border border-gray-100 text-xs ${
                          customer.currentBalance > 0
                            ? 'text-red-600'
                            : customer.currentBalance < 0
                            ? 'text-green-600'
                            : ''
                        }`}
                      >
                        ₹{customer.currentBalance}
                      </td>
                      <td className="p-1 border border-gray-100 text-xs">
                        {customer.collectedBy}
                      </td>
                      <td className="p-1 border border-gray-100 text-xs">
                        {customer.customerCode}
                      </td>
                      <td className="p-1 border border-gray-100 text-xs">
                        {customer.stbNo}
                      </td>
                      <td className="p-1 border border-gray-100 text-xs">
                        {customer.cardNo}
                      </td>
                      <td className="p-1 border border-gray-100 text-xs text-center">
                        {customer.portalRecharge ? '☑' : '☐'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
{
  /* <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="online-transactions">
              Online Transactions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="mt-6">
            {/* Date Sections */
}
//     {Object.entries(transactionData).map(([date, data]) => (
//       <DailyReportTable key={date} date={date} data={data} />
//     ))}
//   </TabsContent>

//   <TabsContent value="online-transactions" className="mt-6">
//     <Card>
//       <CardContent className="p-8 text-center">
//         <p className="text-gray-500">
//           Online transactions data will be displayed here
//         </p>
//       </CardContent>
//     </Card>
//   </TabsContent>
// </Tabs> */}
export default TestCollection;
