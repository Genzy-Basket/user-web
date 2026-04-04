import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Loader2, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { useOrder } from "../hooks/useOrder";
import { useCart } from "../../cart/hooks/useCart";
import { ORDER_ROUTES } from "../../../constants/order.constants";

const PHASE = {
  POLLING: "polling",
  SUCCESS: "success",
  FAILED: "failed",
  TIMEOUT: "timeout",
};

const PaymentProcessingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { pollOrderStatus, stopPolling } = useOrder();
  const { clearCart } = useCart();

  // orderId can come from URL param or router state
  const orderId = searchParams.get("app_order_id") || searchParams.get("order_id") || location.state?.orderId;

  const [phase, setPhase] = useState(PHASE.POLLING);
  const [attempt, setAttempt] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!orderId || startedRef.current) return;
    startedRef.current = true;

    pollOrderStatus(orderId, {
      onUpdate: () => {
        setAttempt((a) => a + 1);
      },
      onSuccess: async () => {
        setPhase(PHASE.SUCCESS);
        await clearCart();
        setTimeout(() => {
          navigate(ORDER_ROUTES.ORDER_SUCCESS, {
            state: { orderId },
          });
        }, 1500);
      },
      onFail: (data) => {
        setPhase(data?.timedOut ? PHASE.TIMEOUT : PHASE.FAILED);
      },
    });

    return () => { stopPolling(); startedRef.current = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  // ── No orderId — shouldn't happen but handle gracefully ─────────────────
  if (!orderId) {
    return (
      <CenteredCard>
        <XCircle className="w-14 h-14 text-red-400 mx-auto" />
        <h1 className="mt-4 text-xl font-bold text-slate-800">
          Invalid session
        </h1>
        <p className="text-slate-500 text-sm mt-2">
          Could not find your order.
        </p>
        <NavButton onClick={() => navigate(ORDER_ROUTES.ORDERS)}>
          My Orders
        </NavButton>
      </CenteredCard>
    );
  }

  // ── Polling ──────────────────────────────────────────────────────────────
  if (phase === PHASE.POLLING) {
    return (
      <CenteredCard>
        <div className="relative w-20 h-20 mx-auto">
          <div className="absolute inset-0 rounded-full border-4 border-emerald-100" />
          <div className="absolute inset-0 rounded-full border-4 border-brand border-t-transparent animate-spin" />
          <span className="absolute inset-0 flex items-center justify-center text-2xl">
            💳
          </span>
        </div>
        <h1 className="mt-6 text-xl font-bold text-slate-800">
          Confirming your payment
        </h1>
        <p className="text-slate-500 text-sm mt-2">
          Please don&apos;t close this window…
        </p>
        {attempt > 3 && (
          <p className="mt-4 text-xs text-slate-400">
            This is taking a moment. Hang tight.
          </p>
        )}
      </CenteredCard>
    );
  }

  // ── Success ──────────────────────────────────────────────────────────────
  if (phase === PHASE.SUCCESS) {
    return (
      <CenteredCard>
        <CheckCircle2 className="w-16 h-16 text-brand mx-auto" />
        <h1 className="mt-4 text-xl font-bold text-slate-800">
          Payment Confirmed!
        </h1>
        <p className="text-slate-500 text-sm mt-2">
          Redirecting to your order…
        </p>
      </CenteredCard>
    );
  }

  // ── Failed ───────────────────────────────────────────────────────────────
  if (phase === PHASE.FAILED) {
    return (
      <CenteredCard>
        <XCircle className="w-14 h-14 text-red-400 mx-auto" />
        <h1 className="mt-4 text-xl font-bold text-slate-800">
          Payment Failed
        </h1>
        <p className="text-slate-500 text-sm mt-2 max-w-xs mx-auto">
          Your payment could not be completed. No money was charged.
        </p>
        <NavButton onClick={() => navigate(ORDER_ROUTES.CHECKOUT)} primary>
          Try Again
        </NavButton>
        <NavButton onClick={() => navigate(ORDER_ROUTES.ORDERS)}>
          View Orders
        </NavButton>
      </CenteredCard>
    );
  }

  // ── Timeout ──────────────────────────────────────────────────────────────
  return (
    <CenteredCard>
      <div className="w-14 h-14 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center mx-auto">
        <RefreshCw className="w-7 h-7 text-amber-500" />
      </div>
      <h1 className="mt-4 text-xl font-bold text-slate-800">
        Still processing…
      </h1>
      <p className="text-slate-500 text-sm mt-2 max-w-xs mx-auto">
        We couldn&apos;t confirm your payment automatically. Check your order
        status — it may still succeed.
      </p>
      <NavButton
        onClick={() => navigate(ORDER_ROUTES.ORDER_DETAIL(orderId))}
        primary
      >
        Check Order Status
      </NavButton>
      <NavButton onClick={() => navigate(ORDER_ROUTES.ORDERS)}>
        My Orders
      </NavButton>
    </CenteredCard>
  );
};

// ── Layout helpers ────────────────────────────────────────────────────────────
const CenteredCard = ({ children }) => (
  <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-10 text-center max-w-sm w-full">
      {children}
    </div>
  </div>
);

const NavButton = ({ children, onClick, primary }) => (
  <button
    onClick={onClick}
    className={`mt-3 w-full py-3 rounded-xl font-semibold text-sm transition-all
      ${
        primary
          ? "bg-brand text-white hover:bg-brand-dark shadow-md shadow-emerald-100"
          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
      }`}
  >
    {children}
  </button>
);

export default PaymentProcessingPage;
