import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Vendor {
  _id?: string;
  businessName: string;
  email: string;
  phone: string;
  gstNumber: string;
  aadharNumber: string;
  address: string;
  isVerified: boolean;
  products?: string[]; // store product IDs this vendor owns
  createdAt?: string;
}

interface VendorState {
  vendor: Vendor | null;
  vendors: Vendor[];
  isAuthenticated: boolean;
}

const initialState: VendorState = {
  vendor: null,
  vendors: [],
  isAuthenticated: false,
};

const vendorSlice = createSlice({
  name: "vendor",
  initialState,
  reducers: {
    setVendor: (state, action: PayloadAction<Vendor>) => {
      state.vendor = action.payload;
      state.isAuthenticated = true;
    },
    updateVendor: (state, action: PayloadAction<Vendor>) => {
      if (state.vendor && state.vendor._id === action.payload._id) {
        state.vendor = { ...state.vendor, ...action.payload };
      }
    },
    logoutVendor: (state) => {
      state.vendor = null;
      state.isAuthenticated = false;
    },
    setVendors: (state, action: PayloadAction<Vendor[]>) => {
      state.vendors = action.payload;
    },
    addVendor: (state, action: PayloadAction<Vendor>) => {
      state.vendors.push(action.payload);
    },
    removeVendor: (state, action: PayloadAction<string>) => {
      state.vendors = state.vendors.filter((v) => v._id !== action.payload);
    },
  },
});

export const {
  setVendor,
  updateVendor,
  logoutVendor,
  setVendors,
  addVendor,
  removeVendor,
} = vendorSlice.actions;

export default vendorSlice.reducer;
