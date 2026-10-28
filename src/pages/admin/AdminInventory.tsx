import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.ts';
import { Product } from '../../types/index.ts';
import { Boxes, PlusCircle, AlertTriangle, CheckCircle2, History, X, AlertCircle } from 'lucide-react';

export const AdminInventory: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Adjustment Modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [changeQuantity, setChangeQuantity] = useState('10');
  const [reason, setReason] = useState('Supplier shipment received');
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadInventory = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAdminInventory();
      setProducts(res.products || []);
    } catch (err) {
      console.error('Error loading inventory:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const openAdjustmentModal = (prod: Product) => {
    setSelectedProduct(prod);
    setChangeQuantity('10');
    setReason('Supplier shipment restock');
    setModalError(null);
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setModalError(null);
    setIsSubmitting(true);

    try {
      const qtyChange = parseInt(changeQuantity, 10);
      if (isNaN(qtyChange) || qtyChange === 0) {
        throw new Error('Please enter a non-zero adjustment quantity.');
      }

      await api.createInventoryAdjustment({
        productId: selectedProduct.id,
        changeQuantity: qtyChange,
        reason,
      });

      setSelectedProduct(null);
      loadInventory();
    } catch (err: any) {
      setModalError(err.message || 'Failed to adjust inventory');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-display">Inventory & Stock Audit</h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor real-time warehouse shelves, trigger restocking, and audit movement logs
        </p>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4 text-right">Available Stock</th>
                <th className="py-3 px-4 text-center">Stock Health</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Loading inventory records...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((prod) => {
                  const isLow = prod.stockQuantity <= prod.lowStockThreshold;
                  const isOut = prod.stockQuantity <= 0;

                  return (
                    <tr key={prod.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-900 block">{prod.name}</span>
                        <span className="text-[11px] text-slate-400">{prod.unit}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500">{prod.sku}</td>
                      <td className="py-3 px-4 text-slate-600">{prod.category?.name}</td>
                      <td className="py-3 px-4 text-right font-bold tabular-nums">
                        <span className={isOut ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-slate-900'}>
                          {prod.stockQuantity}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isOut ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Out of Stock</span>
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Low ({prod.stockQuantity} / {prod.lowStockThreshold})</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Optimal</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => openAdjustmentModal(prod)}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 ml-auto transition-colors"
                        >
                          <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Adjust Stock</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setSelectedProduct(null)} />

          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 z-10 border border-slate-200 space-y-4">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-xs font-mono text-emerald-700 font-semibold">{selectedProduct.sku}</span>
              <h3 className="text-lg font-bold text-slate-900 font-display">
                Adjust Inventory: {selectedProduct.name}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Current warehouse stock: <strong className="font-bold text-slate-900 tabular-nums">{selectedProduct.stockQuantity} {selectedProduct.unit}</strong>
              </p>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Quantity Change (+ to restock, - to write off)
                </label>
                <input
                  type="number"
                  required
                  value={changeQuantity}
                  onChange={(e) => setChangeQuantity(e.target.value)}
                  placeholder="e.g. 25 or -5"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-bold text-slate-900 tabular-nums focus:outline-emerald-600"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Resulting Stock: <strong className="tabular-nums">{selectedProduct.stockQuantity + (parseInt(changeQuantity, 10) || 0)}</strong>
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Audit Reason *
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-emerald-600 mb-2"
                >
                  <option value="Supplier shipment received">Supplier shipment received</option>
                  <option value="Damaged or expired inventory write-off">Damaged or expired inventory write-off</option>
                  <option value="Physical shelf audit reconciliation">Physical shelf audit reconciliation</option>
                  <option value="Customer return restocked">Customer return restocked</option>
                  <option value="Special seasonal promotional allocation">Special seasonal promotional allocation</option>
                </select>
                <input
                  type="text"
                  placeholder="Or custom detailed audit notes..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg text-slate-700 focus:outline-emerald-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Recording...' : 'Commit Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
