import { useState, useEffect, useCallback, useMemo } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ShoppingBasket,
  CalendarDays,
  CreditCard,
  Loader2,
} from "lucide-react";
import { useWallet } from "../../wallet/hooks/useWallet";
import { useUser } from "../../user/hooks/useUser";
import { useSubscription } from "../hooks/useSubscription";
import { errorBus } from "../../../api/errorBus";
import subscriptionAPI from "../../../api/endpoints/subscription.api";
import ProductSelector from "./ProductSelector";
import CalendarPicker from "./CalendarPicker";
import SubscriptionSummary from "./SubscriptionSummary";

const toDateKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const STEPS = [
  { key: "products", label: "Items", icon: ShoppingBasket },
  { key: "schedule", label: "Schedule", icon: CalendarDays },
  { key: "summary", label: "Summary", icon: CreditCard },
];

const NewSubscription = ({ onBack }) => {
  const { balance, fetchWallet } = useWallet();
  const { profile } = useUser();
  const {
    createSubscription,
    verifyPayment,
    loading: subLoading,
  } = useSubscription();

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  // Key: `${productId}:${configId}`, Value: { productId, configId, quantity }
  const [selections, setSelections] = useState({});
  const [step, setStep] = useState("products");
  const [selectedDates, setSelectedDates] = useState(new Set());
  const now = new Date();
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [calYear, setCalYear] = useState(now.getFullYear());

  useEffect(() => {
    fetchWallet();
    subscriptionAPI
      .getSubscriptionProducts()
      .then((res) => setProducts(res.data || []))
      .catch(() => setProducts([]))
      .finally(() => setProductsLoading(false));
  }, [fetchWallet]);

  const selectedItems = useMemo(() => {
    const items = [];
    for (const [, sel] of Object.entries(selections)) {
      if (!sel.configId || !sel.productId) continue;
      const product = products.find((p) => p._id === sel.productId);
      if (!product) continue;
      const config = product.priceConfigs.find(
        (c) => (c._id || c.id) === sel.configId,
      );
      if (!config) continue;
      items.push({
        productId: sel.productId,
        productName: product.name,
        config,
        quantity: sel.quantity,
      });
    }
    return items;
  }, [selections, products]);

  const dailyCost = useMemo(
    () =>
      selectedItems.reduce(
        (sum, item) => sum + item.config.price * item.quantity,
        0,
      ),
    [selectedItems],
  );

  const walletMaxDays = dailyCost > 0 ? Math.floor(balance / dailyCost) : 0;

  const handleConfigToggle = useCallback((productId, configId) => {
    setSelections((prev) => {
      const key = `${productId}:${configId}`;
      const next = { ...prev };
      if (next[key]) {
        delete next[key];
      } else {
        next[key] = { productId, configId, quantity: 1 };
      }
      return next;
    });
  }, []);

  const handleQuantityChange = useCallback((productId, configId, qty) => {
    if (qty < 1) return;
    const key = `${productId}:${configId}`;
    setSelections((prev) => ({
      ...prev,
      [key]: { ...prev[key], productId, configId, quantity: qty },
    }));
  }, []);

  const getProductSelectedConfigs = useCallback(
    (productId) => {
      const configs = {};
      for (const [key, sel] of Object.entries(selections)) {
        if (sel.productId === productId) {
          configs[sel.configId] = sel.quantity;
        }
      }
      return configs;
    },
    [selections],
  );

  const handleToggleDate = useCallback((dateKey) => {
    setSelectedDates((prev) => {
      const next = new Set(prev);
      if (next.has(dateKey)) next.delete(dateKey);
      else next.add(dateKey);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback((dates) => {
    setSelectedDates((prev) => {
      const keys = dates.map((d) => toDateKey(d));
      const allIn = keys.every((k) => prev.has(k));
      const next = new Set(prev);
      if (allIn) keys.forEach((k) => next.delete(k));
      else keys.forEach((k) => next.add(k));
      return next;
    });
  }, []);

  const handleClearAll = useCallback(() => setSelectedDates(new Set()), []);

  const handlePrevMonth = useCallback(() => {
    setCalMonth((m) => {
      if (m === 0) {
        setCalYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  }, []);

  const handleNextMonth = useCallback(() => {
    setCalMonth((m) => {
      if (m === 11) {
        setCalYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  }, []);

  const pollVerification = useCallback(
    async (subscriptionId) => {
      const MAX_DURATION = 30_000;
      const INITIAL_INTERVAL = 2_000;
      const MAX_INTERVAL = 5_000;
      const start = Date.now();
      let interval = INITIAL_INTERVAL;

      // Immediate first check
      try {
        const res = await verifyPayment(subscriptionId);
        if (res?.status === "success") return "success";
        if (res?.status === "failed") return "failed";
      } catch {
        // fall through to polling
      }

      return new Promise((resolve) => {
        const tick = async () => {
          try {
            const res = await verifyPayment(subscriptionId);
            if (res?.status === "success") return resolve("success");
            if (res?.status === "failed") return resolve("failed");
          } catch {
            // network blip — keep polling
          }

          if (Date.now() - start >= MAX_DURATION) {
            // Final attempt
            try {
              const res = await verifyPayment(subscriptionId);
              if (res?.status === "success") return resolve("success");
            } catch {
              // ignore
            }
            return resolve("timeout");
          }

          interval = Math.min(interval * 1.5, MAX_INTERVAL);
          setTimeout(tick, interval);
        };

        setTimeout(tick, interval);
      });
    },
    [verifyPayment],
  );

  const handleSubscribe = async (paymentMethod) => {
    const items = selectedItems.map((item) => ({
      productId: item.productId,
      priceConfigId: item.config._id || item.config.id,
      quantity: item.quantity,
    }));
    const dates = [...selectedDates].sort();

    const result = await createSubscription(items, dates, paymentMethod);
    if (!result) return;

    // Wallet payment — subscription is immediately active
    if (paymentMethod === "wallet") {
      errorBus.emit("Subscription created!", "success");
      fetchWallet();
      onBack();
      return;
    }

    // Online payment — launch Razorpay
    const { razorpayOrderId, keyId, subscriptionId } = result;
    if (!razorpayOrderId || !keyId) {
      errorBus.emit("Payment session not available", "error");
      return;
    }

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
        handler: async function () {
          // Payment succeeded — poll for verification
          const status = await pollVerification(subscriptionId);
          if (status === "success") {
            errorBus.emit("Subscription created!", "success");
            fetchWallet();
            onBack();
          } else if (status === "timeout") {
            errorBus.emit(
              "Payment is still processing. Check back shortly.",
              "info",
            );
            onBack();
          } else {
            errorBus.emit("Payment failed. Please try again.", "error");
          }
        },
        modal: {
          ondismiss: function () {
            // User closed modal — still poll in case payment went through
            pollVerification(subscriptionId).then((status) => {
              if (status === "success") {
                errorBus.emit("Subscription created!", "success");
                fetchWallet();
                onBack();
              }
            });
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function () {
        errorBus.emit("Payment failed. Please try again.", "error");
      });
      rzp.open();
    } catch {
      errorBus.emit("Could not launch payment", "error");
    }
  };

  const handleBack = () => {
    if (step === "summary") setStep("schedule");
    else if (step === "schedule") setStep("products");
    else onBack();
  };

  const isLoading = subLoading;
  const stepIndex = STEPS.findIndex((s) => s.key === step);
  const itemCount = selectedItems.length;
  const total = dailyCost * selectedDates.size;

  if (productsLoading && products.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <>
      {/* Step indicator — 3 steps */}
      <div className="flex items-center gap-2 mb-6">
        {STEPS.map(({ key, label, icon: Icon }, idx) => {
          const isActive = idx === stepIndex;
          const isDone = idx < stepIndex;
          const isFuture = idx > stepIndex;
          return (
            <div key={key} className="flex items-center gap-2 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                  isDone || isActive
                    ? "bg-brand text-white"
                    : "bg-slate-200 text-slate-400"
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span
                className={`text-xs font-semibold ${isFuture ? "text-slate-400" : "text-slate-800"}`}
              >
                {label}
              </span>
              {idx < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 rounded-full ${isDone ? "bg-brand" : "bg-slate-200"}`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step 1: Products */}
      {step === "products" && (
        <div className="space-y-4">
          {products.length === 0 && !productsLoading && (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
              <p className="text-slate-500 font-medium">
                No subscription products available
              </p>
            </div>
          )}
          {products.map((product) => (
            <ProductSelector
              key={product._id}
              product={product}
              selectedConfigs={getProductSelectedConfigs(product._id)}
              onConfigToggle={handleConfigToggle}
              onQuantityChange={handleQuantityChange}
            />
          ))}
        </div>
      )}

      {/* Step 2: Schedule */}
      {step === "schedule" && (
        <div className="space-y-4">
          {dailyCost > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-800 flex items-center justify-between">
              <span>
                <span className="font-bold">₹{dailyCost}/day</span>
                <span className="text-emerald-600 ml-1">
                  · {selectedDates.size} days = ₹{total}
                </span>
              </span>
              {walletMaxDays > 0 && (
                <span className="text-xs text-emerald-500">
                  Wallet covers {walletMaxDays} days
                </span>
              )}
            </div>
          )}

          <CalendarPicker
            selectedDates={selectedDates}
            onToggleDate={handleToggleDate}
            onSelectAll={handleSelectAll}
            onClearAll={handleClearAll}
            month={calMonth}
            year={calYear}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            maxDays={0}
          />
        </div>
      )}

      {/* Step 3: Summary */}
      {step === "summary" && (
        <div className="space-y-4">
          <SubscriptionSummary
            items={selectedItems}
            selectedDates={selectedDates}
            walletBalance={balance}
            onSubscribe={handleSubscribe}
            loading={isLoading}
          />
        </div>
      )}

      {/* Bottom bar — products and schedule steps only, hidden on summary */}
      {itemCount > 0 && step !== "summary" && (
        <div
          className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-slate-200 px-4 py-4 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] z-30"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 1rem)" }}
        >
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-800">
                {itemCount} item{itemCount > 1 ? "s" : ""} selected
                <span className="text-slate-400 font-medium ml-1">
                  · ₹{dailyCost}/day
                </span>
              </p>
              {step === "schedule" && selectedDates.size > 0 && (
                <p className="text-xs text-slate-500">
                  {selectedDates.size} day{selectedDates.size !== 1 ? "s" : ""}{" "}
                  · ₹{total} total
                </p>
              )}
            </div>
            {step === "products" && (
              <button
                type="button"
                onClick={() => setStep("schedule")}
                className="flex items-center gap-2 px-6 py-3 bg-brand text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors text-sm"
              >
                Choose Days
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
            {step === "schedule" && (
              <button
                type="button"
                onClick={() => setStep("summary")}
                disabled={selectedDates.size === 0}
                className="flex items-center gap-2 px-6 py-3 bg-brand text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors text-sm disabled:opacity-50"
              >
                Review & Pay
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default NewSubscription;
