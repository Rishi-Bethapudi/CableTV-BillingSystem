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

import { XCircle } from 'lucide-react';

import CalendarRangePicker from '@/components/CalendarRangePicker';

import { useSelector } from 'react-redux';

import { RootState } from '@/redux/store';

interface CollectionFiltersProps {
  onFilterChange?: (filters: any) => void;

  onReset?: () => void;
}

interface Agent {
  _id: string;

  name: string;
}

export function CollectionFilters({
  onFilterChange,
  onReset,
}: CollectionFiltersProps) {
  // ---------------- DATES ----------------
  const today = useMemo(() => new Date(), []);

  const monthBefore = useMemo(() => {
    const d = new Date();

    d.setMonth(d.getMonth() - 1);

    return d;
  }, []);

  // ---------------- USER ----------------
  const user = useSelector((state: RootState) => state.auth.user);

  // ---------------- FILTER STATE ----------------
  const [filters, setFilters] = useState({
    startDate: monthBefore,

    endDate: today,

    agent: 'all',

    area: 'all',

    payment: 'all',
  });

  // ---------------- AGENTS ----------------
  const agents = useMemo(() => {
    if (!user) return [];

    const mappedAgents: Agent[] = [];

    // ALL OPTION
    mappedAgents.push({
      _id: 'all',
      name: 'All Agents',
    });

    // INCLUDE SELF IF OPERATOR
    if (user.role === 'operator' || user.role === 'supervisor') {
      mappedAgents.push({
        _id: user._id,
        name: `${user.name} (You)`,
      });
    }

    // ASSIGNED AGENTS
    if (Array.isArray(user.agents)) {
      mappedAgents.push(...user.agents);
    }

    // SUPERVISORS
    if (Array.isArray(user.supervisors)) {
      mappedAgents.push(...user.supervisors);
    }

    // REMOVE DUPLICATES
    const uniqueAgents = mappedAgents.filter(
      (agent, index, self) =>
        index === self.findIndex((a) => a._id === agent._id),
    );

    return uniqueAgents;
  }, [user]);

  // ---------------- AREAS ----------------
  const areas = useMemo(() => {
    if (!user) return [];

    // localities assigned to current user
    return Array.isArray(user.localities) ? user.localities : [];
  }, [user]);

  // ---------------- FILTER CHANGE ----------------
  useEffect(() => {
    onFilterChange?.(filters);
  }, [filters, onFilterChange]);

  // ---------------- ACTIVE FILTER COUNT ----------------
  const activeFilterCount = useMemo(() => {
    let count = 0;

    if (filters.agent !== 'all') count++;

    if (filters.area !== 'all') count++;

    if (filters.payment !== 'all') count++;

    return count;
  }, [filters]);

  // ---------------- RESET ----------------
  const handleReset = () => {
    setFilters({
      startDate: monthBefore,

      endDate: today,

      agent: 'all',

      area: 'all',

      payment: 'all',
    });

    onReset?.();
  };

  return (
    <Card className="mb-6 border-none shadow-sm bg-slate-50/50">
      <CardContent className="p-6">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              Filter Collections
            </h3>

            <p className="text-sm text-slate-500">
              Refine report by date, agent, or location
            </p>
          </div>

          <Button
            variant={activeFilterCount > 0 ? 'destructive' : 'outline'}
            size="sm"
            onClick={handleReset}
            className="transition-all"
          >
            {activeFilterCount > 0 && <XCircle className="mr-2 h-4 w-4" />}
            Reset Filters
            {activeFilterCount > 0 && ` (${activeFilterCount})`}
          </Button>
        </div>

        {/* FILTERS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          {/* DATE RANGE */}
          <div className="lg:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 block">
              Date Range
            </label>

            <CalendarRangePicker
              startDate={filters.startDate}
              endDate={filters.endDate}
              onChange={(start, end) =>
                setFilters((f) => ({
                  ...f,
                  startDate: start,
                  endDate: end,
                }))
              }
            />
          </div>

          {/* AGENT */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 block">
              Agent
            </label>

            <Select
              value={filters.agent}
              onValueChange={(val) =>
                setFilters((f) => ({
                  ...f,
                  agent: val,
                }))
              }
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select Agent" />
              </SelectTrigger>

              <SelectContent>
                {agents.map((agent) => (
                  <SelectItem key={agent._id} value={agent._id}>
                    {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* AREA */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 block">
              Area
            </label>

            <Select
              value={filters.area}
              onValueChange={(val) =>
                setFilters((f) => ({
                  ...f,
                  area: val,
                }))
              }
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select Area" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All Areas</SelectItem>

                {areas.map((area) => (
                  <SelectItem key={area} value={area}>
                    {area}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* PAYMENT */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 block">
              Payment
            </label>

            <Select
              value={filters.payment}
              onValueChange={(val) =>
                setFilters((f) => ({
                  ...f,
                  payment: val,
                }))
              }
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Payment Mode" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All Modes</SelectItem>

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
