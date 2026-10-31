import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "./main/slices/authSlice";
import onboardingReducer from "./main/slices/onboardingSlice";
import cartReducer from "./main/slices/cartSlice";
import { authenticationApi } from "./main/api/authenticationApi";
import { onboardingApi } from "./main/api/onboardingApi";
import { dashboardApi } from "./seller/api/dashboardApi";
import storeApi from "./seller/api/storeApi";
import inventoryApi from "./seller/api/inventoryApi";
import inventoryReducer from "./seller/slice/inventorySlice";
import storeReducer from "./seller/slice/storeSlice";
import promotionReducer from "./seller/slice/promotionSlice";
import sponsorReducer from "./seller/slice/sponsorSlice";
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
import manifestBuilderReducer from "./seller/slice/manifestBuilderSlice";

const rootReducer = combineReducers({
  manifestBuilder: manifestBuilderReducer,
  auth: authReducer,
  onboarding: onboardingReducer,
  cart: cartReducer,
  inventory: inventoryReducer,
  store: storeReducer,
  promotion: promotionReducer,
  sponsor: sponsorReducer,
  order: orderApi.reducer,
  home: homeApi.reducer,
  [authenticationApi.reducerPath]: authenticationApi.reducer,
  [onboardingApi.reducerPath]: onboardingApi.reducer,
  [dashboardApi.reducerPath]: dashboardApi.reducer,
  [storeApi.reducerPath]: storeApi.reducer,
  [inventoryApi.reducerPath]: inventoryApi.reducer,
  [orderApi.reducerPath]: orderApi.reducer,
  [homeApi.reducerPath]: homeApi.reducer,
  [cartApi.reducerPath]: cartApi.reducer,
  [profileApi.reducerPath]: profileApi.reducer,
  [savedForLaterApi.reducerPath]: savedForLaterApi.reducer,
  [analyticsApi.reducerPath]: analyticsApi.reducer,
  [paymentApi.reducerPath]: paymentApi.reducer,
  [sellerPaymentApi.reducerPath]: sellerPaymentApi.reducer,
  [mainOrderApi.reducerPath]: mainOrderApi.reducer,
  [ticketApi.reducerPath]: ticketApi.reducer,
  [sellerTicketApi.reducerPath]: sellerTicketApi.reducer,
  [mainProductApi.reducerPath]: mainProductApi.reducer,
  [promotionApi.reducerPath]: promotionApi.reducer,
  [sponsorshipApi.reducerPath]: sponsorshipApi.reducer,
  [sellerAdminApi.reducerPath]: sellerAdminApi.reducer,
  [subscriptionApi.reducerPath]: subscriptionApi.reducer,
  [membershipApi.reducerPath]: membershipApi.reducer,
  [storeFrontApi.reducerPath]: storeFrontApi.reducer,
  [productImportApi.reducerPath]: productImportApi.reducer,
  [financeApi.reducerPath]: financeApi.reducer,
  [connectApi.reducerPath]: connectApi.reducer,
  [notificationApi.reducerPath]: notificationApi.reducer,
  [reviewsApi.reducerPath]: reviewsApi.reducer,
  [fulfillmentApi.reducerPath]: fulfillmentApi.reducer,
  [wmsApi.reducerPath]: wmsApi.reducer,
  [logisticsApi.reducerPath]: logisticsApi.reducer,
});

export default rootReducer;
