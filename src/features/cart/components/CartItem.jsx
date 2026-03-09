import { Trash2, Package, Loader2 } from "lucide-react";
import { useCart } from "../hooks/useCart";
import AddToCartButton from "../../products/components/AddToCartButton";

const CartItem = ({ item }) => {
  const { removeItem, loading: globalLoading } = useCart();

  // 1. Derive data from populated productId
  const product = item.productId;

  // 2. Find the specific config used in this cart item
  const config = product?.priceConfigs?.find(
    (c) => c._id === item.priceConfigId || c.id === item.priceConfigId,
  );

  // Safety check: If product or config isn't found (due to sync/delete lag)
  if (!product || !config) return null;

  const handleRemove = async () => {
    await removeItem(item._id);
  };

  // Calculations
  const unitPrice = config.price;
  const mrp = config.mrp;
  const itemTotal = unitPrice * item.quantity;
  const itemSavings = (mrp - unitPrice) * item.quantity;

  return (
    <div className="bg-white rounded-xl border-2 border-slate-200 p-3 sm:p-5 hover:shadow-md transition-all group relative overflow-hidden">
      <div className="flex gap-4">
        {/* Product Image */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-slate-50 shrink-0 border border-slate-100">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-brand-50">
              <Package className="w-8 h-8 text-brand" />
            </div>
          )}
        </div>

        {/* Details and Actions */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-800 text-base sm:text-lg truncate">
                {product.name}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                {config.displayLabel || `${config.value} ${config.unit}`}
              </p>
            </div>

            {/* Remove Icon — always visible on mobile, hover-only on desktop */}
            <button
              onClick={handleRemove}
              disabled={globalLoading}
              className="p-2 rounded-lg text-slate-300 hover:text-red-600 hover:bg-red-50 focus:text-red-600 focus:bg-red-50 transition-all opacity-100 sm:opacity-0 group-hover:opacity-100 focus:opacity-100"
              aria-label={`Remove ${product.name} from cart`}
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          <div className="flex items-end justify-between mt-4">
            {/* Price Info */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-slate-900">
                  ₹{unitPrice}
                </span>
                {mrp > unitPrice && (
                  <span className="text-xs text-slate-400 line-through">
                    ₹{mrp}
                  </span>
                )}
              </div>
              {itemSavings > 0 && (
                <span className="text-[10px] font-bold text-brand bg-brand-50 px-1.5 py-0.5 rounded w-fit uppercase">
                  Saved ₹{itemSavings}
                </span>
              )}
            </div>

            {/* Reusing AddToCartButton for Quantity Controls */}
            <div className="scale-90 origin-right sm:scale-100">
              <AddToCartButton
                product={product}
                config={config}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Item Subtotal Footer */}
      <div className="mt-4 pt-3 border-t border-slate-50 flex justify-between items-center">
        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
          Item Subtotal
        </span>
        <span className="font-bold text-slate-800">
          ₹{itemTotal.toFixed(2)}
        </span>
      </div>
    </div>
  );
};

export default CartItem;
