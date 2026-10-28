import React, { useEffect, useState, useCallback } from 'react';
import { Product, Category } from '../types/index.ts';
import { api } from '../services/api.ts';
import { ProductCard } from '../components/common/ProductCard.tsx';
import { Search, Filter, RotateCcw, ChevronLeft, ChevronRight, PackageOpen } from 'lucide-react';

interface CatalogPageProps {
  initialCategory?: string;
  initialSearch?: string;
  onSelectProduct: (product: Product) => void;
}

export const CatalogPage: React.FC<CatalogPageProps> = ({
  initialCategory,
  initialSearch = '',
  onSelectProduct,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'ALL');
  const [maxPrice, setMaxPrice] = useState<number>(25);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Sync initialCategory or initialSearch if changed from parent
  useEffect(() => {
    if (initialCategory) setSelectedCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    if (initialSearch !== undefined) setSearch(initialSearch);
  }, [initialSearch]);

  // Load Categories once
  useEffect(() => {
    api.getCategories().then((res) => setCategories(res.categories || [])).catch(() => {});
  }, []);

  // Fetch Products with current query parameters
  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page,
        limit: 12,
        sort,
      };

      if (search.trim()) params.q = search.trim();
      if (selectedCategory && selectedCategory !== 'ALL') params.category = selectedCategory;
      if (maxPrice < 25) params.maxPrice = maxPrice;
      if (inStockOnly) params.inStock = 'true';

      const data = await api.getProducts(params);
      setProducts(data.products || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalCount(data.pagination?.total || 0);
    } catch (err) {
      console.error('Error fetching catalog products:', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, sort, search, selectedCategory, maxPrice, inStockOnly]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('ALL');
    setMaxPrice(25);
    setInStockOnly(false);
    setSort('newest');
    setPage(1);
  };

  return (
    <div className="space-y-8">
      {/* Page Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">Supermarket Catalog</h1>
          <p className="text-xs text-slate-500 mt-1">
            Showing <strong className="font-semibold text-slate-900 tabular-nums">{totalCount}</strong> farm-fresh items
          </p>
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-3">
          <label htmlFor="sort-select" className="text-xs font-semibold text-slate-600 whitespace-nowrap">
            Sort by:
          </label>
          <select
            id="sort-select"
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            className="text-xs bg-white border border-slate-300 rounded-lg px-3 py-1.5 font-medium text-slate-800 focus:outline-emerald-600"
          >
            <option value="newest">Newest Arrivals</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Name: A to Z</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <aside className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                <Filter className="w-3.5 h-3.5 text-emerald-600" />
                Filters
              </span>
              <button
                type="button"
                onClick={resetFilters}
                className="text-[11px] font-semibold text-slate-500 hover:text-emerald-700 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Keyword Search */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Search Products</label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. Apples, Milk, Salmon..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-emerald-600"
                />
              </div>
            </div>

            {/* Department / Category Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Department</label>
              <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                <button
                  type="button"
                  onClick={() => { setSelectedCategory('ALL'); setPage(1); }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                    selectedCategory === 'ALL'
                      ? 'bg-emerald-50 text-emerald-800 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>All Departments</span>
                  <span className="text-[10px] text-slate-400 tabular-nums">
                    {categories.reduce((acc, c) => acc + (c._count?.products || 0), 0)}
                  </span>
                </button>

                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => { setSelectedCategory(cat.slug); setPage(1); }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                      selectedCategory === cat.slug
                        ? 'bg-emerald-50 text-emerald-800 font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate">{cat.name}</span>
                    <span className="text-[10px] text-slate-400 tabular-nums">
                      {cat._count?.products || 0}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Max Price Range Slider */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-2">
                <span>Max Price</span>
                <span className="text-emerald-700 font-bold tabular-nums">${maxPrice}</span>
              </div>
              <input
                type="range"
                min="2"
                max="25"
                step="1"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(Number(e.target.value));
                  setPage(1);
                }}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>$2</span>
                <span>$25+</span>
              </div>
            </div>

            {/* In-Stock Toggle */}
            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 select-none">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => {
                    setInStockOnly(e.target.checked);
                    setPage(1);
                  }}
                  className="w-4 h-4 rounded text-emerald-600 accent-emerald-600"
                />
                <span>In-Stock Only</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="lg:col-span-3 space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-80 rounded-xl bg-slate-200 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <PackageOpen className="w-8 h-8 stroke-1" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">No groceries found</h3>
              <p className="text-xs text-slate-500 max-w-sm mb-4">
                No products matched your current filters. Try adjusting your keyword, category, or price range.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {products.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    onSelectProduct={onSelectProduct}
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-8 border-t border-slate-200">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="p-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <span className="text-xs font-semibold text-slate-700 px-3 tabular-nums">
                    Page {page} of {totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="p-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};
