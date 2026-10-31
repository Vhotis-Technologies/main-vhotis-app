import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import AuthenticationState, {
  User,
  Seller,
  SigninFormData,
  GuestUser,
} from "@/app/interfaces/main/Authentication";

const initialState: AuthenticationState = {
  isAuthenticated: false,
  isAuthReady: false,
  user: null,
  access: null,
  refresh: null,
  loginFormData: {
    email: "",
    password: "",
  },
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: "authentication",
  initialState,
  reducers: {
    // Set the loading state to true
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    // Set the loading state to false
    loginEnd: (state) => {
      state.isLoading = false;
    },
    // Set the error state to the action payload
    loginFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    // Set the state for the users login success
    // If the user is a seller, set the state to the seller state
    loginSuccess: (
      state,
      action: PayloadAction<{
        user: User | Seller;
        access: string;
        refresh: string;
      }>
    ) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.access = action.payload.access;
      state.refresh = action.payload.refresh;
      state.loginFormData = {
        email: "",
        password: "",
      };
      state.isLoading = false;
      state.error = null;
      state.isAuthReady = true;
    },

    guestUserSuccess: (state, action: PayloadAction<GuestUser>) => {
      state.user = action.payload;
      state.isLoading = false;
      state.error = null;
      state.isAuthenticated = true;
      state.isAuthReady = true;
    },

    /* Set the login form data */
    loginFormData: (state, action: PayloadAction<SigninFormData>) => {
      state.loginFormData = action.payload;
    },

    updateLoginFormData: (
      state,
      action: PayloadAction<{ key: keyof SigninFormData; value: string }>
    ) => {
      if (state.loginFormData) {
        state.loginFormData = {
          ...state.loginFormData,
          [action.payload.key]: action.payload.value,
        } as SigninFormData;
      }
    },
    /* Logout the user by setting the states to initial state or null */
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.access = null;
      state.refresh = null;
    },
    /* Refresh token success - update tokens without affecting user data */
    refreshTokenSuccess: (
      state,
      action: PayloadAction<{ access: string; refresh: string }>
    ) => {
      state.access = action.payload.access;
      state.refresh = action.payload.refresh;
    },

    setIsAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },

    setAuthReady: (state, action: PayloadAction<boolean>) => {
      state.isAuthReady = action.payload;
    },

    /** Merge fields into the current user (e.g. seller store_status after PATCH). */
    mergeAuthenticatedUser: (
      state,
      action: PayloadAction<Partial<User> & Partial<Seller>>
    ) => {
      if (!state.user) return;
      state.user = { ...state.user, ...action.payload } as User | Seller;
    },
  },
});

export const {
  loginStart,
  loginEnd,
  loginFailure,
  loginSuccess,
  logout,
  refreshTokenSuccess,
  loginFormData,
  updateLoginFormData,
  guestUserSuccess,
  setIsAuthenticated,
  setAuthReady,
  mergeAuthenticatedUser,
} = authSlice.actions;
export default authSlice.reducer;
