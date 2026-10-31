import PaymentMethod from "./SettingsInterface";

export default interface BillingRecord {
  id: string;
  amount: number;
  billing_date: string;
  status: "pending" | "paid" | "failed" | "refunded";
  transaction_id: string;
  payment_method: PaymentMethod;
  billing_details: {
    description?: string;
    items?: Array<{
      name: string;
      amount: number;
      quantity?: number;
    }>;
    [key: string]: any;
  };
}

export interface BillingFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  status?: Array<"pending" | "paid" | "failed" | "refunded">;
  minAmount?: number;
  maxAmount?: number;
  paymentMethod?: string;
}

export interface BillingSummary {
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  failedAmount: number;
  refundedAmount: number;
  totalTransactions: number;
}
