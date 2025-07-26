'use client';

import { useEffect, useState } from 'react';
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
  const [customers, setCustomers] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // --- Filter states ---
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [balanceFilter, setBalanceFilter] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [dueToday, setDueToday] = useState(false);
  const [dueNext5Days, setDueNext5Days] = useState(false);
  const [dueTomorrow, setDueTomorrow] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');

  // Pagination
  const [page, setPage] = useState(1);
  const limit = 6;

  // --- Load customers from API ---
  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          search: searchTerm,
          customerStatus: statusFilter,
          locality: areaFilter,
          sortBy,
          order,
        });

        if (balanceFilter === 'zero') query.append('paid', 'true');
        else if (balanceFilter === 'due') query.append('unpaid', 'true');
        else if (balanceFilter === 'advance') query.append('advance', 'true');

        if (dueToday) query.append('dueToday', 'true');
        if (dueTomorrow) query.append('dueTomorrow', 'true');
        if (dueNext5Days) query.append('dueNext5Days', 'true');

        // const res = await fetch(
        //   `https://cabletv-billingsystem.onrender.com/api/customers?${query.toString()}`
        // );
        const res = await apiClient.get(`/customers?${query.toString()}`);
        console.log;
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch');

        setCustomers(data.data);
        setTotalPages(data.pagination.totalPages);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load customers');
      }
      setLoading(false);
    };

    fetchCustomers();
  }, [
    page,
    limit,
    searchTerm,
    statusFilter,
    balanceFilter,
    areaFilter,
    dueToday,
    dueTomorrow,
    dueNext5Days,
    sortBy,
    order,
  ]);

  useEffect(() => {
    // Reset page to 1 on filter change
    setPage(1);
  }, [
    searchTerm,
    statusFilter,
    balanceFilter,
    areaFilter,
    dueToday,
    dueTomorrow,
    dueNext5Days,
  ]);

  const handleDownloadExcel = () => {
    if (!customers.length) return toast.error('No data');
    downloadCustomersToExcel(customers, 'customers.xlsx');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
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
      <Card>
        <CardHeader className="hidden sm:block">
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <CustomerFilters
            onSearchChange={setSearchTerm}
            onStatusChange={setStatusFilter}
            onBalanceChange={setBalanceFilter}
            onAreaChange={setAreaFilter}
            onDueTodayChange={setDueToday}
            onDueTomorrowChange={setDueTomorrow}
            onDueNext5DaysChange={setDueNext5Days}
            onSortChange={setSortBy}
            onOrderChange={setOrder}
          />
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="hidden sm:block">
          <CardTitle>All Customers ({customers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomerTable customers={customers} loading={loading} />
          <CustomerPagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
