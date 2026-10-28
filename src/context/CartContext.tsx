import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CartItem, Product } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useAuth } from './AuthContext.tsx';

interface CartContextType {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  total: number;
  itemCount: number;
  isLoading: boolean;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: number | string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number | string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  notification: string | null;
  clearNotification: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const GUEST_CART_STORAGE_KEY = 'freshmart_guest_cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const [deliveryFeeRate, setDeliveryFeeRate] = useState(4.99);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(45.00);

  // Load public store settings for delivery fee
  useEffect(() => {
    api.getPublicSettings().then(res => {
      if (res.settings) {
        if (res.settings.DELIVERY_FEE) setDeliveryFeeRate(parseFloat(res.settings.DELIVERY_FEE) || 4.99);
        if (res.settings.FREE_DELIVERY_THRESHOLD) setFreeDeliveryThreshold(parseFloat(res.settings.FREE_DELIVERY_THRESHOLD) || 45.00);
      }
    }).catch(() => {});
  }, []);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 3500);
  };

  // Helper to fetch server cart
  const fetchServerCart = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const data = await api.getCart();
      setItems(data.items || []);
    } catch (err) {
      console.error('Error fetching server cart:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load cart on user change (or guest cart if logged out)
  useEffect(() => {
    if (user) {
      // Check if guest cart had items, sync them to server
      const savedGuestCart = localStorage.getItem(GUEST_CART_STORAGE_KEY);
      if (savedGuestCart) {
        try {
          const guestItems: CartItem[] = JSON.parse(savedGuestCart);
          if (guestItems.length > 0) {
            const syncPayload = guestItems.map((gi) => ({
              productId: gi.productId,
              quantity: gi.quantity,
            }));
            api.syncGuestCart(syncPayload)
              .then((res) => {
                setItems(res.items || []);
                localStorage.removeItem(GUEST_CART_STORAGE_KEY);
                showNotification('Guest cart merged into your account!');
              })
              .catch(() => {
                fetchServerCart();
              });
            return;
          }
        } catch {
          localStorage.removeItem(GUEST_CART_STORAGE_KEY);
        }
      }
      fetchServerCart();
    } else {
      // Guest mode: load from localStorage
      const saved = localStorage.getItem(GUEST_CART_STORAGE_KEY);
      if (saved) {
        try {
          setItems(JSON.parse(saved));
        } catch {
          setItems([]);
        }
      } else {
        setItems([]);
      }
    }
  }, [user, fetchServerCart]);

  // Save guest cart to localStorage whenever it changes in guest mode
  useEffect(() => {
    if (!user) {
      localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, user]);

  const addToCart = async (product: Product, quantity = 1) => {
    if (product.stockQuantity <= 0) {
      showNotification(`${product.name} is out of stock.`);
      return;
    }

    if (user) {
      try {
        setIsLoading(true);
        const data = await api.addToCart(product.id, quantity);
        setItems(data.items);
        showNotification(`Added ${product.name} to cart.`);
      } catch (err: any) {
        showNotification(err.message || 'Could not add item');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Guest cart logic
      setItems((prev) => {
        const existingIndex = prev.findIndex((item) => item.productId === product.id);
        const price = product.promotionalPrice ?? product.price;

        if (existingIndex > -1) {
          const existing = prev[existingIndex];
          const newQty = Math.min(existing.quantity + quantity, product.stockQuantity);
          const updatedList = [...prev];
          updatedList[existingIndex] = {
            ...existing,
            quantity: newQty,
            itemTotal: parseFloat((price * newQty).toFixed(2)),
          };
          return updatedList;
        } else {
          const newQty = Math.min(quantity, product.stockQuantity);
          const newItem: CartItem = {
            id: `guest_${product.id}_${Date.now()}`,
            productId: product.id,
            quantity: newQty,
            product: {
              id: product.id,
              name: product.name,
              slug: product.slug,
              sku: product.sku,
              price: product.price,
              promotionalPrice: product.promotionalPrice,
              unit: product.unit,
              stockQuantity: product.stockQuantity,
              imageUrl: product.imageUrl,
              isActive: product.isActive,
              categoryName: product.category?.name,
            },
            itemTotal: parseFloat((price * newQty).toFixed(2)),
          };
          return [...prev, newItem];
        }
      });
      showNotification(`Added ${product.name} to cart.`);
    }
  };

  const updateQuantity = async (itemId: number | string, newQuantity: number) => {
    if (user && typeof itemId === 'number') {
      try {
        setIsLoading(true);
        const data = await api.updateCartItem(itemId, newQuantity);
        setItems(data.items);
      } catch (err: any) {
        showNotification(err.message || 'Could not update item');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Guest update
      setItems((prev) => {
        if (newQuantity <= 0) {
          return prev.filter((item) => item.id !== itemId);
        }
        return prev.map((item) => {
          if (item.id === itemId) {
            const cappedQty = Math.min(newQuantity, item.product.stockQuantity);
            const activePrice = item.product.promotionalPrice ?? item.product.price;
            return {
              ...item,
              quantity: cappedQty,
              itemTotal: parseFloat((activePrice * cappedQty).toFixed(2)),
            };
          }
          return item;
        });
      });
    }
  };

  const removeFromCart = async (itemId: number | string) => {
    if (user && typeof itemId === 'number') {
      try {
        setIsLoading(true);
        const data = await api.removeCartItem(itemId);
        setItems(data.items);
        showNotification('Item removed from cart.');
      } catch (err: any) {
        showNotification(err.message || 'Could not remove item');
      } finally {
        setIsLoading(false);
      }
    } else {
      setItems((prev) => prev.filter((item) => item.id !== itemId));
      showNotification('Item removed from cart.');
    }
  };

  const clearCart = async () => {
    if (user) {
      try {
        setIsLoading(true);
        await api.clearCart();
        setItems([]);
        showNotification('Cart cleared.');
      } catch (err: any) {
        showNotification(err.message || 'Could not clear cart');
      } finally {
        setIsLoading(false);
      }
    } else {
      setItems([]);
      localStorage.removeItem(GUEST_CART_STORAGE_KEY);
      showNotification('Cart cleared.');
    }
  };

  const subtotal = parseFloat(
    items.reduce((sum, item) => sum + item.itemTotal, 0).toFixed(2)
  );

  const deliveryFee = items.length === 0 || subtotal >= freeDeliveryThreshold ? 0 : deliveryFeeRate;
  const total = parseFloat((subtotal + deliveryFee).toFixed(2));
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const value: CartContextType = {
    items,
    subtotal,
    deliveryFee,
    freeDeliveryThreshold,
    total,
    itemCount,
    isLoading,
    isCartOpen,
    openCart: () => setIsCartOpen(true),
    closeCart: () => setIsCartOpen(false),
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart: fetchServerCart,
    notification,
    clearNotification: () => setNotification(null),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
