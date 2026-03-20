import { Package, Plus, Minus, Check } from "lucide-react";

const ProductSelector = ({ product, selectedConfigs = {}, onConfigToggle, onQuantityChange }) => {
  if (!product) return null;

  const selectedConfigIds = Object.keys(selectedConfigs);
  const isSelected = selectedConfigIds.length > 0;

  return (
    <div className={`bg-white rounded-2xl border-2 p-5 transition-all duration-200 ${
      isSelected
        ? "border-brand/30 shadow-[0_4px_12px_rgba(9,158,14,0.08)]"
        : "border-slate-200 hover:shadow-md"
    }`}>
      {/* Product header */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-50 shrink-0 border border-slate-100">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-emerald-50">
              <Package className="w-6 h-6 text-brand" />
            </div>
          )}
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-lg">{product.name}</h3>
          <p className="text-xs text-slate-500 capitalize">{product.category}</p>
        </div>
      </div>

      {/* Price config chips */}
      <div className="flex flex-wrap gap-2">
        {product.priceConfigs.map((config) => {
          const configId = config._id || config.id;
          const isSelected = configId in selectedConfigs;

          return (
            <button
              key={configId}
              type="button"
              onClick={() => onConfigToggle(product._id, configId)}
              className={`relative px-4 py-3 rounded-xl border-2 text-left transition-all duration-150 min-w-[100px]
                ${
                  isSelected
                    ? "border-brand bg-brand text-white shadow-md ring-2 ring-brand/20"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                }
              `}
            >
              {isSelected && (
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <Check className="w-3 h-3 text-brand" />
                </div>
              )}
              <span className={`block text-sm font-bold ${isSelected ? "text-white" : "text-slate-800"}`}>
                {config.displayLabel || `${config.value} ${config.unit}`}
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`text-sm font-black ${isSelected ? "text-white" : "text-brand"}`}>₹{config.price}</span>
                {config.mrp > config.price && (
                  <span className={`text-[10px] line-through ${isSelected ? "text-white/60" : "text-slate-400"}`}>₹{config.mrp}</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Quantity steppers — one row per selected config */}
      {isSelected && (
        <div className="pt-4 mt-4 border-t border-slate-100 space-y-3">
          {product.priceConfigs
            .filter((config) => {
              const configId = config._id || config.id;
              return configId in selectedConfigs;
            })
            .map((config) => {
              const configId = config._id || config.id;
              const qty = selectedConfigs[configId] || 1;
              const lineTotal = config.price * qty;

              return (
                <div key={configId} className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-slate-600 font-medium block">
                      {config.displayLabel || `${config.value} ${config.unit}`}
                    </span>
                    <span className="text-xs text-slate-400">₹{lineTotal}/day</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onQuantityChange(product._id, configId, qty - 1)}
                      disabled={qty <= 1}
                      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center disabled:opacity-30 transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5 text-slate-700" />
                    </button>
                    <span className="w-10 text-center font-bold text-slate-800 text-lg">{qty}</span>
                    <button
                      type="button"
                      onClick={() => onQuantityChange(product._id, configId, qty + 1)}
                      disabled={qty >= 10}
                      className="w-8 h-8 rounded-lg bg-brand text-white hover:bg-emerald-700 flex items-center justify-center disabled:opacity-30 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default ProductSelector;
