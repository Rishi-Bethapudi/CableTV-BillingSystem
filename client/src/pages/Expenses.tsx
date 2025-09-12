import { useState, useEffect } from 'react';
import { ExpenseFormDialog } from '../components/expenses/ExpenseFormDialog';
import { ExpenseFilters } from '../components/expenses/ExpenseFilters';
import { ExpenseTable } from '../components/expenses/ExpenseTable';
import { ExpensePagination } from '../components/expenses/ExpensePagination';
import { Button } from '@/components/ui/button';
import { Download, Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import apiClient from '@/utils/apiClient';
import type { Expense, ExpenseFormData } from '@/utils/data';

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Fetch expenses from API
  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/expenses');

      setExpenses(response.data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (expenseData: ExpenseFormData) => {
    try {
      const response = await apiClient.post('/expenses', expenseData);
      setExpenses((prev) => [response.data, ...prev]);
      toast.success('Expense added successfully');
      return true;
    } catch (error) {
      console.error('Error adding expense:', error);
      toast.error('Failed to add expense');
      return false;
    }
  };

  // Get unique categories and payment methods for filter
  const categories = [...new Set(expenses.map((expense) => expense.category))];
  const paymentMethods = [
    ...new Set(expenses.map((expense) => expense.paymentMethod)),
  ];

  // Filter expenses
  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      expense.expenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (expense.vendor
        ? expense.vendor.toLowerCase().includes(searchTerm.toLowerCase())
        : false);

    const matchesCategory =
      categoryFilter === 'all' || expense.category === categoryFilter;
    const matchesPaymentMethod =
      paymentMethodFilter === 'all' ||
      expense.paymentMethod === paymentMethodFilter;

    return matchesSearch && matchesCategory && matchesPaymentMethod;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedExpenses = filteredExpenses.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setPaymentMethodFilter('all');
    setCurrentPage(1);
  };

  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredExpenses.map((expense) => ({
        'Expense Number': expense.expenseNumber,
        Date: expense.date,
        Category: expense.category,
        Vendor: expense.vendor || '',
        'Payment Method': expense.paymentMethod,
        Amount: expense.amount,
        Description: expense.description,
        'Receipt Number': expense.receiptNumber || '',
        Notes: expense.notes || '',
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Expenses');
    XLSX.writeFile(
      workbook,
      `expenses-${new Date().toISOString().split('T')[0]}.xlsx`
    );

    toast.success('Expenses exported successfully');
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Expenses
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm sm:text-base">
            Manage your company expenses and track spending (
            {filteredExpenses.length} expenses)
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={handleExport}
            variant="outline"
            className="flex items-center gap-2"
            disabled={filteredExpenses.length === 0}
          >
            <Download className="h-4 w-4" />
            Export
          </Button>

          <ExpenseFormDialog
            categories={categories}
            paymentMethods={paymentMethods}
            onExpenseAdded={addExpense}
            trigger={
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Expense
              </Button>
            }
          />
        </div>
      </div>

      {/* Search and Filters */}
      <ExpenseFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        paymentMethodFilter={paymentMethodFilter}
        setPaymentMethodFilter={setPaymentMethodFilter}
        categories={categories}
        paymentMethods={paymentMethods}
        onClearFilters={clearFilters}
        onPageChange={handlePageChange}
      />

      {/* Expense Table */}
      <div className="overflow-x-auto">
        <ExpenseTable
          expenses={paginatedExpenses}
          loading={loading}
          searchTerm={searchTerm}
          categoryFilter={categoryFilter}
          paymentMethodFilter={paymentMethodFilter}
          onClearFilters={clearFilters}
        />
      </div>

      {/* Pagination */}
      {filteredExpenses.length > 0 && (
        <ExpensePagination
          currentPage={currentPage}
          totalPages={totalPages}
          startIndex={startIndex}
          endIndex={endIndex}
          totalItems={filteredExpenses.length}
          onPageChange={handlePageChange}
        />
      )}

      {/* Empty State */}
      {!loading && filteredExpenses.length === 0 && (
        <div className="text-center py-12">
          <div className="text-slate-400 dark:text-slate-600 mb-4">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            No expenses found
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            {searchTerm ||
            categoryFilter !== 'all' ||
            paymentMethodFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Get started by adding your first expense'}
          </p>
          {(searchTerm ||
            categoryFilter !== 'all' ||
            paymentMethodFilter !== 'all') && (
            <Button onClick={clearFilters} variant="outline">
              Clear all filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
