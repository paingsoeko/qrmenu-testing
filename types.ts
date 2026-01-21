
export interface LocationData {
  id: number | string;
  name: string;
  address?: string;
  phone?: string;
  image?: string;
  description?: string;
  // Fields from the specific API response
  location_type?: number;
  is_active?: number;
  allow_purchase_order?: number;
  allow_sale_order?: number;
  created_at?: string;
  // Catch-all
  [key: string]: any;
}

export interface Table {
  id: number;
  business_location_id: number;
  zone_id: number;
  table_code: string;
  display_name: string;
  seats: number;
  qr_public_code: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Zone {
  id: number;
  business_location_id: number;
  zone_no: number;
  name: string;
  tables: Table[];
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  image?: string;
  price: number | string;
  category?: string;
  is_active?: number;
  sku?: string;
  type?: string;
  // Fields required for Cart API
  product_id?: number;
  product_variant_id?: number;
  uom_id?: number;
}

export interface CartItem {
  id: number;
  cart_id: number;
  product_id: number;
  product_variant_id: number;
  uom_id: number;
  quantity: string | number;
  uom_price: string | number;
  product_full_name: string;
  created_at: string;
  updated_at: string;
  // Nested details from Cart GET API
  product?: {
    product_image?: string;
    image?: string;
    name?: string;
    [key: string]: any;
  };
  variant?: {
    fullName?: string;
    [key: string]: any;
  };
}

export interface Cart {
  id: number;
  session_id: string;
  items?: CartItem[];
  table_id?: number | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentMethod {
  id: number;
  name: string;
  slug: string;
  logo: string;
  logo_url: string;
  payment_account_id: number;
  note: string;
  is_enable: number;
  is_default: number;
  payment_account?: {
    id: number;
    name: string;
    account_number?: string;
    account_type?: string;
    description?: string;
    [key: string]: any;
  };
}

export interface TableSessionData {
  session_id: number;
  table_id: number;
  location_id: number;
  zone_id: number;
  status: string;
  started_at: string;
  expires_at: string;
}

export interface PromptPayQrData {
  payment_id: number;
  token: string;
  client_secret: string;
  qr_type: string;
  qr_code_url: string;
  instruction_url: string;
  amount: number;
  currency: string;
  expires_at: string;
}

export interface PromptPayStatusData {
  payment_id: number;
  stripe_id: string;
  status: 'pending' | 'confirmed' | 'failed';
  amount: number;
  currency: string;
  paid_at?: string | null;
}

// Order History Types

export interface OrderSaleItem {
  id: number;
  product_id: number;
  quantity: string | number;
  uom_price: string | number;
  subtotal: string | number;
  variation?: {
    fullName?: string;
    product?: {
      name: string;
      product_image?: string;
      image?: string;
    };
  };
}

export interface OrderSale {
  id: number;
  sales_voucher_no: string;
  status: string;
  payment_status: string;
  items: OrderSaleItem[];
}

export interface Order {
  id: number;
  order_number: string;
  status: 'pending' | 'cooking' | 'ready' | 'served' | 'cancelled' | 'completed';
  total_amount: string | number;
  created_at: string;
  sale?: OrderSale;
  details?: any[]; // Fallback if sale is missing
}

export interface OrderHistoryData {
  current_orders: Order[];
  past_orders: Order[];
}

export interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data: T;
  meta?: any;
}
