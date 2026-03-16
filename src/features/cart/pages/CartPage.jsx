import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { useDeliveryConfig } from "../../delivery/context/DeliveryConfigContext";
import CartItem from "../components/CartItem";
import CartSummary from "../components/CartSummary";
import { ShoppingCart, AlertCircle, Trash2, Loader2 } from "lucide-react";
import { ORDER_ROUTES } from "../../../constants/order.constants";
import PageLayout from "../../../components/PageLayout";

const isPastCutoff = (cutoffHour, cutoffMinute) => {
  const now = new Date();
  return (
    now.getHours() > cutoffHour ||
    (now.getHours() === cutoffHour && now.getMinutes() >= cutoffMinute)
  );
};

const CartPage = () => {
  const navigate = useNavigate();
  const {
    cart,
    loading,
    error,
    clearCart,
    itemCount,
    totalAmount,
    isEmpty,
  } = useCart();

  const {
    deliveryCharge: deliveryRate,
    freeDeliveryThreshold,
    orderCutoffHour,
    orderCutoffMinute,
  } = useDeliveryConfig();

  // Single source of truth for delivery + grand total
  const deliveryCharge = (totalAmount ?? 0) >= freeDeliveryThreshold ? 0 : deliveryRate;
  const grandTotal = (totalAmount ?? 0) + deliveryCharge;
  const ordersClosed = isPastCutoff(orderCutoffHour, orderCutoffMinute);

  const [confirmClear, setConfirmClear] = useState(false);

  const handleClearConfirm = async () => {
    setConfirmClear(false);
    await clearCart();
  };

  if (isEmpty && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-brand mx-auto" />
          <p className="mt-6 text-slate-600 font-medium text-lg">Loading your cart…</p>
        </div>
      </div>
    );
  }

  return (
    <PageLayout
      title="My Cart"
      subtitle={isEmpty ? "Your cart is empty" : `${itemCount} ${itemCount === 1 ? "item" : "items"} in your cart`}
      headerRight={
        <>
          {!isEmpty && loading && (
            <Loader2 className="w-5 h-5 text-brand animate-spin" />
          )}
          {!isEmpty && !confirmClear && (
            <button
              onClick={() => setConfirmClear(true)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium text-sm"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
          {confirmClear && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleClearConfirm}
                className="px-3 py-1.5 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 transition-colors"
              >
                Clear
              </button>
              <button
                onClick={() => setConfirmClear(false)}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </>
      }
    >
        {/* Global error */}
        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Cart layout */}
        {isEmpty ? (
          <div className="bg-white rounded-2xl shadow-xl border-2 border-slate-200 p-12 text-center">
            <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-12 h-12 text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Your cart is empty</h2>
            <p className="text-slate-600 mb-8">
              Add some fresh products to get started.
            </p>
            <button
              onClick={() => navigate("/products")}
              className="inline-flex items-center gap-2 px-8 py-3 bg-brand text-white rounded-xl font-bold hover:bg-brand-dark transition-all shadow-lg"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart?.items?.map((item) => (
                <CartItem key={item._id} item={item} />
              ))}
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <CartSummary />
            </div>
          </div>
        )}

      {/* Mobile sticky checkout bar — respects ordersClosed */}
      {!isEmpty && (
        <div className="lg:hidden fixed bottom-16 left-0 right-0 z-30 bg-white border-t border-slate-200 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <button
            onClick={() => navigate(ORDER_ROUTES.CHECKOUT)}
            disabled={loading || ordersClosed}
            className="w-full py-3.5 bg-brand text-white rounded-xl font-bold text-base flex items-center justify-between px-5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {ordersClosed ? (
              <span className="w-full text-center">Orders Closed</span>
            ) : (
              <>
                <span>{itemCount} {itemCount === 1 ? "item" : "items"}</span>
                <span>Checkout · ₹{grandTotal % 1 === 0 ? grandTotal : grandTotal.toFixed(2)}</span>

              </>
            )}
          </button>
        </div>
      )}
    </PageLayout>
  );
};

export default CartPage;
