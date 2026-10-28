import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const categorySchema = z.object({
  name: z.string().min(2, 'Category name is required'),
  slug: z.string().min(2, 'Category slug is required'),
  description: z.string().optional(),
  imageUrl: z.string().url('Must be a valid image URL').optional().or(z.literal('')),
  isActive: z.boolean().default(true),
});

export const productSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  slug: z.string().min(2, 'Product slug is required'),
  sku: z.string().min(2, 'SKU is required'),
  description: z.string().min(5, 'Description is required'),
  price: z.number().positive('Price must be greater than zero'),
  promotionalPrice: z.number().positive().nullable().optional(),
  unit: z.string().min(1, 'Unit (e.g. per kg, per pack) is required'),
  stockQuantity: z.number().int().min(0, 'Stock cannot be negative'),
  lowStockThreshold: z.number().int().min(0).default(10),
  imageUrl: z.string().url('Valid image URL required'),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  categoryId: z.number().int().positive('Valid category required'),
});

export const cartItemSchema = z.object({
  productId: z.number().int().positive('Valid product ID required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(0, 'Quantity cannot be negative'),
});

export const guestCartSyncSchema = z.object({
  items: z.array(
    z.object({
      productId: z.number().int().positive(),
      quantity: z.number().int().positive(),
    })
  ),
});

export const checkoutSchema = z.object({
  deliveryName: z.string().min(2, 'Recipient name is required'),
  deliveryPhone: z.string().min(7, 'Valid contact phone number is required'),
  deliveryAddress: z.string().min(8, 'Detailed delivery address is required'),
  deliveryNotes: z.string().optional(),
  paymentMethod: z.enum(['CASH_ON_DELIVERY', 'MOCK_PAYMENT']).default('CASH_ON_DELIVERY'),
});

export const inventoryAdjustmentSchema = z.object({
  productId: z.number().int().positive(),
  changeQuantity: z.number().int().refine((val) => val !== 0, 'Change quantity cannot be zero'),
  reason: z.string().min(3, 'Audit reason is required'),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']),
});
