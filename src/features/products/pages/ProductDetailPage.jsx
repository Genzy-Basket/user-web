import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useProducts } from "../hooks/useProducts";
import AddToCartButton from "../components/AddToCartButton";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, getProductById } = useProducts();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Try from already-loaded list first (instant)
    const cached = products.find((p) => p._id === id);
    if (cached) {
      setProduct(cached);
      setLoading(false);
      return;
    }

    // Otherwise fetch from API — getProductById is stable (useCallback)
    let cancelled = false;
    setLoading(true);
    getProductById(id).then((data) => {
      if (cancelled) return;
      if (data) {
        setProduct(data);
      } else {
        setError("Product not found.");
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, products]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-brand rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium">Loading product…</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-600 px-4">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <span className="text-4xl">⚠️</span>
        </div>
        <p className="text-xl font-semibold mb-2">Product not found</p>
        <p className="text-slate-500 mb-6 text-sm">{error}</p>
        <Link
          to="/products"
          className="px-6 py-3 bg-brand text-white rounded-xl font-semibold hover:opacity-90 transition-all shadow-md"
        >
          Back to Products
        </Link>
      </div>
    );
  }

  const cheapestConfig = product.priceConfigs?.reduce(
    (min, c) => (c.price < min.price ? c : min),
    product.priceConfigs[0],
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Back bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl hover:bg-slate-100 transition-colors -ml-1"
        >
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </button>
        <h1 className="font-bold text-slate-800 text-base truncate">{product.name}</h1>
      </div>

      <div className="max-w-2xl mx-auto px-0 sm:px-4 py-0 sm:py-6">
        <div className="bg-white sm:rounded-2xl overflow-hidden shadow-sm">
          {/* Hero image */}
          <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {!product.available && (
              <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center">
                <span className="bg-white text-slate-700 text-sm font-bold px-4 py-2 rounded-full shadow-lg">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          {/* Info section */}
          <div className="px-5 pt-5 pb-6">
            {/* Category + veg row */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full capitalize">
                {product.category}
              </span>
              {product.isVeg !== undefined && (
                product.isVeg ? (
                  <span className="w-5 h-5 border-2 border-green-600 flex items-center justify-center rounded-sm">
                    <span className="w-2.5 h-2.5 bg-green-600 rounded-full" />
                  </span>
                ) : (
                  <span className="w-5 h-5 border-2 border-red-600 flex items-center justify-center rounded-sm">
                    <span className="w-2.5 h-2.5 bg-red-600 rounded-full" />
                  </span>
                )
              )}
            </div>

            {/* Name */}
            <h2 className="text-2xl font-extrabold text-slate-800 mb-2 leading-tight">
              {product.name}
            </h2>

            {/* Price headline */}
            {cheapestConfig && (
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-2xl font-extrabold text-brand">
                  ₹{cheapestConfig.price}
                </span>
                {cheapestConfig.mrp > cheapestConfig.price && (
                  <>
                    <span className="text-slate-400 line-through text-sm">
                      ₹{cheapestConfig.mrp}
                    </span>
                    <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                      ₹{cheapestConfig.mrp - cheapestConfig.price} OFF
                    </span>
                  </>
                )}
                {product.priceConfigs?.length > 1 && (
                  <span className="text-xs text-slate-400">onwards</span>
                )}
              </div>
            )}

            {/* Description */}
            {product.description && (
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                {product.description}
              </p>
            )}

            {/* Keywords */}
            {product.keywords?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-5">
                {product.keywords.map((kw) => (
                  <span
                    key={kw}
                    className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-slate-100 pt-5">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                {product.priceConfigs?.length > 1 ? "Available options" : "Quantity"}
              </p>

              <div className="space-y-3">
                {product.priceConfigs?.map((config) => {
                  const savings =
                    config.mrp > config.price ? config.mrp - config.price : 0;

                  return (
                    <div
                      key={config._id}
                      className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-slate-800">
                            {config.displayLabel}
                          </span>
                          {savings > 0 && (
                            <span className="text-xs font-medium text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-full">
                              ₹{savings} OFF
                            </span>
                          )}
                        </div>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                          <span className="text-base font-bold text-brand">
                            ₹{config.price}
                          </span>
                          {config.mrp > config.price && (
                            <span className="text-xs text-slate-400 line-through">
                              ₹{config.mrp}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 w-32">
                        <AddToCartButton
                          config={config}
                          product={product}
                          compact={true}
                          disabled={!product.available}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
