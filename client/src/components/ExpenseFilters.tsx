
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface ExpenseFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  paymentMethodFilter: string;
  setPaymentMethodFilter: (method: string) => void;
  categories: string[];
  paymentMethods: string[];
  onClearFilters: () => void;
  onPageChange: (page: number) => void;
}

export function ExpenseFilters({
  searchTerm,
  setSearchTerm,
  categoryFilter,
  setCategoryFilter,
  paymentMethodFilter,
  setPaymentMethodFilter,
  categories,
  paymentMethods,
  onClearFilters,
  onPageChange
}: ExpenseFiltersProps) {
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onPageChange(1);
  };

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    onPageChange(1);
  };

  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethodFilter(value);
    onPageChange(1);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Search & Filters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Search by expense number, description, or vendor..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          <Select value={categoryFilter} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={paymentMethodFilter} onValueChange={handlePaymentMethodChange}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Filter by payment method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payment Methods</SelectItem>
              {paymentMethods.map((method) => (
                <SelectItem key={method} value={method}>{method}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={onClearFilters}>
            Clear Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
