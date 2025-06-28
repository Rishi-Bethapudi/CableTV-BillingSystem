import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import CustomerHeader from '@/components/customer/CustomerHeader';
import CustomerMainDetails from '@/components/customer/CustomerMainDetails';
import CustomerSidebar from '@/components/customer/CustomerSidebar';
import CustomerRightPanel from '@/components/customer/CustomerRightPanel';

export default function CustomerDetails() {
  const { id } = useParams();
  const [activeSection, setActiveSection] = useState<string | null>(
    'collect-payment'
  );

  // Sample customer data - in real app, this would come from API
  const customer = {
    id: 1,
    firstName: 'Anjaneyulu',
    lastName: 'Janga',
    name: 'Anjaneyulu Janga',
    mobile: '+91 9963676402',
    area: 'Kandrapadu',
    agent: 'Agent 1',
    status: 'Active',
    balance: 0,
    lastBillDate: '2025-06-27',
    expiryDate: '2025-07-27',
    stbNumber: 'DSNW202dec08',
    membershipNo: '100740915',
    stbName: 'DASAN - Corpus',
    address: 'Kandrapadu, Andhra Pradesh',
    email: 'anjaneyulu@example.com',
    connectionDate: '2023-01-15',
    lastPayment: 350,
    lastPaymentDate: '2025-05-29',
  };

  const handleSidebarAction = (action: string) => {
    setActiveSection(activeSection === action ? null : action);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'expired':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto  space-y-3">
        {/* Header */}
        <CustomerHeader customer={customer} />
        {/* Main Grid Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* Main Content - 6 columns */}
          <div className="col-span-12 space-y-3">
            {/* Card 1: Customer Details */}
            <CustomerMainDetails customer={customer} />
          </div>

          <div className="col-span-3 space-y-4">
            <CustomerSidebar
              activeSection={activeSection}
              setActiveSection={setActiveSection}
            />
          </div>
          <div className="xl:col-span-9">
            <CustomerRightPanel
              customer={customer}
              activeSection={activeSection}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
