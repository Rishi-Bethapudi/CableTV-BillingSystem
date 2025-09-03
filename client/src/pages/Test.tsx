'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface Product {
  id: number;
  name: string;
  type: 'SD' | 'HD';
  payType: 'PAY' | 'FTA';
  price: number;
}

interface Customer {
  id: string | number;
  name: string;
  phone: string;
  active: boolean;
  productIds: number[];
  lastBillDate: string;
  expiryDate: string;
  currentPlan: Product;
}

interface Props {
  customer: Customer;
  products: Product[];
}

export default function Test({ customer, products }: Props) {
  const [step, setStep] = useState<'menu' | 'select' | 'preview'>('menu');
  const [open, setOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Product | null>(null);
  const [changeDate, setChangeDate] = useState<Date>(new Date());

  const calculateProrated = () => {
    const cycleStart = new Date(customer.lastBillDate);
    const cycleEnd = new Date(customer.expiryDate);
    const oneDay = 1000 * 60 * 60 * 24;

    const totalDays =
      Math.round((cycleEnd.getTime() - cycleStart.getTime()) / oneDay) + 1;
    const remainingDays =
      Math.round((cycleEnd.getTime() - changeDate.getTime()) / oneDay) + 1;

    const oldRate = customer.currentPlan.price / totalDays;
    const newRate = (selectedPlan?.price ?? 0) / totalDays;

    return {
      remainingDays,
      creditAmount: oldRate * remainingDays,
      chargeAmount: newRate * remainingDays,
      net: newRate * remainingDays - oldRate * remainingDays,
    };
  };

  const handleConfirm = () => {
    toast.success(`Subscription changed to ${selectedPlan?.name}`);
    setOpen(false);
    setStep('menu');
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="bg-purple-50 dark:bg-purple-900/20">
        <CardTitle className="text-lg">Subscription</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span>Status:</span>
          <Badge
            className={
              customer.active
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }
          >
            {customer.active ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        <div className="flex justify-between items-center">
          <span>Plan:</span>
          <span className="font-medium">{customer.currentPlan.name}</span>
        </div>

        <div className="flex justify-between items-center">
          <span>Expiry Date:</span>
          <span>
            {new Date(customer.expiryDate).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-3">
          <Button variant="outline" onClick={() => setOpen(true)}>
            Change Subscription
          </Button>
          <Button variant="destructive">Remove Subscription</Button>
        </div>
      </CardContent>

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
                {products.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPlan(p)}
                    className={`p-3 border rounded-lg cursor-pointer ${
                      selectedPlan?.id === p.id
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
                      <Button
                        variant="outline"
                        onClick={() => setStep('select')}
                      >
                        Back
                      </Button>
                      <Button onClick={handleConfirm}>
                        Confirm & Pay ₹{calc.net.toFixed(2)}
                      </Button>
                    </div>
                  </div>
                );
              })()}
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
