import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import CustomerHeader from '@/components/customer/CustomerHeader';
import CustomerMainDetails from '@/components/customer/CustomerMainDetails';
import CustomerSidebar from '@/components/customer/CustomerSidebar';
import CustomerRightPanel from '@/components/customer/CustomerRightPanel';
import apiClient from '@/utils/apiClient';

export default function CustomerDetails() {
  const { id } = useParams();
  const location = useLocation();

  const [customer, setCustomer] = useState(location.state?.customer || null);
  const [loading, setLoading] = useState(!location.state?.customer);
  const [activeSection, setActiveSection] = useState<string>('collect-payment');

  useEffect(() => {
    if (!customer && id) {
      const fetchCustomer = async () => {
        try {
          setLoading(true);
          const res = await apiClient.get(`/customers/${id}`);
          console.log('Fetched customer:', res.data);
          setCustomer(res.data);
        } catch (error) {
          console.error('Failed to fetch customer:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchCustomer();
    }
  }, [id, customer]);

  if (loading) {
    return <div className="p-6 text-gray-500">Loading customer...</div>;
  }

  if (!customer) {
    return <div className="p-6 text-red-500">Customer not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto space-y-3">
        {/* Header */}
        <CustomerHeader customer={customer} />

        {/* Top Customer Details */}
        <CustomerMainDetails customer={customer} />

        {/* Main Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar - 3 columns */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            <CustomerSidebar
              activeSection={activeSection}
              setActiveSection={setActiveSection}
            />
          </div>

          {/* Right Panel - 9 columns */}
          <div className="col-span-12 lg:col-span-9">
            <CustomerRightPanel
              customer={customer}
              activeSection={activeSection}
              onRefresh={async () => {
                if (id) {
                  const res = await apiClient.get(`/customers/${id}`);
                  setCustomer(res.data);
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
