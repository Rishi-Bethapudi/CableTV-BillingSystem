'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { Search, Filter, RotateCcw } from 'lucide-react';

interface Props {
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onBalanceChange: (value: string) => void;
  onAreaChange: (value: string) => void;
  onDueTodayChange: (value: boolean) => void;
  onDueTomorrowChange: (value: boolean) => void;
  onDueNext5DaysChange: (value: boolean) => void;
  onSortChange: (value: string) => void;
  onOrderChange: (value: string) => void;
}

export default function CustomerFilters({
  onSearchChange,
  onStatusChange,
  onBalanceChange,
  onAreaChange,
  onDueTodayChange,
  onDueTomorrowChange,
  onDueNext5DaysChange,
  onSortChange,
  onOrderChange,
}: Props) {
  const [search, setSearch] = useState('');
  const [popoverOpen, setPopoverOpen] = useState(false);

  const [dueFilters, setDueFilters] = useState({
    dueToday: false,
    dueTomorrow: false,
    dueNext5Days: false,
  });

  const filterOptions = [
    { key: 'dueToday', label: 'Due Today' },
    { key: 'dueTomorrow', label: 'Due Tomorrow' },
    { key: 'dueNext5Days', label: 'Due in 5 Days' },
  ] as const;

  const toggleFilter = (key: keyof typeof dueFilters) => {
    setDueFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const resetFilters = () => {
    onStatusChange('');
    onBalanceChange('');
    onAreaChange('');
    onDueTodayChange(false);
    onDueTomorrowChange(false);
    onDueNext5DaysChange(false);
    onSortChange('');
    onOrderChange('');
    setDueFilters({
      dueToday: false,
      dueTomorrow: false,
      dueNext5Days: false,
    });
    setSearch('');
    onSearchChange('');
  };

  // debounce search
  useEffect(() => {
    const debounce = setTimeout(() => {
      onSearchChange(search);
    }, 400);
    return () => clearTimeout(debounce);
  }, [search]);

  // sync due filters with parent
  useEffect(() => {
    onDueTodayChange(dueFilters.dueToday);
    onDueTomorrowChange(dueFilters.dueTomorrow);
    onDueNext5DaysChange(dueFilters.dueNext5Days);
  }, [dueFilters]);

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
      <div className="flex flex-col gap-4 w-full">
        {/* Mobile */}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search customers..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 space-y-4" align="end">
              {/* Balance */}
              <Select onValueChange={onBalanceChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Balance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zero">Zero/Paid</SelectItem>
                  <SelectItem value="due">Unpaid</SelectItem>
                  <SelectItem value="advance">Advance</SelectItem>
                </SelectContent>
              </Select>

              {/* Status */}
              <Select onValueChange={onStatusChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="disconnected">Disconnected</SelectItem>
                </SelectContent>
              </Select>

              {/* Area */}
              <Select onValueChange={onAreaChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by area" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="guntur">Guntur</SelectItem>
                  <SelectItem value="vijayawada">Vijayawada</SelectItem>
                  <SelectItem value="mangalagiri">Mangalagiri</SelectItem>
                  <SelectItem value="tenali">Tenali</SelectItem>
                </SelectContent>
              </Select>

              {/* Due filters */}
              <div className="space-y-2">
                {filterOptions.map(({ key, label }) => (
                  <label
                    key={key}
                    className={`flex items-center gap-2 text-sm px-3 py-1 rounded-md cursor-pointer transition-colors
                    ${
                      dueFilters[key]
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={dueFilters[key]}
                      onChange={() => toggleFilter(key)}
                      className="accent-primary"
                    />
                    {label}
                  </label>
                ))}
              </div>

              {/* Sort */}
              <Select onValueChange={onSortChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="balanceAmount">Balance</SelectItem>
                  <SelectItem value="expiryDate">Expiry</SelectItem>
                </SelectContent>
              </Select>

              {/* Order */}
              <Select onValueChange={onOrderChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
              </Select>
            </PopoverContent>
          </Popover>

          <Button variant="outline" size="icon" onClick={resetFilters}>
            <RotateCcw className="h-5 w-5" />
          </Button>
        </div>

        {/* Desktop */}
        <div className="hidden lg:flex items-center gap-4">
          {/* Balance */}
          <Select onValueChange={onBalanceChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select Balance" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="zero">Zero/Paid</SelectItem>
              <SelectItem value="due">Unpaid</SelectItem>
              <SelectItem value="advance">Advance</SelectItem>
            </SelectContent>
          </Select>

          {/* Status */}
          <Select onValueChange={onStatusChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="disconnected">Disconnected</SelectItem>
            </SelectContent>
          </Select>

          {/* Area */}
          <Select onValueChange={onAreaChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by area" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="guntur">Guntur</SelectItem>
              <SelectItem value="vijayawada">Vijayawada</SelectItem>
              <SelectItem value="mangalagiri">Mangalagiri</SelectItem>
              <SelectItem value="tenali">Tenali</SelectItem>
            </SelectContent>
          </Select>

          {/* Due filters */}
          <div className="flex gap-2">
            {filterOptions.map(({ key, label }) => (
              <label
                key={key}
                className={`flex items-center gap-2 text-sm px-3 py-1 rounded-md cursor-pointer transition-colors
                ${
                  dueFilters[key]
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <input
                  type="checkbox"
                  checked={dueFilters[key]}
                  onChange={() => toggleFilter(key)}
                  className="accent-primary"
                />
                {label}
              </label>
            ))}
          </div>

          {/* Sort */}
          <Select onValueChange={onSortChange}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="balanceAmount">Balance</SelectItem>
              <SelectItem value="expiryDate">Expiry</SelectItem>
            </SelectContent>
          </Select>

          {/* Order */}
          <Select onValueChange={onOrderChange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Asc</SelectItem>
              <SelectItem value="desc">Desc</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            onClick={resetFilters}
            className="text-sm gap-2"
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
