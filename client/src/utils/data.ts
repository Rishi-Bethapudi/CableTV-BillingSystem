export interface CollectPaymentPayload {
  customerId: string;
  amount: number;
  method: string;
  note?: string;
  recordedAt?: string;
}
export interface SubscriptionDetails {
  _id: string;
  expiryDate: string;
  startDate: string;
  status: 'ACTIVE' | 'EXPIRED' | 'PAUSED' | 'TERMINATED';
  productId: {
    _id: string;
    name: string;
    planType: 'BASE' | 'ADDON';
    customerPrice: number;
    operatorCost: number;
    billingInterval: {
      value: number;
      unit: 'days' | 'months';
    };
  };
}

export interface Product {
  _id: string;
  operatorId: string;
  productCode: string;
  name: string;
  planType: 'Basic' | 'Add-on';
  customerPrice: number;
  operatorCost: number;
  billingInterval: {
    value: number;
    unit: 'days' | 'months';
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductForm {
  productCode: string;
  name: string;
  planType: 'BASE' | 'ADDON' | '';
  customerPrice: string;
  operatorCost: string;
  billingIntervalValue: string;
  billingIntervalUnit: 'days' | 'months';
  isActive: boolean;
}

export interface Subscription {
  _id: string;
  customerId: string;
  operatorId: string;
  productId: string | Product;
  startDate: string;
  expiryDate: string;
  price: number;
  billingInterval: {
    value: number;
    unit: 'days' | 'months';
  };
  status: 'ACTIVE' | 'EXPIRED' | 'PAUSED' | 'TERMINATED';
  createdAt: string;
  updatedAt: string;
}

export interface CustomerDevice {
  stbNumber?: string;
  cardNumber?: string;
  deviceModel?: string;
  membershipNumber?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  _id: string;
  operatorId: string;
  agentId: string | null;
  customerCode: string;
  sequenceNo: number;
  name: string;
  contactNumber: string;     // TS version uses correct field name
  alternateContact?: string;
  messageNumber?: string;
  locality: string;
  billingAddress: string;
  gstNumber?: string;
  devices: CustomerDevice[];

  balanceAmount: number;
  defaultExtraCharge: number;   // previously additionalCharge
  defaultDiscount: number;      // previously discount

  activeSubscriptions: string[]; // list of subscription IDs
  earliestExpiry: string | null;
currentSubscriptions?: SubscriptionDetails[];
expiredSubscriptions?: SubscriptionDetails[];
  connectionStartDate: string;
  active: boolean;
  deleted: boolean;

  lastPaymentAmount?: number;
  lastPaymentDate?: string;
  lastPaymentMethod?: string;

  remark?: string;
  createdAt: string;
  updatedAt: string;
}


export interface CollectedBy {
  _id: string;
  name: string;
}

export type TransactionType =
  | 'INVOICE'
  | 'PAYMENT'
  | 'ADJUSTMENT'
  | 'OPENING_BALANCE';

export interface Transaction {
  _id: string;
  customerId: string;
  operatorId: string;
  collectedBy: CollectedBy;
  collectedByType: 'Operator' | 'Agent';
  type: TransactionType;
  amount: number;              // + add to balance, - reduce balance
  balanceBefore: number;
  balanceAfter: number;

  invoiceId?: string;          // only for INVOICE
  receiptNumber?: string;      // only for PAYMENT

  productId?: string | Product; // only for invoices
  startDate?: string;
  expiryDate?: string;

  costOfGoodsSold?: number;   // only for invoice (profit calc)
  method?: string;            // only for PAYMENT
  note?: string;
  isOpeningBalance?: boolean;

  createdAt: string;
  updatedAt: string;
}


export interface Expense {
  _id: string;
  operatorId: string;
  expenseNumber: string;
  expenseDate: string;
  category: string;
  vendor?: string;
  paymentMethod: string;
  amount: number;
  description: string;
  receiptNumber?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface ExpenseFormData {
  expenseDate: string;
  category: string;
  vendor: string;
  paymentMethod: string;
  amount: number;
  description: string;
  receiptNumber: string;
  notes: string;
}


