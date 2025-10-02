export interface Product {
  _id: string;
  operatorId: string;
  productCode: string;
  name: string;
  category: 'Basic' | 'Premium' | 'Add-on';
  customerPrice: number;       // price charged to customer
  operatorCost: number;        // cost to operator
  billingInterval: {
    value: number;
    unit: 'days' | 'months';
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface ProductForm {
  productCode: string;
  name: string;
  category: 'Basic' | 'Premium' | 'Add-on';
  customerPrice: string;
  operatorCost: string;
  billingIntervalValue: string;
  billingIntervalUnit: 'days' | 'months';
  isActive: boolean;
}

export interface CustomerSubscription {
  productId: string | Product; // populated with full product if needed
  startDate: string;           // ISO string
  expiryDate: string;          // ISO string
  price: number;
  billingInterval: {
    value: number;
    unit: 'days' | 'months';
  };
  status: 'active' | 'expired' | 'inactive';
}

export interface Customer {
  _id: string;
  operatorId: string;
  agentId: string | null;
  customerCode: string;
  name: string;
  locality: string;
  mobile: string;
  billingAddress: string;
  balanceAmount: number;
  connectionStartDate: string;
  sequenceNo: number;
  active: boolean;
  stbName: string;
  stbNumber: string;
  cardNumber: string;
  subscriptions: CustomerSubscription[];
  earliestExpiry?: string | null; 
  additionalCharge: number;
  discount: number;
  lastPaymentAmount: number;
  lastPaymentDate: string;
  remark: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface CollectedBy {
  _id: string;
  name: string;
}

export interface Transaction {
  _id: string;
  customerId: string;
  operatorId: string;
  collectedBy: CollectedBy;
  collectedByType: 'Operator' | 'Agent';
  type: 'Billing' | 'Payment' | 'Adjustment';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  invoiceId: string;
  receiptNumber?: string;     // optional, may not exist
  productId: string | Product;
  startDate?: string;
  expiryDate?: string;
  costOfGoodsSold: number;
  method?: string;            // only for payments
  note?: string;
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


