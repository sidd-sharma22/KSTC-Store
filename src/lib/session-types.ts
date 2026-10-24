export type UserRole =
  | "RETAIL_CUSTOMER"
  | "CONTRACTOR"
  | "AUTHORIZED_DEALER"
  | "PLUMBER"
  | "ADMIN_SUPER"
  | "ADMIN_SALES"
  | "ADMIN_BILLING"
  | "STAFF_WAREHOUSE"
  | "RETAIL"
  | "TRADE"
  | "ADMIN";

export interface SessionPayload {
  userId: string;
  email: string;
  name?: string | null;
  phone?: string | null;
  role: UserRole;
  customerTag?: string | null;
  tradeStatus?: "PENDING" | "APPROVED" | "REJECTED" | null;
  shopName?: string | null;
  plumberCode?: string | null;
}

export function isSuperAdmin(role?: UserRole | null): boolean {
  return role === "ADMIN_SUPER" || role === "ADMIN";
}

export function isAdminStaff(role?: UserRole | null): boolean {
  return (
    role === "ADMIN_SUPER" ||
    role === "ADMIN_SALES" ||
    role === "ADMIN_BILLING" ||
    role === "STAFF_WAREHOUSE" ||
    role === "ADMIN"
  );
}

export function isAuthorizedDealer(role?: UserRole | null): boolean {
  return role === "AUTHORIZED_DEALER" || role === "TRADE";
}

export function isPlumber(role?: UserRole | null): boolean {
  return role === "PLUMBER";
}

export function isContractor(role?: UserRole | null): boolean {
  return role === "CONTRACTOR";
}

export function isRetailCustomer(role?: UserRole | null): boolean {
  return !role || role === "RETAIL_CUSTOMER" || role === "RETAIL";
}

export function getRoleDisplayName(role?: UserRole | null): string {
  switch (role) {
    case "ADMIN_SUPER":
    case "ADMIN":
      return "Business Owner / Admin";
    case "ADMIN_SALES":
      return "Sales Administrator";
    case "ADMIN_BILLING":
      return "Billing & Accounts Operator";
    case "STAFF_WAREHOUSE":
      return "Warehouse Logistics Staff";
    case "AUTHORIZED_DEALER":
    case "TRADE":
      return "Authorized Dealer (Shop Owner)";
    case "CONTRACTOR":
      return "Building Contractor";
    case "PLUMBER":
      return "Certified Plumber Partner";
    case "RETAIL_CUSTOMER":
    case "RETAIL":
    default:
      return "Direct Retail Customer";
  }
}
