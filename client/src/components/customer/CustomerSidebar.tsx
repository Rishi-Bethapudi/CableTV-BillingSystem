import {
  CreditCard,
  RefreshCw,
  Settings,
  DollarSign,
  Plus,
  Activity,
  Monitor,
  Edit,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface SidebarItem {
  key: string;
  label: string;
  icon: React.ElementType;
  isPrimary?: boolean;
}

const sidebarItems: SidebarItem[] = [
  {
    key: 'collect-payment',
    label: 'Collect Payment',
    icon: CreditCard,
    isPrimary: true,
  },
  { key: 'renew', label: 'Renew', icon: RefreshCw },
  { key: 'subscription', label: 'Subscription', icon: Settings },
  { key: 'adjust-balance', label: 'Adjust Balance', icon: DollarSign },
  { key: 'add-on-bill', label: 'Add On Bill', icon: Plus },
  { key: 'active-inactive', label: 'Active / Inactive', icon: Activity },
  { key: 'additional-charge', label: 'Additional Charge', icon: Plus },
  { key: 'balance-history', label: 'Balance History', icon: DollarSign },
  { key: 'hardware-details', label: 'Hardware Details', icon: Monitor },
  { key: 'customer-edit', label: 'Customer Edit', icon: Edit },
];

interface CustomerSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  layout?: 'vertical' | 'horizontal'; // 🚀 NEW
}

export default function CustomerSidebar({
  activeSection,
  setActiveSection,
  layout = 'vertical',
}: CustomerSidebarProps) {
  const isHorizontal = layout === 'horizontal';

  return (
    <Card className="w-full">
      <CardContent
        className={`p-3 ${
          isHorizontal ? 'flex flex-wrap gap-2 justify-center' : 'space-y-2'
        }`}
      >
        {sidebarItems.map(({ key, label, icon: Icon, isPrimary }) => {
          const isActive = activeSection === key;

          return (
            <Button
              key={key}
              onClick={() => setActiveSection(key)}
              size="sm"
              className={`
                flex items-center gap-2
                ${
                  isActive
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
                }
                ${isPrimary && !isActive ? 'font-semibold border-blue-300' : ''}
                ${isHorizontal ? 'px-3' : 'w-full justify-start'}
              `}
              variant="ghost"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}
