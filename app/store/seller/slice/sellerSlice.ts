import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SellerProfile {
  id?: string;
  businessName?: string;
  email?: string;
  phone?: string;
  address?: {
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  isVerified?: boolean;
  businessType?: string;
  rating?: number;
  totalOrders?: number;
  isActive?: boolean;
}

interface SellerState {
  profile: SellerProfile | null;
  isAuthenticated: boolean;
  token: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: SellerState = {
  profile: null,
  isAuthenticated: false,
  token: null,
  refreshToken: null,
  loading: false,
  error: null,
};

const sellerSlice = createSlice({
  name: "seller",
  initialState,
  reducers: {
    setSellerCredentials: (
      state,
      action: PayloadAction<{ profile: SellerProfile; token: string }>
    ) => {
      const { profile, token } = action.payload;
      state.profile = profile;
      state.token = token;
      state.isAuthenticated = true;
      state.error = null;
    },
    updateSellerProfile: (
      state,
      action: PayloadAction<Partial<SellerProfile>>
    ) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    logout: (state) => {
      state.profile = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
});

export const {
  setSellerCredentials,
  updateSellerProfile,
  setLoading,
  setError,
  logout,
} = sellerSlice.actions;

export default sellerSlice.reducer;
