import React, { useEffect, useState } from 'react';
import { Category, Product } from '../types/index.ts';
import { api } from '../services/api.ts';
import { ProductCard } from '../components/common/ProductCard.tsx';
import { ArrowRight, Leaf, Sparkles, Check, ChevronRight } from 'lucide-react';

interface HomePageProps {
  onNavigate: (view: string, param?: any) => void;
  onSelectProduct: (product: Product) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onSelectProduct }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadHomeData() {
      try {
        const [catsRes, prodsRes] = await Promise.all([
          api.getCategories(),
          api.getProducts({ isFeatured: true, limit: 8 }),
        ]);

        if (isMounted) {
          setCategories(catsRes.categories || []);
          setFeaturedProducts(prodsRes.products || []);
        }
      } catch (err) {
        console.error('Error loading homepage data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadHomeData();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="space-y-16">
      {/* Editorial Storefront Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-emerald-900 text-white shadow-xl">
        <div className="absolute inset-0 bg-radial from-emerald-800/80 via-emerald-950 to-slate-950 opacity-90" />
        <div className="relative max-w-7xl mx-auto px-6 py-16 sm:py-24 lg:py-28 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 border border-emerald-700/60 text-xs font-semibold text-emerald-300">
              <Leaf className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Organically & Locally Sourced</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-display text-white text-balance leading-tight">
              Farm-fresh harvest, delivered to your doorstep.
            </h1>

            <p className="text-sm sm:text-base text-emerald-100 max-w-xl leading-relaxed">
              Experience the highest quality heirloom fruits, crisp greens, pasture-raised dairy, and artisan bakery essentials—picked at dawn and delivered fresh today.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => onNavigate('catalog')}
                className="px-6 py-3.5 bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg transition-transform hover:-translate-y-0.5"
              >
                <span>Shop Fresh Catalog</span>
                <ArrowRight className="w-4 h-4 text-emerald-700" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('deals')}
                className="px-6 py-3.5 bg-emerald-800/80 hover:bg-emerald-700 text-white border border-emerald-600/50 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>View Weekly Specials</span>
              </button>
            </div>

            {/* Micro proof points */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-emerald-800/60 text-xs text-emerald-200">
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero Pesticides</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Same-Day Cold Chain</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Cash on Delivery</span>
              </div>
            </div>
          </div>

          {/* Visual Showcase Card */}
          <div className="relative">
            <div className="relative mx-auto max-w-md lg:max-w-none rounded-2xl overflow-hidden shadow-2xl border border-emerald-700/50">
              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1000&q=80"
                alt="Farm Fresh Produce Assortment"
                referrerPolicy="no-referrer"
                className="w-full h-80 lg:h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-transparent flex items-end p-6">
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider text-emerald-300">
                    Hand-Selected Morning Pick
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">
                    Organic Honeycrisp & Vine Tomatoes in Stock
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Category / Department */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-display">Shop by Department</h2>
            <p className="text-xs text-slate-500 mt-1">Explore our 8 curated supermarket sections</p>
          </div>
          <button
            onClick={() => onNavigate('catalog')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>All Departments</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onNavigate('catalog', { category: cat.slug })}
              className="group flex flex-col items-center text-center p-3 rounded-xl bg-white border border-slate-200/90 hover:border-emerald-600 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-100 mb-2 border border-slate-100 group-hover:scale-105 transition-transform">
                <img
                  src={cat.imageUrl || ''}
                  alt={cat.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs font-semibold text-slate-800 group-hover:text-emerald-700 line-clamp-1">
                {cat.name}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 tabular-nums">
                {cat._count?.products || 0} items
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Farm Products Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-display">Featured Fresh Harvest</h2>
            <p className="text-xs text-slate-500 mt-1">Hand-picked organic favorites available today</p>
          </div>
          <button
            onClick={() => onNavigate('catalog', { isFeatured: true })}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>Browse All ({featuredProducts.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-72 rounded-xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onSelectProduct={onSelectProduct}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
