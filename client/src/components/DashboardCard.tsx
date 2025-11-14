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
  onClick?: () => void;
  clickable?: boolean;
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
  onClick,
  clickable = false,
}: DashboardCardProps) {
  const isClickable = clickable && typeof onClick === 'function';

  return (
    <Card
      onClick={isClickable ? onClick : undefined}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : -1}
      onKeyDown={(e) => {
        if (isClickable && (e.key === 'Enter' || e.key === ' ')) onClick?.();
      }}
      className={cn(
        'relative overflow-hidden select-none',
        isClickable &&
          'cursor-pointer hover:shadow-lg active:scale-[0.98] transition-all',
        className
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          {/* Left */}
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {title}
            </p>

            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
              {typeof value === 'number' && currency
                ? `${value < 0 ? '-₹' : '₹'}${Math.abs(value).toLocaleString(
                    'en-IN'
                  )}`
                : value}
            </p>

            {secondaryValue !== undefined && SecondaryIcon && (
              <div className="flex items-center gap-1 mt-1 text-sm text-slate-500 dark:text-slate-400">
                <SecondaryIcon className="h-4 w-4" />
                <span className="font-medium">{secondaryValue}</span>
              </div>
            )}
          </div>

          {/* Right */}
          <div
            className={cn(
              'h-12 w-12 rounded-lg flex items-center justify-center',
              changeType === 'positive' &&
                'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300',
              changeType === 'negative' &&
                'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300',
              changeType === 'neutral' &&
                'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
            )}
          >
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
