import React, { useEffect, useState, useCallback } from 'react';
import { Order, OrderStatus } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { Search, Eye, X, Check, Truck, AlertOctagon, Clock, CheckCircle2 } from 'lucide-react';

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: any = { limit: 50 };
      if (search.trim()) params.q = search.trim();
      if (selectedStatus !== 'ALL') params.status = selectedStatus;

      const res = await api.getAdminOrders(params);
      setOrders(res.orders || []);
    } catch (err) {
      console.error('Error fetching admin orders:', err);
    } finally {
      setIsLoading(false);
    }
  }, [search, selectedStatus]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleStatusChange = async (orderId: number, nextStatus: OrderStatus) => {
    if (nextStatus === 'CANCELLED') {
      if (!confirm('Are you sure you want to cancel this order? This will safely restore the deducted inventory back to warehouse stock.')) {
        return;
      }
    }

    setIsUpdating(true);
    try {
      const res = await api.updateOrderStatus(orderId, nextStatus);
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(res.order);
      }
      loadOrders();
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'OUT_FOR_DELIVERY':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'PREPARING':
      case 'CONFIRMED':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-display">Orders & Fulfillment Pipeline</h1>
        <p className="text-xs text-slate-500 mt-1">Review live incoming orders, advance fulfillment status, and inspect delivery data</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by order #, customer name, phone, or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-emerald-600"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="text-xs bg-white border border-slate-300 rounded-lg px-3 py-1.5 font-medium text-slate-700 w-full sm:w-auto focus:outline-emerald-600"
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending Approval</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="PREPARING">Preparing In Cold Room</option>
          <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Recipient Phone</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4 text-right">Total</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No orders matched your search criteria.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-emerald-800">{ord.orderNumber}</td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900 block">{ord.deliveryName}</span>
                      <span className="text-[11px] text-slate-400">{ord.user?.email}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono">{ord.deliveryPhone}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${getStatusBadge(ord.status)}`}>
                        {ord.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <span className="font-medium block">
                        {ord.paymentMethod === 'CASH_ON_DELIVERY' ? 'COD (Cash)' : 'Mock Payment'}
                      </span>
                      <span className="text-[10px] text-slate-400">Status: {ord.paymentStatus}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 tabular-nums">
                      ${ord.totalAmount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(ord)}
                        className="px-3 py-1 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Manage</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Management Dialog */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setSelectedOrder(null)} />

          <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 z-10 border border-slate-200 space-y-6">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-emerald-800">{selectedOrder.orderNumber}</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getStatusBadge(selectedOrder.status)}`}>
                  {selectedOrder.status.replace(/_/g, ' ')}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-1 font-display">
                Fulfillment Controls & Delivery Dossier
              </h3>
            </div>

            {/* Status Transition Control Buttons */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                Advance Fulfillment State
              </span>

              <div className="flex flex-wrap gap-2">
                {selectedOrder.status === 'PENDING' && (
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => handleStatusChange(selectedOrder.id, 'CONFIRMED')}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Confirm Order</span>
                  </button>
                )}

                {(selectedOrder.status === 'PENDING' || selectedOrder.status === 'CONFIRMED') && (
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => handleStatusChange(selectedOrder.id, 'PREPARING')}
                    className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Start Packing (Preparing)</span>
                  </button>
                )}

                {selectedOrder.status === 'PREPARING' && (
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => handleStatusChange(selectedOrder.id, 'OUT_FOR_DELIVERY')}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Dispatch (Out for Delivery)</span>
                  </button>
                )}

                {selectedOrder.status === 'OUT_FOR_DELIVERY' && (
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => handleStatusChange(selectedOrder.id, 'DELIVERED')}
                    className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark as Delivered</span>
                  </button>
                )}

                {selectedOrder.status !== 'DELIVERED' && selectedOrder.status !== 'CANCELLED' && (
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => handleStatusChange(selectedOrder.id, 'CANCELLED')}
                    className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ml-auto"
                  >
                    <AlertOctagon className="w-3.5 h-3.5" />
                    <span>Cancel Order & Restore Stock</span>
                  </button>
                )}
              </div>
            </div>

            {/* Delivery Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <span className="font-bold text-slate-800 block">Delivery Destination</span>
                <p className="text-slate-700">{selectedOrder.deliveryName}</p>
                <p className="text-slate-700">{selectedOrder.deliveryAddress}</p>
                <p className="text-slate-700 font-mono">{selectedOrder.deliveryPhone}</p>
                {selectedOrder.deliveryNotes && (
                  <p className="text-slate-500 italic mt-1">Notes: {selectedOrder.deliveryNotes}</p>
                )}
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <span className="font-bold text-slate-800 block">Authoritative Financials</span>
                <p className="text-slate-600">Subtotal: <span className="tabular-nums font-semibold">${selectedOrder.subtotal.toFixed(2)}</span></p>
                <p className="text-slate-600">Delivery Fee: <span className="tabular-nums font-semibold">${selectedOrder.deliveryFee.toFixed(2)}</span></p>
                <p className="text-slate-900 font-bold text-sm pt-1 border-t border-slate-200">
                  Total Due: <span className="tabular-nums text-emerald-800">${selectedOrder.totalAmount.toFixed(2)}</span>
                </p>
                <p className="text-[11px] text-slate-500 pt-1">
                  Payment: {selectedOrder.paymentMethod === 'CASH_ON_DELIVERY' ? 'Cash on Delivery' : 'Instant Demo'}
                </p>
              </div>
            </div>

            {/* Items Snapshots */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 mb-2 uppercase tracking-wider">Ordered Products</h4>
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1 text-xs">
                {selectedOrder.items.map((it) => (
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
