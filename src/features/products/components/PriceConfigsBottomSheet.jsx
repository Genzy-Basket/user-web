import { useEffect } from "react";
import { X } from "lucide-react";
import AddToCartButton from "./AddToCartButton";

const PriceConfigsBottomSheet = ({ product, onClose }) => {
  // Lock body scroll while sheet is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Sheet */}
      <div
        className="relative bg-white w-full max-w-lg rounded-t-3xl animate-slide-up shadow-2xl max-h-[80vh] flex flex-col"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 bg-slate-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 shrink-0">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-14 h-14 rounded-xl object-cover shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-800 text-base line-clamp-1">
              {product.name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Choose quantity</p>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl hover:bg-slate-100 transition-colors shrink-0"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Config rows */}
        <div className="overflow-y-auto px-4 py-2 flex-1">
          {product.priceConfigs.map((config) => {
            const discount =
              config.mrp > config.price
                ? ((config.mrp - config.price) / config.mrp) * 100
                : 0;

            return (
              <div
                key={config._id}
                className="flex items-center gap-3 py-4 border-b border-slate-100 last:border-0"
              >
                {/* Label + price */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-slate-800">
                      {config.displayLabel}
                    </span>
                    {discount > 0 && (
                      <span className="text-xs font-medium text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-full">
                        {discount.toFixed(0)}% OFF
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

                {/* Add / qty ctrl */}
                <div className="shrink-0 w-32">
                  <AddToCartButton
                    config={config}
                    product={product}
                    compact={true}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PriceConfigsBottomSheet;
