import React, { useEffect, useState } from 'react';
import { Order, OrderStatus } from '../types/index.ts';
import { api } from '../services/api.ts';
import { Package, Clock, CheckCircle2, AlertCircle, Truck, Eye, ArrowLeft, X } from 'lucide-react';

interface OrderHistoryPageProps {
  onBackToCatalog: () => void;
  selectedOrderId?: number | null;
}

const STATUS_STEPS: Array<{ key: OrderStatus; label: string; desc: string }> = [
  { key: 'PENDING', label: 'Order Received', desc: 'Awaiting confirmation' },
  { key: 'CONFIRMED', label: 'Confirmed', desc: 'Order approved by supermarket' },
  { key: 'PREPARING', label: 'Preparing Harvest', desc: 'Packing fresh items into cold crates' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', desc: 'Courier en route in cold van' },
  { key: 'DELIVERED', label: 'Delivered', desc: 'Delivered safely to doorstep' },
];

export const OrderHistoryPage: React.FC<OrderHistoryPageProps> = ({ onBackToCatalog, selectedOrderId }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  useEffect(() => {
    let isMounted = true;
    api.getMyOrders()
      .then((res) => {
        if (isMounted) {
          const list: Order[] = res.orders || [];
          setOrders(list);

          if (selectedOrderId) {
            const found = list.find((o) => o.id === selectedOrderId);
            if (found) setActiveOrder(found);
          }
        }
      })
      .catch((err) => {
        console.error('Error fetching my orders:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => { isMounted = false; };
  }, [selectedOrderId]);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'CANCELLED':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'OUT_FOR_DELIVERY':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PREPARING':
      case 'CONFIRMED':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStepStatus = (stepKey: OrderStatus, currentStatus: OrderStatus) => {
    if (currentStatus === 'CANCELLED') return 'cancelled';
    const orderIndex = STATUS_STEPS.findIndex((s) => s.key === currentStatus);
    const stepIndex = STATUS_STEPS.findIndex((s) => s.key === stepKey);

    if (stepIndex < orderIndex) return 'completed';
    if (stepIndex === orderIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <button
            onClick={onBackToCatalog}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Catalog</span>
          </button>
          <h1 className="text-2xl font-bold text-slate-900 font-display">My Order History</h1>
          <p className="text-xs text-slate-500 mt-1">Review your past grocery deliveries and real-time order tracking</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-28 rounded-2xl bg-slate-200 animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
            <Package className="w-8 h-8 stroke-1" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">No orders yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mb-4">
            You haven't placed any grocery orders yet. Discover our seasonal harvests and fill your basket!
          </p>
          <button
            onClick={onBackToCatalog}
            className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Shop Supermarket
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => (
            <div
              key={ord.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-slate-900">{ord.orderNumber}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getStatusColor(ord.status)}`}>
                    {ord.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Placed on {new Date(ord.createdAt).toLocaleDateString()} at {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span>·</span>
                  <span>{ord.items.length} {ord.items.length === 1 ? 'item' : 'items'}</span>
                </div>
                <div className="text-xs text-slate-600">
                  <span>Delivering to: <strong>{ord.deliveryAddress}</strong></span>
                </div>
              </div>

              <div className="flex items-center sm:flex-col sm:items-end justify-between gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <span className="text-base font-bold text-slate-900 tabular-nums">
                  ${ord.totalAmount.toFixed(2)}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveOrder(ord)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Track & Receipt</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detailed Order Timeline & Receipt Modal */}
      {activeOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setActiveOrder(null)} />

          <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 z-10 border border-slate-200 space-y-6">
            <button
              onClick={() => setActiveOrder(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-emerald-800">{activeOrder.orderNumber}</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getStatusColor(activeOrder.status)}`}>
                  {activeOrder.status.replace(/_/g, ' ')}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-1 font-display">
                Delivery Timeline & Order Details
              </h3>
            </div>

            {/* 6-Stage Timeline */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold text-slate-800 mb-4 uppercase tracking-wider">Fulfillment Progress</h4>
              {activeOrder.status === 'CANCELLED' ? (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>This order was cancelled. Any deducted inventory has been restored safely.</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {STATUS_STEPS.map((step, idx) => {
                    const statusType = getStepStatus(step.key, activeOrder.status);
                    return (
                      <div key={step.key} className="flex items-start gap-3">
                        <div className="relative flex flex-col items-center">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              statusType === 'completed'
                                ? 'bg-emerald-600 text-white'
                                : statusType === 'current'
                                ? 'bg-amber-500 text-white ring-4 ring-amber-100'
                                : 'bg-slate-200 text-slate-500'
                            }`}
                          >
                            {statusType === 'completed' ? (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : (
                              idx + 1
                            )}
                          </div>
                          {idx < STATUS_STEPS.length - 1 && (
                            <div
                              className={`w-0.5 h-6 my-0.5 ${
                                statusType === 'completed' ? 'bg-emerald-600' : 'bg-slate-200'
                              }`}
                            />
                          )}
                        </div>

                        <div>
                          <p
                            className={`text-xs font-bold ${
                              statusType === 'current'
                                ? 'text-amber-800'
                                : statusType === 'completed'
                                ? 'text-emerald-900'
                                : 'text-slate-400'
                            }`}
                          >
                            {step.label}
                          </p>
                          <p className="text-[11px] text-slate-500">{step.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Delivery Info & Itemized Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <span className="font-bold text-slate-800 block">Delivery Address</span>
                <p className="text-slate-600">{activeOrder.deliveryName}</p>
                <p className="text-slate-600">{activeOrder.deliveryAddress}</p>
                <p className="text-slate-600">{activeOrder.deliveryPhone}</p>
                {activeOrder.deliveryNotes && (
                  <p className="text-slate-500 italic mt-1">Note: {activeOrder.deliveryNotes}</p>
                )}
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <span className="font-bold text-slate-800 block">Payment Summary</span>
                <p className="text-slate-600">
                  Method: <strong className="font-semibold text-slate-800">{activeOrder.paymentMethod === 'CASH_ON_DELIVERY' ? 'Cash on Delivery (COD)' : 'Instant Demo Payment'}</strong>
                </p>
                <p className="text-slate-600">Payment Status: <span className="font-semibold">{activeOrder.paymentStatus}</span></p>
                <p className="text-slate-600">Subtotal: <span className="tabular-nums">${activeOrder.subtotal.toFixed(2)}</span></p>
                <p className="text-slate-600">Delivery Fee: <span className="tabular-nums">${activeOrder.deliveryFee.toFixed(2)}</span></p>
                <p className="text-slate-900 font-bold pt-1 border-t border-slate-200">
                  Total: <span className="tabular-nums">${activeOrder.totalAmount.toFixed(2)}</span>
                </p>
              </div>
            </div>

            {/* Items Snapshots */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 mb-2 uppercase tracking-wider">Ordered Items</h4>
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1 text-xs">
                {activeOrder.items.map((it) => (
                  <div key={it.id} className="flex justify-between items-center py-1.5 border-b border-slate-100 last:border-b-0">
                    <div>
                      <span className="font-semibold text-slate-800">{it.productNameSnapshot}</span>
                      <span className="text-[11px] text-slate-400 block">
                        {it.quantity} × ${it.unitPriceSnapshot.toFixed(2)}
                      </span>
                    </div>
                    <span className="font-bold text-slate-900 tabular-nums">${it.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
