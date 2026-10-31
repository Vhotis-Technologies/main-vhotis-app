import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "../../main/api/rtkBaseQuery";
import { PromotionPriority } from "@/app/interfaces/seller/PromotionsInterface";

export interface PromotionPaymentData {
  promotion_type: "promotion" | "store_sponsorship" | "product_sponsorship";
  storeId?: string;
  promotion_data: {
    // Store-wide promotion data
    budget?: number;
    dailyBudget?: number;
    startDate?: string;
    endDate?: string;
    priority?: PromotionPriority;
    targeting?: {
      ageRanges?: string[];
      interests?: string[];
      genders?: string[];
      locations?: string[];
    };
    estimatedReach?: number;
    durationDays?: number;
    requiredBudget?: number;
    message?: string | null;
    warning?: string | null;
    suggestedDurationDays?: number;
    surplus?: number;
    deficit?: number;
    isBudgetValid?: boolean;
    ageRanges?: string[];
    interests?: string[];
    genders?: string[];
    locations?: string[];
    // Product-specific promotion data
    dealType?: string;
    productIds?: string[];
    name?: string;
    discountValue?: string;
    minimumPurchase?: string;
    maxDiscount?: string;
    usageLimit?: string;
  };
}

export interface PaymentSheetResponse {
  paymentIntent?: string;
  ephemeralKey?: string;
  customer?: string;
  amount?: number;
  paymentIntentId?: string;
  skip_payment?: boolean;
  currency?: string;
}

const sellerPaymentApi = createApi({
  reducerPath: "sellerPaymentApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["PromotionPayment"],
  endpoints: (builder) => ({
    /**
     * Create a payment sheet for promotion payments
     * @param promotionData - Promotion payment data including type and configuration
     */
    createPaymentSheet: builder.mutation<
      PaymentSheetResponse,
      PromotionPaymentData
    >({
      query: (promotionData) => ({
        url: "/api/v2/payment/create_payment_sheet/",
        method: "POST",
        data: promotionData,
      }),
      invalidatesTags: ["PromotionPayment"],
    }),
  }),
});

export const { useCreatePaymentSheetMutation } = sellerPaymentApi;
export default sellerPaymentApi;
