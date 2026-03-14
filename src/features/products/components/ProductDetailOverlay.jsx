import { useEffect, useState } from "react";
import { X, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import AddToCartButton from "./AddToCartButton";

const ProductDetailOverlay = ({ product, onClose }) => {
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = () => {
    setClosing(true);
    setTimeout(onClose, 280);
  };

  const cheapestConfig = product.priceConfigs?.reduce(
    (min, c) => (c.price < min.price ? c : min),
    product.priceConfigs[0],
  );

  const headlineSavings =
    cheapestConfig?.mrp > cheapestConfig?.price
      ? cheapestConfig.mrp - cheapestConfig.price
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-280 ${closing ? "opacity-0" : "opacity-100"}`}
        onClick={handleClose}
      />

      {/* Panel */}
      <div
        className={`relative bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden ${
          closing ? "animate-slide-up-out" : "animate-slide-up"
        }`}
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 shrink-0 sm:hidden">
          <div className="w-10 h-1 bg-slate-300 rounded-full" />
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 shadow-md hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5 text-slate-600" />
        </button>

        {/* Image */}
        <div className="relative aspect-4/3 shrink-0 overflow-hidden bg-slate-100">
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

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 px-5 py-4">
          {/* Name + veg badge */}
          <div className="flex items-start justify-between gap-3 mb-1">
            <h2 className="text-xl font-bold text-slate-800 leading-tight">
              {product.name}
            </h2>
            {product.isVeg !== undefined && (
              <span className="shrink-0 mt-0.5">
                {product.isVeg ? (
                  <span className="w-5 h-5 border-2 border-green-600 flex items-center justify-center rounded-sm">
                    <span className="w-2.5 h-2.5 bg-green-600 rounded-full" />
                  </span>
                ) : (
                  <span className="w-5 h-5 border-2 border-red-600 flex items-center justify-center rounded-sm">
                    <span className="w-2.5 h-2.5 bg-red-600 rounded-full" />
                  </span>
                )}
              </span>
            )}
          </div>

          {/* Category + "full page" link */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full capitalize">
              {product.category}
            </span>
            <Link
              to={`/products/${product._id}`}
              onClick={handleClose}
              className="flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
            >
              Full details
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

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
                    ₹{headlineSavings} OFF
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
            <div className="flex flex-wrap gap-1.5 mb-4">
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

          {/* Price configs */}
          <div className="border-t border-slate-100 pt-4">
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
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50"
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
  );
};

export default ProductDetailOverlay;
