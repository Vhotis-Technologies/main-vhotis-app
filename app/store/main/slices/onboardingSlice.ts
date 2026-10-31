import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  OnboardingState,
  RegistrationFormData,
  StoreInformationFormData,
} from "@/app/interfaces/others/OnboardingInterfaces";
import * as SecureStore from "expo-secure-store";

const initialState: OnboardingState = {
  seller_id: null,
  operatingMode: null,
  isError: null,
  isLoading: false,
  isSuccess: false,
  registrationFormData: null,
  storeInformationFormData: null,
  verificationFormData: null,
  capConflictSlugs: [],
};

const onboardingSlice = createSlice({
  name: "onboarding",
  initialState: initialState,
  reducers: {
    /* Set the loading state */
    loadingStart: (state) => {
      state.isLoading = true;
    },
    loadingEnd: (state) => {
      state.isLoading = false;
    },
    /* Set the user_id */
    setSellerId: (state, action: PayloadAction<string>) => {
      state.seller_id = action.payload;
    },

    setOperatingMode: (
      state,
      action: PayloadAction<import("@/app/interfaces/others/OnboardingInterfaces").SellingPath>,
    ) => {
      state.operatingMode = action.payload;
    },

    setCapConflictSlugs: (state, action: PayloadAction<string[]>) => {
      state.capConflictSlugs = action.payload;
    },

    setMarketVerticalSlugs: (state, action: PayloadAction<string[]>) => {
      if (state.storeInformationFormData) {
        state.storeInformationFormData.marketVerticalSlugs = action.payload;
      } else {
        state.storeInformationFormData = {
          businessName: "",
          businessReg: "",
          businessAddress: "",
          businessCity: "",
          businessPostcode: "",
          businessCountry: "",
          businessDescription: "",
          useExistingAddress: "",
          marketVerticalSlugs: action.payload,
        };
      }
    },

    onboardingError: (state, action: PayloadAction<string[]>) => {
      state.isLoading = false;
      state.isError = action.payload;
    },

    /* Set the registration form data */
    registrationFormData: (
      state,
      action: PayloadAction<{
        formdata: RegistrationFormData | null;
      }>
    ) => {
      state.registrationFormData = action.payload.formdata;
    },

    /* Update individual registration form field */
    updateRegistrationField: (
      state,
      action: PayloadAction<{
        field: keyof RegistrationFormData;
        value: string;
      }>
    ) => {
      if (state.registrationFormData) {
        state.registrationFormData[action.payload.field] = action.payload.value;
      } else {
        state.registrationFormData = {
          firstName: "",
          lastName: "",
          email: "",
          phoneCountryCode: "",
          phone: "",
          password: "",
          address1: "",
          address2: "",
          city: "",
          state: "",
          postcode: "",
          country: "",
          latitude: "",
          longitude: "",
          ethnicity: "",
          gender: "",
          dob: "",
          [action.payload.field]: action.payload.value,
        } as RegistrationFormData;
      }
    },

    /* Reset registration form data */
    resetRegistrationFormData: (state) => {
      state.registrationFormData = null;
      state.seller_id = null;
      // Clear from AsyncStorage as well
      SecureStore.deleteItemAsync("seller_id").catch((error) => {
        console.error("Error removing seller_id from storage:", error);
      });
    },

    /* Set the store information form data */
    storeInformationFormData: (
      state,
      action: PayloadAction<{
        formdata: StoreInformationFormData;
      }>
    ) => {
      state.storeInformationFormData = action.payload.formdata;
    },

    /* Update individual store information form field */
    updateStoreInformationField: (
      state,
      action: PayloadAction<{
        field: keyof StoreInformationFormData;
        value: string | string[];
      }>
    ) => {
      if (state.storeInformationFormData) {
        (state.storeInformationFormData as Record<string, unknown>)[action.payload.field] =
          action.payload.value;
      } else {
        state.storeInformationFormData = {
          businessName: "",
          businessReg: "",
          businessAddress: "",
          businessCity: "",
          businessState: "",
          businessPostcode: "",
          businessCountry: "",
          businessDescription: "",
          useExistingAddress: "",
          marketVerticalSlugs: [],
          [action.payload.field]: action.payload.value,
        } as StoreInformationFormData;
      }
    },

    /* Clear the registration form data */
    clearRegistrationFormData: (state) => {
      state.registrationFormData = null;
    },
  },
});

export const {
  loadingStart,
  loadingEnd,
  registrationFormData,
  updateRegistrationField,
  resetRegistrationFormData,
  storeInformationFormData,
  updateStoreInformationField,
  onboardingError,
  setSellerId,
  setOperatingMode,
  setCapConflictSlugs,
  setMarketVerticalSlugs,
  clearRegistrationFormData,
} = onboardingSlice.actions;
export default onboardingSlice.reducer;
