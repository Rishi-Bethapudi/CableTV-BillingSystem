
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

interface CustomerData {
  id: number;
  name: string;
  mobile: string;
  area: string;
  agent: string;
  status: string;
  balance: number;
  lastBillDate: string;
  expiryDate: string;
  stbNumber: string;
  membershipNo: string;
  stbName: string;
  address: string;
  email: string;
  connectionDate: string;
  lastPayment: number;
  lastPaymentDate: string;
}

interface CustomerMainContentProps {
  customer: CustomerData;
}

export function CustomerMainContent({ customer }: CustomerMainContentProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'expired':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    }
  };

  return (
    <div className="flex-1 space-y-6">
      {/* Customer Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          {customer.name}
          <Badge className={getStatusColor(customer.status)}>
            {customer.status}
          </Badge>
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          {customer.stbName} • {customer.stbNumber} • {customer.membershipNo}
        </p>
      </div>

      {/* Customer Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Balance Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Balance Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-center">₹{customer.balance}</div>
            <div className="text-sm text-center text-slate-500 mt-2">
              Till Date: {new Date(customer.lastBillDate).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })}
            </div>
          </CardContent>
        </Card>

        {/* Last Bill Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Last Bill Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-center">₹{customer.lastPayment}</div>
          </CardContent>
        </Card>
      </div>

      {/* Last Payment */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Last Payment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{customer.lastPayment}</div>
          <div className="text-sm text-slate-500 mt-1">
            Collected on: {new Date(customer.lastPaymentDate).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            })}
          </div>
        </CardContent>
      </Card>

      {/* Customer Details */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Mobile No.</Label>
              <div className="text-lg">{customer.mobile}</div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Billing Area</Label>
              <div className="text-lg">{customer.area}</div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Agent</Label>
              <div className="text-lg">{customer.agent}</div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Connection Date</Label>
              <div className="text-lg">
                {new Date(customer.connectionDate).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
