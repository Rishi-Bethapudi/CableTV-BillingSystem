// components/CollectionFilters.tsx
'use client';

import { useState, useEffect } from 'react';
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

export function CollectionFilters({
  onChange,
}: {
  onChange?: (filters: any) => void;
}) {
  // default date range = last month till today
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

  // notify parent whenever filters change
  useEffect(() => {
    onChange?.(filters);
  }, [filters, onChange]);

  const resetFilters = () => {
    setFilters({
      status: 'all',
      startDate: monthBefore,
      endDate: today,
      agent: 'all',
      area: 'all',
      payment: 'all',
    });
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4 ">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold mb-3">Filters and Options</h3>
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
              onValueChange={(val) => setFilters({ ...filters, status: val })}
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
          <div className="col-span-2">
            <CalendarRangePicker
              startDate={filters.startDate}
              endDate={filters.endDate}
              onChange={(start, end) =>
                setFilters({ ...filters, startDate: start, endDate: end })
              }
            />
          </div>

          {/* Agent */}
          <div>
            <Select
              value={filters.agent}
              onValueChange={(val) => setFilters({ ...filters, agent: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                <SelectItem value="agent1">Agent 1</SelectItem>
                <SelectItem value="agent2">Agent 2</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Area */}
          <div>
            <Select
              value={filters.area}
              onValueChange={(val) => setFilters({ ...filters, area: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Areas</SelectItem>
                <SelectItem value="kandrapadu">Kandrapadu</SelectItem>
                <SelectItem value="chennai">Chennai</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment */}
          <div>
            <Select
              value={filters.payment}
              onValueChange={(val) => setFilters({ ...filters, payment: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="online">Online</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
