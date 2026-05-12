import { Search, X } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';

import { Card, CardContent } from '@/components/ui/card';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AgentFiltersProps {
  searchTerm: string;

  statusFilter: string;

  onSearchChange: (value: string) => void;

  onStatusFilterChange: (value: string) => void;

  onClearFilters: () => void;
}

export default function AgentFilters({
  searchTerm,

  statusFilter,

  onSearchChange,

  onStatusFilterChange,

  onClearFilters,
}: AgentFiltersProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* SEARCH */}

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

            <Input
              type="search"
              placeholder="Search by name, mobile, email or employee code..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          {/* STATUS */}

          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>

              <SelectItem value="active">Active</SelectItem>

              <SelectItem value="inactive">Inactive</SelectItem>

              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>

          {/* CLEAR */}

          <Button variant="outline" onClick={onClearFilters} className="gap-2">
            <X className="h-4 w-4" />
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
