import BillingRecord from "./BillingInterface";

export interface InvoiceDetails {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  billingRecord: BillingRecord;

  // Company/Business Information
  companyDetails: {
    name: string;
    address: string;
    email: string;
    phone?: string;
    taxId?: string;
    logo?: string;
  };

  // Customer Information
  customerDetails: {
    name: string;
    address?: string;
    email: string;
    phone?: string;
    customerId?: string;
  };

  // Additional Fields
  notes?: string;
  terms?: string;
  paymentInstructions?: string;

  // Calculated Totals
  subtotal: number;
  tax?: {
    rate: number;
    amount: number;
  };
  discount?: {
    description: string;
    amount: number;
  };
  total: number;
}

export interface InvoiceProps {
  invoice: InvoiceDetails;
  onDownload?: () => void;
  onPrint?: () => void;
  onShare?: () => void;
}
