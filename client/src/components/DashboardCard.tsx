import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  changeType?: 'positive' | 'negative' | 'neutral';
  className?: string;
  currency?: boolean;
  secondaryValue?: string | number;
  secondaryIcon?: LucideIcon;
}

export function DashboardCard({
  title,
  value,
  icon: Icon,
  changeType = 'neutral',
  className,
  currency = false,
  secondaryValue,
  secondaryIcon: SecondaryIcon,
}: DashboardCardProps) {
  return (
    <Card className={cn('relative overflow-hidden', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {title}
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
              {currency && typeof value === 'number'
                ? `₹${value.toLocaleString('en-IN')}`
                : value}
            </p>
            {secondaryValue !== undefined && SecondaryIcon && (
              <div className="flex items-center space-x-1 mt-1 text-sm text-slate-500 dark:text-slate-400">
                <SecondaryIcon className="h-4 w-4" />
                <span className="font-medium">{secondaryValue}</span>
              </div>
            )}
          </div>
          <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
            <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
