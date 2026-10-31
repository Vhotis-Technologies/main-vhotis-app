import { createSlice } from "@reduxjs/toolkit";
import { ProductInterface, ProductReturnInterface } from "@/app/interfaces/seller/ProductInterface";

interface InventoryState {
  products: ProductInterface | null;
  product_list: ProductReturnInterface[] | null;
}

const inventorySlice = createSlice({
  name: "inventory",
  initialState: {
    products: null,
    product_list: null,
  } as InventoryState,

  reducers: {
    updateProduct: (state, action) => {
      state.products = action.payload;
    },

    updateProductList: (state, action) => {
      state.product_list = action.payload;
    },
  },
});

export const { updateProduct, updateProductList } = inventorySlice.actions;
export default inventorySlice.reducer;
