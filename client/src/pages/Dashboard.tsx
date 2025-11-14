import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLayout } from '@/components/layouts/LayoutContext';
import {
  IndianRupee,
  Users,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  UserPlus,
  MessageSquare,
  Bell,
  LinkIcon,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardCard } from '@/components/DashboardCard';
import { DashboardSkeleton } from '@/components/DashboardSkeleton';
import apiClient from '@/utils/apiClient';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const { setHeaderActions } = useLayout();

  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await apiClient.get('/reports/dashboard-summary');
      return res.data;
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    setHeaderActions(
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => refetch()}
          disabled={isRefetching}
          title="Refresh dashboard"
        >
          <RefreshCw
            className={`h-5 w-5 ${isRefetching ? 'animate-spin' : ''}`}
          />
        </Button>
        <Button variant="ghost" size="icon" title="Notifications">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" title="Quick links">
          <LinkIcon className="h-5 w-5" />
        </Button>
      </div>
    );
    return () => setHeaderActions(null);
  }, [isRefetching, refetch]);

  if (isLoading) return <DashboardSkeleton />;

  const primaryColors = [
    'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800',
    'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800',
    'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800',
    'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800',
  ];

  const openRoute = (item: any) => {
    if (!item.route || item.stat <= 0) return;
    navigate({
      pathname: item.route,
      search: item.params
        ? new URLSearchParams(item.params as any).toString()
        : undefined,
    });
  };

  return (
    <div className="space-y-6 px-4 sm:px-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Welcome back! Here's what's happening with your cable TV business
          today.
        </p>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-6">
        {data.primaryMetrics?.map((item: any, idx: number) => (
          <DashboardCard
            key={item.id}
            title={item.name}
            value={item.stat}
            currency={item.stat_type === 0}
            secondaryValue={item.des}
            secondaryIcon={
              item.name.includes('Pending')
                ? AlertCircle
                : item.name.includes('Customer')
                ? UserPlus
                : IndianRupee
            }
            icon={
              item.name.includes('Collection')
                ? IndianRupee
                : item.name.includes('Pending')
                ? AlertCircle
                : item.name.includes('Online')
                ? LinkIcon
                : CheckCircle
            }
            className={`bg-gradient-to-br ${primaryColors[idx]}`}
            clickable={!!item.route && item.stat > 0}
            onClick={() => openRoute(item)}
          />
        ))}
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-6">
        {data.secondaryMetrics?.map((item: any) => (
          <DashboardCard
            key={item.id}
            title={item.name}
            value={item.stat}
            icon={
              item.name.includes('Renewals')
                ? Calendar
                : item.name.includes('Upcoming')
                ? Clock
                : item.name.includes('Pending')
                ? AlertCircle
                : item.name.includes('Customer')
                ? Users
                : MessageSquare
            }
            changeType={
              item.name.includes('Expired') || item.name.includes('Pending')
                ? 'negative'
                : item.name.includes('Renewals') || item.name.includes('Active')
                ? 'positive'
                : 'neutral'
            }
            clickable={!!item.route && item.stat > 0}
            onClick={() => openRoute(item)}
          />
        ))}
      </div>
    </div>
  );
}
