import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

import CustomerHeader from '@/components/customer/CustomerHeader';
import CustomerMainDetails from '@/components/customer/CustomerMainDetails';
import CustomerSidebar from '@/components/customer/CustomerSidebar';
import CustomerRightPanel from '@/components/customer/CustomerRightPanel';
import apiClient from '@/utils/apiClient';
import type { Customer } from '@/utils/data';

export default function CustomerDetails() {
  const { id } = useParams();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('collect-payment');

  const fetchCustomer = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get(`/customers/${id}`);
      setCustomer(res.data);
    } catch (err) {
      console.error('Failed to fetch customer:', err);
      setError('Failed to load customer. Please try again later.');
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  if (loading)
    return (
      <div className="p-6 flex justify-center items-center text-gray-500">
        <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading customer...
      </div>
    );

  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!customer)
    return <div className="p-6 text-red-500">Customer not found.</div>;
  console.log('Rendering CustomerDetails for:', customer);
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto space-y-3">
        <CustomerHeader customer={customer} />

        <CustomerMainDetails customer={customer} />

        <div className="space-y-6">
          {/* Sidebar becomes horizontal on small screens, vertical on lg */}
          <div className="block lg:hidden">
            <CustomerSidebar
              activeSection={activeSection}
              setActiveSection={setActiveSection}
              layout="horizontal"
            />
          </div>

          <div className="grid grid-cols-12 gap-6">
            <div className="hidden lg:block lg:col-span-3">
              <CustomerSidebar
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                layout="vertical"
              />
            </div>

            <div className="col-span-12 lg:col-span-9">
              <CustomerRightPanel
                customer={customer}
                activeSection={activeSection}
                onRefresh={fetchCustomer}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
