import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, ShieldCheck, ArrowLeft, Loader2, MessageSquare, ChevronRight, Pencil } from "lucide-react";
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

  // ── Load Razorpay SDK ────────────────────────────────────────────────────
  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const [showCodConfirm, setShowCodConfirm] = useState(false);

  // ── Handle Place Order ───────────────────────────────────────────────────
  const handleCheckout = () => {
    if (paymentMethod === "cod") {
      setShowCodConfirm(true);
      return;
    }
    handlePlaceOrder();
  };

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

    // Online payment — open Razorpay checkout
    const { razorpayOrderId, keyId, order } = result;

    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error("Failed to load Razorpay SDK");

      const options = {
        key: keyId,
        order_id: razorpayOrderId,
        name: "Genzy Basket",
        prefill: {
          contact: profile?.phoneNumber || "",
          email: profile?.email || "",
        },
        theme: { color: "#099E0E" },
        handler: function () {
          // Payment succeeded — navigate to processing page to verify
          navigate(ORDER_ROUTES.PAYMENT_PROCESSING, {
            state: { orderId: order.orderId },
          });
        },
        modal: {
          ondismiss: function () {
            // User closed the modal without paying — still go to processing
            navigate(ORDER_ROUTES.PAYMENT_PROCESSING, {
              state: { orderId: order.orderId },
            });
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function () {
        navigate(ORDER_ROUTES.PAYMENT_PROCESSING, {
          state: { orderId: order.orderId },
        });
      });
      rzp.open();
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
            {address ? (
              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="w-full bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3 text-left hover:shadow-sm transition-all"
              >
                <div className="w-9 h-9 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-brand" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 text-sm truncate">
                    {address.houseOrFlat}
                  </p>
                  <p className="text-sm text-slate-500 truncate">
                    {address.street}, {address.area}, {address.pincode}
                  </p>
                </div>
                <Pencil className="w-4 h-4 text-brand shrink-0" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="w-full bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 text-left hover:bg-amber-100 transition-all"
              >
                <span className="text-amber-500 shrink-0 text-lg">⚠️</span>
                <span className="flex-1 text-sm text-amber-700 font-medium">
                  Add a delivery address to place your order
                </span>
                <ChevronRight className="w-4 h-4 text-amber-400 shrink-0" />
              </button>
            )}

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
              onClick={handleCheckout}
              disabled={loading || !address || itemCount === 0}
              className="w-full py-4 bg-brand text-white rounded-xl font-bold text-lg
                hover:bg-brand-dark transition-all shadow-lg shadow-emerald-100
                active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : paymentMethod === "cod" ? (
                "Place Order"
              ) : (
                `Pay ₹${grandTotal.toFixed(2)}`
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-slate-400 text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>Secured by Razorpay</span>
            </div>
          </div>
        </div>
      </div>

      {/* COD Confirmation Modal */}
      {showCodConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Confirm Order</h3>
            <p className="text-sm text-slate-600 mb-6">
              Are you sure you want to place this order with Cash on Delivery?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCodConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowCodConfirm(false);
                  handlePlaceOrder();
                }}
                className="flex-1 py-2.5 rounded-xl bg-brand text-white font-semibold text-sm hover:bg-brand-dark transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
