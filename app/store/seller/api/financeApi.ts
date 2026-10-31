import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../../main/api/rtkBaseQuery";
import type {
  FinanceOverviewResponse,
  PayoutHistoryResponse,
  PayoutMethod,
  SaveBankAccountPayload,
  StoreWalletResponse,
  WalletCodeResponse,
  WalletCodeStatusResponse,
  WithdrawalRequestPayload,
  WithdrawalResponse,
} from "@/app/interfaces/seller/FinanceInterface";
import type { FinancePeriod } from "@/app/component/seller/main/store/finance/FinancePeriodToggle";

const FINANCES = "/api/v2/finances";

export type FinanceStoreParams = {
  storeId?: string;
};

const financeApi = createApi({
  reducerPath: "financeApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Wallet", "PayoutMethods"],
  endpoints: (builder) => ({
    getStoreWallet: builder.query<StoreWalletResponse, FinanceStoreParams | void>({
      query: (params) => ({
        url: `${FINANCES}/get_wallet_summary/`,
        method: "GET",
        params: params?.storeId ? { store_id: params.storeId } : undefined,
      }),
      providesTags: ["Wallet"],
      keepUnusedDataFor: 15,
    }),

    getFinanceOverview: builder.query<
      FinanceOverviewResponse,
      { period: FinancePeriod; storeId?: string }
    >({
      query: ({ period, storeId }) => ({
        url: `${FINANCES}/get_finance_overview/`,
        method: "GET",
        params: {
          period,
          ...(storeId ? { store_id: storeId } : {}),
        },
      }),
      providesTags: ["Wallet"],
      keepUnusedDataFor: 15,
    }),

    checkWalletCodeStatus: builder.query<WalletCodeStatusResponse, void>({
      query: () => ({
        url: `${FINANCES}/check_wallet_code_status/`,
        method: "GET",
      }),
    }),

    setWalletCode: builder.mutation<
      WalletCodeResponse,
      { wallet_code: string; confirm_wallet_code: string }
    >({
      query: ({ wallet_code, confirm_wallet_code }) => ({
        url: `${FINANCES}/set_wallet_code/`,
        method: "POST",
        data: { wallet_code, confirm_wallet_code },
      }),
    }),

    verifyWalletCode: builder.mutation<
      WalletCodeResponse,
      { wallet_code: string }
    >({
      query: ({ wallet_code }) => ({
        url: `${FINANCES}/verify_wallet_code/`,
        method: "POST",
        data: { wallet_code },
      }),
    }),

    getPayoutMethods: builder.query<PayoutMethod[], void>({
      query: () => ({
        url: `${FINANCES}/payout_methods/`,
        method: "GET",
      }),
      providesTags: ["PayoutMethods"],
    }),

    saveBankAccount: builder.mutation<PayoutMethod, SaveBankAccountPayload>({
      query: (data) => ({
        url: `${FINANCES}/save_bank_account/`,
        method: "POST",
        data,
      }),
      invalidatesTags: ["PayoutMethods", "Wallet"],
    }),

    requestWithdrawal: builder.mutation<
      WithdrawalResponse,
      WithdrawalRequestPayload
    >({
      query: ({ storeId, ...data }) => ({
        url: `${FINANCES}/withdraw/`,
        method: "POST",
        data: {
          ...data,
          ...(storeId ? { store_id: storeId } : {}),
        },
      }),
      invalidatesTags: ["Wallet"],
    }),

    getPayoutHistory: builder.query<
      PayoutHistoryResponse,
      { page?: number; page_size?: number } | void
    >({
      query: (params) => ({
        url: `${FINANCES}/payouts/`,
        method: "GET",
        params: params || undefined,
      }),
    }),
  }),
});

export const {
  useGetStoreWalletQuery,
  useGetFinanceOverviewQuery,
  useCheckWalletCodeStatusQuery,
  useLazyCheckWalletCodeStatusQuery,
  useSetWalletCodeMutation,
  useVerifyWalletCodeMutation,
  useGetPayoutMethodsQuery,
  useSaveBankAccountMutation,
  useRequestWithdrawalMutation,
  useGetPayoutHistoryQuery,
} = financeApi;
export default financeApi;
