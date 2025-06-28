import { useState } from 'react';
import { ExpenseFormDialog } from '@/components/ExpenseFormDialog';
import { ExpenseFilters } from '@/components/ExpenseFilters';
import { ExpenseTable } from '@/components/ExpenseTable';
import { ExpensePagination } from '@/components/ExpensePagination';

export default function Expenses() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Sample expense data with more entries for pagination demo
  const expenses = [
    {
      id: 1,
      expenseNumber: 'EXP001',
      date: '2024-01-15',
      category: 'Rent',
      vendor: 'Landlord Inc.',
      paymentMethod: 'Check',
      amount: 1200,
      description: 'Monthly rent for office space',
      receiptNumber: 'REC123',
      notes: 'Paid via check #456'
    },
    {
      id: 2,
      expenseNumber: 'EXP002',
      date: '2024-01-16',
      category: 'Utilities',
      vendor: 'Power Corp',
      paymentMethod: 'Credit Card',
      amount: 350,
      description: 'Electricity bill for January',
      receiptNumber: 'REC124',
      notes: 'Paid online with card ending in 1234'
    },
    {
      id: 3,
      expenseNumber: 'EXP003',
      date: '2024-01-17',
      category: 'Supplies',
      vendor: 'Office Depot',
      paymentMethod: 'Cash',
      amount: 150,
      description: 'Office supplies: paper, pens, etc.',
      receiptNumber: 'REC125',
      notes: 'Purchased in-store'
    },
    {
      id: 4,
      expenseNumber: 'EXP004',
      date: '2024-01-18',
      category: 'Marketing',
      vendor: 'Ad Agency',
      paymentMethod: 'Wire Transfer',
      amount: 2000,
      description: 'Payment for online ad campaign',
      receiptNumber: 'REC126',
      notes: 'Transfer ref: AD202401'
    },
    {
      id: 5,
      expenseNumber: 'EXP005',
      date: '2024-01-19',
      category: 'Travel',
      vendor: 'Airline Co.',
      paymentMethod: 'Credit Card',
      amount: 800,
      description: 'Flight tickets for conference',
      receiptNumber: 'REC127',
      notes: 'Card ending in 5678'
    },
    {
      id: 6,
      expenseNumber: 'EXP006',
      date: '2024-01-20',
      category: 'Salaries',
      vendor: null,
      paymentMethod: 'Direct Deposit',
      amount: 5000,
      description: 'Employee salaries for January',
      receiptNumber: null,
      notes: 'Payroll run'
    },
    {
      id: 7,
      expenseNumber: 'EXP007',
      date: '2024-01-21',
      category: 'Maintenance',
      vendor: 'Repair Services',
      paymentMethod: 'Check',
      amount: 250,
      description: 'Repair of office equipment',
      receiptNumber: 'REC128',
      notes: 'Check #789'
    },
    {
      id: 8,
      expenseNumber: 'EXP008',
      date: '2024-01-22',
      category: 'Insurance',
      vendor: 'Insurance Co.',
      paymentMethod: 'Online',
      amount: 400,
      description: 'Business insurance premium',
      receiptNumber: 'REC129',
      notes: 'Paid via online portal'
    },
    {
      id: 9,
      expenseNumber: 'EXP009',
      date: '2024-01-23',
      category: 'Training',
      vendor: 'Training Institute',
      paymentMethod: 'Credit Card',
      amount: 600,
      description: 'Employee training course',
      receiptNumber: 'REC130',
      notes: 'Card ending in 9012'
    },
    {
      id: 10,
      expenseNumber: 'EXP010',
      date: '2024-01-24',
      category: 'Software',
      vendor: 'Software Inc.',
      paymentMethod: 'Credit Card',
      amount: 300,
      description: 'Subscription to project management software',
      receiptNumber: 'REC131',
      notes: 'Monthly subscription'
    },
    {
      id: 11,
      expenseNumber: 'EXP011',
      date: '2024-01-25',
      category: 'Rent',
      vendor: 'Landlord Inc.',
      paymentMethod: 'Check',
      amount: 1200,
      description: 'Monthly rent for office space',
      receiptNumber: 'REC132',
      notes: 'Paid via check #457'
    },
    {
      id: 12,
      expenseNumber: 'EXP012',
      date: '2024-01-26',
      category: 'Utilities',
      vendor: 'Power Corp',
      paymentMethod: 'Credit Card',
      amount: 350,
      description: 'Electricity bill for January',
      receiptNumber: 'REC133',
      notes: 'Paid online with card ending in 3456'
    }
  ];

  // Get unique categories and payment methods for filter
  const categories = [...new Set(expenses.map(expense => expense.category))];
  const paymentMethods = [...new Set(expenses.map(expense => expense.paymentMethod))];

  // Filter expenses
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = 
      expense.expenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (expense.vendor ? expense.vendor.toLowerCase().includes(searchTerm.toLowerCase()) : false);
    
    const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
    const matchesPaymentMethod = paymentMethodFilter === 'all' || expense.paymentMethod === paymentMethodFilter;
    
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

  const handleExpenseAdded = () => {
    // In a real app, this would refresh the data from the server
    // For now, we just keep the existing sample data
    console.log('Expense added, refreshing data...');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Expenses</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage your company expenses and track spending ({filteredExpenses.length} expenses)
          </p>
        </div>
        <ExpenseFormDialog 
          categories={categories}
          paymentMethods={paymentMethods}
          onExpenseAdded={handleExpenseAdded}
        />
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
      <ExpenseTable
        expenses={paginatedExpenses}
        searchTerm={searchTerm}
        categoryFilter={categoryFilter}
        paymentMethodFilter={paymentMethodFilter}
        onClearFilters={clearFilters}
      />

      {/* Pagination */}
      <ExpensePagination
        currentPage={currentPage}
        totalPages={totalPages}
        startIndex={startIndex}
        endIndex={endIndex}
        totalItems={filteredExpenses.length}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
