// File: components/customer/CustomerMainDetails.tsx
interface CustomerProps {
  customer: {
    name: string;
    mobile?: string;
    locality?: string;
    balance?: number;
    lastBillDate?: string;
    stbName?: string;
    stbNumber?: string;
    cardNumber?: string;
  };
}

export default function CustomerMainDetails({ customer }: CustomerProps) {
  return (
    <div className="space-y-3">
      {/* Customer Overview */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-md p-4 sm:p-6">
        <h2 className="text-lg font-semibold mb-3">Customer Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Balance
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              ₹{customer.balance?.toLocaleString() ?? 0}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Last Bill Date
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {customer.lastBillDate
                ? new Date(customer.lastBillDate).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'N/A'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Area
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {customer.locality ?? 'N/A'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Mobile
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {customer.mobile ? customer.mobile.replace('+91 ', '') : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Hardware Details */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-md p-4 sm:p-6">
        <h2 className="text-lg font-semibold mb-3">Hardware Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              STB Name
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {customer.stbName ?? 'N/A'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              STB No
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {customer.stbNumber ?? 'N/A'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Card No
            </span>
            <span className="font-semibold text-gray-400">
              {customer.cardNumber ?? 'N/A'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Membership No
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {customer.cardNumber ?? 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
