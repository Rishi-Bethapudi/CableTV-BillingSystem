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
  connectionStartDate: string; // or Date if parsed
  expiryDate: string; // or Date
  sequenceNo: number;
  active: boolean;
  stbName: string;
  stbNumber: string;
  cardNumber: string;
  productId: [string]; // array of product IDs
  additionalCharge: number;
  discount: number;
  lastPaymentAmount: number;
  lastPaymentDate: string; // or Date
  remark: string;
  createdAt: string; // or Date
  updatedAt: string; // or Date
}
