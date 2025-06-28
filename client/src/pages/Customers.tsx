// File: app/(pages)/customers/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Download, Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { downloadCustomersToExcel } from '@/utils/excelUtils';
import { Customer, customers } from '@/utils/data';
import CustomerTable from '@/components/customers/CustomerTable';
import CustomerFilters from '@/components/customers/CustomerFilters';
import CustomerPagination from '@/components/customers/CustomerPagination';

const sampleData: Customer[] = customers;

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [balanceFilter, setBalanceFilter] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const filtered = useMemo(() => {
    let data = sampleData;

    if (searchTerm) {
      data = data.filter(
        (c) =>
          `${c.firstName} ${c.lastName}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          c.phone.includes(searchTerm) ||
          c.sCode.toString().includes(searchTerm)
      );
    }
    if (statusFilter) {
      data = data.filter((c) => c.status.toLowerCase() === statusFilter);
    }
    if (areaFilter) {
      data = data.filter((c) => c.area.toLowerCase() === areaFilter);
    }
    if (balanceFilter === 'zero') {
      data = data.filter((c) => c.balance === 0);
    } else if (balanceFilter === 'due') {
      data = data.filter((c) => c.balance > 0);
    } else if (balanceFilter === 'advance') {
      data = data.filter((c) => c.balance < 0);
    }

    return data;
  }, [searchTerm, statusFilter, areaFilter, balanceFilter]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages]);

  const handleDownloadExcel = () => {
    if (!sampleData.length) return toast.error('No data');
    downloadCustomersToExcel(sampleData, 'customers.xlsx');
  };

  return (
    <div className="space-y-4">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Customers
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Manage your customer database
          </p>
        </div>

        {/* Right: Actions */}
        <div className="flex gap-2">
          {/* Only shown on sm and up */}
          <div className="hidden sm:flex gap-2">
            <Button variant="outline" onClick={handleDownloadExcel}>
              <Download className="h-4 w-4 mr-2" /> Download Excel
            </Button>
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" /> Upload Excel
            </Button>
          </div>

          {/* Always show Add Customer */}
          <Button>
            <Plus className="h-4 w-4 mr-2" /> Add Customer
          </Button>
        </div>
      </div>

      {/* Filters Card */}
      <Card>
        {/* Hide heading on mobile */}
        <CardHeader className="hidden sm:block ">
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <CustomerFilters
            onSearchChange={setSearchTerm}
            onStatusChange={setStatusFilter}
            onBalanceChange={setBalanceFilter}
            onAreaChange={setAreaFilter}
          />
        </CardContent>
      </Card>

      {/* Customers Table Card */}
      <Card>
        <CardHeader className="hidden sm:block">
          <CardTitle>All Customers ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomerTable customers={paginated} />
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
