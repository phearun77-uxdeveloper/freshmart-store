import React, { useEffect, useState } from 'react';
import { Product } from '../types/index.ts';
import { api } from '../services/api.ts';
import { ProductCard } from '../components/common/ProductCard.tsx';
import { Sparkles, ArrowLeft, Tag } from 'lucide-react';

interface DealsPageProps {
  onBackToCatalog: () => void;
  onSelectProduct: (product: Product) => void;
}

export const DealsPage: React.FC<DealsPageProps> = ({ onBackToCatalog, onSelectProduct }) => {
  const [dealProducts, setDealProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    api.getProducts({ limit: 50 })
      .then((res) => {
        if (isMounted) {
          const prods: Product[] = res.products || [];
          // Filter to items with active promotional price
          const discounted = prods.filter(
            (p) => p.promotionalPrice && p.promotionalPrice < p.price
          );
          setDealProducts(discounted);
        }
      })
      .catch((err) => {
        console.error('Error fetching deals:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  return (
    <div className="space-y-8">
      {/* Deals Header Banner */}
      <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-3xl p-8 sm:p-10 shadow-lg relative overflow-hidden">
        <div className="relative max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/80 rounded-full text-xs font-bold text-amber-100">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>Weekly Farm Specials</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display">
            Fresh Harvest Discounts & Supermarket Specials
          </h1>
          <p className="text-xs sm:text-sm text-amber-100 leading-relaxed">
            Save on seasonal fruits, pasture dairy, wild Alaskan seafood, and pantry essentials. Discounts applied directly at checkout.
          </p>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-72 rounded-xl bg-slate-200 animate-pulse" />
          ))}
        </div>
      ) : dealProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
          <Tag className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No active discounts today</h3>
          <p className="text-xs text-slate-500">Check back tomorrow morning for new farm-direct deals.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {dealProducts.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onSelectProduct={onSelectProduct}
            />
          ))}
        </div>
      )}
    </div>
  );
};
