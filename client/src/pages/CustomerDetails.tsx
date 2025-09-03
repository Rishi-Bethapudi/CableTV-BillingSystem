import { useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import CustomerHeader from '@/components/customer/CustomerHeader';
import CustomerMainDetails from '@/components/customer/CustomerMainDetails';
import CustomerSidebar from '@/components/customer/CustomerSidebar';
import CustomerRightPanel from '@/components/customer/CustomerRightPanel';

export default function CustomerDetails() {
  const { id } = useParams();
  const location = useLocation();
  const [customer, setCustomer] = useState(location.state?.customer || null);
  const [activeSection, setActiveSection] = useState<string | null>(
    'collect-payment'
  );
  if (!customer) {
    // fallback: fetch customer details by id
    return <div>Loading customer...</div>;
  }
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
