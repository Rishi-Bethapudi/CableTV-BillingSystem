'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  User,
  Tv,
  CreditCard,
  Phone,
  MapPin,
  Home,
  Settings,
  DollarSign,
  FileText,
  Save,
  ArrowLeft,
  X,
} from 'lucide-react';
// import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ConfirmationModal from '@/components/customer/ConfirmationModal';
import apiClient from '@/utils/apiClient';

interface FormData {
  // Personal Details
  fullName: string;
  mobileNumber: string;
  locality: string;
  billingAddress: string;

  // Hardware Details
  stbModel: string;
  stbNumber: string;
  cardNumber: string;

  // Billing & Plan Details
  connectionStartDate: string;
  subscriptionPlans: string[]; // ✅ changed to array
  openingBalance: string;
  additionalCharges: string;
  discount: string;
  remarks: string;
}

interface FormErrors {
  [key: string]: string;
}

interface STBOption {
  value: string;
  label: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
}

interface OperatorData {
  localities?: string[];
}

const AddCustomerPage: React.FC = () => {
  // const router = useRouter();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [operatorLocalities, setOperatorLocalities] = useState<string[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingOperator, setIsLoadingOperator] = useState(true);

  const [formData, setFormData] = useState<FormData>({
    // Personal Details
    fullName: '',
    mobileNumber: '',
    locality: '',
    billingAddress: '',

    // Hardware Details
    stbModel: '',
    stbNumber: '',
    cardNumber: '',

    // Billing & Plan Details
    connectionStartDate: new Date().toISOString().split('T')[0],
    subscriptionPlans: [],
    openingBalance: '',
    additionalCharges: '',
    discount: '',
    remarks: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const stbOptions: STBOption[] = [
    { value: 'STB-X', label: 'STB-X' },
    { value: 'STB-HD-2', label: 'STB-HD-2' },
    { value: 'ZAP-4K', label: 'ZAP-4K' },
  ];

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoadingProducts(true);
        const response = await apiClient.get('/products');
        setProducts(response.data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
        // You might want to show a toast notification here
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  // Fetch operator localities on component mount
  useEffect(() => {
    const fetchOperatorData = async () => {
      try {
        setIsLoadingOperator(true);
        const response = await apiClient.get('/operators/me');
        setOperatorLocalities(response.data?.localities || []);
      } catch (error) {
        console.error('Error fetching operator data:', error);
        // You might want to show a toast notification here
      } finally {
        setIsLoadingOperator(false);
      }
    };

    fetchOperatorData();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required field validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobileNumber.replace(/\D/g, ''))) {
      newErrors.mobileNumber = 'Mobile number must be 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Find selected product to get plan amount
      const selectedProduct = products.find(
        (p) => p.id === formData.subscriptionPlan
      );
      const planAmount = selectedProduct ? selectedProduct.price : 0;

      // Prepare payload according to API requirements
      const payload = {
        name: formData.fullName,
        mobile: formData.mobileNumber,
        locality: formData.locality,
        address: formData.billingAddress,
        stbModel: formData.stbModel,
        stbNumber: formData.stbNumber,
        cardNumber: formData.cardNumber,
        connectionStartDate: formData.connectionStartDate,
        productId: formData.subscriptionPlan,
        planAmount: planAmount,
        balanceAmount: parseFloat(formData.openingBalance) || 0,
        additionalCharges: parseFloat(formData.additionalCharges) || 0,
        discount: parseFloat(formData.discount) || 0,
        remark: formData.remarks,
      };

      const response = await apiClient.post('/customers', payload);

      if (response.status === 200 || response.status === 201) {
        alert('Customer added successfully!');

        // Reset form after successful submission
        setFormData({
          fullName: '',
          mobileNumber: '',
          locality: '',
          billingAddress: '',
          stbModel: '',
          stbNumber: '',
          cardNumber: '',
          connectionStartDate: new Date().toISOString().split('T')[0],
          subscriptionPlan: '',
          openingBalance: '',
          additionalCharges: '',
          discount: '',
          remarks: '',
        });
        setErrors({});

        // Navigate back or to customers list
        // router.back();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error adding customer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    // router.back();
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      mobileNumber: '',
      locality: '',
      billingAddress: '',
      stbModel: '',
      stbNumber: '',
      cardNumber: '',
      connectionStartDate: new Date().toISOString().split('T')[0],
      subscriptionPlan: '',
      openingBalance: '',
      additionalCharges: '',
      discount: '',
      remarks: '',
    });
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBack}
              className="inline-flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Add New Customer
          </h1>
          <p className="text-gray-600">
            Enter customer details to create a new account in the cable TV
            billing system
          </p>
        </div>

        <div className="space-y-6">
          {/* Section 1: Personal Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                Personal Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={(e) =>
                        handleInputChange('fullName', e.target.value)
                      }
                      className={`pl-10 ${
                        errors.fullName ? 'border-red-500' : ''
                      }`}
                      placeholder="Enter full name"
                    />
                  </div>
                  {errors.fullName && (
                    <Alert variant="destructive">
                      <AlertDescription>{errors.fullName}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobileNumber">
                    Mobile Number <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="mobileNumber"
                      type="tel"
                      value={formData.mobileNumber}
                      onChange={(e) =>
                        handleInputChange('mobileNumber', e.target.value)
                      }
                      className={`pl-10 ${
                        errors.mobileNumber ? 'border-red-500' : ''
                      }`}
                      placeholder="Enter 10-digit mobile number"
                    />
                  </div>
                  {errors.mobileNumber && (
                    <Alert variant="destructive">
                      <AlertDescription>{errors.mobileNumber}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="locality">Locality</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                    {operatorLocalities.length > 0 ? (
                      <Select
                        value={formData.locality}
                        onValueChange={(value) =>
                          handleInputChange('locality', value)
                        }
                      >
                        <SelectTrigger className="pl-10">
                          <SelectValue placeholder="Select locality" />
                        </SelectTrigger>
                        <SelectContent>
                          {operatorLocalities.map((locality, index) => (
                            <SelectItem key={index} value={locality}>
                              {locality}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id="locality"
                        type="text"
                        value={formData.locality}
                        onChange={(e) =>
                          handleInputChange('locality', e.target.value)
                        }
                        className="pl-10"
                        placeholder={
                          isLoadingOperator
                            ? 'Loading localities...'
                            : 'Enter area or neighborhood'
                        }
                        disabled={isLoadingOperator}
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billingAddress">Billing Address</Label>
                  <div className="relative">
                    <Home className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Textarea
                      id="billingAddress"
                      value={formData.billingAddress}
                      onChange={(e) =>
                        handleInputChange('billingAddress', e.target.value)
                      }
                      className="pl-10 resize-none"
                      rows={3}
                      placeholder="Enter detailed billing address"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Hardware Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Tv className="h-5 w-5 text-green-600" />
                </div>
                Hardware Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="stbModel">STB Name / Model</Label>
                  <div className="relative">
                    <Settings className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                    <Select
                      value={formData.stbModel}
                      onValueChange={(value) =>
                        handleInputChange('stbModel', value)
                      }
                    >
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="Select STB Model" />
                      </SelectTrigger>
                      <SelectContent>
                        {stbOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stbNumber">STB Number</Label>
                  <Input
                    id="stbNumber"
                    type="text"
                    value={formData.stbNumber}
                    onChange={(e) =>
                      handleInputChange('stbNumber', e.target.value)
                    }
                    placeholder="Enter STB serial number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="cardNumber"
                      type="text"
                      value={formData.cardNumber}
                      onChange={(e) =>
                        handleInputChange('cardNumber', e.target.value)
                      }
                      className="pl-10"
                      placeholder="Enter viewing card number"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Billing & Plan Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-purple-600" />
                </div>
                Billing & Plan Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="connectionStartDate">
                    Connection Start Date
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="connectionStartDate"
                      type="date"
                      value={formData.connectionStartDate}
                      onChange={(e) =>
                        handleInputChange('connectionStartDate', e.target.value)
                      }
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="subscriptionPlans">Subscription Plans</Label>
                  <Select
                    value=""
                    onValueChange={(value) => {
                      if (!formData.subscriptionPlans) {
                        setFormData((prev) => ({
                          ...prev,
                          subscriptionPlans: [value],
                        }));
                      } else if (!formData.subscriptionPlans.includes(value)) {
                        setFormData((prev) => ({
                          ...prev,
                          subscriptionPlans: [...prev.subscriptionPlans, value],
                        }));
                      }
                    }}
                    disabled={isLoadingProducts}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          isLoadingProducts
                            ? 'Loading products...'
                            : 'Select subscription plan(s)'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} - ₹{product.price}
                          {product.description && (
                            <span className="text-sm text-gray-500 block">
                              {product.description}
                            </span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Show selected products as tags */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.subscriptionPlans?.map((planId) => {
                      const product = products.find((p) => p.id === planId);
                      return (
                        <div
                          key={planId}
                          className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-sm"
                        >
                          {product?.name || 'Unknown'}
                          <button
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                subscriptionPlans:
                                  prev.subscriptionPlans?.filter(
                                    (id) => id !== planId
                                  ),
                              }))
                            }
                            className="text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="openingBalance">Opening Balance (₹)</Label>
                  <Input
                    id="openingBalance"
                    type="number"
                    value={formData.openingBalance}
                    onChange={(e) =>
                      handleInputChange('openingBalance', e.target.value)
                    }
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalCharges">
                    Additional Charges (₹)
                  </Label>
                  <Input
                    id="additionalCharges"
                    type="number"
                    value={formData.additionalCharges}
                    onChange={(e) =>
                      handleInputChange('additionalCharges', e.target.value)
                    }
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discount">Discount (%)</Label>
                  <Input
                    id="discount"
                    type="number"
                    value={formData.discount}
                    onChange={(e) =>
                      handleInputChange('discount', e.target.value)
                    }
                    placeholder="0"
                    min="0"
                    max="100"
                  />
                </div>

                <div className="md:col-span-2 lg:col-span-3 space-y-2">
                  <Label htmlFor="remarks">Remarks</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Textarea
                      id="remarks"
                      value={formData.remarks}
                      onChange={(e) =>
                        handleInputChange('remarks', e.target.value)
                      }
                      className="pl-10 resize-none"
                      rows={3}
                      placeholder="Add any internal notes about the customer..."
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCancelModal(true)}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => setShowSaveModal(true)}
              disabled={isSubmitting || isLoadingProducts}
              className="inline-flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? 'Saving...' : 'Save Customer'}
            </Button>
          </div>
        </div>
      </div>

      <ConfirmationModal
        open={showCancelModal}
        message="Are you sure you want to cancel? All changes will be lost."
        onConfirm={() => {
          resetForm();
          setShowCancelModal(false);
        }}
        onCancel={() => setShowCancelModal(false)}
      />

      <ConfirmationModal
        open={showSaveModal}
        message="Do you want to save this customer?"
        onConfirm={() => {
          setShowSaveModal(false);
          handleSubmit();
        }}
        onCancel={() => setShowSaveModal(false)}
      />
    </div>
  );
};

export default AddCustomerPage;
