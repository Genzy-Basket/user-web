import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, ShieldCheck, ArrowLeft, Loader2, MessageSquare } from "lucide-react";
import { useCart } from "../../cart/hooks/useCart";
import { useOrder } from "../hooks/useOrder";
import { useAuth } from "../../auth/hooks/useAuth";
import { useUser } from "../../user/hooks/useUser";
import PaymentMethodSelector from "../components/PaymentMethodSelector";
import OrderSummary from "../components/OrderSummary";
import {
  PAYMENT_METHOD,
  ORDER_ROUTES,
} from "../../../constants/order.constants";
import { useDeliveryConfig } from "../../delivery/context/DeliveryConfigContext";
import { useWallet } from "../../wallet/hooks/useWallet";

const CheckoutPage = () => {
  const navigate = useNavigate();
  useAuth();
  const { profile } = useUser();
  const {
    cart,
    itemCount,
    totalAmount: cartTotal,
    totalMrp,
    totalSavings,
    clearCart,
  } = useCart();
  const { createOrder, loading } = useOrder();
  const { fetchWallet } = useWallet();

  useEffect(() => { fetchWallet(); }, [fetchWallet]);

  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHOD.ONLINE);
  const [customerNotes, setCustomerNotes] = useState("");
  const { deliveryCharge: deliveryRate, freeDeliveryThreshold } = useDeliveryConfig();

  const deliveryCharge =
    (cartTotal ?? 0) >= freeDeliveryThreshold ? 0 : deliveryRate;
  const grandTotal = (cartTotal ?? 0) + deliveryCharge;

  const address = profile?.address;

  // ── Load Cashfree SDK ────────────────────────────────────────────────────
  const loadCashfreeSdk = () =>
    new Promise((resolve, reject) => {
      if (window.Cashfree) return resolve(window.Cashfree);
      const script = document.createElement("script");
      script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
      script.onload = () => resolve(window.Cashfree);
      script.onerror = () => reject(new Error("Failed to load Cashfree SDK"));
      document.head.appendChild(script);
    });

  // ── Handle Place Order ───────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (!address) {
      navigate("/profile"); // send to profile to add address
      return;
    }

    const result = await createOrder(paymentMethod, customerNotes.trim() || null);
    if (!result.success) return; // error already toasted by context

    // COD or Wallet — backend already cleared cart; just navigate
    if (result.isCod || paymentMethod === "wallet") {
      clearCart();
      if (paymentMethod === "wallet") fetchWallet();
      navigate(ORDER_ROUTES.ORDER_SUCCESS, {
        state: { orderId: result.order.orderId, isCod: paymentMethod === "cod" },
      });
      return;
    }

    // Online payment — open Cashfree checkout
    const { paymentSessionId, order } = result;

    try {
      const cashfree = await loadCashfreeSdk();

      const cashfreeInstance = cashfree({
        mode:
          import.meta.env.VITE_CASHFREE_ENV === "production"
            ? "production"
            : "sandbox",
      });

      cashfreeInstance.checkout({
        paymentSessionId,
        redirectTarget: "_self", // redirect in same tab
        returnUrl: `${window.location.origin}${ORDER_ROUTES.PAYMENT_PROCESSING}?app_order_id=${order.orderId}`,
      });

      // Navigate to processing page immediately so the user sees feedback
      // even if the redirect takes a moment
      navigate(ORDER_ROUTES.PAYMENT_PROCESSING, {
        state: { orderId: order.orderId },
      });
    } catch {
      navigate(ORDER_ROUTES.PAYMENT_PROCESSING, {
        state: { orderId: order.orderId },
      });
    }
  };

  // ── Build items for OrderSummary ─────────────────────────────────────────
  // cart items have `productId` (populated) and `priceConfigId` (raw ObjectId string)
  const summaryItems =
    cart?.items?.map((item) => {
      const product = item.productId;
      const config = product?.priceConfigs?.find(
        (c) => c._id?.toString() === item.priceConfigId?.toString(),
      );
      return {
        _id: item._id,
        productSnapshot: { name: product?.name, imageUrl: product?.imageUrl },
        value: config?.quantity,
        unit: config?.unit,
        quantity: item.quantity,
        totalPrice: (config?.price ?? 0) * item.quantity,
      };
    }) ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 font-medium text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Cart
        </button>

        <h1 className="text-2xl font-black text-slate-900 mb-6">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">
          {/* Left column — address + payment */}
          <div className="lg:col-span-3 space-y-5">
            {/* Delivery Address */}
            <section className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-slate-800 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand" />
                  Delivery Address
                </h2>
                <button
                  onClick={() => navigate("/profile")}
                  className="text-xs font-semibold text-brand hover:underline"
                >
                  {address ? "Change" : "Add Address"}
                </button>
              </div>

              {address ? (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                  <p className="font-semibold text-slate-800 text-sm">
                    {address.houseOrFlat}, {address.street}
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
                    {address.area}, {address.pincode}
                  </p>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-700 text-sm font-medium">
                  No delivery address found. Please add one before placing an
                  order.
                </div>
              )}
            </section>

            {/* Delivery Instructions */}
            <section className="bg-white rounded-2xl border border-slate-200 p-5">
              <h2 className="font-bold text-slate-800 flex items-center gap-2 mb-3">
                <MessageSquare className="w-4 h-4 text-brand" />
                Delivery Instructions
                <span className="text-xs font-normal text-slate-400 ml-1">(optional)</span>
              </h2>
              <textarea
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                placeholder="e.g. Ring the doorbell, leave at the gate, no plastic bags..."
                rows={2}
                maxLength={200}
                className="w-full border border-slate-200 rounded-xl p-3 text-sm resize-none
                  focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all"
              />
              {customerNotes.length > 0 && (
                <p className="text-xs text-slate-400 mt-1 text-right">
                  {customerNotes.length}/200
                </p>
              )}
            </section>

            {/* Payment Method */}
            <section className="bg-white rounded-2xl border border-slate-200 p-5">
              <h2 className="font-bold text-slate-800 mb-4">Payment Method</h2>
              <PaymentMethodSelector
                selected={paymentMethod}
                onChange={setPaymentMethod}
                disabled={loading}
                grandTotal={grandTotal}
              />
            </section>
          </div>

          {/* Right column — summary + CTA */}
          <div className="lg:col-span-2 space-y-4">
            <OrderSummary
              items={summaryItems}
              itemsTotal={cartTotal ?? 0}
              mrpTotal={totalMrp ?? 0}
              savings={totalSavings ?? 0}
              deliveryCharge={deliveryCharge}
              totalAmount={grandTotal}
            />

            <button
              onClick={handlePlaceOrder}
              disabled={loading || !address || itemCount === 0}
              className="w-full py-4 bg-brand text-white rounded-xl font-bold text-lg
                hover:bg-brand-dark transition-all shadow-lg shadow-emerald-100
                active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                `Pay ₹${grandTotal.toFixed(2)}`
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-slate-400 text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>Secured by Cashfree Payments</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
