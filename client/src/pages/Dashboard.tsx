import { useEffect } from 'react';
import { useLayout } from '@/components/layouts/LayoutContext';
import {
  IndianRupee,
  Users,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  UserPlus,
  MessageSquare,
  RotateCcw,
  Bell,
  LinkIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardCard } from '@/components/DashboardCard';

export default function Dashboard() {
  const { setHeaderActions } = useLayout();
  // Sample data - in real app, this would come from your backend
  const dashboardData = {
    monthlyCollection: 125000,
    todayCollection: 8500,
    pendingAmount: 45000,
    onlineCollection: 78000,
    todayRenewals: 23,
    monthlyRenewals: 345,
    upcomingRenewals: 67,
    expiredRenewals: 12,
    totalCustomers: 1234,
    activeCustomers: 1156,
    newCustomers: 34,
    pendingComplaints: 8,
    followUpCustomers: 15,
    recycleBin: 3,
  };
  useEffect(() => {
    setHeaderActions(
      <div className="flex gap-1">
        <Button variant="ghost" size="icon" onClick={() => {}}>
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => {}}>
          <LinkIcon className="h-5 w-5" />
        </Button>
      </div>
    );
    return () => setHeaderActions(null);
  }, []);

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

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-6">
        <DashboardCard
          title="Monthly Total Collection"
          value={dashboardData.monthlyCollection}
          icon={IndianRupee}
          currency={true}
          secondaryValue={345}
          secondaryIcon={Users}
          className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800"
        />
        <DashboardCard
          title="Today's Collection"
          value={dashboardData.todayCollection}
          icon={TrendingUp}
          secondaryValue={35}
          secondaryIcon={Users}
          currency={true}
          className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800"
        />
        <DashboardCard
          title="Total Pending Amount"
          value={dashboardData.pendingAmount}
          icon={AlertCircle}
          secondaryValue={345}
          secondaryIcon={Users}
          currency={true}
          className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800"
        />
        <DashboardCard
          title="Monthly Online Collection"
          value={dashboardData.onlineCollection}
          icon={CheckCircle}
          secondaryValue={345}
          secondaryIcon={Users}
          changeType="positive"
          currency={true}
          className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800"
        />
      </div>

      {/* Renewals & Activity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-6">
        <DashboardCard
          title="Today's Renewals"
          value={dashboardData.todayRenewals}
          icon={Calendar}
          changeType="neutral"
        />
        <DashboardCard
          title="This Month's Renewals"
          value={dashboardData.monthlyRenewals}
          icon={CheckCircle}
          changeType="positive"
        />
        <DashboardCard
          title="Upcoming Renewals"
          value={dashboardData.upcomingRenewals}
          icon={Clock}
        />
        <DashboardCard
          title="Expired Renewals"
          value={dashboardData.expiredRenewals}
          icon={AlertCircle}
        />
        <DashboardCard
          title="Total Customers"
          value={dashboardData.totalCustomers}
          icon={Users}
        />
        <DashboardCard
          title="New Customers This Month"
          value={dashboardData.newCustomers}
          icon={UserPlus}
        />
      </div>

      {/* Support & Maintenance Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-6">
        <DashboardCard
          title="Pending Complaints"
          value={dashboardData.pendingComplaints}
          icon={MessageSquare}
          changeType="negative"
        />
        <DashboardCard
          title="Today's Follow-ups"
          value={dashboardData.followUpCustomers}
          icon={Clock}
          changeType="positive"
        />
        <DashboardCard
          title="Recycle Bin"
          value={dashboardData.recycleBin}
          icon={RotateCcw}
          changeType="neutral"
        />
        <DashboardCard
          title="Active Agents"
          value="12"
          icon={Users}
          changeType="positive"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="min-h-16 text-sm p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-left">
            <div className="flex items-center space-x-3">
              <UserPlus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="font-medium text-slate-900 dark:text-white">
                Add New Customer
              </span>
            </div>
          </button>
          <button className="min-h-16 text-sm p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-left">
            <div className="flex items-center space-x-3">
              <IndianRupee className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span className="font-medium text-slate-900 dark:text-white">
                Collect Payment
              </span>
            </div>
          </button>
          <button className="min-h-16 text-sm p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-left">
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <span className="font-medium text-slate-900 dark:text-white">
                Process Renewals
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
