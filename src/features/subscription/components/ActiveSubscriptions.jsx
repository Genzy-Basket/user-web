import { useState } from "react";
import { CalendarCheck, Package, Pause, Play, X, Loader2, SkipForward } from "lucide-react";
import { useSubscription } from "../hooks/useSubscription";

const STATUS_STYLES = {
  active: { bg: "bg-emerald-50", text: "text-brand", dot: "bg-brand", label: "Active" },
  paused: { bg: "bg-amber-50", text: "text-amber-600", dot: "bg-amber-500", label: "Paused" },
  cancelled: { bg: "bg-red-50", text: "text-red-500", dot: "bg-red-500", label: "Cancelled" },
  completed: { bg: "bg-slate-50", text: "text-slate-500", dot: "bg-slate-400", label: "Completed" },
};

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

const ActiveSubscriptions = ({ onNewSubscription }) => {
  const {
    subscriptions,
    loading,
    pauseSubscription,
    resumeSubscription,
    cancelSubscription,
    skipDate,
  } = useSubscription();

  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [skipTarget, setSkipTarget] = useState(null); // { subscriptionId, dates[] }

  const handlePause = async (subscriptionId) => {
    await pauseSubscription(subscriptionId);
  };

  const handleResume = async (subscriptionId) => {
    await resumeSubscription(subscriptionId);
  };

  const handleCancelConfirm = async () => {
    if (!cancelReason.trim()) return;
    await cancelSubscription(cancelTarget, cancelReason.trim());
    setCancelTarget(null);
    setCancelReason("");
  };

  const handleSkipDate = async (subscriptionId, date) => {
    await skipDate(subscriptionId, date);
    setSkipTarget(null);
  };

  if (loading && subscriptions.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
          <CalendarCheck className="w-8 h-8 text-brand" />
        </div>
        <h2 className="font-bold text-slate-700 text-lg">No active subscriptions</h2>
        <p className="text-slate-500 text-sm mt-1 mb-6">
          Subscribe to daily essentials like milk, curd & coconut
        </p>
        <button
          type="button"
          onClick={onNewSubscription}
          className="px-6 py-2.5 bg-brand text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-all"
        >
          Create Subscription
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {subscriptions.map((sub) => {
          const status = STATUS_STYLES[sub.status] || STATUS_STYLES.active;
          const deliveredCount =
            sub.deliveryDates?.filter((d) => d.status === "delivered").length ?? 0;
          const skippedCount =
            sub.deliveryDates?.filter((d) => d.status === "skipped").length ?? 0;
          const totalDays = sub.totalDays ?? 0;
          const upcomingDates =
            sub.deliveryDates?.filter((d) => d.status === "upcoming") ?? [];
          const nextDelivery = upcomingDates[0]?.date;

          return (
            <div
              key={sub._id || sub.subscriptionId}
              className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-all"
            >
              {/* Header row */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${status.bg} ${status.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                    {status.label}
                  </span>
                  {nextDelivery && sub.status === "active" && (
                    <span className="text-xs text-slate-400">
                      Next: {formatDate(nextDelivery)}
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-400 font-medium">
                  {sub.subscriptionId}
                </span>
              </div>

              {/* Items */}
              <div className="flex flex-wrap gap-2 mb-3">
                {sub.items?.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-1.5">
                    {item.productSnapshot?.imageUrl ? (
                      <img src={item.productSnapshot.imageUrl} alt={item.productSnapshot.name} className="w-6 h-6 rounded object-cover" />
                    ) : (
                      <Package className="w-4 h-4 text-slate-400" />
                    )}
                    <span className="text-sm font-medium text-slate-700">
                      {item.productSnapshot?.name}
                    </span>
                    <span className="text-xs text-slate-400">
                      {item.displayLabel} x{item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                  <span>
                    {deliveredCount} delivered
                    {skippedCount > 0 && ` · ${skippedCount} skipped`}
                  </span>
                  <span>{upcomingDates.length} remaining</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand rounded-full transition-all"
                    style={{ width: `${totalDays > 0 ? ((deliveredCount + skippedCount) / totalDays) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="text-sm">
                  <span className="font-bold text-slate-800">₹{sub.dailyCost}/day</span>
                  <span className="text-slate-400 mx-1.5">·</span>
                  <span className="text-slate-500">₹{sub.totalAmount} total</span>
                </div>

                {(sub.status === "active" || sub.status === "paused") && (
                  <div className="flex items-center gap-2">
                    {sub.status === "active" && upcomingDates.length > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          setSkipTarget({
                            subscriptionId: sub.subscriptionId,
                            dates: upcomingDates,
                          })
                        }
                        disabled={loading}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <SkipForward className="w-3 h-3" />
                        Skip
                      </button>
                    )}
                    {sub.status === "active" && (
                      <button
                        type="button"
                        onClick={() => handlePause(sub.subscriptionId)}
                        disabled={loading}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
                      >
                        <Pause className="w-3 h-3" />
                        Pause
                      </button>
                    )}
                    {sub.status === "paused" && (
                      <button
                        type="button"
                        onClick={() => handleResume(sub.subscriptionId)}
                        disabled={loading}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-brand bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                      >
                        <Play className="w-3 h-3" />
                        Resume
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setCancelTarget(sub.subscriptionId)}
                      disabled={loading}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <X className="w-3 h-3" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Skip date modal */}
      {skipTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <h3 className="font-bold text-slate-800 text-lg">Skip a Delivery</h3>
            <p className="text-slate-500 text-sm mt-1 mb-4">
              Select a date to skip. You'll get a refund for that day.
            </p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {skipTarget.dates.map((d) => (
                <button
                  key={d.date}
                  type="button"
                  onClick={() => handleSkipDate(skipTarget.subscriptionId, d.date.split("T")[0])}
                  disabled={loading}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 hover:border-brand hover:bg-emerald-50 transition-all text-left disabled:opacity-50"
                >
                  <span className="text-sm font-medium text-slate-700">
                    {formatDate(d.date)}
                  </span>
                  <SkipForward className="w-4 h-4 text-slate-400" />
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setSkipTarget(null)}
              className="mt-4 w-full py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm hover:bg-slate-200 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Cancel modal */}
      {cancelTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <h3 className="font-bold text-slate-800 text-lg">Cancel Subscription?</h3>
            <p className="text-slate-500 text-sm mt-1 mb-4">
              Remaining days will be refunded to your wallet.
            </p>
            <textarea
              className="w-full border border-slate-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
              rows={3}
              placeholder="Reason for cancellation..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={() => {
                  setCancelTarget(null);
                  setCancelReason("");
                }}
                className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm hover:bg-slate-200 transition-all"
              >
                Keep It
              </button>
              <button
                type="button"
                disabled={!cancelReason.trim() || loading}
                onClick={handleCancelConfirm}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-semibold text-sm
                  hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ActiveSubscriptions;
