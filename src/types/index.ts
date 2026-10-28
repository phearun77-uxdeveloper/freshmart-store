export type UserRole = 'CUSTOMER' | 'ADMIN';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  phone?: string | null;
  address?: string | null;
  createdAt?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
  createdAt: string;
  _count?: {
    products: number;
  };
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: number;
  promotionalPrice?: number | null;
  unit: string;
  stockQuantity: number;
  lowStockThreshold: number;
  imageUrl: string;
  isActive: boolean;
  isFeatured: boolean;
  categoryId: number;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CartItemProduct {
  id: number;
  name: string;
  slug: string;
  sku: string;
  price: number;
  promotionalPrice?: number | null;
  unit: string;
  stockQuantity: number;
  imageUrl: string;
  isActive: boolean;
  categoryName?: string;
}

export interface CartItem {
  id: number | string; // string for guest cart temporary IDs
  productId: number;
  quantity: number;
  product: CartItemProduct;
  itemTotal: number;
}

export interface CartResponse {
  cartId?: number;
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderItem {
  id: number;
  productId: number;
  productNameSnapshot: string;
  unitPriceSnapshot: number;
  quantity: number;
  subtotal: number;
  product?: {
    imageUrl: string;
    slug: string;
    unit: string;
  };
}

export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  deliveryName: string;
  deliveryPhone: string;
  deliveryAddress: string;
  deliveryNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  user?: {
    name: string;
    email: string;
  };
}

export interface StoreSetting {
  id: number;
  key: string;
  value: string;
  updatedAt: string;
}

export interface InventoryMovement {
  id: number;
  productId: number;
  changeQuantity: number;
  reason: string;
  adminUserId?: number | null;
  createdAt: string;
  product?: {
    name: string;
    sku: string;
  };
}
