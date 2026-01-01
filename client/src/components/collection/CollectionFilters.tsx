'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import CalendarRangePicker from '@/components/CalendarRangePicker';

interface CollectionFiltersProps {
  onFilterChange?: (filters: any) => void;
  onReset?: () => void;
}

export function CollectionFilters({
  onFilterChange,
  onReset,
}: CollectionFiltersProps) {
  const today = new Date();
  const monthBefore = new Date();
  monthBefore.setMonth(today.getMonth() - 1);

  const [filters, setFilters] = useState({
    status: 'all',
    startDate: monthBefore,
    endDate: today,
    agent: 'all',
    area: 'all',
    payment: 'all',
  });

  // count "meaningful" filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.status !== 'all') count++;
    if (filters.agent !== 'all') count++;
    if (filters.area !== 'all') count++;
    if (filters.payment !== 'all') count++;

    // date range not equal to default monthBefore–today
    const defStart = monthBefore.toDateString();
    const defEnd = today.toDateString();
    if (
      filters.startDate.toString() !== defStart ||
      filters.endDate.toString() !== defEnd
    ) {
      count++;
    }
    return count;
  }, [filters, monthBefore, today]);

  useEffect(() => {
    onFilterChange?.(filters);
  }, [filters, onFilterChange]);

  const resetFilters = () => {
    const reset = {
      status: 'all',
      startDate: monthBefore,
      endDate: today,
      agent: 'all',
      area: 'all',
      payment: 'all',
    };
    setFilters(reset);
    onReset?.();
  };

  const setQuickRange = (type: 'today' | 'last7' | 'month') => {
    const now = new Date();
    if (type === 'today') {
      setFilters((f) => ({ ...f, startDate: now, endDate: now }));
    } else if (type === 'last7') {
      const from = new Date();
      from.setDate(now.getDate() - 7);
      setFilters((f) => ({ ...f, startDate: from, endDate: now }));
    } else if (type === 'month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      setFilters((f) => ({ ...f, startDate: start, endDate: now }));
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4 ">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold mb-0">Filters and Options</h3>
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                Active filters: {activeFilterCount}
              </span>
            )}
          </div>

          {/* Reset */}
          <div>
            <Button variant="outline" className="w-full" onClick={resetFilters}>
              Reset
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
          {/* Status */}
          <div>
            <Select
              value={filters.status}
              onValueChange={(val) =>
                setFilters((f) => ({ ...f, status: val }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Data show or" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Data</SelectItem>
                <SelectItem value="paid">Paid Only</SelectItem>
                <SelectItem value="pending">Pending Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="col-span-2 space-y-2">
            <CalendarRangePicker
              startDate={filters.startDate}
              endDate={filters.endDate}
              onChange={(start, end) =>
                setFilters((f) => ({ ...f, startDate: start, endDate: end }))
              }
            />
            <div className="flex gap-2 flex-wrap text-xs">
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2"
                onClick={() => setQuickRange('today')}
              >
                Today
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2"
                onClick={() => setQuickRange('last7')}
              >
                Last 7 Days
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2"
                onClick={() => setQuickRange('month')}
              >
                This Month
              </Button>
            </div>
          </div>

          {/* Agent */}
          <div>
            <Select
              value={filters.agent}
              onValueChange={(val) => setFilters((f) => ({ ...f, agent: val }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                {/* TODO: replace with dynamic list */}
                <SelectItem value="agent1">Agent 1</SelectItem>
                <SelectItem value="agent2">Agent 2</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Area */}
          <div>
            <Select
              value={filters.area}
              onValueChange={(val) => setFilters((f) => ({ ...f, area: val }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Areas</SelectItem>
                {/* TODO: replace with dynamic list */}
                <SelectItem value="kandrapadu">Kandrapadu</SelectItem>
                <SelectItem value="chennai">Chennai</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment */}
          <div>
            <Select
              value={filters.payment}
              onValueChange={(val) =>
                setFilters((f) => ({ ...f, payment: val }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Online">Online</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
