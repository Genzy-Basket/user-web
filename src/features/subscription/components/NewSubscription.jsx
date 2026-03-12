import { useState, useEffect, useCallback, useMemo } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ShoppingBasket,
  CalendarDays,
  Loader2,
} from "lucide-react";
import { useProducts } from "../../products/hooks/useProducts";
import { useWallet } from "../../wallet/hooks/useWallet";
import { useSubscription } from "../hooks/useSubscription";
import { errorBus } from "../../../api/errorBus";
import ProductSelector from "./ProductSelector";
import CalendarPicker from "./CalendarPicker";
import SubscriptionSummary from "./SubscriptionSummary";

const SUBSCRIPTION_PRODUCT_IDS = [
  "6992fe0cd34ec5e48a6ecb3c", // coconut
  "6992fe0cd34ec5e48a6ecb68", // milk
  "6992fe0cd34ec5e48a6ecb6a", // curd
];

const toDateKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const loadCashfreeSdk = () =>
  new Promise((resolve, reject) => {
    if (window.Cashfree) return resolve(window.Cashfree);
    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.onload = () => resolve(window.Cashfree);
    script.onerror = () => reject(new Error("Failed to load Cashfree SDK"));
    document.head.appendChild(script);
  });

const NewSubscription = ({ onBack }) => {
  const { products: allProducts, loading: productsLoading } = useProducts();
  const { balance, fetchWallet } = useWallet();
  const {
    createSubscription,
    verifyPayment,
    loading: subLoading,
  } = useSubscription();

  const products = useMemo(
    () => allProducts.filter((p) => SUBSCRIPTION_PRODUCT_IDS.includes(p._id)),
    [allProducts],
  );

  const [selections, setSelections] = useState({});
  const [step, setStep] = useState("products");
  const [selectedDates, setSelectedDates] = useState(new Set());
  const now = new Date();
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [calYear, setCalYear] = useState(now.getFullYear());

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  const selectedItems = useMemo(() => {
    const items = [];
    for (const [productId, sel] of Object.entries(selections)) {
      if (!sel.configId) continue;
      const product = products.find((p) => p._id === productId);
      if (!product) continue;
      const config = product.priceConfigs.find(
        (c) => (c._id || c.id) === sel.configId,
      );
      if (!config) continue;
      items.push({
        productId,
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

  const handleSelectConfig = useCallback((productId, configId) => {
    setSelections((prev) => ({
      ...prev,
      [productId]: {
        configId,
        quantity: configId ? prev[productId]?.quantity || 1 : 0,
      },
    }));
  }, []);

  const handleQuantityChange = useCallback((productId, qty) => {
    if (qty < 1) return;
    setSelections((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], quantity: qty },
    }));
  }, []);

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

    // Online payment — launch Cashfree
    const { paymentSessionId, subscriptionId } = result;
    if (!paymentSessionId) {
      errorBus.emit("Payment session not available", "error");
      return;
    }

    try {
      const cashfree = await loadCashfreeSdk();
      const instance = cashfree({
        mode:
          import.meta.env.VITE_CASHFREE_ENV === "production"
            ? "production"
            : "sandbox",
      });

      // _modal mode: checkout() resolves when modal closes
      await instance.checkout({
        paymentSessionId,
        redirectTarget: "_modal",
      });

      // Modal closed — poll for verification
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

  if (productsLoading && products.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <>
      {/* Back + Step indicator */}
      <button
        type="button"
        onClick={handleBack}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-5 font-medium text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        {step === "products"
          ? "Back"
          : step === "schedule"
            ? "Back to Items"
            : "Back to Schedule"}
      </button>

      {/* Step progress */}
      <div className="flex items-center gap-3 mb-6">
        {[
          { key: "products", label: "Items", icon: ShoppingBasket },
          { key: "schedule", label: "Schedule", icon: CalendarDays },
        ].map(({ key, label, icon: Icon }, idx) => {
          const isActive = step === key || (step === "summary" && idx <= 1);
          const isDone =
            (key === "products" && step !== "products") ||
            (key === "schedule" && step === "summary");
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
                className={`text-xs font-semibold ${isActive ? "text-slate-800" : "text-slate-400"}`}
              >
                {label}
              </span>
              {idx < 1 && (
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
          {products.map((product) => {
            const sel = selections[product._id];
            return (
              <ProductSelector
                key={product._id}
                product={product}
                selectedConfigId={sel?.configId ?? null}
                quantity={sel?.quantity ?? 1}
                onSelectConfig={handleSelectConfig}
                onQuantityChange={handleQuantityChange}
              />
            );
          })}
        </div>
      )}

      {/* Step 2: Calendar + Summary */}
      {(step === "schedule" || step === "summary") && (
        <div className="space-y-4">
          {dailyCost > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-800 flex items-center justify-between">
              <span>
                <span className="font-bold">₹{dailyCost}/day</span>
                <span className="text-emerald-600 ml-1">
                  · {selectedDates.size} days = ₹
                  {dailyCost * selectedDates.size}
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

          {step === "summary" && (
            <SubscriptionSummary
              items={selectedItems}
              selectedDates={selectedDates}
              walletBalance={balance}
              onSubscribe={handleSubscribe}
              loading={isLoading}
            />
          )}
        </div>
      )}

      {/* Bottom bar */}
      {selectedItems.length > 0 && step !== "summary" && (
        <div className="fixed bottom-16 md:bottom-0 left-0 right-0 bg-white border-t-2 border-slate-200 px-4 py-4 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] z-30">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-800">
                {selectedItems.length} item{selectedItems.length > 1 ? "s" : ""}
                <span className="text-slate-400 font-medium ml-1">
                  · ₹{dailyCost}/day
                </span>
              </p>
              {step === "schedule" && selectedDates.size > 0 && (
                <p className="text-xs text-slate-500">
                  {selectedDates.size} day{selectedDates.size !== 1 ? "s" : ""}{" "}
                  · ₹{dailyCost * selectedDates.size} total
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
