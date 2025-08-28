'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Download, Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { downloadCustomersToExcel } from '@/utils/excelUtils';
import CustomerTable from '@/components/customers/CustomerTable';
import CustomerFilters from '@/components/customers/CustomerFilters';
import CustomerPagination from '@/components/customers/CustomerPagination';
import apiClient from '@/utils/apiClient';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    searchTerm: '',
    statusFilter: '',
    balanceFilter: '',
    areaFilter: '',
    dueToday: false,
    dueTomorrow: false,
    dueNext5Days: false,
    sortBy: 'createdAt',
    order: 'desc',
  });

  // Pagination
  const [page, setPage] = useState(1);
  const limit = 6;

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search: filters.searchTerm,
        customerStatus: filters.statusFilter,
        locality: filters.areaFilter,
        sortBy: filters.sortBy,
        order: filters.order,
      });

      // balance filter
      switch (filters.balanceFilter) {
        case 'zero':
          query.append('paid', 'true');
          break;
        case 'due':
          query.append('unpaid', 'true');
          break;
        case 'advance':
          query.append('advance', 'true');
          break;
      }

      // due filters
      if (filters.dueToday) query.append('dueToday', 'true');
      if (filters.dueTomorrow) query.append('dueTomorrow', 'true');
      if (filters.dueNext5Days) query.append('dueNext5Days', 'true');

      const res = await apiClient.get(`/customers?${query.toString()}`);
      const data = res.data;
      console.log(data);

      setCustomers(data?.data || []);
      setTotalPages(data?.pagination?.totalPages ?? 1);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, [page, limit, filters]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [filters]);

  const handleDownloadExcel = () => {
    if (!customers.length) return toast.error('No data');
    downloadCustomersToExcel(customers, 'customers.xlsx');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="hidden sm:flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Customers
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Manage your customer database
          </p>
        </div>

        <div className="flex gap-2">
          <div className="hidden sm:flex gap-2">
            <Button variant="outline" onClick={handleDownloadExcel}>
              <Download className="h-4 w-4 mr-2" /> Download Excel
            </Button>
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" /> Upload Excel
            </Button>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" /> Add Customer
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="hidden sm:block">
        <CardHeader className="hidden sm:block">
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <CustomerFilters
            onSearchChange={(val) =>
              setFilters((prev) => ({ ...prev, searchTerm: val }))
            }
            onStatusChange={(val) =>
              setFilters((prev) => ({ ...prev, statusFilter: val }))
            }
            onBalanceChange={(val) =>
              setFilters((prev) => ({ ...prev, balanceFilter: val }))
            }
            onAreaChange={(val) =>
              setFilters((prev) => ({ ...prev, areaFilter: val }))
            }
            onDueTodayChange={(val) =>
              setFilters((prev) => ({ ...prev, dueToday: val }))
            }
            onDueTomorrowChange={(val) =>
              setFilters((prev) => ({ ...prev, dueTomorrow: val }))
            }
            onDueNext5DaysChange={(val) =>
              setFilters((prev) => ({ ...prev, dueNext5Days: val }))
            }
            onSortChange={(val) =>
              setFilters((prev) => ({ ...prev, sortBy: val }))
            }
            onOrderChange={(val) =>
              setFilters((prev) => ({ ...prev, order: val }))
            }
          />
        </CardContent>
      </Card>

      <div className=" top-0  lg:hidden">
        <div className="flex space-x-2">
          <button className="px-4 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-full">
            Due Today
          </button>
          <button className="px-4 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-full">
            Due Tomorrow
          </button>
          <button className="px-4 py-1 text-sm font-medium text-white bg-gray-800 rounded-full">
            Unpaid
          </button>
        </div>
      </div>
      <div>
        <CustomerTable customers={customers} loading={loading} />
        <CustomerPagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
