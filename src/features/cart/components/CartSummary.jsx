import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Tag,
  TrendingDown,
  Wallet,
  Loader2,
  Clock,
  Package,
} from "lucide-react";
import { useCart } from "../hooks/useCart";
import { ORDER_ROUTES } from "../../../constants/order.constants";
import { useDeliveryConfig } from "../../delivery/context/DeliveryConfigContext";

const isPastCutoff = (cutoffHour, cutoffMinute) => {
  const now = new Date();
  return (
    now.getHours() > cutoffHour ||
    (now.getHours() === cutoffHour && now.getMinutes() >= cutoffMinute)
  );
};

const fmt12 = (h, m) => {
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
};

const CartSummary = () => {
  const navigate = useNavigate();
  const { itemCount, totalMrp, totalAmount, totalSavings, loading } = useCart();
  const {
    deliveryCharge: deliveryRate,
    freeDeliveryThreshold,
    orderCutoffHour,
    orderCutoffMinute,
  } = useDeliveryConfig();
  const ordersClosed = isPastCutoff(orderCutoffHour, orderCutoffMinute);

  const deliveryCharge =
    (totalAmount ?? 0) >= freeDeliveryThreshold ? 0 : deliveryRate;
  const grandTotal = (totalAmount ?? 0) + deliveryCharge;
  const amountToFree = freeDeliveryThreshold - (totalAmount ?? 0);

  // Format rupee amounts consistently — no unnecessary decimals
  const fmt = (n) => `₹${n % 1 === 0 ? n : n.toFixed(2)}`;

  return (
    // max-h + overflow-y-auto ensures the panel scrolls on short viewports
    // so the checkout button is always reachable
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm sticky top-6 max-h-[calc(100vh-5rem)] overflow-y-auto">
      <div className="p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-brand" />
          Order Summary
        </h2>

        <div className="space-y-4 mb-6">
          {/* Item Count */}
          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-2 text-sm font-medium">
              <Package className="w-4 h-4 text-slate-400" />
              Items in Cart
            </span>
            <span className="font-bold text-slate-900">{itemCount}</span>
          </div>

          {/* MRP Total */}
          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-2 text-sm font-medium">
              <Tag className="w-4 h-4 text-slate-400" />
              Price (MRP)
            </span>
            <span className="font-semibold line-through text-slate-400">
              {fmt(totalMrp ?? 0)}
            </span>
          </div>

          {/* Discount */}
          {(totalSavings ?? 0) > 0 && (
            <div className="flex items-center justify-between text-brand py-1">
              <span className="flex items-center gap-2 text-sm font-semibold">
                <TrendingDown className="w-4 h-4" />
                Discount
              </span>
              <span className="font-bold">−{fmt(totalSavings ?? 0)}</span>
            </div>
          )}

          {/* Delivery charge */}
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-sm font-medium">Delivery</span>
            {deliveryCharge === 0 ? (
              <span className="font-bold text-brand text-sm">FREE</span>
            ) : (
              <span className="font-semibold text-slate-700 text-sm">
                {fmt(deliveryCharge)}
              </span>
            )}
          </div>

          {/* Free delivery nudge */}
          {deliveryCharge > 0 && amountToFree > 0 && (
            <p className="text-[11px] text-amber-600 bg-amber-50 rounded-lg px-3 py-2 font-medium">
              Add ₹{Math.ceil(amountToFree)} more for free delivery
            </p>
          )}

          {/* Total */}
          <div className="border-t border-slate-100 pt-4 mt-2">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-slate-400" />
                To Pay
              </span>
              <span className="text-2xl font-black text-slate-900">
                {fmt(grandTotal)}
              </span>
            </div>
          </div>

          {/* Savings badge */}
          {(totalSavings ?? 0) > 0 && (
            <div className="bg-emerald-50 text-brand rounded-lg p-3 border border-emerald-100 mt-4">
              <p className="text-xs font-bold flex items-center justify-center gap-1">
                <span className="text-base">🎉</span> You are saving{" "}
                {fmt(totalSavings ?? 0)} on this order
              </p>
            </div>
          )}
        </div>

        {/* Cutoff warning */}
        {ordersClosed && (
          <div className="mb-4 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs font-semibold text-amber-700">
              Orders are closed for today. Ordering reopens at midnight. Cutoff
              was {fmt12(orderCutoffHour, orderCutoffMinute)}.
            </p>
          </div>
        )}

        {/* Checkout CTA */}
        <button
          onClick={() => navigate(ORDER_ROUTES.CHECKOUT)}
          disabled={loading || itemCount === 0 || ordersClosed}
          className="w-full py-4 px-6 bg-brand text-white rounded-xl font-bold text-lg
            hover:bg-brand-dark transition-all shadow-lg shadow-emerald-100
            active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : ordersClosed ? (
            "Orders Closed"
          ) : (
            "Proceed to Checkout"
          )}
        </button>

        <p className="mt-4 text-[11px] text-slate-400 text-center font-medium">
          Secure SSL Encrypted Checkout
        </p>
      </div>
    </div>
  );
};

export default CartSummary;
