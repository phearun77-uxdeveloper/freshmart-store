import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.ts';
import {
  DollarSign,
  Package,
  Layers,
  Users,
  ShoppingCart,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigateToTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateToTab }) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadKPIs = async () => {
    setIsLoading(true);
    try {
      const res = await api.getDashboardKPIs();
      setData(res);
    } catch (err) {
      console.error('Error fetching dashboard KPIs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadKPIs();
  }, []);

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7].map((n) => (
            <div key={n} className="h-28 rounded-2xl bg-slate-200 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const { kpis, lowStockAlerts, recentOrders, statusDistribution } = data;

  return (
    <div className="space-y-8">
      {/* Page Title & Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">Store Operations Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time metrics calculated live from database records
          </p>
        </div>
        <button
          onClick={loadKPIs}
          className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Total Realized Revenue</span>
            <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
              ${kpis.totalSales.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Total Orders</span>
            <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {kpis.totalOrders}
            </span>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Pending Dispatch</span>
            <span className="text-2xl font-extrabold text-amber-700 tabular-nums">
              {kpis.pendingOrders}
            </span>
          </div>
        </div>

        {/* Low Stock Warnings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Low Stock Alerts</span>
            <span className="text-2xl font-extrabold text-rose-700 tabular-nums">
              {kpis.lowStockCount}
            </span>
          </div>
        </div>

        {/* Active Products */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Active Products</span>
            <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {kpis.totalProducts}
            </span>
          </div>
        </div>

        {/* Active Categories */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Departments</span>
            <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {kpis.totalCategories}
            </span>
          </div>
        </div>

        {/* Registered Customers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4 sm:col-span-2">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Registered Customers</span>
            <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {kpis.totalCustomers}
            </span>
          </div>
        </div>
      </div>

      {/* Low-Stock Quick Alerts & Order Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Low Stock Alerts */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900">Critical Stock Inventory Warnings</h3>
            </div>
            <button
              onClick={() => onNavigateToTab('inventory')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>Manage Inventory</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {lowStockAlerts.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">All product stocks are currently healthy (above threshold).</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                    <th className="pb-2">Product Name</th>
                    <th className="pb-2">SKU</th>
                    <th className="pb-2">Department</th>
                    <th className="pb-2 text-right">Available Stock</th>
                    <th className="pb-2 text-right">Threshold</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lowStockAlerts.map((prod: any) => (
                    <tr key={prod.id} className="hover:bg-slate-50">
                      <td className="py-2.5 font-semibold text-slate-900">{prod.name}</td>
                      <td className="py-2.5 font-mono text-slate-500">{prod.sku}</td>
                      <td className="py-2.5 text-slate-600">{prod.category?.name}</td>
                      <td className="py-2.5 text-right font-bold text-rose-600 tabular-nums">
                        {prod.stockQuantity} {prod.unit}
                      </td>
                      <td className="py-2.5 text-right text-slate-400 tabular-nums">
                        {prod.lowStockThreshold}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
            Fulfillment Breakdown
          </h3>
          <div className="space-y-3">
            {statusDistribution.map((item: any) => (
              <div key={item.status} className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-600">{item.status.replace(/_/g, ' ')}</span>
                <span className="font-bold text-slate-900 tabular-nums bg-slate-100 px-2 py-0.5 rounded">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Recent Customer Orders</h3>
          <button
            onClick={() => onNavigateToTab('orders')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>View All Orders</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                <th className="pb-2">Order #</th>
                <th className="pb-2">Customer</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Payment Method</th>
                <th className="pb-2 text-right">Items</th>
                <th className="pb-2 text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentOrders.map((ord: any) => (
                <tr key={ord.id} className="hover:bg-slate-50">
                  <td className="py-3 font-mono font-bold text-emerald-800">{ord.orderNumber}</td>
                  <td className="py-3 font-medium text-slate-900">{ord.user?.name}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-slate-100 text-slate-800 border border-slate-200">
                      {ord.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 text-slate-500">
                    {ord.paymentMethod === 'CASH_ON_DELIVERY' ? 'Cash on Delivery' : 'Mock Payment'}
                  </td>
                  <td className="py-3 text-right tabular-nums text-slate-600">{ord._count.items}</td>
                  <td className="py-3 text-right font-bold text-slate-900 tabular-nums">
                    ${ord.totalAmount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
