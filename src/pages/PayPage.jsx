import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Loader2, CheckCircle2, XCircle, ShieldCheck } from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const PHASE = {
  LOADING: "loading",
  READY: "ready",
  PAYING: "paying",
  VERIFYING: "verifying",
  SUCCESS: "success",
  FAILED: "failed",
  ERROR: "error",
  ALREADY_PAID: "already_paid",
};

const loadCashfreeSdk = () =>
  new Promise((resolve, reject) => {
    if (window.Cashfree) return resolve(window.Cashfree);
    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.onload = () => resolve(window.Cashfree);
    script.onerror = () => reject(new Error("Failed to load payment SDK"));
    document.head.appendChild(script);
  });

const PayPage = () => {
  const { cashfreeOrderId } = useParams();
  const [phase, setPhase] = useState(PHASE.LOADING);
  const [payData, setPayData] = useState(null);
  const [error, setError] = useState(null);
  const initRef = useRef(false);

  // Fetch payment session
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    (async () => {
      try {
        const { data } = await axios.get(`${API_URL}/pay/${cashfreeOrderId}`);
        if (!data.success) throw new Error(data.message);

        if (data.alreadyPaid) {
          setPhase(PHASE.ALREADY_PAID);
          return;
        }

        setPayData(data);
        setPhase(PHASE.READY);
      } catch (err) {
        setError(
          err.response?.data?.message || err.message || "Something went wrong",
        );
        setPhase(PHASE.ERROR);
      }
    })();
  }, [cashfreeOrderId]);

  const handlePay = async () => {
    if (!payData?.paymentSessionId) return;
    setPhase(PHASE.PAYING);

    try {
      const Cashfree = await loadCashfreeSdk();
      const cashfree = Cashfree({
        mode:
          import.meta.env.VITE_CASHFREE_ENV === "production"
            ? "production"
            : "sandbox",
      });

      cashfree.checkout({
        paymentSessionId: payData.paymentSessionId,
        redirectTarget: "_self",
        returnUrl: `${window.location.origin}/pay/${cashfreeOrderId}`,
      });
    } catch {
      setError("Failed to open payment. Please try again.");
      setPhase(PHASE.READY);
    }
  };

  // On return from Cashfree redirect, verify payment
  useEffect(() => {
    if (phase !== PHASE.READY || !payData) return;

    const params = new URLSearchParams(window.location.search);
    if (!params.has("order_id")) return;

    // Cashfree redirected back — verify
    setPhase(PHASE.VERIFYING);
    (async () => {
      try {
        const { data } = await axios.post(
          `${API_URL}/pay/${cashfreeOrderId}/verify`,
          {},
        );
        if (data.paid) {
          setPhase(PHASE.SUCCESS);
        } else {
          setError("Payment was not completed. Please try again.");
          setPhase(PHASE.FAILED);
        }
      } catch {
        setError(
          "Could not verify payment. Please check with the delivery person.",
        );
        setPhase(PHASE.FAILED);
      }
    })();
  }, [phase, payData, cashfreeOrderId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center max-w-sm w-full">
        {/* Loading */}
        {phase === PHASE.LOADING && (
          <>
            <Loader2 className="w-12 h-12 text-emerald-500 mx-auto animate-spin" />
            <p className="text-slate-500 text-sm mt-4">Loading payment…</p>
          </>
        )}

        {/* Ready to pay */}
        {phase === PHASE.READY && payData && (
          <>
            <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mx-auto">
              <span className="text-3xl">💳</span>
            </div>
            <p className="text-slate-500 text-sm mt-4">
              Order #{payData.orderId}
            </p>
            <h1 className="text-3xl font-black text-slate-800 mt-1">
              ₹{payData.amount?.toFixed(0)}
            </h1>
            <p className="text-slate-400 text-xs mt-1 mb-6">
              Pay online for your order
            </p>
            <button
              onClick={handlePay}
              className="w-full py-3.5 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-100 transition-all text-base"
            >
              Pay Now
            </button>
            <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs mt-4">
              <ShieldCheck className="w-4 h-4" />
              <span>Secured by Cashfree Payments</span>
            </div>
          </>
        )}

        {/* Paying / Verifying */}
        {(phase === PHASE.PAYING || phase === PHASE.VERIFYING) && (
          <>
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-100" />
              <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
              <span className="absolute inset-0 flex items-center justify-center text-2xl">
                💳
              </span>
            </div>
            <h2 className="mt-4 text-lg font-bold text-slate-800">
              {phase === PHASE.VERIFYING
                ? "Verifying payment…"
                : "Opening payment…"}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Please don&apos;t close this page
            </p>
          </>
        )}

        {/* Success */}
        {phase === PHASE.SUCCESS && (
          <>
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
            <h1 className="mt-4 text-xl font-bold text-slate-800">
              Payment Successful!
            </h1>
            <p className="text-slate-500 text-sm mt-2">
              Thank you! Your payment has been received.
            </p>
            <p className="text-slate-400 text-xs mt-1">
              You can close this page now.
            </p>
          </>
        )}

        {/* Already paid */}
        {phase === PHASE.ALREADY_PAID && (
          <>
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
            <h1 className="mt-4 text-xl font-bold text-slate-800">
              Already Paid
            </h1>
            <p className="text-slate-500 text-sm mt-2">
              This order has already been paid. No action needed.
            </p>
          </>
        )}

        {/* Failed */}
        {phase === PHASE.FAILED && (
          <>
            <XCircle className="w-14 h-14 text-red-400 mx-auto" />
            <h1 className="mt-4 text-xl font-bold text-slate-800">
              Payment Failed
            </h1>
            <p className="text-slate-500 text-sm mt-2">{error}</p>
            <button
              onClick={() => {
                setError(null);
                setPhase(PHASE.READY);
              }}
              className="mt-4 w-full py-3 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all"
            >
              Try Again
            </button>
          </>
        )}

        {/* Error */}
        {phase === PHASE.ERROR && (
          <>
            <XCircle className="w-14 h-14 text-red-400 mx-auto" />
            <h1 className="mt-4 text-xl font-bold text-slate-800">
              Something went wrong
            </h1>
            <p className="text-slate-500 text-sm mt-2">
              {error || "This payment link may be invalid or expired."}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default PayPage;
