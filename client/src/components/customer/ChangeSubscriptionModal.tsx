'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Product, Customer } from '@/utils/data';
import apiClient from '@/utils/apiClient';
import { toast } from 'react-toastify';

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  customer: Customer;
}

export default function ChangeSubscriptionModal({
  open,
  setOpen,
  customer,
}: Props) {
  const [step, setStep] = useState<'menu' | 'select' | 'preview'>('menu');
  const [selectedPlan, setSelectedPlan] = useState<Product | null>(null);
  const [changeDate, setChangeDate] = useState<Date>(new Date());
  const [saving, setSaving] = useState(false);

  // Dummy available products – replace with fetch if needed
  const availablePlans: Product[] = [
    { _id: '1', name: 'Basic SD', price: 200 },
    { _id: '2', name: 'Premium HD', price: 350 },
  ];

  const calculateProrated = () => {
    const cycleStart = new Date(customer.lastBillDate);
    const cycleEnd = new Date(customer.expiryDate);
    const oneDay = 1000 * 60 * 60 * 24;

    const totalDays =
      Math.round((cycleEnd.getTime() - cycleStart.getTime()) / oneDay) + 1;
    const remainingDays =
      Math.round((cycleEnd.getTime() - changeDate.getTime()) / oneDay) + 1;

    const oldRate =
      (availablePlans.find((p) => p._id === customer.productId[0])?.price ??
        0) / totalDays;
    const newRate = (selectedPlan?.price ?? 0) / totalDays;

    return {
      remainingDays,
      creditAmount: oldRate * remainingDays,
      chargeAmount: newRate * remainingDays,
      net: newRate * remainingDays - oldRate * remainingDays,
    };
  };

  const handleConfirm = async () => {
    try {
      setSaving(true);
      await apiClient.put(`/subscriptions/${customer._id}/change`, {
        productId: selectedPlan?._id,
        effectiveFrom: changeDate,
      });
      toast.success('Subscription changed successfully');
      setOpen(false);
      setStep('menu');
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || 'Failed to change subscription'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-3xl">
        {step === 'menu' && (
          <>
            <DialogHeader>
              <DialogTitle>Select Change Option</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Button
                className="w-full"
                onClick={() => {
                  setChangeDate(new Date(customer.lastBillDate));
                  setStep('select');
                }}
              >
                Change From Last Bill Date
              </Button>
              <Button
                className="w-full"
                onClick={() => {
                  setChangeDate(new Date());
                  setStep('select');
                }}
              >
                Change From Today
              </Button>
              <Button
                className="w-full"
                onClick={() => {
                  setChangeDate(new Date());
                  setStep('select');
                }}
              >
                Change From Any Date
              </Button>
            </div>
          </>
        )}

        {step === 'select' && (
          <>
            <DialogHeader>
              <DialogTitle>Select New Plan</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availablePlans.map((p) => (
                <div
                  key={p._id}
                  onClick={() => setSelectedPlan(p)}
                  className={`p-3 border rounded-lg cursor-pointer ${
                    selectedPlan?._id === p._id
                      ? 'border-teal-500 bg-teal-50'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium">{p.name}</div>
                  <div className="text-sm text-gray-500">₹{p.price}</div>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <Button
                disabled={!selectedPlan}
                onClick={() => setStep('preview')}
              >
                Continue
              </Button>
            </div>
          </>
        )}

        {step === 'preview' && selectedPlan && (
          <>
            <DialogHeader>
              <DialogTitle>Prorated Bill Preview</DialogTitle>
            </DialogHeader>
            {(() => {
              const calc = calculateProrated();
              return (
                <div className="space-y-3">
                  <p>
                    Change effective from{' '}
                    {changeDate.toLocaleDateString('en-GB')}.
                  </p>
                  <div className="flex justify-between text-sm">
                    <span>Credit for unused plan</span>
                    <span className="text-green-600">
                      +₹{calc.creditAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Charge for new plan</span>
                    <span className="text-red-600">
                      -₹{calc.chargeAmount.toFixed(2)}
                    </span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-bold">
                    <span>Net Due Today</span>
                    <span>₹{calc.net.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => setStep('select')}>
                      Back
                    </Button>
                    <Button onClick={handleConfirm} disabled={saving}>
                      {saving
                        ? 'Processing...'
                        : `Confirm & Pay ₹${calc.net.toFixed(2)}`}
                    </Button>
                  </div>
                </div>
              );
            })()}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
