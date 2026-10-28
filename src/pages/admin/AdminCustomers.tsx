import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.ts';
import { Users, Search, ShoppingCart, DollarSign, Calendar } from 'lucide-react';

export const AdminCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let isMounted = true;
    api.getAdminCustomers()
      .then((res) => {
        if (isMounted) setCustomers(res.customers || []);
      })
      .catch((err) => {
        console.error('Error fetching customers:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-display">Registered Customer Directory</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review customer purchase statistics, order frequencies, and delivery profiles
        </p>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-emerald-600"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4">Primary Address</th>
                <th className="py-3 px-4 text-center">Orders Placed</th>
                <th className="py-3 px-4 text-right">Lifetime Spend</th>
                <th className="py-3 px-4 text-right">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Loading customer directory...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No customers found.
                  </td>
                </tr>
              ) : (
                filtered.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900 block">{cust.name}</span>
                      <span className="text-[11px] text-slate-500">{cust.email}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono">
                      {cust.phone || '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                      {cust.address || '—'}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-900 tabular-nums">
                      {cust.orderCount}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-800 tabular-nums">
                      ${cust.totalSpent.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500">
                      {new Date(cust.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
