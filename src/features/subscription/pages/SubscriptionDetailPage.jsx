import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  Pause,
  Play,
  X,
  SkipForward,
  Loader2,
  CalendarDays,
} from "lucide-react";
import { useSubscription } from "../hooks/useSubscription";

const STATUS_STYLES = {
  active: { bg: "bg-emerald-50", text: "text-brand", dot: "bg-brand", label: "ACTIVE" },
  paused: { bg: "bg-amber-50", text: "text-amber-600", dot: "bg-amber-500", label: "PAUSED" },
  cancelled: { bg: "bg-red-50", text: "text-red-500", dot: "bg-red-500", label: "CANCELLED" },
  completed: { bg: "bg-slate-50", text: "text-slate-500", dot: "bg-slate-400", label: "COMPLETED" },
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return `${DAYS[d.getDay() === 0 ? 6 : d.getDay() - 1]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
};

const dotColor = (status) => {
  switch (status) {
    case "delivered": return "bg-brand";
    case "skipped": return "bg-amber-500";
    case "upcoming": return "bg-blue-500";
    default: return "bg-slate-400";
  }
};

const dotTextColor = (status) => {
  switch (status) {
    case "delivered": return "text-brand";
    case "skipped": return "text-amber-600";
    case "upcoming": return "text-blue-600";
    default: return "text-slate-500";
  }
};

const dotBg = (status) => {
  switch (status) {
    case "delivered": return "bg-emerald-50";
    case "skipped": return "bg-amber-50";
    case "upcoming": return "bg-blue-50";
    default: return "bg-slate-50";
  }
};

const SubscriptionDetailPage = () => {
  const { subscriptionId } = useParams();
  const navigate = useNavigate();
  const {
    subscriptions,
    loading,
    fetchSubscriptions,
    pauseSubscription,
    resumeSubscription,
    cancelSubscription,
    skipDate,
  } = useSubscription();

  const [skipModal, setSkipModal] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    if (subscriptions.length === 0) fetchSubscriptions();
  }, [subscriptions.length, fetchSubscriptions]);

  const sub = subscriptions.find(
    (s) => s.subscriptionId === subscriptionId || s._id === subscriptionId,
  );

  if (loading && !sub) {
    return (
      <Page>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-brand" />
        </div>
      </Page>
    );
  }

  if (!sub) {
    return (
      <Page>
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
          <p className="text-slate-500 font-medium">Subscription not found</p>
          <button
            onClick={() => navigate("/subscriptions")}
            className="mt-4 px-6 py-2.5 bg-brand text-white rounded-xl font-semibold text-sm"
          >
            Back to Subscriptions
          </button>
        </div>
      </Page>
    );
  }

  const status = STATUS_STYLES[sub.status] || STATUS_STYLES.active;
  const deliveredCount = sub.deliveryDates?.filter((d) => d.status === "delivered").length ?? 0;
  const skippedCount = sub.deliveryDates?.filter((d) => d.status === "skipped").length ?? 0;
  const totalDays = sub.totalDays ?? 0;
  const progress = totalDays > 0 ? ((deliveredCount + skippedCount) / totalDays) * 100 : 0;
  const upcomingDates = sub.deliveryDates?.filter((d) => d.status === "upcoming") ?? [];

  const handlePause = async () => {
    await pauseSubscription(sub.subscriptionId);
  };

  const handleResume = async () => {
    await resumeSubscription(sub.subscriptionId);
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) return;
    await cancelSubscription(sub.subscriptionId, cancelReason.trim());
    setCancelModal(false);
    setCancelReason("");
  };

  const handleSkip = async (date) => {
    await skipDate(sub.subscriptionId, date.split("T")[0]);
    setSkipModal(false);
  };

  return (
    <Page>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/subscriptions")}
          className="p-2 rounded-xl hover:bg-white/80 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <h1 className="text-xl font-black text-slate-900">Subscription</h1>
      </div>

      {/* Status + Progress Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${status.bg} ${status.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </span>
          <span className="text-xs text-slate-400 font-medium">{sub.subscriptionId}</span>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span>{deliveredCount} delivered, {skippedCount} skipped / {totalDays} days</span>
          <span className="font-semibold text-slate-600">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
          <div className="h-full bg-brand rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>

        {/* Cost chips */}
        <div className="grid grid-cols-3 gap-3">
          <InfoChip label="Daily" value={`₹${sub.dailyCost}`} />
          <InfoChip label="Total" value={`₹${sub.totalAmount}`} />
          <InfoChip label="Days" value={`${totalDays}`} />
        </div>
      </div>

      {/* Items */}
      <h3 className="font-black text-slate-900 text-sm mb-2">Items</h3>
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4">
        {sub.items?.map((item, i) => (
          <div key={i} className="flex items-center gap-3 py-2">
            {item.productSnapshot?.imageUrl ? (
              <img
                src={item.productSnapshot.imageUrl}
                alt={item.productSnapshot.name}
                className="w-11 h-11 rounded-lg object-cover"
              />
            ) : (
              <div className="w-11 h-11 rounded-lg bg-slate-100 flex items-center justify-center">
                <Package className="w-5 h-5 text-slate-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-700">{item.productSnapshot?.name}</p>
              <p className="text-xs text-slate-400">{item.displayLabel} × {item.quantity}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Delivery Schedule */}
      <h3 className="font-black text-slate-900 text-sm mb-2">Delivery Schedule</h3>
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4">
        <div className="space-y-1">
          {sub.deliveryDates?.map((dd, i) => (
            <div key={i} className="flex items-center gap-3 py-1.5">
              <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor(dd.status)}`} />
              <span className="flex-1 text-sm font-medium text-slate-700">
                {formatDate(dd.date)}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${dotBg(dd.status)} ${dotTextColor(dd.status)}`}>
                {dd.status.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      {sub.status === "active" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <ActionButton
              icon={SkipForward}
              label="Skip Date"
              color="amber"
              onClick={() => setSkipModal(true)}
              disabled={loading || upcomingDates.length === 0}
            />
            <ActionButton
              icon={Pause}
              label="Pause"
              color="amber"
              onClick={handlePause}
              disabled={loading}
            />
          </div>
          <ActionButton
            icon={X}
            label="Cancel Subscription"
            color="red"
            onClick={() => setCancelModal(true)}
            disabled={loading}
            full
          />
        </div>
      )}

      {sub.status === "paused" && (
        <div className="grid grid-cols-2 gap-3">
          <ActionButton
            icon={Play}
            label="Resume"
            color="green"
            onClick={handleResume}
            disabled={loading}
          />
          <ActionButton
            icon={X}
            label="Cancel"
            color="red"
            onClick={() => setCancelModal(true)}
            disabled={loading}
          />
        </div>
      )}

      {/* Skip Date Modal */}
      {skipModal && (
        <Modal onClose={() => setSkipModal(false)}>
          <h3 className="font-bold text-slate-800 text-lg">Skip a Delivery</h3>
          <p className="text-slate-500 text-sm mt-1 mb-4">Select a date to skip. You'll get a refund for that day.</p>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {upcomingDates.map((d) => (
              <button
                key={d.date}
                onClick={() => handleSkip(d.date)}
                disabled={loading}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 hover:border-brand hover:bg-emerald-50 transition-all text-left disabled:opacity-50"
              >
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-700">{formatDate(d.date)}</span>
                </div>
                <SkipForward className="w-4 h-4 text-slate-400" />
              </button>
            ))}
          </div>
          <button
            onClick={() => setSkipModal(false)}
            className="mt-4 w-full py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm hover:bg-slate-200 transition-all"
          >
            Close
          </button>
        </Modal>
      )}

      {/* Cancel Modal */}
      {cancelModal && (
        <Modal onClose={() => { setCancelModal(false); setCancelReason(""); }}>
          <h3 className="font-bold text-slate-800 text-lg">Cancel Subscription?</h3>
          <p className="text-slate-500 text-sm mt-1 mb-4">Remaining days will be refunded to your wallet.</p>
          <textarea
            className="w-full border border-slate-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
            rows={3}
            placeholder="Reason for cancellation..."
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => { setCancelModal(false); setCancelReason(""); }}
              className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm hover:bg-slate-200 transition-all"
            >
              Keep It
            </button>
            <button
              disabled={!cancelReason.trim() || loading}
              onClick={handleCancel}
              className="flex-1 py-3 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Cancel
            </button>
          </div>
        </Modal>
      )}
    </Page>
  );
};

// ── Helpers ──

const Page = ({ children }) => (
  <div className="min-h-screen bg-linear-to-br from-emerald-50 via-teal-50 to-cyan-50 py-8 px-4">
    <div className="max-w-2xl mx-auto space-y-0">{children}</div>
  </div>
);

const InfoChip = ({ label, value }) => (
  <div className="bg-slate-50 border border-slate-100 rounded-xl py-2.5 text-center">
    <p className="text-[11px] text-slate-400">{label}</p>
    <p className="text-sm font-bold text-slate-800">{value}</p>
  </div>
);

const colorMap = {
  amber: "text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100",
  red: "text-red-500 bg-red-50 border-red-200 hover:bg-red-100",
  green: "text-brand bg-emerald-50 border-emerald-200 hover:bg-emerald-100",
};

const ActionButton = ({ icon: Icon, label, color, onClick, disabled, full }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-semibold text-sm transition-all disabled:opacity-50 ${colorMap[color]} ${full ? "w-full" : ""}`}
  >
    <Icon className="w-4 h-4" />
    {label}
  </button>
);

const Modal = ({ children, onClose }) => (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
      {children}
    </div>
  </div>
);

export default SubscriptionDetailPage;
