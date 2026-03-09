import { X } from "lucide-react";
import React from "react";

const PriceConfigsModal = (product, setShowConfigModal) => {
  //   console.log(product);
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setShowConfigModal(false)}
      />

      <div className="relative bg-white w-full sm:max-w-2xl max-h-[85vh] sm:max-h-[90vh] overflow-hidden sm:rounded-2xl rounded-t-3xl animate-slide-up shadow-2xl">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b-2 border-slate-200 p-4 sm:p-6 flex items-start justify-between z-10">
          <div className="flex gap-3 sm:gap-4 flex-1">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover shrink-0"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-linear-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-3xl sm:text-4xl shrink-0">
                🥬
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-1 line-clamp-2">
                {product.name}
              </h3>
              <p className="text-sm text-slate-600">Choose size</p>
            </div>
          </div>
          <button
            onClick={() => setShowConfigModal(false)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors shrink-0 ml-2"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600" />
          </button>
        </div>

        {/* Config Options */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(85vh-100px)] sm:max-h-[calc(90vh-120px)]">
          <div className="space-y-3">
            {product.priceConfigs.map((config) => {
              const configDiscount =
                config.mrp > config.price
                  ? ((config.mrp - config.price) / config.mrp) * 100
                  : 0;

              return (
                <div
                  key={config._id}
                  className={`bg-slate-50 rounded-xl p-3 sm:p-4 border-2 transition-all ${"border-brand bg-brand-50/50"}`}
                >
                  <div className="flex items-start justify-between gap-3 sm:gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
                        <span className="text-base sm:text-lg font-bold text-slate-800">
                          {config.value} {config.unit}
                        </span>
                        {configDiscount > 0 && (
                          <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                            {configDiscount.toFixed(0)}% OFF
                          </span>
                        )}
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg sm:text-xl font-bold text-brand">
                          ₹{config.price.toFixed(2)}
                        </span>
                        {config.mrp > config.price && (
                          <span className="text-xs sm:text-sm text-slate-400 line-through">
                            ₹{config.mrp.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <AddToCartButton
                    config={config}
                    productId={product._id}
                    disabled={!product.available}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t-2 border-slate-200 p-4 sm:p-6">
          <button
            onClick={() => setShowConfigModal(false)}
            className="w-full py-3 px-4 bg-linear-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PriceConfigsModal;
