import type { Customer } from '@/utils/data';

export default function CustomerMainDetails({
  customer,
}: {
  customer: Customer;
}) {
  const device =
    customer.devices?.find((d) => d.active) || customer.devices?.[0];

  // Fallback for last transaction fields if not populated
  const lastPaymentAmount =
    customer.lastTransaction?.amount ?? customer.lastPaymentAmount ?? 0;
  const lastPaymentDate =
    customer.lastTransaction?.createdAt ?? customer.lastPaymentDate;

  // Calculate balance display
  const balance = Number(customer.balanceAmount ?? 0);
  const balanceDisplay =
    balance > 0
      ? `₹${balance.toLocaleString('en-IN')} Due`
      : balance < 0
      ? `₹${Math.abs(balance).toLocaleString('en-IN')} Advance`
      : '₹0';

  const balanceClass =
    balance > 0
      ? 'text-red-600'
      : balance < 0
      ? 'text-green-600'
      : 'text-gray-900 dark:text-white';

  const activeSubscriptions =
    customer.subscriptions?.filter((s) => s.status === 'active').length ?? 0;

  return (
    <div className="space-y-3">
      {/* Customer Overview */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-md p-4 sm:p-6">
        <h2 className="text-lg font-semibold mb-3">Customer Overview</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <InfoBlock
            label="Balance"
            value={balanceDisplay}
            className={balanceClass}
          />

          <InfoBlock
            label="Last Payment"
            value={
              lastPaymentDate
                ? new Date(lastPaymentDate).toLocaleDateString('en-IN')
                : 'N/A'
            }
          />

          <InfoBlock label="Area" value={customer.locality ?? 'N/A'} />

          <InfoBlock
            label="Active Subscriptions"
            value={`${activeSubscriptions}`}
          />
        </div>
      </div>

      {/* Hardware Details */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-md p-4 sm:p-6">
        <h2 className="text-lg font-semibold mb-3">Hardware Details</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <InfoBlock label="STB No" value={device?.stbNumber ?? 'N/A'} />
          <InfoBlock label="Card No" value={device?.cardNumber ?? 'N/A'} />
          <InfoBlock label="Active Device" value={device ? 'Yes' : 'No'} />
          <InfoBlock
            label="Total Devices"
            value={`${customer.devices?.length ?? 0}`}
          />
        </div>
      </div>
    </div>
  );
}

function InfoBlock({
  label,
  value,
  className,
}: {
  label: string;
  value: string | number;
  className?: string;
}) {
  return (
    <div className="flex flex-col">
      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      <span
        className={`font-semibold ${
          className ?? 'text-gray-900 dark:text-white'
        }`}
      >
        {value}
      </span>
    </div>
  );
}
