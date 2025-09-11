import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

import CustomerHeader from '@/components/customer/CustomerHeader';
import CustomerMainDetails from '@/components/customer/CustomerMainDetails';
import CustomerSidebar from '@/components/customer/CustomerSidebar';
import CustomerRightPanel from '@/components/customer/CustomerRightPanel';
import apiClient from '@/utils/apiClient';
import axios from 'axios';

export default function CustomerDetails() {
  const { id } = useParams();

  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('collect-payment');

  const fetchCustomer = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      // const res = await axios.get(`https://ht9t3tq8-5000.inc1.devtunnels.ms/api/customers/${id}`);
      // const res = await apiClient.get(`/customers/${id}`);
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
    if (!customer && id) {
      fetchCustomer();
    }
  }, [id, customer, fetchCustomer]);

  if (loading) {
    return (
      <div className="p-6 animate-pulse space-y-4">
        <div className="h-6 bg-gray-300 rounded w-1/3"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="flex justify-center items-center h-64 text-gray-500">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Loading customer...
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  if (!customer) {
    return <div className="p-6 text-red-500">Customer not found.</div>;
  }
  console.log('Rendering CustomerDetails with customer:', customer);
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto space-y-3">
        {/* Header */}
        <CustomerHeader customer={customer} />

        {/* Top Details */}
        <CustomerMainDetails customer={customer} />

        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            <CustomerSidebar
              activeSection={activeSection}
              setActiveSection={setActiveSection}
            />
          </div>

          {/* Right Panel */}
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
  );
}
