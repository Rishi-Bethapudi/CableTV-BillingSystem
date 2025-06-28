import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CustomerData {
  lastBillDate: string;
  expiryDate: string;
}

interface RenewSectionProps {
  customer: CustomerData;
  isVisible: boolean;
}

function RenewSection({ customer, isVisible }: RenewSectionProps) {
  const [fromDate, setFromDate] = useState(customer.expiryDate);
  const [toDate, setToDate] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [selectedPackage, setSelectedPackage] = useState('');

  useEffect(() => {
    const from = new Date(fromDate);
    const newToDate = new Date(from);
    newToDate.setDate(newToDate.getDate() + parseInt(selectedPeriod));
    setToDate(newToDate.toISOString().split('T')[0]);
  }, [fromDate, selectedPeriod]);

  const handleRenewToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setFromDate(today);
  };

  const handleRenew = () => {
    console.log('Renewing subscription:', {
      fromDate,
      toDate,
      selectedPackage,
      selectedPeriod,
    });
  };

  return (
    <Card className="w-full">
      <CardHeader className="bg-green-50 dark:bg-green-900/20">
        <CardTitle className="text-lg">Renew Subscription</CardTitle>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Section */}
          <div className="space-y-3">
            {/* Customer Name */}
            <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Customer Name:
              </span>
              <span className="font-semibold">{customer?.firstName}</span>
            </div>

            {/* Current Balance */}
            <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Current Balance:
              </span>
              <span className="font-semibold text-white bg-slate-700 px-2 py-1 rounded-md">
                ₹{customer?.balance}
              </span>
            </div>

            {/* Last Bill Date */}
            <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg">
              <Label className="text-sm text-muted-foreground">
                Last Bill Date
              </Label>
              <div className="font-semibold">{customer.lastBillDate}</div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input type="date" value={toDate} readOnly />
              </div>
            </div>

            {/* Period Dropdown */}
            <div>
              <Label>Period</Label>
              <Select
                value={selectedPeriod}
                onValueChange={(value) => setSelectedPeriod(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 Days</SelectItem>
                  <SelectItem value="60">60 Days</SelectItem>
                  <SelectItem value="90">90 Days</SelectItem>
                  <SelectItem value="180">180 Days</SelectItem>
                  <SelectItem value="365">365 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Package Dropdown */}
            <div>
              <Label>Package</Label>
              <Select
                value={selectedPackage}
                onValueChange={setSelectedPackage}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select package" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic - ₹300</SelectItem>
                  <SelectItem value="premium">Premium - ₹500</SelectItem>
                  <SelectItem value="gold">Gold - ₹750</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Right Section: Current Subscription */}
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg h-fit">
            <h4 className="text-base font-semibold mb-3">
              Current Subscription
            </h4>
            <p className="text-sm text-muted-foreground">
              Active until:{' '}
              <span className="font-bold">{customer.expiryDate}</span>
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Last renewal on:{' '}
              <span className="font-bold">{customer.lastBillDate}</span>
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Suggested renewal period:{' '}
              <span className="font-bold">{selectedPeriod} days</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-3 mt-6">
          <Button
            onClick={handleRenewToday}
            variant="outline"
            className="w-full md:w-1/2"
          >
            Renew From Today
          </Button>
          <Button
            onClick={handleRenew}
            className="w-full md:w-1/2 bg-green-600 hover:bg-green-700 text-white"
          >
            Renew Subscription
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default RenewSection;
