import React, { useState } from 'react';
import { Product } from '../../types/index.ts';
import { useCart } from '../../context/CartContext.tsx';
import { ShoppingBag, Eye, Package } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelectProduct?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelectProduct }) => {
  const { addToCart } = useCart();
  const [imageError, setImageError] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const activePrice = product.promotionalPrice ?? product.price;
  const hasDiscount = product.promotionalPrice && product.promotionalPrice < product.price;
  const isOutOfStock = product.stockQuantity <= 0;
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= product.lowStockThreshold;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock || isAdding) return;
    setIsAdding(true);
    await addToCart(product, 1);
    setIsAdding(false);
  };

  return (
    <div
      onClick={() => onSelectProduct && onSelectProduct(product)}
      className="group relative flex flex-col bg-white rounded-xl border border-slate-200/90 overflow-hidden hover:border-slate-300 hover:shadow-md transition-all duration-200 cursor-pointer"
    >
      {/* Product Image Stage (65-70% height) */}
      <div className="relative aspect-[4/3] w-full bg-slate-50 overflow-hidden">
        {!imageError ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-4">
            <Package className="w-10 h-10 mb-2 stroke-1" />
            <span className="text-xs text-slate-500 font-medium text-center">{product.name}</span>
          </div>
        )}

        {/* Quiet Discount / Stock Marker (No pill badge spam) */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
          {hasDiscount && (
            <span className="bg-amber-500 text-white text-[11px] font-semibold px-2 py-0.5 rounded shadow-sm">
              SAVE ${(product.price - product.promotionalPrice!).toFixed(2)}
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-slate-900/90 text-white text-[11px] font-medium px-2 py-0.5 rounded backdrop-blur-xs">
              Out of stock
            </span>
          )}
          {isLowStock && !isOutOfStock && (
            <span className="bg-amber-100 text-amber-800 text-[11px] font-medium px-2 py-0.5 rounded border border-amber-200">
              Only {product.stockQuantity} left
            </span>
          )}
        </div>

        {/* Quick View Overlay Button */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            type="button"
            className="px-3 py-1.5 bg-white text-slate-900 rounded-lg text-xs font-semibold shadow-md flex items-center gap-1.5 hover:bg-slate-50 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Content Info */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Unboxed Metadata with Typographic Middot Separators */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <span className="font-medium text-emerald-700">{product.category?.name || 'Fresh Grocery'}</span>
            <span aria-hidden="true">·</span>
            <span>{product.unit}</span>
          </div>

          <h3 className="text-sm font-semibold text-slate-900 line-clamp-1 group-hover:text-emerald-700 transition-colors">
            {product.name}
          </h3>

          <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Action Row */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-slate-900 tabular-nums">
              ${activePrice.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-slate-400 line-through tabular-nums">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAdding}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95'
            }`}
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{isAdding ? 'Adding...' : isOutOfStock ? 'Sold Out' : 'Add'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
