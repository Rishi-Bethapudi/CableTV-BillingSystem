'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Download,
  Plus,
  Upload,
  Search,
  MoreVertical,
  Filter,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { downloadCustomersToExcel } from '@/utils/excelUtils';
import CustomerTable from '@/components/customers/CustomerTable';
import CustomerFilters from '@/components/customers/CustomerFilters';
import CustomerPagination from '@/components/customers/CustomerPagination';
import apiClient from '@/utils/apiClient';
import { useLayout } from '@/components/layouts/LayoutContext';
import { useNavigate } from 'react-router-dom';
export default function CustomersPage() {
  const navigate = useNavigate();
  const { setHeaderActions } = useLayout();
  const [showSearch, setShowSearch] = useState(false);
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

  // Header actions
  useEffect(() => {
    setHeaderActions(
      <div className="flex items-center gap-2">
        {/* Search */}
        {showSearch ? (
          <div className="flex items-center border rounded-md px-2 w-full sm:w-64">
            <Search className="h-4 w-4 text-gray-500 shrink-0" />
            <Input
              autoFocus
              type="search"
              placeholder="Search customers..."
              className="pl-2 h-7 text-xs border-0 focus-visible:ring-0 focus-visible:ring-offset-0 flex-1"
              onBlur={() => setShowSearch(false)}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, searchTerm: e.target.value }))
              }
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setShowSearch(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSearch(true)}
          >
            <Search className="h-5 w-5" />
          </Button>
        )}

        {/* Filter */}
        <Button variant="ghost" size="icon">
          <Filter className="h-5 w-5" />
        </Button>

        {/* More */}
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>
    );
    return () => setHeaderActions(null);
  }, [showSearch, setHeaderActions]);

  // Pagination
  const [page, setPage] = useState(1);
  const limit = 20;

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

      if (filters.balanceFilter === 'zero') query.append('paid', 'true');
      if (filters.balanceFilter === 'due') query.append('unpaid', 'true');
      if (filters.balanceFilter === 'advance') query.append('advance', 'true');

      if (filters.dueToday) query.append('dueToday', 'true');
      if (filters.dueTomorrow) query.append('dueTomorrow', 'true');
      if (filters.dueNext5Days) query.append('dueNext5Days', 'true');

      const res = await apiClient.get(`/customers?${query.toString()}`);
      const data = res.data;

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

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const handleDownloadExcel = () => {
    if (!customers.length) return toast.error('No data');
    downloadCustomersToExcel(customers, 'customers.xlsx');
  };

  return (
    <div className="space-y-4 w-full max-w-screen overflow-x-hidden">
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
          <Button onClick={() => navigate('/add-customer')}>
            <Plus className="h-4 w-4 mr-2" /> Add Customer
          </Button>
        </div>
      </div>

      {/* Filters (Desktop) */}
      <div className="hidden sm:block rounded-md border bg-white w-full">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-lg font-semibold">Filters</h2>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search customers..."
              className="pl-10"
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, searchTerm: e.target.value }))
              }
            />
          </div>
        </div>
        <div className="p-4">
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
        </div>
      </div>

      {/* Mobile Quick Filters */}
      <div className="lg:hidden">
        <div className="flex space-x-2 overflow-x-auto no-scrollbar">
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

      {/* Table + Pagination */}
      <div className="w-full overflow-x-auto">
        <CustomerTable customers={customers} loading={loading} />
      </div>

      <CustomerPagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
