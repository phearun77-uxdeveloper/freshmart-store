import React, { useState } from 'react';
import { useCart } from '../../context/CartContext.tsx';
import { X, Plus, Minus, Trash2, ArrowRight, ShoppingBag, Truck } from 'lucide-react';

interface CartDrawerProps {
  onNavigateToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onNavigateToCheckout }) => {
  const {
    items,
    subtotal,
    deliveryFee,
    freeDeliveryThreshold,
    total,
    itemCount,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const [confirmClear, setConfirmClear] = useState(false);

  if (!isCartOpen) return null;

  const progressToFreeDelivery = Math.min(100, (subtotal / freeDeliveryThreshold) * 100);
  const remainingForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">Your Basket</h2>
              <span className="text-xs text-slate-500 font-medium tabular-nums">
                ({itemCount} {itemCount === 1 ? 'item' : 'items'})
              </span>
            </div>
            <button
              onClick={closeCart}
              className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="bg-emerald-50/70 border-b border-emerald-100 px-6 py-3">
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-900 mb-1.5">
              <Truck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              {remainingForFreeDelivery === 0 ? (
                <span className="font-semibold text-emerald-700">You have earned FREE Standard Delivery!</span>
              ) : (
                <span>
                  Add <strong className="font-bold tabular-nums">${remainingForFreeDelivery.toFixed(2)}</strong> more for free delivery
                </span>
              )}
            </div>
            <div className="w-full bg-emerald-200/60 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full transition-all duration-300"
                style={{ width: `${progressToFreeDelivery}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                  <ShoppingBag className="w-8 h-8 stroke-1" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1">Your basket is empty</h3>
                <p className="text-xs text-slate-500 max-w-xs mb-4">
                  Browse our farm-fresh produce and grocery essentials to get started.
                </p>
                <button
                  onClick={closeCart}
                  className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map((item) => {
                const activePrice = item.product.promotionalPrice ?? item.product.price;
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-b-0"
                  >
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-lg object-cover bg-slate-50 border border-slate-200/80 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-slate-900 truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        ${activePrice.toFixed(2)} {item.product.unit}
                      </p>

                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center border border-slate-200 rounded-md bg-slate-50">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 text-slate-600 hover:text-slate-900 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center text-xs font-semibold tabular-nums text-slate-800">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            disabled={item.quantity >= item.product.stockQuantity}
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 text-slate-600 hover:text-slate-900 disabled:opacity-40 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-xs font-bold text-slate-900 tabular-nums ml-auto">
                          ${item.itemTotal.toFixed(2)}
                        </span>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors ml-2"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Drawer Footer with Authoritative Calculation */}
          {items.length > 0 && (
            <div className="p-6 border-t border-slate-200 bg-slate-50/50 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900 tabular-nums">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Fee</span>
                  <span className="font-semibold text-slate-900 tabular-nums">
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-700 font-bold">FREE</span>
                    ) : (
                      `$${deliveryFee.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Amount</span>
                  <span className="tabular-nums text-emerald-800">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    closeCart();
                    onNavigateToCheckout();
                  }}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {confirmClear ? (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[11px] text-slate-500">Clear entire basket?</span>
                    <button
                      type="button"
                      onClick={() => {
                        clearCart();
                        setConfirmClear(false);
                      }}
                      className="text-[11px] font-bold text-rose-600 hover:underline"
                    >
                      Yes, Clear
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmClear(false)}
                      className="text-[11px] text-slate-600 hover:underline ml-auto"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmClear(true)}
                    className="text-[11px] text-slate-500 hover:text-slate-800 transition-colors text-center py-1"
                  >
                    Clear basket
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
