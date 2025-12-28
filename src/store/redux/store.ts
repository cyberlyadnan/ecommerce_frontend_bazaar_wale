import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import createWebStorage from "redux-persist/lib/storage/createWebStorage";
import type { Storage } from "redux-persist";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

// Import your slices
import authReducer from "./slices/authSlice";
import cartReducer from "./slices/cartSlice";
import vendorReducer from "./slices/vendorSlice";
import productReducer from "./slices/productSlice";

const createNoopStorage = (): Storage => ({
  getItem: async () => null,
  setItem: async (_key, value) => value,
  removeItem: async () => undefined,
});

const storage: Storage =
  typeof window !== "undefined"
    ? createWebStorage("local")
    : createNoopStorage();

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "cart"], // only persist login + cart
};

const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  vendor: vendorReducer,
  product: productReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // required for redux-persist
    }),
});

export const persistor = persistStore(store);

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
