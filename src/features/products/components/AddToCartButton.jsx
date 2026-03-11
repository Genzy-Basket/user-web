import { useState } from "react";
import { Plus, Minus, Loader2 } from "lucide-react";
import { useCart } from "../../cart/hooks/useCart";

const AddToCartButton = ({
  config,
  product,
  setShowConfigModal,
  compact = false,
  disabled = false,
}) => {
  // Per-item loading — does NOT block other cart items
  const { addItem, updateQuantity, removeItem, getCartItem } = useCart();
  const [isUpdating, setIsUpdating] = useState(false);

  const cartItem = getCartItem(product._id, config?._id);
  const quantity = cartItem ? cartItem.quantity : 0;

  // Mobile-first sizing: compact mode is xs, default grows on sm+
  const heightClass = compact ? "h-7" : "h-8 sm:h-9";
  const textClass = compact ? "text-xs" : "text-xs sm:text-sm";
  const iconSize = "w-3 h-3 sm:w-4 sm:h-4";

  const handleAdd = async (e) => {
    e.stopPropagation();
    if (isUpdating || disabled) return;
    if (product.priceConfigs?.length > 1 && !config?._id) {
      setShowConfigModal?.(true);
      return;
    }
    setIsUpdating(true);
    try {
      await addItem(product._id, config?._id, 1);
    } catch (err) {
      if (import.meta.env.DEV) console.error("Add error:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdate = async (e, action) => {
    e.stopPropagation();
    if (isUpdating || !cartItem) return;
    setIsUpdating(true);
    try {
      if (action === "decrement" && quantity === 1) {
        await removeItem(cartItem._id);
      } else {
        await updateQuantity(cartItem._id, action);
      }
    } catch (err) {
      if (import.meta.env.DEV) console.error(`Error during ${action}:`, err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (quantity === 0) {
    return (
      <div className="w-full flex justify-center">
        <button
          onClick={handleAdd}
          disabled={isUpdating || disabled}
          className={`w-full flex items-center justify-center bg-brand text-white font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm ${heightClass} ${textClass}`}
        >
          {isUpdating ? (
            <Loader2 className={`${iconSize} animate-spin`} />
          ) : (
            "Add"
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center">
      <div
        className={`w-full flex items-center justify-between bg-brand relative rounded-xl p-1 shadow-sm transition-all ${heightClass}`}
      >
        {isUpdating && (
          <div className="absolute inset-0 bg-brand/40 backdrop-blur-[1px] rounded-xl flex items-center justify-center z-10">
            <Loader2 className={`${iconSize} animate-spin text-white`} />
          </div>
        )}

        {/* Minus / Remove */}
        <button
          onClick={(e) => handleUpdate(e, "decrement")}
          disabled={isUpdating}
          className="h-full aspect-square rounded-lg bg-white flex items-center justify-center text-brand active:scale-90 transition-all disabled:opacity-50"
        >
          <Minus className={iconSize} strokeWidth={3} />
        </button>

        <span className={`text-white font-bold ${textClass}`}>{quantity}</span>

        {/* Plus */}
        <button
          onClick={(e) => handleUpdate(e, "increment")}
          disabled={isUpdating}
          className="h-full aspect-square rounded-lg bg-white flex items-center justify-center text-brand active:scale-90 transition-all disabled:opacity-50"
        >
          <Plus className={iconSize} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
};

export default AddToCartButton;
