import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  CreditCard,
  Loader2,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { useOrder } from "../hooks/useOrder";
import OrderStatusBadge from "../components/OrderStatusBadge";
import OrderSummary from "../components/OrderSummary";
import {
  ORDER_PROGRESS_STEPS,
  ORDER_STATUS,
  CANCELLABLE_STATUSES,
  PAYMENT_METHOD_CONFIG,
  PAYMENT_STATUS_LABEL,
  ORDER_ROUTES,
} from "../../../constants/order.constants";

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { fetchOrder, cancelOrder, loading, error } = useOrder();

  const [order, setOrder] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    if (!orderId) return;
    fetchOrder(orderId).then((o) => {
      if (o) setOrder(o);
    });
  }, [orderId, fetchOrder]);

  const handleCancel = async () => {
    if (!cancelReason.trim()) return;
    const result = await cancelOrder(order.orderId, cancelReason.trim());
    if (result.success) {
      setOrder(result.order);
      setShowCancelModal(false);
      setCancelReason("");
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading && !order) {
    return (
      <Page>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-brand" />
        </div>
      </Page>
    );
  }

  // ── Error / not found ────────────────────────────────────────────────────
  if (!loading && !order) {
    return (
      <Page>
        <div className="bg-white rounded-2xl border border-red-100 p-10 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="font-bold text-slate-700">Order not found</p>
          {error && <p className="text-slate-500 text-sm mt-1">{error}</p>}
          <button
            onClick={() => navigate(ORDER_ROUTES.ORDERS)}
            className="mt-6 px-6 py-2.5 bg-brand text-white rounded-xl font-semibold text-sm hover:bg-brand-dark transition-all"
          >
            My Orders
          </button>
        </div>
      </Page>
    );
  }

  const isCancelled = [ORDER_STATUS.CANCELLED, ORDER_STATUS.REFUNDED].includes(
    order.orderStatus,
  );
  const canCancel = CANCELLABLE_STATUSES.includes(order.orderStatus);
  const methodConfig = PAYMENT_METHOD_CONFIG[order.payment?.method];

  return (
    <Page>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(ORDER_ROUTES.ORDERS)}
          className="p-2 rounded-xl hover:bg-white/80 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-xl font-black text-slate-900">Order Details</h1>
          <p className="text-xs text-slate-500 font-mono">#{order.orderId}</p>
        </div>
        <div className="ml-auto">
          <OrderStatusBadge status={order.orderStatus} />
        </div>
      </div>

      {/* Progress tracker */}
      {!isCancelled && <ProgressTracker currentStatus={order.orderStatus} />}

      {/* Cancelled banner */}
      {isCancelled && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex gap-3 items-start">
          <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-700 text-sm">
              Order{" "}
              {order.orderStatus === ORDER_STATUS.REFUNDED
                ? "Refunded"
                : "Cancelled"}
            </p>
            {order.cancellationReason && (
              <p className="text-red-500 text-xs mt-0.5">
                {order.cancellationReason}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Order summary (items + pricing) */}
      <OrderSummary
        items={order.items}
        itemsTotal={order.itemsTotal}
        mrpTotal={order.mrpTotal}
        savings={order.savings}
        deliveryCharge={order.deliveryCharge}
        totalAmount={order.totalAmount}
      />

      {/* Delivery address */}
      {order.deliveryAddress && (
        <section className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-brand" />
            Delivery Address
          </h3>
          <p className="text-sm text-slate-700">
            {order.deliveryAddress.houseOrFlat}, {order.deliveryAddress.street}
          </p>
          <p className="text-sm text-slate-500 mt-0.5">
            {order.deliveryAddress.area}, {order.deliveryAddress.pincode}
          </p>
        </section>
      )}

      {/* Payment info */}
      <section className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 mb-3">
          <CreditCard className="w-4 h-4 text-brand" />
          Payment Info
        </h3>
        <div className="space-y-2">
          <InfoRow
            label="Method"
            value={
              methodConfig
                ? `${methodConfig.icon}  ${methodConfig.label}`
                : order.payment?.method
            }
          />
          <InfoRow
            label="Status"
            value={
              PAYMENT_STATUS_LABEL[order.payment?.status] ||
              order.payment?.status
            }
          />
          {order.payment?.transactionId && (
            <InfoRow
              label="Transaction ID"
              value={order.payment.transactionId}
              mono
            />
          )}
          {order.payment?.paidAt && (
            <InfoRow
              label="Paid At"
              value={new Date(order.payment.paidAt).toLocaleString("en-IN")}
            />
          )}
        </div>
      </section>

      {/* Expected delivery */}
      {order.expectedDeliveryDate && !isCancelled && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-4">
          <p className="text-sm text-brand font-semibold">
            🕐 Expected Delivery:{" "}
            {new Date(order.expectedDeliveryDate).toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
      )}

      {/* Cancel CTA */}
      {canCancel && (
        <button
          onClick={() => setShowCancelModal(true)}
          className="w-full py-3 border-2 border-red-200 text-red-500 rounded-xl font-semibold text-sm
            hover:bg-red-50 transition-all"
        >
          Cancel Order
        </button>
      )}

      {/* Cancel modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <h3 className="font-bold text-slate-800 text-lg">Cancel Order?</h3>
            <p className="text-slate-500 text-sm mt-1 mb-4">
              Please tell us why you&apos;re cancelling.
            </p>
            <textarea
              className="w-full border border-slate-200 rounded-xl p-3 text-sm resize-none
                focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
              rows={3}
              placeholder="Reason for cancellation…"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason("");
                }}
                className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm hover:bg-slate-200 transition-all"
              >
                Keep It
              </button>
              <button
                disabled={!cancelReason.trim() || loading}
                onClick={handleCancel}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-semibold text-sm
                  hover:bg-red-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
};

// ── Progress tracker ──────────────────────────────────────────────────────────
const statusOrder = [
  "pending",
  "confirmed",
  "processing",
  "out_for_delivery",
  "delivered",
];

const ProgressTracker = ({ currentStatus }) => {
  const currentIdx = statusOrder.indexOf(currentStatus);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <h3 className="font-bold text-slate-800 text-sm mb-4">Order Progress</h3>
      <div className="relative">
        {/* connector line */}
        <div className="absolute top-3.5 left-3.5 right-3.5 h-0.5 bg-slate-100" />
        <div
          className="absolute top-3.5 left-3.5 h-0.5 bg-brand transition-all duration-500"
          style={{
            width:
              currentIdx <= 0
                ? "0%"
                : `${(Math.min(currentIdx, ORDER_PROGRESS_STEPS.length - 1) / (ORDER_PROGRESS_STEPS.length - 1)) * 100}%`,
          }}
        />

        <div className="relative flex justify-between">
          {ORDER_PROGRESS_STEPS.map((step, i) => {
            const stepIdx = statusOrder.indexOf(step.status);
            const done = currentIdx >= stepIdx;
            const active = currentIdx === stepIdx;

            return (
              <div
                key={step.status}
                className="flex flex-col items-center gap-1.5"
              >
                <div
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs transition-all
                    ${
                      done
                        ? "bg-brand border-brand text-white shadow-sm shadow-emerald-200"
                        : "bg-white border-slate-200 text-slate-400"
                    }
                    ${active ? "ring-4 ring-emerald-100" : ""}
                  `}
                >
                  {step.icon}
                </div>
                <span
                  className={`text-[10px] font-semibold text-center max-w-[52px] leading-tight
                    ${done ? "text-brand" : "text-slate-400"}`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ── Layout helpers ────────────────────────────────────────────────────────────
const Page = ({ children }) => (
  <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-8 px-4">
    <div className="max-w-2xl mx-auto space-y-4">{children}</div>
  </div>
);

const InfoRow = ({ label, value, mono }) => (
  <div className="flex items-center justify-between">
    <span className="text-xs text-slate-500">{label}</span>
    <span
      className={`text-xs font-semibold text-slate-700 ${mono ? "font-mono" : ""}`}
    >
      {value}
    </span>
  </div>
);

export default OrderDetailPage;
