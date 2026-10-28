/**
 * Centralized API Service for FreshMart
 * Uses native Fetch API with credentials: 'include' for secure HTTP-only cookies
 */

const API_BASE = '/api';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  let url = `${API_BASE}${endpoint}`;

  if (options.params) {
    const searchParams = new URLSearchParams();
    Object.entries(options.params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, String(val));
      }
    });
    const qs = searchParams.toString();
    if (qs) {
      url += `?${qs}`;
    }
  }

  const token = localStorage.getItem('freshmart_token');
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  register: (body: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => request<any>('/auth/logout', { method: 'POST' }),
  getMe: () => request<any>('/auth/me'),

  // Categories
  getCategories: (params?: any) => request<any>('/categories', { params }),
  getCategoryById: (id: number) => request<any>(`/categories/${id}`),
  createCategory: (body: any) => request<any>('/categories', { method: 'POST', body: JSON.stringify(body) }),
  updateCategory: (id: number, body: any) => request<any>(`/categories/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteCategory: (id: number) => request<any>(`/categories/${id}`, { method: 'DELETE' }),

  // Products
  getProducts: (params?: any) => request<any>('/products', { params }),
  getProductBySlug: (slug: string) => request<any>(`/products/slug/${slug}`),
  getProductById: (id: number) => request<any>(`/products/${id}`),
  createProduct: (body: any) => request<any>('/products', { method: 'POST', body: JSON.stringify(body) }),
  updateProduct: (id: number, body: any) => request<any>(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteProduct: (id: number) => request<any>(`/products/${id}`, { method: 'DELETE' }),

  // Cart
  getCart: () => request<any>('/cart'),
  addToCart: (productId: number, quantity: number = 1) =>
    request<any>('/cart/items', { method: 'POST', body: JSON.stringify({ productId, quantity }) }),
  updateCartItem: (itemId: number, quantity: number) =>
    request<any>(`/cart/items/${itemId}`, { method: 'PATCH', body: JSON.stringify({ quantity }) }),
  removeCartItem: (itemId: number) =>
    request<any>(`/cart/items/${itemId}`, { method: 'DELETE' }),
  clearCart: () => request<any>('/cart', { method: 'DELETE' }),
  syncGuestCart: (items: Array<{ productId: number; quantity: number }>) =>
    request<any>('/cart/sync', { method: 'POST', body: JSON.stringify({ items }) }),

  // Orders
  createOrder: (body: any) => request<any>('/orders', { method: 'POST', body: JSON.stringify(body) }),
  getMyOrders: () => request<any>('/orders/my'),
  getOrderById: (id: number) => request<any>(`/orders/${id}`),

  // Public Settings
  getPublicSettings: () => request<any>('/settings/public'),

  // Admin
  getDashboardKPIs: () => request<any>('/admin/dashboard'),
  getAdminOrders: (params?: any) => request<any>('/admin/orders', { params }),
  updateOrderStatus: (id: number, status: string) =>
    request<any>(`/admin/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  getAdminCustomers: () => request<any>('/admin/customers'),
  getAdminInventory: () => request<any>('/admin/inventory'),
  createInventoryAdjustment: (body: any) =>
    request<any>('/admin/inventory/adjustments', { method: 'POST', body: JSON.stringify(body) }),
  getAdminSettings: () => request<any>('/admin/settings'),
  updateAdminSettings: (settings: Array<{ key: string; value: string }>) =>
    request<any>('/admin/settings', { method: 'PATCH', body: JSON.stringify({ settings }) }),
};
