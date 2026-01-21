import { LocationData, Zone, Product, Cart, PaymentMethod, PromptPayQrData, PromptPayStatusData, TableSessionData, OrderHistoryData, StaffQrData, Currency } from '../types';

const API_BASE = "https://qrmenu.demo.picosbs.com/api/v1/qr-menu";
const API_TOKEN = "061a5b0a27511d1e1f94bc970df0db43962d7fc72fb7099c175d99403113d9d9";

// --- Helper Functions ---

export const getSessionId = (): string => {
  const STORAGE_KEY = 'qr_menu_session_id';
  let sessionId = localStorage.getItem(STORAGE_KEY);
  
  if (!sessionId) {
    // Generate a simple random string for session ID
    sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem(STORAGE_KEY, sessionId);
  }
  
  return sessionId;
};

// --- API Logic ---

const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = new URL(`${API_BASE}${endpoint}`);
  
  const headers = {
    'Accept': 'application/json',
    'X-API-Token': API_TOKEN,
    ...((options.headers as Record<string, string>) || {})
  };

  const response = await fetch(url.toString(), {
    ...options,
    headers
  });

  if (!response.ok) {
    // Attempt to parse error message from JSON body if available
    try {
        const errorJson = await response.json();
        throw new Error(errorJson.message || `API Error: ${response.status} ${response.statusText}`);
    } catch (e: any) {
        if (e.message && e.message.startsWith('API Error')) throw e; // Re-throw if it's already our error
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
  }

  return response.json();
};

export const fetchLocations = async (): Promise<LocationData[]> => {
  const json = await apiRequest('/locations');
  
  if (Array.isArray(json)) return json;
  if (json && Array.isArray(json.data)) return json.data;
  return [];
};

export const fetchTables = async (locationId: number | string): Promise<Zone[]> => {
  const response = await fetch(`${API_BASE}/tables?location_id=${locationId}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'X-API-Token': API_TOKEN
    }
  });
  
  if (!response.ok) throw new Error("Failed to fetch tables");
  const json = await response.json();
  
  if (json && Array.isArray(json.data)) return json.data;
  return [];
};

export const fetchProducts = async (locationId: number | string, categoryId?: number | string | null): Promise<Product[]> => {
  const params = new URLSearchParams();
  params.append('location_id', String(locationId));
  
  if (categoryId) {
    params.append('category_id', String(categoryId));
  }
  
  const response = await fetch(`${API_BASE}/products?${params.toString()}`, {
      method: 'GET',
      headers: {
          'Accept': 'application/json',
          'X-API-Token': API_TOKEN
      }
  });

  if (!response.ok) throw new Error("Failed to fetch products");
  const json = await response.json();

  // Handle pagination structure: response.data.data
  if (json && json.data && Array.isArray(json.data.data)) {
      // Map API response to Product interface
      return json.data.data.map((item: any) => {
          const productDetails = item.product || {};
          return {
              id: item.id, // This acts as the variant ID in this specific API structure
              name: item.fullName || productDetails.name || "Unknown Item",
              description: productDetails.product_description || productDetails.product_short_description || "",
              image: productDetails.product_image || productDetails.image || null,
              price: item.default_selling_price || 0,
              category: productDetails.category_name || "Other",
              is_active: 1,
              sku: item.variation_sku || productDetails.sku,
              // Fields for Cart
              product_id: item.product_id,
              product_variant_id: item.id,
              uom_id: productDetails.uom_id
          };
      });
  } 
  
  // Fallback for different API structures (like simple array)
  if (json && Array.isArray(json.data)) {
      return json.data;
  }
  
  return [];
};

export const startTableSession = async (tableId: number): Promise<TableSessionData> => {
  const json = await apiRequest('/table-sessions/start', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      qr_code: null,
      table_id: tableId
    })
  });

  if (json.success && json.data) {
    return json.data;
  }
  throw new Error(json.message || "Failed to start table session");
};

export const createCart = async (sessionId: string, tableSessionId?: number): Promise<Cart> => {
  const payload: any = { session_id: sessionId };
  if (tableSessionId) {
    payload.table_session_id = tableSessionId;
  }

  const json = await apiRequest('/cart/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (json.success && json.data) {
    return json.data;
  }
  throw new Error(json.message || "Failed to create cart");
};

export const fetchCart = async (sessionId: string): Promise<Cart> => {
  const json = await apiRequest(`/cart?session_id=${sessionId}`, {
    method: 'GET'
  });

  if (json.success && json.data) {
    return json.data;
  }
  throw new Error(json.message || "Failed to fetch cart");
};

export const addToCart = async (payload: {
  session_id: string;
  product_variant_id: number;
  product_id: number;
  uom_id: number;
  uom_price: number | string;
  quantity: number;
}): Promise<Cart> => {
  const json = await apiRequest('/cart/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (json.success && json.data) {
    return json.data;
  }
  throw new Error(json.message || "Failed to add item to cart");
};

export const updateCartItem = async (payload: {
  session_id: string;
  cart_item_id: number;
  quantity: number;
}): Promise<Cart> => {
  const json = await apiRequest('/cart/update', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (json.success && json.data) {
    return json.data;
  }
  throw new Error(json.message || "Failed to update cart item");
};

export const removeCartItem = async (payload: {
  session_id: string;
  cart_item_id: number;
}): Promise<Cart> => {
  const params = new URLSearchParams();
  params.append('session_id', payload.session_id);
  params.append('cart_item_id', String(payload.cart_item_id));

  const json = await apiRequest(`/cart/remove?${params.toString()}`, {
    method: 'DELETE',
    headers: {
      'Accept': 'application/json'
    }
  });

  if (json.success && json.data) {
    return json.data;
  }
  throw new Error(json.message || "Failed to remove cart item");
};

export const fetchPaymentMethods = async (): Promise<PaymentMethod[]> => {
  const json = await apiRequest('/payment-methods', {
    method: 'GET'
  });

  let methods: PaymentMethod[] = [];
  if (json.success && Array.isArray(json.data)) {
    methods = json.data;
  }

  // Inject "Pay to Staff" method
  methods.push({
    id: 9999, // Arbitrary high ID to avoid conflict
    name: "Pay to Staff",
    slug: "staff",
    logo: "",
    logo_url: "",
    payment_account_id: 0,
    note: "Show QR code to staff",
    is_enable: 1,
    is_default: 0,
    payment_account: {
        id: 0,
        name: "Pay to Staff",
        account_number: "Show QR",
        account_type: "Staff",
        description: "Staff member will scan your QR code"
    }
  });

  return methods;
};

export const generatePromptPayQr = async (payload: {
  cart_id: number;
  location_id: number | string;
  amount: number;
  order_type: string;
}): Promise<PromptPayQrData> => {
  const json = await apiRequest('/payments/promptpay/qr', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (json.success && json.data) {
    return json.data;
  }
  throw new Error(json.message || "Failed to generate QR code");
};

export const generateStaffQr = async (payload: {
  cart_id: number;
  location_id: number | string;
  amount: number;
  order_type: string;
}): Promise<StaffQrData> => {
  const json = await apiRequest('/payments/staff/qr', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (json.success && json.data) {
    return json.data;
  }
  throw new Error(json.message || "Failed to generate staff QR");
};

export const checkPromptPayStatus = async (token: string): Promise<PromptPayStatusData> => {
  const json = await apiRequest(`/payments/promptpay/status?token=${token}`, {
    method: 'GET'
  });

  if (json.success && json.data) {
    return json.data;
  }
  throw new Error(json.message || "Failed to check payment status");
};

export const checkPaymentStatus = async (token: string): Promise<{
    payment_id: number;
    status: string;
    confirmed_at: string | null;
}> => {
  const json = await apiRequest(`/payments/status?token=${token}`, {
    method: 'GET'
  });

  if (json.success && json.data) {
    return json.data;
  }
  throw new Error(json.message || "Failed to check payment status");
};

export const requestManualPayment = async (payload: {
  cart_id: number;
  location_id: number | string;
  payment_method_id: number | string;
  amount: number;
  order_type: string;
  proof_image?: File | null;
}): Promise<any> => {
  const formData = new FormData();
  formData.append('cart_id', String(payload.cart_id));
  formData.append('location_id', String(payload.location_id));
  formData.append('payment_method', String(payload.payment_method_id));
  formData.append('amount', String(payload.amount));
  formData.append('order_type', payload.order_type);

  if (payload.proof_image) {
    formData.append('proof_image', payload.proof_image);
  }

  // Use raw fetch to handle FormData boundary correctly
  const response = await fetch(`${API_BASE}/payments`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'X-API-Token': API_TOKEN
      // Do NOT set Content-Type here, let browser set multipart/form-data boundary
    },
    body: formData
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.message || "Payment request failed");
  }

  if (json.success) {
    return json.data;
  }
  throw new Error(json.message || "Failed to request payment");
};

export const placeOrder = async (payload: {
  cart_id: number;
  payment_method_id: number;
  amount: number;
  slip_image?: File;
}): Promise<any> => {
  // Alias to requestManualPayment for compatibility or direct usage
  return requestManualPayment({
      cart_id: payload.cart_id,
      location_id: 0, // Fallback if not provided, but calling code should use requestManualPayment
      payment_method_id: payload.payment_method_id,
      amount: payload.amount,
      order_type: 'dine_in',
      proof_image: payload.slip_image
  });
};

export const fetchOrderHistory = async (sessionId: string): Promise<OrderHistoryData> => {
  const json = await apiRequest(`/order-history?session_id=${sessionId}`, {
    method: 'GET'
  });

  if (json.success && json.data) {
    return json.data;
  }
  throw new Error(json.message || "Failed to fetch order history");
};

export const fetchDefaultCurrency = async (): Promise<Currency> => {
  const json = await apiRequest('/default-currency', {
    method: 'GET'
  });

  if (json.success && json.data) {
    return json.data;
  }
  throw new Error(json.message || "Failed to fetch currency");
};