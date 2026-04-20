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
import { useSelector, useDispatch } from 'react-redux';
import { loadUserFromStorage } from '../../redux/slices/authSlice';

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
  const today = useMemo(() => new Date(), []);
  const monthBefore = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d;
  }, []);

  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.auth.user);

  const [filters, setFilters] = useState({
    startDate: monthBefore,
    endDate: today,
    agent: 'all',
    area: 'all',
    payment: 'all',
  });

  const [agents, setAgents] = useState<Agent[]>([]);
  const [areas, setAreas] = useState<string[]>([]); // ✅ strings only

  useEffect(() => {
    dispatch(loadUserFromStorage());
  }, [dispatch]);

  useEffect(() => {
    if (!user) return;

    const userAgents = user.agents || [];
    const userSupervisors = user.supervisors || [];

    setAgents([
      { _id: 'all', name: 'All Agents' },
      ...userAgents,
      ...userSupervisors,
    ]);

    // ✅ Keep areas as strings (matches backend)
    setAreas(user.localities || []);
  }, [user]);

  useEffect(() => {
    onFilterChange?.(filters);
  }, [filters, onFilterChange]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.agent !== 'all') count++;
    if (filters.area !== 'all') count++;
    if (filters.payment !== 'all') count++;
    return count;
  }, [filters]);

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
            Reset Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          {/* Date Range */}
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

          {['agent', 'area', 'payment'].map((key) => (
            <div key={key}>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 block">
                {key}
              </label>

              <Select
                value={filters[key as keyof typeof filters] as string}
                onValueChange={(val) =>
                  setFilters((f) => ({ ...f, [key]: val }))
                }
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder={`Select ${key}`} />
                </SelectTrigger>

                <SelectContent>
                  {/* AGENT */}
                  {key === 'agent' &&
                    agents.map((a) => (
                      <SelectItem key={a._id} value={a._id}>
                        {a.name}
                      </SelectItem>
                    ))}

                  {/* AREA */}
                  {key === 'area' && (
                    <>
                      <SelectItem value="all">All Areas</SelectItem>
                      {areas.map((ar) => (
                        <SelectItem key={ar} value={ar}>
                          {ar}
                        </SelectItem>
                      ))}
                    </>
                  )}

                  {/* PAYMENT */}
                  {key === 'payment' && (
                    <>
                      <SelectItem value="all">All Modes</SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Online">Online</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
