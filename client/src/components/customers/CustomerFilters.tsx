import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Search, Filter, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onBalanceChange: (value: string) => void;
  onAreaChange: (value: string) => void;
}

export default function CustomerFilters({
  onSearchChange,
  onStatusChange,
  onBalanceChange,
  onAreaChange,
}: Props) {
  const [search, setSearch] = useState('');
  const [popoverOpen, setPopoverOpen] = useState(false);

  // Reset all filters
  const resetFilters = () => {
    onStatusChange('');
    onBalanceChange('');
    onAreaChange('');
    setSearch('');
  };

  // Debounce search input
  useEffect(() => {
    const debounce = setTimeout(() => {
      onSearchChange(search);
    }, 400);
    return () => clearTimeout(debounce);
  }, [search]);

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Mobile: Search + Filter + Reset */}
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

        {/* Filter Icon */}
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon">
              <Filter className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 space-y-4" align="end">
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
          </PopoverContent>
        </Popover>

        {/* Reset Icon */}
        <Button variant="outline" size="icon" onClick={resetFilters}>
          <RotateCcw className="h-5 w-5" />
        </Button>
      </div>

      {/* Desktop: Search + Filters + Reset */}
      <div className="hidden lg:flex items-center gap-4">
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

        <Button
          variant="ghost"
          onClick={resetFilters}
          className="text-sm gap-2"
        >
          <RotateCcw className="h-4 w-4" /> Reset
        </Button>
      </div>
    </div>
  );
}
