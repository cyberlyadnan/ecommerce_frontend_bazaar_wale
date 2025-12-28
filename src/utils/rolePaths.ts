import { UserRole } from "@/types/auth";

export const ROLE_HOME_PATH: Record<UserRole, string> = {
  customer: "/",
  vendor: "/vendor/dashboard",
  admin: "/admin/dashboard",
};

export const getRoleHomePath = (role?: UserRole | null) => {
  if (!role) {
    return "/";
  }
  return ROLE_HOME_PATH[role] ?? "/";
};


