import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import CartInitialState, {
  CartCalculation,
  CartItems,
} from "@/app/interfaces/main/cart/CartInterface";

const initialState: CartInitialState = {
  cartItems: [],
  cartCalculation: {
    sub_total: 0,
    total: 0,           // legacy, kept for backwards compatibility
    total_amount: 0,    // canonical
    vat: 0,
    service_fee: 0,
    delivery_fee: 0,
    delivery_time: 0
  },
  isLoading: false,
  error: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    /* Set the cart items using the payload action of type {CartItems []} */
    setCartItems: (state, action: PayloadAction<CartItems[]>) => {
      state.cartItems = action.payload;
    },

    /* Set the cart calculation using the payload {CartCalculation}
     * This will return the total calculations for the users cart
     */
    setCartCalculation: (state, action: PayloadAction<CartCalculation>) => {
      state.cartCalculation = action.payload;
    },

    /* The method is used to add an item to the cart item list.
     * Before the item is added, it first checks if the product within the cart with the
     * Id is already in the cart. If it is, it will increment the quantity of the item.
     * If it is not, it will add the item to the cart.
     */
    addCartItem: (state, action: PayloadAction<CartItems>) => {
      const existingItem = state.cartItems.find(
        (item) => item.id === action.payload.id
      );
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.cartItems.push(action.payload);
      }
    },

    /* This method checks if an item is already in the cartitem array.
     * If the item is found in the array list, it would then remove the item from the list.
     * This will be used to remove the item from the state but not the servers */
    decrementCartItem: (state, action: PayloadAction<string>) => {
      const item = state.cartItems.find((item) => item.id === action.payload);
      if (item && item.quantity > 1) {
        item.quantity -= 1;
      } else {
        state.cartItems = state.cartItems.filter(
          (item) => item.id !== action.payload
        );
      }
    },

    /* The method is used to delete an item from the list inside the state,
     * Before an item is deleted, it simply filters out the item from the list.
     * This will be used to delete the item from the state but not the servers */
    deleteCartItem: (state, action: PayloadAction<string>) => {
      state.cartItems = state.cartItems.filter(
        (item) => item.id !== action.payload
      );
    },

    /* Clear all cart items */
    clearCart: (state) => {
      state.cartItems = [];
      state.cartCalculation = {
        sub_total: 0,
        total: 0,
        vat: 0,
        service_fee: 0, 
        delivery_fee: 0,
        delivery_time: 0
      };
    },

    /* Update item quantity */
    updateItemQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>
    ) => {
      const item = state.cartItems.find(
        (item) => item.id === action.payload.id
      );
      if (item) {
        item.quantity = action.payload.quantity;
      }
    },

    /* Set error state */
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    setLoadingState: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  setCartItems,
  setCartCalculation,
  addCartItem,
  decrementCartItem,
  deleteCartItem,
  clearCart,
  updateItemQuantity,
  setError,
  setLoadingState,
} = cartSlice.actions;

export default cartSlice.reducer;
