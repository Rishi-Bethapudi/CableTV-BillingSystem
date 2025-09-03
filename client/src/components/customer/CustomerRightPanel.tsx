// File: components/customer/CustomerRightPanel.tsx

import { Suspense, lazy } from 'react';
import { Customer } from '@/utils/data';
import { Loader2 } from 'lucide-react';

interface Props {
  customer: Customer;
  activeSection: string;
}

// Lazy load sections
const CollectPaymentSection = lazy(() => import('./CollectPaymentSection'));
const RenewSection = lazy(() => import('./RenewSection'));
const SubscriptionSection = lazy(() => import('./SubscriptionSection'));
const AdjustBalanceSection = lazy(() => import('./AdjustBalanceSection'));
const AddOnBillSection = lazy(() => import('./AddOnBillSection'));
const ActiveInactiveSection = lazy(() => import('./ActiveInactiveSection'));
const AdditionalChargeSection = lazy(() => import('./AdditionalChargeSection'));
const BalanceHistorySection = lazy(() => import('./BalanceHistorySection'));
const HardwareDetailsSection = lazy(() => import('./HardwareDetailsSection'));
const CustomerEditSection = lazy(() => import('./CustomerEditSection'));

export default function CustomerRightPanel({ customer, activeSection }: Props) {
  return (
    <div className="w-full space-y-6 transition-all animate-in fade-in zoom-in duration-300">
      <Suspense
        fallback={
          <div className="flex justify-center items-center p-6 min-h-[200px]">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        }
      >
        {(() => {
          switch (activeSection) {
            case 'collect-payment':
              return <CollectPaymentSection customer={customer} />;
            case 'renew':
              return <RenewSection customer={customer} />;
            case 'subscription':
              return <SubscriptionSection customer={customer} />;
            case 'adjust-balance':
              return <AdjustBalanceSection customer={customer} />;
            case 'add-on-bill':
              return <AddOnBillSection customer={customer} />;
            case 'active-inactive':
              return <ActiveInactiveSection customer={customer} />;
            case 'additional-charge':
              return <AdditionalChargeSection />;
            case 'balance-history':
              return <BalanceHistorySection />;
            case 'hardware-details':
              return <HardwareDetailsSection customer={customer} />;
            case 'customer-edit':
              return <CustomerEditSection customer={customer} />;
            default:
              return <CollectPaymentSection customer={customer} />;
          }
        })()}
      </Suspense>
    </div>
  );
}
