import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Wallet, ArrowDownLeft, ArrowUpRight, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useWallet } from "../hooks/useWallet";
import { errorBus } from "../../../api/errorBus";

const PRESETS = [500, 1000, 2000, 3000, 5000];

// "idle" | "creating" | "paying" | "verifying" | "success" | "failed"
const PHASE_LABELS = {
  creating: "Opening payment gateway…",
  paying: "Complete payment in the window…",
  verifying: "Verifying payment…",
};

const WalletPage = () => {
  const navigate = useNavigate();
  const { balance, transactions, pagination, loading, fetchWallet, addFunds, verifyFunds } = useWallet();
  const [amount, setAmount] = useState("");
  const [phase, setPhase] = useState("idle");
  const [resultBalance, setResultBalance] = useState(null);

  // Preload Cashfree SDK on mount so it's ready when needed
  const sdkPromiseRef = useState(() => null);
  const loadCashfreeSdk = () => {
    if (window.Cashfree) return Promise.resolve(window.Cashfree);
    if (!sdkPromiseRef[0]) {
      sdkPromiseRef[0] = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
        script.onload = () => resolve(window.Cashfree);
        script.onerror = () => {
          sdkPromiseRef[0] = null;
          reject(new Error("Failed to load Cashfree SDK"));
        };
        document.head.appendChild(script);
      });
    }
    return sdkPromiseRef[0];
  };

  useEffect(() => {
    fetchWallet();
    loadCashfreeSdk();
  }, [fetchWallet]);

  const handleAddFunds = async () => {
    const num = parseFloat(amount);
    if (!num || num < 500 || num > 5000) {
      errorBus.emit("Enter amount between ₹500 and ₹5,000", "error");
      return;
    }

    try {
      // Run API call and SDK load in parallel
      setPhase("creating");
      const [result, cashfree] = await Promise.all([
        addFunds(num),
        loadCashfreeSdk(),
      ]);

      if (!result) {
        setPhase("idle");
        return;
      }

      const { paymentSessionId, cashfreeOrderId } = result;
      if (!paymentSessionId || !cashfreeOrderId) {
        errorBus.emit("Payment session not available", "error");
        setPhase("idle");
        return;
      }

      const instance = cashfree({
        mode: import.meta.env.VITE_CASHFREE_ENV === "production" ? "production" : "sandbox",
      });

      // Phase 3: Open payment modal
      setPhase("paying");
      await instance.checkout({
        paymentSessionId,
        redirectTarget: "_modal",
        returnUrl: window.location.href,
      });

      // Phase 4: Verify payment (checkout promise resolved = modal closed)
      setPhase("verifying");

      // Small delay to let Cashfree finalize on their end
      await new Promise((r) => setTimeout(r, 1500));

      const res = await verifyFunds(cashfreeOrderId);
      if (res?.status === "success") {
        setResultBalance(res.balance);
        setPhase("success");
        setAmount("");
        fetchWallet();
      } else if (res?.status === "pending") {
        // Retry once more after a longer delay
        await new Promise((r) => setTimeout(r, 3000));
        const retry = await verifyFunds(cashfreeOrderId);
        if (retry?.status === "success") {
          setResultBalance(retry.balance);
          setPhase("success");
          setAmount("");
          fetchWallet();
        } else {
          setPhase("failed");
        }
      } else {
        setPhase("failed");
      }
    } catch {
      errorBus.emit("Could not launch payment", "error");
      setPhase("idle");
    }
  };

  const resetPhase = () => {
    setPhase("idle");
    setResultBalance(null);
  };

  const isBusy = phase !== "idle" && phase !== "success" && phase !== "failed";

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const h = d.getHours() % 12 || 12;
    const m = String(d.getMinutes()).padStart(2, "0");
    const p = d.getHours() < 12 ? "AM" : "PM";
    return `${d.getDate()} ${months[d.getMonth()]} · ${h}:${m} ${p}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="text-2xl font-black text-slate-900 mb-6">Wallet</h1>

        {/* Balance Card */}
        <div className="bg-brand rounded-2xl p-6 mb-6 text-white shadow-lg shadow-brand/20">
          <div className="flex items-center gap-2 mb-3 opacity-80">
            <Wallet className="w-5 h-5" />
            <span className="text-sm font-medium">Wallet Balance</span>
          </div>
          <p className="text-4xl font-black tracking-tight">₹{balance.toFixed(2)}</p>
        </div>

        {/* Add Funds */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6 relative overflow-hidden">
          {/* Processing Overlay */}
          {isBusy && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-brand animate-spin" />
              <p className="text-sm font-semibold text-slate-700">{PHASE_LABELS[phase]}</p>
            </div>
          )}

          {/* Success Overlay */}
          {phase === "success" && (
            <div className="absolute inset-0 bg-white z-10 flex flex-col items-center justify-center gap-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              <p className="text-sm font-bold text-emerald-700">Funds added successfully!</p>
              {resultBalance != null && (
                <p className="text-xs text-slate-500">New balance: ₹{resultBalance.toFixed(2)}</p>
              )}
              <button
                onClick={resetPhase}
                className="mt-2 px-5 py-2 bg-brand text-white rounded-lg text-sm font-semibold"
              >
                Done
              </button>
            </div>
          )}

          {/* Failed Overlay */}
          {phase === "failed" && (
            <div className="absolute inset-0 bg-white z-10 flex flex-col items-center justify-center gap-3">
              <XCircle className="w-10 h-10 text-red-400" />
              <p className="text-sm font-bold text-red-600">Payment could not be verified</p>
              <p className="text-xs text-slate-500">If money was deducted, it will be refunded automatically.</p>
              <button
                onClick={resetPhase}
                className="mt-2 px-5 py-2 bg-brand text-white rounded-lg text-sm font-semibold"
              >
                Try Again
              </button>
            </div>
          )}

          <h2 className="font-bold text-slate-800 mb-1">Add Funds</h2>
          <p className="text-xs text-slate-500 mb-4">Min ₹500 · Max ₹5,000</p>

          <div className="flex flex-wrap gap-2 mb-4">
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => setAmount(String(p))}
                disabled={isBusy}
                className="px-4 py-2 bg-emerald-50 text-brand border border-emerald-200 rounded-full text-sm font-semibold hover:bg-emerald-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ₹{p}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min="500"
              max="5000"
              disabled={isBusy}
              className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-brand focus:outline-none text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleAddFunds}
              disabled={isBusy || loading}
              className="px-6 py-3 bg-brand text-white rounded-xl font-bold text-sm hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[120px] justify-center"
            >
              {isBusy ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing
                </>
              ) : (
                "Add Money"
              )}
            </button>
          </div>
        </div>

        {/* Transactions */}
        {transactions.length > 0 && (
          <div>
            <h2 className="font-bold text-slate-800 mb-4">Transaction History</h2>
            <div className="space-y-2">
              {transactions.map((txn) => {
                const isCredit = txn.type === "credit";
                return (
                  <div
                    key={txn._id}
                    className="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-3"
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        isCredit ? "bg-emerald-50 text-brand" : "bg-red-50 text-red-500"
                      }`}
                    >
                      {isCredit ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-700 truncate">
                        {txn.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">{formatDate(txn.createdAt)}</span>
                        {txn.status !== "success" && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              txn.status === "pending"
                                ? "bg-amber-50 text-amber-600"
                                : "bg-red-50 text-red-500"
                            }`}
                          >
                            {txn.status.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`font-bold text-sm ${
                        txn.status === "failed"
                          ? "text-red-400"
                          : isCredit
                          ? "text-brand"
                          : "text-red-500"
                      }`}
                    >
                      {isCredit ? "+" : "-"}₹{txn.amount}
                    </span>
                  </div>
                );
              })}
            </div>

            {pagination?.hasMore && (
              <button
                onClick={() => fetchWallet((pagination?.currentPage ?? 1) + 1)}
                disabled={loading}
                className="mt-4 w-full py-2 text-brand font-semibold text-sm hover:underline disabled:opacity-50"
              >
                Load more
              </button>
            )}
          </div>
        )}

        {transactions.length === 0 && !loading && (
          <div className="text-center py-12">
            <Wallet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No transactions yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletPage;
