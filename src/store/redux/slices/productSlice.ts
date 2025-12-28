import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Product {
  _id?: string;
  name: string;
  description: string;
  category: string;
  subCategory?: string;
  price: number;
  stock: number;
  minOrderQty: number;
  images: string[];
  vendorId: string;
  vendorName: string;
  vendorPhone: string;
  status?: "active" | "inactive";
  createdAt?: string;
}

interface ProductState {
  products: Product[];
  selectedProduct: Product | null;
}

const initialState: ProductState = {
  products: [],
  selectedProduct: null,
};

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload;
    },
    addProduct: (state, action: PayloadAction<Product>) => {
      state.products.push(action.payload);
    },
    updateProduct: (state, action: PayloadAction<Product>) => {
      const index = state.products.findIndex((p) => p._id === action.payload._id);
      if (index !== -1) {
        state.products[index] = action.payload;
      }
    },
    deleteProduct: (state, action: PayloadAction<string>) => {
      state.products = state.products.filter((p) => p._id !== action.payload);
    },
    selectProduct: (state, action: PayloadAction<Product | null>) => {
      state.selectedProduct = action.payload;
    },
    clearProducts: (state) => {
      state.products = [];
      state.selectedProduct = null;
    },
  },
});

export const {
  setProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  selectProduct,
  clearProducts,
} = productSlice.actions;

export default productSlice.reducer;
