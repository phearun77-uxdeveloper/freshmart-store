import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { api } from '../services/api.ts';
import { Order } from '../types/index.ts';
import { ShieldCheck, Truck, ArrowLeft, CheckCircle2, AlertTriangle, CreditCard, Banknote, User } from 'lucide-react';

interface CheckoutPageProps {
  onBackToCatalog: () => void;
  onViewOrder: (orderId: number) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onBackToCatalog, onViewOrder }) => {
  const { user, openAuthModal, quickDemoLogin } = useAuth();
  const { items, subtotal, deliveryFee, total, clearCart } = useCart();

  // Form Fields
  const [deliveryName, setDeliveryName] = useState(user?.name || '');
  const [deliveryPhone, setDeliveryPhone] = useState(user?.phone || '');
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || '');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH_ON_DELIVERY' | 'MOCK_PAYMENT'>('CASH_ON_DELIVERY');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // If user is not authenticated, prompt sign-in
  if (!user) {
    return (
      <div className="max-w-md mx-auto py-16 text-center bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
          <User className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 font-display">Authentication Required</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Please sign in or register to complete your supermarket checkout. Your current basket will be automatically saved.
        </p>
        <div className="pt-2 flex flex-col gap-2">
          <button
            type="button"
            onClick={openAuthModal}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
          >
            Sign In / Register
          </button>
          <button
            type="button"
            onClick={() => quickDemoLogin('customer')}
            className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
          >
            1-Click Demo Customer Sign In
          </button>
        </div>
      </div>
    );
  }

  // If order was placed successfully, display receipt confirmation
  if (confirmedOrder) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 space-y-6">
        <div className="bg-white rounded-3xl border border-emerald-200 p-8 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-bold text-slate-900 font-display">Order Confirmed!</h2>
          <p className="text-xs text-slate-500">
            Thank you, <strong className="text-slate-800">{confirmedOrder.deliveryName}</strong>. Your harvest is being prepared at our fulfillment center.
          </p>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 inline-block text-left text-xs space-y-1">
            <div>
              <span className="text-slate-500">Order Number: </span>
              <strong className="font-mono text-emerald-800 font-bold">{confirmedOrder.orderNumber}</strong>
            </div>
            <div>
              <span className="text-slate-500">Payment: </span>
              <span className="font-semibold text-slate-800">
                {confirmedOrder.paymentMethod === 'CASH_ON_DELIVERY' ? 'Cash on Delivery (COD)' : 'Instant Demo Payment'}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Total Due: </span>
              <strong className="font-bold text-slate-900 tabular-nums">${confirmedOrder.totalAmount.toFixed(2)}</strong>
            </div>
            <div>
              <span className="text-slate-500">Delivering to: </span>
              <span className="text-slate-700">{confirmedOrder.deliveryAddress}</span>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onViewOrder(confirmedOrder.id)}
              className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Track Order Status
            </button>
            <button
              type="button"
              onClick={onBackToCatalog}
              className="w-full sm:w-auto px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If cart is empty
  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Your Basket is Empty</h2>
        <p className="text-xs text-slate-500">Please select items from the supermarket catalog before checking out.</p>
        <button
          onClick={onBackToCatalog}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold"
        >
          Browse Catalog
        </button>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await api.createOrder({
        deliveryName,
        deliveryPhone,
        deliveryAddress,
        deliveryNotes,
        paymentMethod,
      });

      await clearCart();
      setConfirmedOrder(res.order);
    } catch (err: any) {
      setError(err.message || 'Failed to complete order. Please review your cart and delivery details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Back Link */}
      <button
        onClick={onBackToCatalog}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Catalog</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Delivery & Payment Form */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <Truck className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900 font-display">Delivery & Payment Information</h2>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handlePlaceOrder} id="checkout-form" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Recipient Name *</label>
                <input
                  type="text"
                  required
                  value={deliveryName}
                  onChange={(e) => setDeliveryName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone *</label>
                <input
                  type="tel"
                  required
                  value={deliveryPhone}
                  onChange={(e) => setDeliveryPhone(e.target.value)}
                  placeholder="e.g. +1 (555) 019-2831"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 focus:outline-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Delivery Address *</label>
              <textarea
                required
                rows={2}
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Street address, apartment or suite, city, postal code"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 focus:outline-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Delivery Notes (Optional)</label>
              <input
                type="text"
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder="e.g. Leave by front door, ring doorbell"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 focus:outline-emerald-600"
              />
            </div>

            {/* Payment Method Selector */}
            <div className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 mb-3">Select Payment Method</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'CASH_ON_DELIVERY'
                      ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CASH_ON_DELIVERY"
                    checked={paymentMethod === 'CASH_ON_DELIVERY'}
                    onChange={() => setPaymentMethod('CASH_ON_DELIVERY')}
                    className="mt-1 text-emerald-600 accent-emerald-600"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                      <Banknote className="w-4 h-4 text-emerald-700" />
                      <span>Cash on Delivery (COD)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      Pay directly to our delivery courier when your fresh groceries arrive.
                    </p>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'MOCK_PAYMENT'
                      ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="MOCK_PAYMENT"
                    checked={paymentMethod === 'MOCK_PAYMENT'}
                    onChange={() => setPaymentMethod('MOCK_PAYMENT')}
                    className="mt-1 text-emerald-600 accent-emerald-600"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                      <CreditCard className="w-4 h-4 text-slate-600" />
                      <span>Instant Demo Payment</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      Simulated immediate confirmation for test orders (no real card charged).
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </form>
        </div>

        {/* Authoritative Order Summary Column */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 font-display">
            Order Summary ({items.length} {items.length === 1 ? 'item' : 'items'})
          </h3>

          <div className="max-h-64 overflow-y-auto space-y-3 pr-1 text-xs">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-start gap-2">
                <div className="truncate">
                  <span className="font-semibold text-slate-800 truncate block">{item.product.name}</span>
                  <span className="text-[11px] text-slate-400">
                    {item.quantity} × ${(item.product.promotionalPrice ?? item.product.price).toFixed(2)}
                  </span>
                </div>
                <span className="font-bold text-slate-900 tabular-nums">
                  ${item.itemTotal.toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900 tabular-nums">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Delivery Fee</span>
              <span className="font-semibold text-slate-900 tabular-nums">
                {deliveryFee === 0 ? <span className="text-emerald-700 font-bold">FREE</span> : `$${deliveryFee.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
              <span>Final Total</span>
              <span className="tabular-nums text-emerald-800 text-base">${total.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            form="checkout-form"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Validating & Processing...' : `Place Order · $${total.toFixed(2)}`}
          </button>

          <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Atomic stock reservation & order transaction</span>
          </div>
        </div>
      </div>
    </div>
  );
};
