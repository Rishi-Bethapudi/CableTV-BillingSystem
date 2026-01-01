import React, { useState, useEffect } from 'react';
import { Search, Calendar, Package, User, CreditCard } from 'lucide-react';
import apiClient from '@/utils/apiClient';
import { toast } from 'sonner';
import type { Customer } from '@/utils/data';

interface RenewSubscriptionProps {
  customer: Customer;
  isVisible: boolean;
  onRefresh: () => void;
}

const RenewSubscription = ({
  customer,
  isVisible,
  onRefresh,
}: RenewSubscriptionProps) => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [selectedPackage, setSelectedPackage] = useState('');
  const [packages, setPackages] = useState<any[]>([]);
  const [filteredPackages, setFilteredPackages] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [renewLoading, setRenewLoading] = useState(false);

  const activeSubscription = customer?.subscriptions?.[0];
  const activeProduct = activeSubscription?.product;

  const isExpired = customer?.earliestExpiry
    ? new Date(customer.earliestExpiry) < new Date()
    : true;

  // 🔹 Auto-calc To date based on start date & period
  useEffect(() => {
    if (fromDate && selectedPeriod) {
      const start = new Date(fromDate);
      const end = new Date(start);
      end.setDate(start.getDate() + parseInt(selectedPeriod));
      setToDate(end.toISOString().split('T')[0]);
    }
  }, [fromDate, selectedPeriod]);

  // 🔹 Search filter
  useEffect(() => {
    if (searchTerm) {
      setFilteredPackages(
        packages.filter((pkg) =>
          pkg.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredPackages(packages);
    }
  }, [searchTerm, packages]);

  // 🔥 Fetch products from backend (as per Product model)
  const fetchPackages = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/products');
      const data = res.data;
      setPackages(data);
      setFilteredPackages(data);

      if (activeProduct) {
        const match = data.find((pkg: any) => pkg._id === activeProduct._id);
        if (match) {
          setSelectedPackage(match.name);
          setSearchTerm(match.name);
        }
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handlePackageSelect = (pkg: any) => {
    setSelectedPackage(pkg.name);
    setSearchTerm(pkg.name);
    setShowDropdown(false);
  };

  const handleRenewToday = () => {
    setFromDate(new Date().toISOString().split('T')[0]);
  };

  const handleRenew = async () => {
    const selectedPkg = packages.find((pkg) => pkg.name === selectedPackage);
    if (!selectedPkg) return alert('Please select a package');

    const payload = {
      customerId: customer._id,
      productId: selectedPkg._id,
      note: 'Subscription renewal',
      startDate: fromDate,
    };

    setRenewLoading(true);
    try {
      await apiClient.post('/transactions/billing', payload);
      toast.success('Subscription renewed successfully!');
      onRefresh?.();
    } catch (error) {
      console.error('Renew error:', error);
      toast.error('Renewal failed. Try again.');
    } finally {
      setRenewLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Info Banner */}
        <div
          className={`p-4 ${
            isExpired
              ? 'bg-red-50 border-l-4 border-red-500'
              : 'bg-green-50 border-l-4 border-green-500'
          }`}
        >
          <h2
            className={`text-lg font-medium flex items-center gap-2 ${
              isExpired ? 'text-red-800' : 'text-green-800'
            }`}
          >
            <Package className="w-4 h-4" />
            Renew Subscription
          </h2>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* LEFT – customer info & dates */}
            <div className="space-y-4">
              {/* Customer */}
              <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-3">
                <User className="w-5 h-5 text-gray-500" />
                <div>
                  <span className="text-sm text-gray-600">Customer Name:</span>
                  <div className="font-semibold text-gray-900">
                    {customer.name}
                  </div>
                </div>
              </div>

              {/* Balance */}
              <div className="bg-gray-50 p-4 rounded-lg flex justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-gray-500" />
                  Current Balance
                </span>
                <span className="font-semibold text-white bg-gray-700 px-3 py-1 rounded-md">
                  ₹{customer.balanceAmount}
                </span>
              </div>

              {/* Last Bill Date */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-600">Last Bill Date</span>
                </div>
                <div className="font-semibold text-gray-900">
                  {formatDate(customer.lastPaymentDate)}
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm mb-1 block">Start Date</label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="text-sm mb-1 block">End Date</label>
                  <input
                    type="date"
                    value={toDate}
                    readOnly
                    className="input-field bg-gray-100 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Period */}
              <div>
                <label className="text-sm mb-1 block">Period</label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="input-field"
                >
                  <option value="30">30 Days</option>
                  <option value="60">60 Days</option>
                  <option value="90">90 Days</option>
                  <option value="180">180 Days</option>
                  <option value="365">365 Days</option>
                </select>
              </div>
            </div>

            {/* RIGHT – subscription info */}
            <div
              className={`p-6 rounded-lg h-fit border ${
                isExpired
                  ? 'bg-red-50 border-red-200'
                  : 'bg-green-50 border-green-200'
              }`}
            >
              <h4
                className={`font-semibold mb-4 ${
                  isExpired ? 'text-red-800' : 'text-green-800'
                }`}
              >
                Current Subscription
              </h4>

              <div className="space-y-3">
                <StatusRow label="Status">
                  {isExpired ? 'EXPIRED' : 'ACTIVE'}
                </StatusRow>

                <StatusRow label="Active until">
                  {formatDate(customer.earliestExpiry)}
                </StatusRow>

                <StatusRow label="Last renewal">
                  {formatDate(customer.lastPaymentDate)}
                </StatusRow>

                <StatusRow label="Package">
                  {activeProduct?.name || 'Not Subscribed'}
                </StatusRow>
              </div>
            </div>
          </div>

          {/* 🔽 Package selection moved below current subscription */}
          <div className="relative">
            <label className="text-sm mb-1 block">Package</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Search package…"
                className="input-field pl-10"
              />
            </div>

            {showDropdown && (
              <div className="absolute z-10 w-full bg-white shadow-lg rounded-lg border mt-1 max-h-60 overflow-y-auto">
                {loading ? (
                  <div className="p-3 text-center text-gray-500">Loading…</div>
                ) : filteredPackages.length > 0 ? (
                  filteredPackages.map((pkg) => (
                    <div
                      key={pkg._id}
                      onClick={() => handlePackageSelect(pkg)}
                      className="p-3 hover:bg-gray-100 cursor-pointer"
                    >
                      <div className="font-medium">{pkg.name}</div>
                      <div className="text-sm text-gray-600">
                        ₹{pkg.customerPrice}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-gray-500">
                    No results
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 🔥 Buttons with BG */}
          <div className="flex flex-col md:flex-row gap-4 border-t pt-6">
            <button
              onClick={handleRenewToday}
              className="btn-secondary bg-gray-200"
            >
              Renew From Today
            </button>
            <button
              onClick={handleRenew}
              disabled={!selectedPackage || !fromDate || renewLoading}
              className="btn-primary bg-blue-600 text-white"
            >
              {renewLoading ? 'Renewing…' : 'Renew Subscription'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatusRow = ({ children, label }: any) => (
  <div className="flex justify-between text-sm">
    <span className="text-gray-600">{label}:</span>
    <span className="font-bold">{children}</span>
  </div>
);

export default RenewSubscription;
