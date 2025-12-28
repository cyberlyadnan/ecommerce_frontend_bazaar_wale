export type UserRole = "customer" | "vendor" | "admin";

export type VendorStatus = "pending" | "active" | "rejected" | "suspended";

export interface AuthUser {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  role: UserRole;
  businessName?: string | null;
  gstNumber?: string | null;
  vendorStatus?: VendorStatus | null;
  isPhoneVerified?: boolean;
  isEmailVerified?: boolean;
  lastLoginAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}


