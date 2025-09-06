import React, { useState } from 'react';

const CollectionDashboard = () => {
  const [activeTab, setActiveTab] = useState('summary');
  const [filters, setFilters] = useState({
    dateRange: '1 September 2025 to 30 September 2025',
    agent: 'Select Agent',
    area: 'Select Area',
    paymentMode: 'Select Payment Mode',
  });

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
    alert('Excel export functionality would be implemented here');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-full mx-auto p-3">
        {/* Header */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
          <h1 className="text-2xl font-normal text-gray-800 mb-3">
            Collection
          </h1>
          <div className="text-gray-600 text-xs mb-3">
            ...ing days...भुगतान 2 बैंक कार्य दिवसों के भीतर आपके बैंक खाते में
            जमा कर दिया जाएगा
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-50 p-3 rounded-lg mb-4">
          <h3 className="mb-3 text-gray-800 font-medium text-sm">
            Filters and Options
          </h3>
          <div className="flex gap-2 items-center flex-wrap">
            <select className="px-2 py-1 border border-gray-300 rounded bg-white text-xs min-w-32">
              <option>Data show on Create Date</option>
            </select>
            <select
              className="px-2 py-1 border border-gray-300 rounded bg-white text-xs min-w-40"
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            >
              <option>1 September 2025 to 30 September 2025</option>
            </select>
            <select
              className="px-2 py-1 border border-gray-300 rounded bg-white text-xs min-w-24"
              value={filters.agent}
              onChange={(e) => handleFilterChange('agent', e.target.value)}
            >
              <option>Select Agent</option>
            </select>
            <select
              className="px-2 py-1 border border-gray-300 rounded bg-white text-xs min-w-24"
              value={filters.area}
              onChange={(e) => handleFilterChange('area', e.target.value)}
            >
              <option>Select Area</option>
            </select>
            <select
              className="px-2 py-1 border border-gray-300 rounded bg-white text-xs min-w-32"
              value={filters.paymentMode}
              onChange={(e) =>
                handleFilterChange('paymentMode', e.target.value)
              }
            >
              <option>Select Payment Mode</option>
            </select>
            <button
              onClick={handleReset}
              className="px-3 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex mb-4">
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-4 py-2 text-xs font-medium ${
              activeTab === 'summary'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-600 text-white hover:bg-gray-700'
            } rounded-l`}
          >
            📊 Summary
          </button>
          <button
            onClick={() => setActiveTab('online')}
            className={`px-4 py-2 text-xs font-medium ${
              activeTab === 'online'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-600 text-white hover:bg-gray-700'
            } rounded-r`}
          >
            💳 Online Transactions
          </button>
        </div>

        {/* Summary Section */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-3">
            <div className="bg-white p-4 rounded-lg shadow-sm text-center min-w-32">
              <div className="text-xl font-bold text-orange-500 mb-1">
                ₹ 10180
              </div>
              <div className="text-gray-600 text-xs">Total Paid</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm text-center min-w-32">
              <div className="text-xl font-bold text-orange-500 mb-1">
                ₹ 10180
              </div>
              <div className="text-gray-600 text-xs">Total Payments</div>
            </div>
          </div>
          <button
            onClick={handleExcelExport}
            className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors flex items-center gap-1"
          >
            📊 Excel
          </button>
        </div>

        {/* Date Sections */}
        {Object.entries(transactionData).map(([date, data]) => (
          <DailyReportTable key={date} date={date} data={data} />
        ))}
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
              Customer: {data.summary.customers}
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

export default CollectionDashboard;
