export interface User {
  id: string;
  email: string;
  full_name: string;
  country: string;
  is_verified: boolean;
  is_admin: boolean;
  is_blocked: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  category: "mobile_topup" | "internet" | "mobile_pack" | "utility" | "transport" | string;
  product_code: string;
  gateway_id: string | null;
  phone_prefixes: string;
  min_amount: number;
  max_amount: number;
  is_active: boolean;
  display_order: number;
  icon_url: string;
  created_at?: string;
  updated_at?: string;
}

export interface AppConfig {
  exchange_rate_usd_to_npr: number;
  supported_currencies: string[];
}

export type TransactionStatus =
  | "pending"
  | "processing"
  | "success"
  | "failed"
  | "refunded";

export interface Transaction {
  id: string;
  user_id: string;
  service_id: string;
  recipient_number: string;
  amount_npr: number;
  amount_charged: number;
  currency: string;
  exchange_rate: number;
  status: TransactionStatus;
  gateway_reference: string;
  provider_reference: string;
  receipt_message: string;
  created_at: string;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
}

export interface Gateway {
  id: string;
  name: string;
  provider_code: string;
  base_url: string;
  config: string;
  is_active: boolean;
  has_credentials: boolean;
  created_at: string;
  updated_at: string;
}

export interface KhaltiBalance {
  credits_consumed: number;
  credits_available: number;
}

export interface DashboardStats {
  total_users: number;
  total_transactions: number;
  successful_payments: number;
  pending_payments: number;
  failed_payments: number;
  total_revenue_npr: number;
  khalti_balance: KhaltiBalance | null;
}

export interface PaginatedUsers {
  users: User[];
  total: number;
}

export interface PaginatedTransactions {
  transactions: Transaction[];
  total: number;
}
