import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { CartItemDto } from "@/services/cartApi";

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  vendorId: string;
  image: string;
  minOrderQty?: number;
}

interface CartState {
  items: CartItem[];
  loading: boolean;
  synced: boolean;
}

const initialState: CartState = {
  items: [],
  loading: false,
  synced: false,
};

// Helper to convert backend cart item to frontend format
const mapCartItem = (item: CartItemDto): CartItem => {
  const productId = typeof item.productId === 'string' ? item.productId : item.productId._id;
  const product = typeof item.productId === 'object' ? item.productId : null;
  
  return {
    productId,
    name: item.title,
    price: item.pricePerUnit,
    quantity: item.qty,
    vendorId: item.vendorId,
    image: item.meta?.image || product?.images?.[0]?.url || '',
    minOrderQty: item.minOrderQty,
  };
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setCartItems: (state, action: PayloadAction<CartItemDto[]>) => {
      state.items = action.payload.map(mapCartItem);
      state.synced = true;
    },
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existing = state.items.find(
        (item) => item.productId === action.payload.productId
      );
      if (existing) {
        existing.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
    },
    updateCartItem: (state, action: PayloadAction<{ productId: string; quantity: number }>) => {
      const item = state.items.find((i) => i.productId === action.payload.productId);
      if (item) {
        item.quantity = action.payload.quantity;
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((i) => i.productId !== action.payload);
    },
    clearCart: (state) => {
      state.items = [];
    },
    resetSync: (state) => {
      state.synced = false;
    },
  },
});

export const { 
  setLoading, 
  setCartItems, 
  addToCart, 
  updateCartItem,
  removeFromCart, 
  clearCart,
  resetSync,
} = cartSlice.actions;
export default cartSlice.reducer;
