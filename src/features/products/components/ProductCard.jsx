import { useState } from "react";
import { useCart } from "../../cart/hooks/useCart";
import AddToCartButton from "./AddToCartButton";
import PriceConfigsBottomSheet from "./PriceConfigsBottomSheet";

// activeConfig — when a specific config for this product is in cart,
//   the parent renders one card per in-cart config with activeConfig set.
// No activeConfig — none of this product's configs are in cart; show Add.
const ProductCard = ({ product, activeConfig }) => {
  const { cart } = useCart();
  const [showSheet, setShowSheet] = useState(false);

  const isMultiConfig = product.priceConfigs?.length > 1;

  // For display: use activeConfig's price, or fall back to the cheapest config
  const displayConfig =
    activeConfig ??
    product.priceConfigs?.reduce(
      (min, c) => (c.price < min.price ? c : min),
      product.priceConfigs[0],
    );

  const discount =
    displayConfig?.mrp > displayConfig?.price
      ? ((displayConfig.mrp - displayConfig.price) / displayConfig.mrp) * 100
      : 0;

  const openSheet = () => setShowSheet(true);

  return (
    <>
      <div
        className={`bg-white rounded-xl border-2 border-slate-200 overflow-hidden hover:shadow-xl transition-all ${isMultiConfig ? "cursor-pointer" : ""}`}
        onClick={isMultiConfig ? openSheet : undefined}
      >
        {/* Image */}
        <div className="relative aspect-square overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />

          {discount > 0 && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
              {discount.toFixed(0)}% OFF
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <div className="flex items-center justify-between mb-1">
            {/* Show config label when in cart, otherwise show category */}
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded capitalize">
              {activeConfig ? activeConfig.displayLabel : product.category}
            </span>
            {product.isVeg && (
              <span className="w-3 h-3 border border-green-600 flex items-center justify-center">
                <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
              </span>
            )}
          </div>

          <h3 className="font-bold text-slate-800 text-sm mb-1 line-clamp-1">
            {product.name}
          </h3>

          <div className="flex items-center gap-2 mb-3">
            {/* "from" prefix only on the Add card for multi-config */}
            {!activeConfig && isMultiConfig && (
              <span className="text-xs text-slate-400">from</span>
            )}
            <span className="text-emerald-700 font-bold">
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
            <AddToCartButton config={product.priceConfigs[0]} product={product} />
          )}

          {/* No activeConfig, multi config → "Add" opens sheet */}
          {!activeConfig && isMultiConfig && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                openSheet();
              }}
              className="w-full h-10 flex items-center justify-center bg-[#009661] text-white font-bold rounded-xl transition-all active:scale-95 shadow-sm"
            >
              Add
            </button>
          )}
        </div>
      </div>

      {showSheet && (
        <PriceConfigsBottomSheet
          product={product}
          onClose={() => setShowSheet(false)}
        />
      )}
    </>
  );
};

export default ProductCard;
