import { createSlice } from "@reduxjs/toolkit";
import { loginSuccess, logout } from "@/app/store/main/slices/authSlice";
import { Seller } from "@/app/interfaces/main/Authentication";

/** Maps API / persisted `store_status` to the UI open flag. */
export function isStoreOpenFromSellerStatus(status?: string | null): boolean {
  if (status == null || typeof status !== "string") return false;
  const s = status.trim().toLowerCase();
  return s === "open" || s === "true" || s === "1";
}

const storeSlice = createSlice({
  name: "store",
  initialState: {
    isStoreOpen: false,
    newProduct: null,
  },
  reducers: {
    setIsStoreOpen: (state, action) => {
      state.isStoreOpen = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginSuccess, (state, action) => {
        const user = action.payload.user as Seller;
        if (
          (user?.is_seller || user?.is_store_admin) &&
          user.store_status != null &&
          user.store_status !== ""
        ) {
          state.isStoreOpen = isStoreOpenFromSellerStatus(user.store_status);
        }
      })
      .addCase(logout, (state) => {
        state.isStoreOpen = false;
      });
  },
});

export const { setIsStoreOpen } = storeSlice.actions;
export default storeSlice.reducer;
