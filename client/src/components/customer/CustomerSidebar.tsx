// File: components/customer/CustomerSidebar.tsx

import {
  CreditCard,
  RefreshCw,
  Settings,
  DollarSign,
  Plus,
  Activity,
  Monitor,
  Calendar,
  Edit,
  Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface SidebarItem {
  key: string;
  label: string;
  icon: React.ElementType;
  isPrimary?: boolean;
}

interface CustomerSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
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
  // { key: 'customer-follow-up', label: 'Customer Follow Up', icon: Calendar },
  { key: 'customer-edit', label: 'Customer Edit', icon: Edit },
  // { key: 'upload-documents', label: 'Upload Documents', icon: Upload },
];

export default function CustomerSidebar({
  activeSection,
  setActiveSection,
}: CustomerSidebarProps) {
  return (
    <Card className="w-full sticky top-6">
      <CardContent className="p-4 space-y-2">
        {sidebarItems.map(({ key, label, icon: Icon, isPrimary }) => {
          const isActive = activeSection === key;
          return (
            <Button
              key={key}
              onClick={() => setActiveSection(key)}
              className={`w-full justify-start text-left ${
                isActive
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
              } ${
                isPrimary && !isActive ? 'font-semibold border-blue-300' : ''
              }`}
              variant="ghost"
            >
              <Icon className="h-4 w-4 mr-3" />
              {label}
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}
