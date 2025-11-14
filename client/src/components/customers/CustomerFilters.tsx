import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { RotateCcw } from 'lucide-react';

interface Props {
  filters: any;
  setFilters: (updater: any) => void;
  operatorAreas?: string[];
}

export default function CustomerFilters({
  filters,
  setFilters,
  operatorAreas,
}: Props) {
  const reset = () => {
    setFilters({
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
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      <Select
        value={filters.statusFilter}
        onValueChange={(v) =>
          setFilters((p: any) => ({ ...p, statusFilter: v }))
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.balanceFilter}
        onValueChange={(v) =>
          setFilters((p: any) => ({ ...p, balanceFilter: v }))
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Balance" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="zero">Zero / Paid</SelectItem>
          <SelectItem value="due">Due</SelectItem>
          <SelectItem value="advance">Advance</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.areaFilter}
        onValueChange={(v) => setFilters((p: any) => ({ ...p, areaFilter: v }))}
      >
        <SelectTrigger>
          <SelectValue placeholder="Area" />
        </SelectTrigger>
        <SelectContent>
          {(operatorAreas || []).map((area) => (
            <SelectItem key={area} value={area}>
              {area}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.sortBy}
        onValueChange={(v) => setFilters((p: any) => ({ ...p, sortBy: v }))}
      >
        <SelectTrigger>
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="name">Name</SelectItem>
          <SelectItem value="balanceAmount">Balance</SelectItem>
          <SelectItem value="earliestExpiry">Expiry</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.order}
        onValueChange={(v) => setFilters((p: any) => ({ ...p, order: v }))}
      >
        <SelectTrigger>
          <SelectValue placeholder="Order" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="asc">Ascending</SelectItem>
          <SelectItem value="desc">Descending</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="ghost" onClick={reset} className="gap-1">
        <RotateCcw className="h-4 w-4" /> Reset
      </Button>
    </div>
  );
}
