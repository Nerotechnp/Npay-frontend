export interface User {
  id: string;
  email: string;
  full_name: string;
  country: string;
  is_verified: boolean;
  is_admin: boolean;
  is_blocked: boolean;
  last_active: string | null;
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
  // service_charge and bank_processing_fee are percentages of the NPR amount
  // charged per transaction for this product (e.g. 1.5 = 1.5%). Added on top of
  // the amount the user pays.
  service_charge: number;
  bank_processing_fee: number;
  is_active: boolean;
  display_order: number;
  icon_url: string;
  created_at?: string;
  updated_at?: string;
}

// ForexRate is a single Nepal Rastra Bank quote for one currency, normalized to
// NPR per 1 unit (NRB quotes INR per 100 and JPY per 10, so the raw buy/sell
// are divided by the unit).
export interface ForexRate {
  name: string;
  unit: number;
  buy_per_unit: number;
  sell_per_unit: number;
}

export interface AppConfig {
  // exchange_rate_source is "nrb" when served from the live Nepal Rastra Bank
  // feed, or "unavailable" when the live feed could not be reached.
  exchange_rate_source: "nrb" | "unavailable" | string;
  exchange_rate_date: string | null;
  supported_currencies: string[];
  exchange_rates: Record<string, ForexRate>;
}

export type TransactionStatus =
  | "pending"
  | "processing"
  | "success"
  | "failed"
  | "refunded";

// DeliveryStatus tracks fulfillment to the end provider (Khalti/eSewa/IME)
// independently of the payment status. A transaction can be paid (status =
// success) yet still undelivered if the delivery provider rejects it.
export type DeliveryStatus = "pending" | "delivered" | "failed";

export interface Transaction {
  id: string;
  user_id: string;
  service_id: string;
  recipient_number: string;
  amount_npr: number;
  amount_charged: number;
  // service_charge and bank_processing_fee are the fee amounts (in `currency`,
  // i.e. the currency the user paid in) derived from the product's percentage
  // fees and added to the principal to get the total charged.
  service_charge: number;
  bank_processing_fee: number;
  currency: string;
  exchange_rate: number;
  status: TransactionStatus;
  delivery_status: DeliveryStatus;
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

// MobilePack is one purchasable data/SMS bundle for a carrier, loaded from the
// product's delivery gateway at runtime (not hardcoded on the client).
export interface MobilePack {
  id: string; // package_id (NTC) or product_code (Ncell)
  label: string;
  price: number; // fixed price in NPR
  validity: string;
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
