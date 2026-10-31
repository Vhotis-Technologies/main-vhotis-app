/** Seller wallet & finance API shapes (aligned with Django FinanceView responses). */

export interface SellerWallet {
  currency: string;
  available_balance: string | number;
  pending_balance: string | number;
  total_earned: string | number;
  total_withdrawn: string | number;
  payout_fee_percentage?: number;
}

export interface StoreWalletResponse {
  store: {
    id: number;
    status: string;
    business_name: string;
  };
  wallet: SellerWallet;
}

export interface WalletCodeStatusResponse {
  has_wallet_code: boolean;
  status: "setup_required" | "code_required";
}

export interface WalletCodeResponse {
  message?: string;
  status: "verified" | "not_verified" | "setup_required";
}

export interface PayoutMethod {
  id: string;
  type: "bank_account";
  label: string;
  last4: string;
  is_default?: boolean;
}

export interface SaveBankAccountPayload {
  /** Account holder name */
  account_name: string;
  bank_name: string;
  iban: string;
  account_number?: string;
  /** UK sort code or other national routing; same as `sort_code` on the API */
  routing_number?: string;
  sort_code?: string;
  bic?: string;
  swift_code?: string;
}

export interface WithdrawalRequestPayload {
  amount: number;
  currency: string;
  payout_method_id: string;
  wallet_code: string;
  storeId?: string;
}

export interface WithdrawalResponse {
  withdrawal_id: string;
  status: "pending" | "processing" | "completed" | "failed";
  eta_days: number;
  gross_amount?: number;
  fee?: number;
  net_amount?: number;
  fee_rate?: number;
}

export interface PayoutHistoryEntry {
  id: string;
  title: string;
  card_last4: string;
  amount: string | number;
  currency: string;
  date: string;
  status: "pending" | "processing" | "completed" | "failed";
  type: "debit" | "credit";
}

export interface PayoutHistoryResponse {
  results: PayoutHistoryEntry[];
  count: number;
  next?: string | null;
  previous?: string | null;
}

export interface FinanceChartApiPoint {
  label: string;
  value: number;
  highlighted?: boolean;
}

export interface FinanceOverviewCategories {
  sales: number;
  withdrawals: number;
  refunds: number;
  pending: number;
}

export interface FinanceOverviewResponse {
  currency: string;
  period: "weekly" | "monthly";
  period_total: number;
  chart: FinanceChartApiPoint[];
  categories: FinanceOverviewCategories;
}
