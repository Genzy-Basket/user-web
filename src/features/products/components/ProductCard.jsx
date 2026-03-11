import { useState, memo } from "react";
import AddToCartButton from "./AddToCartButton";
import PriceConfigsBottomSheet from "./PriceConfigsBottomSheet";
import ProductDetailOverlay from "./ProductDetailOverlay";

// activeConfig — when a specific config for this product is in cart,
//   the parent renders one card per in-cart config with activeConfig set.
// No activeConfig — none of this product's configs are in cart; show Add.
const ProductCard = ({ product, activeConfig }) => {
  const [showSheet, setShowSheet] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const isMultiConfig = product.priceConfigs?.length > 1;
  const isAvailable = product.available !== false;

  // For display: use activeConfig's price, or fall back to the cheapest config
  const displayConfig =
    activeConfig ??
    product.priceConfigs?.reduce(
      (min, c) => (c.price < min.price ? c : min),
      product.priceConfigs[0],
    );

  const savingsAmount =
    displayConfig?.mrp > displayConfig?.price
      ? displayConfig.mrp - displayConfig.price
      : 0;

  const openDetail = () => setShowDetail(true);

  // Multi-config "Add" button: open bottom sheet, not detail overlay
  const openSheet = (e) => {
    e.stopPropagation();
    if (!isAvailable) return;
    setShowSheet(true);
  };

  return (
    <>
      <div
        className={`bg-white rounded-xl border-2 border-slate-200 overflow-hidden hover:shadow-xl transition-all ${
          !isAvailable ? "opacity-60 grayscale" : ""
        }`}
      >
        {/* Image — click opens detail */}
        <div
          className="relative aspect-4/3 overflow-hidden cursor-pointer group/img"
          onClick={openDetail}
        >
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-105"
            loading="lazy"
          />

          {savingsAmount > 0 && isAvailable && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
              ₹{savingsAmount} OFF
            </div>
          )}

          {/* Out of stock pill */}
          {!isAvailable && (
            <div className="absolute inset-0 flex items-end justify-center pb-3">
              <span className="bg-white/95 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                Out of Stock
              </span>
            </div>
          )}

          {/* Detail hint on hover */}
          {isAvailable && (
            <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors flex items-center justify-center">
              <span className="opacity-0 group-hover/img:opacity-100 transition-opacity bg-white/90 text-slate-700 text-[10px] font-semibold px-2.5 py-1 rounded-full shadow">
                View details
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          {/* Badge row: always show category; if activeConfig also show the config label */}
          <div className="flex items-center justify-between gap-1 mb-1">
            <div className="flex items-center gap-1 min-w-0">
              {/* <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded capitalize truncate">
                {product.category}
              </span> */}
              {activeConfig && (
                <span className="text-xs font-bold text-brand bg-brand/10 px-2 py-0.5 rounded truncate">
                  {activeConfig.displayLabel}
                </span>
              )}
            </div>
            {product.isVeg && (
              <span className="shrink-0 w-3.5 h-3.5 border border-green-600 flex items-center justify-center rounded-sm">
                <span className="w-2 h-2 bg-green-600 rounded-full" />
              </span>
            )}
          </div>

          {/* Name — click opens detail */}
          <h3
            className="font-bold text-slate-800 text-sm mb-1 line-clamp-2 cursor-pointer hover:text-brand transition-colors"
            onClick={openDetail}
          >
            {product.name}
          </h3>

          <div className="flex items-center gap-2 mb-3">
            {!activeConfig && isMultiConfig && (
              <span className="text-xs text-slate-400">from</span>
            )}
            <span className="text-brand-dark font-bold">
              ₹{displayConfig?.price}
            </span>
            {displayConfig?.mrp > displayConfig?.price && (
              <span className="text-slate-400 line-through text-xs">
                ₹{displayConfig.mrp}
              </span>
            )}
          </div>

          {/* ── Button area ─────────────────────────────────────────── */}

          {/* activeConfig in cart → show qty ctrl directly */}
          {activeConfig && (
            <AddToCartButton config={activeConfig} product={product} />
          )}

          {/* No activeConfig, single config → direct add/qty ctrl */}
          {!activeConfig && !isMultiConfig && (
            <AddToCartButton
              config={product.priceConfigs[0]}
              product={product}
              disabled={!isAvailable}
            />
          )}

          {/* No activeConfig, multi config → "Add" opens bottom sheet */}
          {!activeConfig && isMultiConfig && (
            <button
              onClick={openSheet}
              disabled={!isAvailable}
              className="w-full h-8 sm:h-9 text-xs sm:text-sm flex items-center justify-center bg-brand text-white font-bold rounded-xl transition-all active:scale-95 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
          )}
        </div>
      </div>

      {/* Bottom sheet — for choosing a config to add */}
      {showSheet && (
        <PriceConfigsBottomSheet
          product={product}
          onClose={() => setShowSheet(false)}
        />
      )}

      {/* Detail overlay — image/name click; does NOT open alongside sheet */}
      {showDetail && !showSheet && (
        <ProductDetailOverlay
          product={product}
          onClose={() => setShowDetail(false)}
        />
      )}
    </>
  );
};

export default memo(ProductCard);
