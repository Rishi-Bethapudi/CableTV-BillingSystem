export interface Product {
  _id: string;
  name: string;
  customerPrice: number;
  billingInterval: number;
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
  connectionStartDate: string; // ISO string (can convert to Date in app if needed)
  expiryDate: string; // ISO string
  sequenceNo: number;
  active: boolean;
  stbName: string;
  stbNumber: string;
  cardNumber: string;
  productId: Product[]; // now array of product objects
  additionalCharge: number;
  discount: number;
  lastPaymentAmount: number;
  lastPaymentDate: string; // ISO string
  remark: string;
  createdAt: string;
  updatedAt: string;
  __v?: number; // optional (only present in Mongo responses)
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
  collectedByType: string;
  type: 'Billing' | 'Payment' | 'Adjustment';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  invoiceId: string;
  receiptNumber: string;
  costOfGoodsSold: number;
  method: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}
