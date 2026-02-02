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
import { Customer } from '@/utils/data';
import ExcelUploadDialog from '@/components/ExcelUploadDialog';

export default function CustomersPage() {
  const navigate = useNavigate();
  const { setHeaderActions } = useLayout();

  const [showSearch, setShowSearch] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

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
    deleted: false,
  });

  const [page, setPage] = useState(1);
  const limit = 20;

  // ================= FETCH CUSTOMERS =================
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

      if (filters.balanceFilter) query.append('balance', filters.balanceFilter);
      if (filters.dueToday) query.append('dueToday', 'true');
      if (filters.dueTomorrow) query.append('dueTomorrow', 'true');
      if (filters.dueNext5Days) query.append('dueNext5Days', 'true');
      if (filters.deleted) query.append('includeDeleted', 'true');

      const res = await apiClient.get(`/customers?${query.toString()}`);
      setCustomers(res.data?.data || []);
      setTotalPages(res.data?.pagination?.totalPages ?? 1);
    } catch {
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

  // ================= EXCEL UPLOAD =================
  const handleUploadCustomersExcel = async (file: File) => {
    if (!file) return;

    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];

    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid Excel file (.xlsx or .xls)');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      toast.loading('Uploading customers...');

      const res = await apiClient.post('/customers/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000,
      });

      toast.dismiss();
      toast.success(res.data?.message || 'Customers imported successfully');

      setShowUploadDialog(false);
      fetchCustomers(); // 🔥 refresh data
    } catch (err: any) {
      toast.dismiss();
      toast.error(err.response?.data?.message || 'Upload failed');
      console.error('Customer Excel Upload Error:', err);
    }
  };

  // ================= HEADER ACTIONS =================
  useEffect(() => {
    setHeaderActions(
      <div className="flex items-center gap-2">
        {showSearch ? (
          <div className="flex items-center border rounded-md px-2 w-full sm:w-64">
            <Search className="h-4 w-4 text-gray-500" />
            <Input
              autoFocus
              type="search"
              placeholder="Search customers..."
              className="pl-2 h-7 text-xs border-0 focus-visible:ring-0"
              onBlur={() => setShowSearch(false)}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  searchTerm: e.target.value,
                }))
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
        <Button variant="ghost" size="icon">
          <Filter className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>,
    );
    return () => setHeaderActions(null);
  }, [showSearch]);

  // ================= DOWNLOAD =================
  const handleDownload = () => {
    if (!customers.length) return toast.error('No data');
    downloadCustomersToExcel(customers, 'customers.xlsx');
  };

  return (
    <div className="space-y-4 w-full">
      {/* Header */}
      <div className="hidden sm:flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground mt-1">
            Manage your customer database
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" /> Download Excel
          </Button>
          <Button variant="outline" onClick={() => setShowUploadDialog(true)}>
            <Upload className="h-4 w-4 mr-2" /> Upload Excel
          </Button>
          <Button onClick={() => navigate('/add-customer')}>
            <Plus className="h-4 w-4 mr-2" /> Add Customer
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="hidden sm:block rounded-md border bg-white">
        <div className="p-4">
          <CustomerFilters filters={filters} setFilters={setFilters} />
        </div>
      </div>

      {/* Table */}
      <CustomerTable
        customers={customers}
        loading={loading}
        sortField={filters.sortBy}
        sortOrder={filters.order}
        onSort={(field, order) =>
          setFilters((prev) => ({ ...prev, sortBy: field, order }))
        }
      />

      {/* Pagination */}
      <CustomerPagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {/* Upload Dialog */}
      <ExcelUploadDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        title="Upload Customers"
        description="Upload Excel file with customer data"
        onUpload={handleUploadCustomersExcel}
      />
    </div>
  );
}
