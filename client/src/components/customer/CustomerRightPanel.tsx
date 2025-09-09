// File: components/customer/CustomerRightPanel.tsx

import { Suspense, lazy } from 'react';
import type { Customer } from '@/utils/data';
import { Loader2 } from 'lucide-react';

interface Props {
  customer: Customer;
  activeSection: string;
  refetchCustomer: () => void;
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

interface Props {
  customer: Customer;
  activeSection: string;
  onRefresh: () => void; // <-- accept onRefresh
}

export default function CustomerRightPanel({
  customer,
  activeSection,
  onRefresh,
}: Props) {
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
              return (
                <CollectPaymentSection
                  customer={customer}
                  onRefresh={onRefresh}
                />
              );
            case 'renew':
              return (
                <RenewSection
                  customer={customer}
                  isVisible={true}
                  onRefresh={onRefresh}
                />
              );
            case 'subscription':
              return (
                <SubscriptionSection
                  customer={customer}
                  isVisible={true}
                  onRefresh={onRefresh}
                />
              );
            case 'adjust-balance':
              return (
                <AdjustBalanceSection
                  customer={customer}
                  isVisible={true}
                  onRefresh={onRefresh}
                />
              );
            case 'add-on-bill':
              return (
                <AddOnBillSection
                  customer={customer}
                  isVisible={true}
                  onRefresh={onRefresh}
                />
              );
            case 'active-inactive':
              return (
                <ActiveInactiveSection
                  customer={customer}
                  isVisible={true}
                  onRefresh={onRefresh}
                />
              );
            case 'additional-charge':
              return (
                <AdditionalChargeSection
                  customer={customer}
                  isVisible={true}
                  onRefresh={onRefresh}
                />
              );
            case 'balance-history':
              return (
                <BalanceHistorySection
                  customer={customer}
                  isVisible={true}
                  onRefresh={onRefresh}
                />
              );
            case 'hardware-details':
              return (
                <HardwareDetailsSection
                  customer={customer}
                  isVisible={true}
                  onRefresh={onRefresh}
                />
              );
            case 'customer-edit':
              return (
                <CustomerEditSection
                  customer={customer}
                  isVisible={true}
                  onRefresh={onRefresh}
                />
              );
            default:
              return (
                <CollectPaymentSection
                  customer={customer}
                  onRefresh={onRefresh}
                />
              );
          }
        })()}
      </Suspense>
    </div>
  );
}
