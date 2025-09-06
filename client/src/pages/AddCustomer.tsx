'use client';

import React, { useState } from 'react';
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
import { Link } from 'react-router-dom';

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
  subscriptionPlan: string;
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

interface SubscriptionPlan {
  value: string;
  label: string;
  price: number;
}

const AddCustomerPage: React.FC = () => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
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
    subscriptionPlan: '',
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

  const subscriptionPlans: SubscriptionPlan[] = [
    { value: 'APSFL-BASIC', label: 'APSFL Basic - ₹350', price: 350 },
    { value: 'INTERNET-OTT', label: 'Internet & OTT - ₹450', price: 450 },
    { value: 'ALL-SPORTS-HD', label: 'All Sports HD - ₹550', price: 550 },
  ];

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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log('Form submitted:', formData);

      // Here you would typically make an API call to save the customer
      // const response = await fetch('/api/customers', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // })

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
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error adding customer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = (): void => {
    if (confirm('Are you sure you want to cancel? All changes will be lost.')) {
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
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
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
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="locality"
                      type="text"
                      value={formData.locality}
                      onChange={(e) =>
                        handleInputChange('locality', e.target.value)
                      }
                      className="pl-10"
                      placeholder="Enter area or neighborhood"
                    />
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
                  <Label htmlFor="subscriptionPlan">Subscription Plan</Label>
                  <Select
                    value={formData.subscriptionPlan}
                    onValueChange={(value) =>
                      handleInputChange('subscriptionPlan', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subscription plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {subscriptionPlans.map((plan) => (
                        <SelectItem key={plan.value} value={plan.value}>
                          {plan.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
              disabled={isSubmitting}
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
