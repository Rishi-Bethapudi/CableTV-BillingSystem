import React, { useState, useEffect } from 'react';
import { Search, Calendar, Package, User, CreditCard } from 'lucide-react';
import apiClient from '@/utils/apiClient';
import { toast } from 'sonner';
import type { Customer } from '@/utils/data';

interface RenewSubscriptionProps {
  customer: Customer;
  isVisible: boolean;
}
const RenewSubscription = ({ customer, isVisible }: RenewSubscriptionProps) => {
  // Sample customer data - replace with your actual data
  // const [customer] = useState({
  //   id: '687cfdcc9624e0a93a377f4a',
  //   name: 'John Doe',
  //   balanceAmount: 150,
  //   lastBillDate: '2024-12-15',
  //   expiryDate: '2025-01-15', // Change this to test expired state: "2024-12-01"
  //   currentPackageId: '6864a1b1c9e8d4f2a1b3c8d2',
  //   currentPackageName: 'Premium Package',
  // });

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [selectedPackage, setSelectedPackage] = useState('');
  const [packages, setPackages] = useState([]);
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [renewLoading, setRenewLoading] = useState(false);

  // Check if subscription is expired
  const isExpired = new Date(customer.expiryDate) < new Date();

  // Calculate end date when start date or period changes
  useEffect(() => {
    if (fromDate && selectedPeriod) {
      const startDate = new Date(fromDate);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + parseInt(selectedPeriod));
      setToDate(endDate.toISOString().split('T')[0]);
    }
  }, [fromDate, selectedPeriod]);

  // Filter packages based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = packages.filter(
        (pkg) =>
          pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pkg.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPackages(filtered);
    } else {
      setFilteredPackages(packages);
    }
  }, [searchTerm, packages]);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/products');
      const data = res.data;
      setPackages(data);
      setFilteredPackages(data);

      // Find the package name using customer's currentPackageId
      if (customer?.productId[0] && data.length > 0) {
        const matchedPackage = data.find(
          (pkg: any) => pkg._id === customer.productId[0]
        );

        if (matchedPackage) {
          setSelectedPackage(matchedPackage.name);
          setSearchTerm(matchedPackage.name);
        } else {
          // fallback to first package if not found
          setSelectedPackage(data[0].name);
          setSearchTerm(data[0].name);
        }
      } else if (data.length > 0) {
        // default fallback: use first package
        setSelectedPackage(data[0].name);
        setSearchTerm(data[0].name);
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

  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg.name);
    setSearchTerm(pkg.name);
    setShowDropdown(false);
  };

  const handleRenewToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setFromDate(today);
  };

  const handleRenew = async () => {
    const selectedPkg = packages.find((pkg) => pkg.name === selectedPackage);
    if (!selectedPkg) {
      alert('Please select a package');
      return;
    }

    const payload = {
      customerId: customer._id,
      productId: selectedPkg._id,
      note: 'Subscription renewal',
    };

    setRenewLoading(true);
    try {
      // Mock API call - replace with actual API endpoint
      await apiClient.post('/transactions/billing', payload);
      // console.log('Renewing subscription with payload:', payload);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success('Subscription renewed successfully!');
    } catch (error) {
      console.error('Error renewing subscription:', error);
      alert('Failed to renew subscription. Please try again.');
    } finally {
      setRenewLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header with dynamic background */}
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
            {isExpired && (
              <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                EXPIRED
              </span>
            )}
          </h2>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Section */}
            <div className="space-y-4">
              {/* Customer Name */}
              <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-3">
                <User className="w-5 h-5 text-gray-500" />
                <div className="flex-1">
                  <span className="text-sm text-gray-600">Customer Name:</span>
                  <div className="font-semibold text-gray-900">
                    {customer.name}
                  </div>
                </div>
              </div>

              {/* Current Balance */}
              <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    Current Balance:
                  </span>
                </div>
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

              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={toDate}
                    readOnly
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Period Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Period
                </label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="30">30 Days</option>
                  <option value="60">60 Days</option>
                  <option value="90">90 Days</option>
                  <option value="180">180 Days</option>
                  <option value="365">365 Days</option>
                </select>
              </div>

              {/* Searchable Package Dropdown */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Package
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    placeholder="Search packages..."
                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {showDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {loading ? (
                      <div className="p-3 text-center text-gray-500">
                        Loading packages...
                      </div>
                    ) : filteredPackages.length > 0 ? (
                      filteredPackages.map((pkg) => (
                        <div
                          key={pkg._id}
                          onClick={() => handlePackageSelect(pkg)}
                          className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-gray-900">
                            {pkg.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            ₹{pkg.customerPrice}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-center text-gray-500">
                        No packages found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Section: Current Subscription */}
            <div
              className={`p-6 rounded-lg h-fit ${
                isExpired
                  ? 'bg-red-50 border border-red-200'
                  : 'bg-green-50 border border-green-200'
              }`}
            >
              <h4
                className={`text-lg font-semibold mb-4 ${
                  isExpired ? 'text-red-800' : 'text-green-800'
                }`}
              >
                Current Subscription
              </h4>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span
                    className={`font-bold text-sm px-2 py-1 rounded ${
                      isExpired
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {isExpired ? 'EXPIRED' : 'ACTIVE'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Active until:</span>
                  <span
                    className={`font-bold ${
                      isExpired ? 'text-red-600' : 'text-green-600'
                    }`}
                  >
                    {formatDate(customer.expiryDate)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Last renewal:</span>
                  <span className="font-bold text-gray-800">
                    {formatDate(customer.lastPaymentDate)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    Current Package:
                  </span>
                  <span className="font-bold text-gray-800">
                    {selectedPackage || 'N/A'}
                  </span>
                </div>

                {fromDate && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">New period:</span>
                    <span className="font-bold text-blue-600">
                      {selectedPeriod} days
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row gap-4 pt-6 border-t border-gray-200">
            <button
              onClick={handleRenewToday}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Renew From Today
            </button>
            <button
              onClick={handleRenew}
              disabled={renewLoading || !selectedPackage || !fromDate}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                renewLoading || !selectedPackage || !fromDate
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {renewLoading ? 'Renewing...' : 'Renew Subscription'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RenewSubscription;
