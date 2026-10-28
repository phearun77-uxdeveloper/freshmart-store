import React, { useEffect, useState } from 'react';
import { Product } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useCart } from '../context/CartContext.tsx';
import { ProductCard } from '../components/common/ProductCard.tsx';
import { ShoppingBag, ArrowLeft, Check, AlertCircle, Plus, Minus, Package, Truck, ShieldCheck } from 'lucide-react';

interface ProductDetailPageProps {
  productSlug: string;
  onBack: () => void;
  onSelectProduct: (product: Product) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  productSlug,
  onBack,
  onSelectProduct,
}) => {
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setQuantity(1);
    setImageError(false);

    api.getProductBySlug(productSlug)
      .then((res) => {
        if (isMounted) {
          setProduct(res.product);
          setRelated(res.relatedProducts || []);
        }
      })
      .catch((err) => {
        console.error('Error fetching product by slug:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => { isMounted = false; };
  }, [productSlug]);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-pulse">
          <div className="aspect-[4/3] bg-slate-200 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-6 w-32 bg-slate-200 rounded" />
            <div className="h-10 w-3/4 bg-slate-200 rounded" />
            <div className="h-24 bg-slate-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Product Not Found</h2>
        <p className="text-xs text-slate-500">The grocery item you requested is no longer available.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold"
        >
          Back to Catalog
        </button>
      </div>
    );
  }

  const activePrice = product.promotionalPrice ?? product.price;
  const hasDiscount = product.promotionalPrice && product.promotionalPrice < product.price;
  const isOutOfStock = product.stockQuantity <= 0;

  const handleAddToCart = async () => {
    if (isOutOfStock || isAdding) return;
    setIsAdding(true);
    await addToCart(product, quantity);
    setIsAdding(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Grocery Catalog</span>
      </button>

      {/* Contiguous Purchase Module */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
        {/* Left: Product Image Stage */}
        <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-200/80 relative">
          {!imageError ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-8">
              <Package className="w-16 h-16 mb-3 stroke-1" />
              <span className="text-sm font-medium">{product.name}</span>
            </div>
          )}

          {hasDiscount && (
            <span className="absolute top-4 left-4 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded shadow-sm">
              Save ${(product.price - product.promotionalPrice!).toFixed(2)}
            </span>
          )}
        </div>

        {/* Right: Contiguous Purchase Column */}
        <div className="space-y-6">
          <div>
            {/* Unboxed Metadata */}
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
              <span className="font-semibold text-emerald-700 uppercase tracking-wider">
                {product.category?.name}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-slate-400">SKU: {product.sku}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
              {product.name}
            </h1>

            {/* Price Row */}
            <div className="flex items-baseline gap-3 mt-3">
              <span className="text-3xl font-bold text-slate-900 tabular-nums">
                ${activePrice.toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-slate-400 line-through tabular-nums">
                  ${product.price.toFixed(2)}
                </span>
              )}
              <span className="text-xs text-slate-500 font-medium">
                {product.unit}
              </span>
            </div>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
            {product.description}
          </p>

          {/* Stock Status Indicator */}
          <div className="flex items-center gap-2 text-xs">
            {isOutOfStock ? (
              <span className="flex items-center gap-1.5 text-rose-600 font-semibold">
                <AlertCircle className="w-4 h-4" />
                <span>Currently out of stock</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <Check className="w-4 h-4" />
                <span>In Stock ({product.stockQuantity} available)</span>
              </span>
            )}
          </div>

          {/* Purchase Controls Row */}
          {!isOutOfStock && (
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-4">
              {/* Quantity Stepper Capped at Stock */}
              <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50 p-1">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="p-2 text-slate-600 hover:text-slate-900 disabled:opacity-40 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-sm font-bold tabular-nums text-slate-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
                  disabled={quantity >= product.stockQuantity}
                  className="p-2 text-slate-600 hover:text-slate-900 disabled:opacity-40 transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to Basket Action */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isAdding}
                className="flex-1 w-full py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isAdding ? 'Adding to Basket...' : `Add to Basket · $${(activePrice * quantity).toFixed(2)}`}</span>
              </button>
            </div>
          )}

          {/* Trust Highlights */}
          <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Same-day cold van delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>100% farm freshness guarantee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="space-y-6 pt-6">
          <h2 className="text-xl font-bold text-slate-900 font-display">
            You might also like in {product.category?.name}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((rel) => (
              <ProductCard
                key={rel.id}
                product={rel}
                onSelectProduct={onSelectProduct}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
