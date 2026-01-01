import { useState, useRef, useEffect, useMemo } from 'react';
import { useReactToPrint } from 'react-to-print';
import * as XLSX from 'xlsx';
import { CollectionFilters } from '@/components/collection/CollectionFilters';
import { CollectionSummaryCard } from '@/components/collection/CollectionSummaryCard';
import { DailyReportTable } from '@/components/collection/DailyReportTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import apiClient from '@/utils/apiClient';

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
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<any>(null);

  const [exportFilteredOnly, setExportFilteredOnly] = useState(true);

  // -------- Restore active tab & cached data on mount ----------
  useEffect(() => {
    const savedTab = localStorage.getItem('collectionActiveTab');
    if (savedTab) setActiveTab(savedTab);

    try {
      const cached = localStorage.getItem('collectionCache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === 'object') {
          setTransactionData(parsed);
        }
      }
    } catch {
      // ignore cache errors
    }
  }, []);

  // -------- Save active tab ----------
  useEffect(() => {
    localStorage.setItem('collectionActiveTab', activeTab);
  }, [activeTab]);

  // ================== FETCH + MERGE ==================
  const fetchCollectionData = async () => {
    try {
      const params: any = {};

      // these come from CollectionFilters as Date objects / strings
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      if (filters.agent && filters.agent !== 'all')
        params.agentId = filters.agent;
      if (filters.area && filters.area !== 'all') params.area = filters.area;
      if (filters.payment && filters.payment !== 'all')
        params.paymentMode = filters.payment;

      const [summaryRes, detailsRes] = await Promise.all([
        apiClient.get('/reports/collection-area-summary', { params }),
        apiClient.get('/reports/collection-details', { params }),
      ]);

      const summary = summaryRes.data?.report || {};
      const details = detailsRes.data?.report || {};

      const final: any = {};

      // ----------- STEP 1: Copy summary to final -----------
      Object.entries(summary).forEach(([dateKey, dayData]: any) => {
        final[dateKey] = {
          summary: dayData.summary || {
            customers: 0,
            amount: 0,
            discount: 0,
            totalPayment: 0,
          },
          areas: dayData.areas || {},
          customerDetails: [], // inserted later
        };
      });

      // ----------- STEP 2: Insert customerDetails -----------
      Object.entries(details).forEach(([dateKey, dayData]: any) => {
        if (!final[dateKey]) {
          final[dateKey] = {
            summary: {
              customers: 0,
              amount: 0,
              discount: 0,
              totalPayment: 0,
            },
            areas: {},
            customerDetails: [],
          };
        }
        final[dateKey].customerDetails.push(...dayData.customerDetails);
      });

      // ----------- STEP 3: Update total cards (server-level filters only) -----------
      const totalsFromServer = Object.values(final).reduce(
        (acc: any, day: any) => {
          acc.amount += day.summary.amount || 0;
          acc.totalPayment += day.summary.totalPayment || 0;
          acc.discount += day.summary.discount || 0;
          acc.customers += day.summary.customers || 0;
          return acc;
        },
        { customers: 0, amount: 0, totalPayment: 0, discount: 0 }
      );

      setTotals(totalsFromServer);
      setTransactionData(final);
      console.log('Final Merged Data:', final);

      // cache latest data
      try {
        localStorage.setItem('collectionCache', JSON.stringify(final));
      } catch {
        // ignore
      }
    } catch (e) {
      console.error('Error fetching collection:', e);
      setTransactionData({});
    }
  };
  useEffect(() => {
    if (!filters) return;

    clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      await fetchCollectionData();
      setLoading(false);
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [filters]);

  // --- Local / client-side filtering + recompute summary + areas ---
  const filteredData = useMemo(() => {
    if (!transactionData || Object.keys(transactionData).length === 0)
      return {};

    const clone = structuredClone(transactionData); // safe deep copy
    const onlineModes = ['PhonePe', 'GPay', 'UPI', 'Online'];

    return Object.fromEntries(
      Object.entries(clone).map(([date, data]: any) => {
        let filteredCustomers = data.customerDetails || [];

        // Status filter: paid / pending
        if (filters.status && filters.status !== 'all') {
          if (filters.status === 'paid') {
            filteredCustomers = filteredCustomers.filter(
              (c: any) => (c.paidAmount || 0) > 0
            );
          } else if (filters.status === 'pending') {
            filteredCustomers = filteredCustomers.filter(
              (c: any) => (c.currentBalance || 0) > 0
            );
          }
        }

        // (Agent / Area / Payment already applied in backend via params,
        //  but leaving here gives extra safety if backend ignores anything.)
        if (filters.agent && filters.agent !== 'all') {
          filteredCustomers = filteredCustomers.filter(
            (c: any) => c.collectedBy === filters.agent
          );
        }

        if (filters.area && filters.area !== 'all') {
          filteredCustomers = filteredCustomers.filter(
            (c: any) => c.area === filters.area
          );
        }

        if (filters.payment && filters.payment !== 'all') {
          if (filters.payment === 'Cash') {
            filteredCustomers = filteredCustomers.filter(
              (c: any) => c.method === 'Cash'
            );
          } else if (filters.payment === 'Online') {
            filteredCustomers = filteredCustomers.filter((c: any) =>
              onlineModes.includes(c.method)
            );
          }
        }

        // ---- Recompute summary + area breakdown from filteredCustomers ----
        const newSummary = {
          customers: 0,
          amount: 0,
          discount: 0,
          totalPayment: 0,
        };
        const newAreas: any = {};

        filteredCustomers.forEach((c: any) => {
          const paid = c.paidAmount || 0;
          const disc = c.discount || 0;
          const areaName = c.area || 'Unknown';
          const mode = c.method || 'Cash';

          newSummary.customers += 1;
          newSummary.amount += paid;
          newSummary.discount += disc;
          newSummary.totalPayment += paid;

          if (!newAreas[areaName]) newAreas[areaName] = { modes: [] };

          let modeRow = newAreas[areaName].modes.find(
            (m: any) => m.mode === mode
          );
          if (!modeRow) {
            modeRow = {
              mode,
              customers: 0,
              amount: 0,
              discount: 0,
              payment: 0,
            };
            newAreas[areaName].modes.push(modeRow);
          }

          modeRow.customers += 1;
          modeRow.amount += paid;
          modeRow.discount += disc;
          modeRow.payment += paid;
        });

        return [
          date,
          {
            ...data,
            summary: newSummary,
            areas: newAreas,
            customerDetails: filteredCustomers,
          },
        ];
      })
    );
  }, [transactionData, filters]);

  // For Excel export we optionally use filteredData or full transactionData
  const dataForExport = useMemo(() => {
    if (exportFilteredOnly && Object.keys(filteredData).length > 0) {
      return filteredData;
    }
    return transactionData || {};
  }, [exportFilteredOnly, filteredData, transactionData]);

  // Receive full filters object from CollectionFilters
  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleReset = () => {
    // child will reset its internal state and call onFilterChange again,
    // but we clear here to avoid stale filters during that gap.
    setFilters({});
  };

  const renderByMethod = (kind: 'Cash' | 'Online') => {
    const onlineModes = ['PhonePe', 'GPay', 'UPI', 'Online'];

    return Object.entries(filteredData).map(([date, data]: any) => {
      let filtered: any[] = [];

      if (kind === 'Cash') {
        filtered = (data.customerDetails || []).filter(
          (c: any) => c.method === 'Cash'
        );
      } else {
        filtered = (data.customerDetails || []).filter((c: any) =>
          onlineModes.includes(c.method)
        );
      }

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

    Object.entries(dataForExport).forEach(([date, data]: any) => {
      (data.customerDetails || []).forEach((c: any) => {
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
  const printRef = useRef<any>(null);
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-full mx-auto p-3">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-1">
              Collection
            </h1>
            <p className="text-xs text-gray-500">
              Date → Area → Mode → Customers with full customer-wise drilldown
            </p>
          </div>
        </div>

        {/* Filters */}
        <CollectionFilters
          onFilterChange={handleFilterChange}
          onReset={handleReset}
        />

        {/* Summary Cards (based on server-filtered totals) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <CollectionSummaryCard title="Total Paid" amount={totals?.amount} />
          <CollectionSummaryCard
            title="Total Payments"
            amount={totals?.totalPayment}
          />
        </div>
        {loading && (
          <div className="w-full flex justify-center py-6">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        )}

        {/* Tabs */}
        {!loading && (
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
                {Object.keys(filteredData).length === 0 && (
                  <div className="text-xs text-gray-500 mb-2">
                    No data for selected filters.
                  </div>
                )}
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
                {Object.entries(filteredData).map(([date, data]: any) => (
                  <Card key={date} className="mb-4">
                    <CardContent className="p-4">
                      <h2 className="font-bold text-gray-700 mb-2">{date}</h2>
                      {Object.entries(data?.areas || {}).map(
                        ([area, areaData]: any) => (
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
                                {(areaData?.modes || []).map(
                                  (m: any, i: number) => (
                                    <tr key={i}>
                                      <td className="border p-1">{m.mode}</td>
                                      <td className="border p-1">
                                        {m.customers}
                                      </td>
                                      <td className="border p-1">
                                        ₹{m.amount}
                                      </td>
                                      <td className="border p-1">
                                        ₹{m.discount}
                                      </td>
                                      <td className="border p-1">
                                        ₹{m.payment}
                                      </td>
                                    </tr>
                                  )
                                )}
                              </tbody>
                            </table>
                          </div>
                        )
                      )}
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </div>
          </Tabs>
        )}
        {/* Export / Print Buttons */}
        <div className="flex flex-wrap items-center gap-3 mt-4">
          <label className="flex items-center gap-2 text-xs text-gray-700">
            <input
              type="checkbox"
              className="rounded border-gray-300"
              checked={exportFilteredOnly}
              onChange={() => setExportFilteredOnly((v) => !v)}
            />
            <span>Export filtered data only</span>
          </label>

          <div className="flex gap-2">
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
    </div>
  );
};

export default CollectionDashboard;
