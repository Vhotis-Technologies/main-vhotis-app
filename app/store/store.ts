import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import rootReducer from "./rootReducer";
import { authenticationApi } from "./main/api/authenticationApi";
import { onboardingApi } from "./main/api/onboardingApi";
import { dashboardApi } from "./seller/api/dashboardApi";
import storeApi from "./seller/api/storeApi";
import inventoryApi from "./seller/api/inventoryApi";
import orderApi from "./seller/api/orderApi";
import homeApi from "./main/api/homeApi";
import cartApi from "./main/api/cartApi";
import profileApi from "./main/api/profileApi";
import savedForLaterApi from "./main/api/savedForLaterApi";
import analyticsApi from "./seller/api/analyticsApi";
import paymentApi from "./main/api/paymentApi";
import sellerPaymentApi from "./seller/api/sellerPaymentApi";
import mainOrderApi from "./main/api/mainOrderApi";
import ticketApi from "./main/api/ticketApi";
import sellerTicketApi from "./seller/api/sellerTicketApi";
import mainProductApi from "./main/api/mainProductApi";
import promotionApi from "./seller/api/promotionApi";
import sponsorshipApi from "./seller/api/sponsorshipApi";
import sellerAdminApi from "./seller/api/sellerAdminApi";
import subscriptionApi from "./seller/api/subscriptionApi";
import membershipApi from "./main/api/membershipApi";
import storeFrontApi from "./main/api/storeFrontApi";
import productImportApi from "./seller/api/productImportApi";
import financeApi from "./seller/api/financeApi";
import connectApi from "./seller/api/connectApi";
import notificationApi from "./main/api/notificationApi";
import reviewsApi from "./seller/api/reviewsApi";
import { fulfillmentApi } from "./seller/api/fulfillmentApi";
import { wmsApi } from "./seller/api/wmsApi";
import { logisticsApi } from "./seller/api/logisticsApi";

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }).concat(
      authenticationApi.middleware,
      onboardingApi.middleware,
      dashboardApi.middleware,
      storeApi.middleware,
      inventoryApi.middleware,
      orderApi.middleware,
      homeApi.middleware,
      cartApi.middleware,
      profileApi.middleware,
      savedForLaterApi.middleware,
      analyticsApi.middleware,
      paymentApi.middleware,
      sellerPaymentApi.middleware,
      mainOrderApi.middleware,
      ticketApi.middleware,
      sellerTicketApi.middleware,
      mainProductApi.middleware,
      promotionApi.middleware,
      sponsorshipApi.middleware,
      sellerAdminApi.middleware,
      subscriptionApi.middleware,
      membershipApi.middleware,
      storeFrontApi.middleware,
      productImportApi.middleware,
      financeApi.middleware,
      connectApi.middleware,
      notificationApi.middleware,
      reviewsApi.middleware,
      fulfillmentApi.middleware,
      wmsApi.middleware,
      logisticsApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
