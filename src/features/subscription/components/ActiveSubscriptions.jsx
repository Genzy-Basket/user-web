import { useNavigate } from "react-router-dom";
import { CalendarCheck, Package, Loader2, Calendar, ChevronRight } from "lucide-react";
import { useSubscription } from "../hooks/useSubscription";

const STATUS_STYLES = {
  active: { bg: "bg-emerald-50", text: "text-brand", dot: "bg-brand", label: "ACTIVE" },
  paused: { bg: "bg-amber-50", text: "text-amber-600", dot: "bg-amber-500", label: "PAUSED" },
  cancelled: { bg: "bg-red-50", text: "text-red-500", dot: "bg-red-500", label: "CANCELLED" },
  completed: { bg: "bg-slate-50", text: "text-slate-500", dot: "bg-slate-400", label: "COMPLETED" },
};

const formatShortDate = (dateStr) => {
  const d = new Date(dateStr);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${d.getDate()} ${months[d.getMonth()]}`;
};

const ActiveSubscriptions = ({ onNewSubscription }) => {
  const { subscriptions, loading } = useSubscription();
  const navigate = useNavigate();

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
        <h2 className="font-bold text-slate-700 text-lg">No subscriptions yet</h2>
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
    <div className="space-y-3">
      {subscriptions.map((sub) => {
        const status = STATUS_STYLES[sub.status] || STATUS_STYLES.active;
        const deliveredCount = sub.deliveryDates?.filter((d) => d.status === "delivered").length ?? 0;
        const skippedCount = sub.deliveryDates?.filter((d) => d.status === "skipped").length ?? 0;
        const totalDays = sub.totalDays ?? 0;
        const progress = totalDays > 0 ? ((deliveredCount + skippedCount) / totalDays) * 100 : 0;
        const upcomingDates = sub.deliveryDates?.filter((d) => d.status === "upcoming") ?? [];
        const nextDelivery = upcomingDates[0]?.date;

        return (
          <div
            key={sub._id || sub.subscriptionId}
            className="bg-white rounded-2xl border border-slate-100 p-4 hover:shadow-md transition-all cursor-pointer"
            onClick={() => navigate(`/subscriptions/${sub.subscriptionId}`)}
          >
            {/* Header: status badge + subscription ID */}
            <div className="flex items-center justify-between mb-2">
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold ${status.bg} ${status.text}`}>
                {status.label}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                {sub.subscriptionId}
              </span>
            </div>

            {/* Next delivery */}
            {nextDelivery && sub.status === "active" && (
              <div className="flex items-center gap-1 mb-3">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs text-slate-500 font-medium">
                  Next delivery: {formatShortDate(nextDelivery)}
                </span>
              </div>
            )}

            {/* Items — rows with images like the app */}
            <div className="mb-3 space-y-2">
              {sub.items?.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  {item.productSnapshot?.imageUrl ? (
                    <img
                      src={item.productSnapshot.imageUrl}
                      alt={item.productSnapshot?.name}
                      className="w-10 h-10 rounded-lg object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      <Package className="w-4 h-4 text-slate-400" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate">
                      {item.productSnapshot?.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {item.displayLabel} × {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span>
                  {deliveredCount} delivered, {skippedCount} skipped / {totalDays} days
                </span>
                <span className="font-semibold text-slate-500">{Math.round(progress)}%</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Cost row */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-500 font-medium">
                Daily: ₹{sub.dailyCost}
              </span>
              <span className="text-sm text-slate-800 font-bold">
                Total: ₹{sub.totalAmount}
              </span>
            </div>

            {/* View Details link */}
            <div className="border-t border-slate-100 pt-2.5">
              <div className="flex items-center justify-center gap-1 text-brand text-sm font-semibold">
                View Details
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ActiveSubscriptions;
