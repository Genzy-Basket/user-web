import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { useOrder } from "../hooks/useOrder";
import OrderCard from "../components/OrderCard";
import {
  ORDER_STATUS,
  ORDER_STATUS_LABEL,
  ORDER_ROUTES,
} from "../../../constants/order.constants";

const FILTER_TABS = [
  { key: "", label: "All" },
  {
    key: ORDER_STATUS.PENDING,
    label: ORDER_STATUS_LABEL[ORDER_STATUS.PENDING],
  },
  {
    key: ORDER_STATUS.CONFIRMED,
    label: ORDER_STATUS_LABEL[ORDER_STATUS.CONFIRMED],
  },
  { key: ORDER_STATUS.OUT_FOR_DELIVERY, label: "On the way" },
  {
    key: ORDER_STATUS.DELIVERED,
    label: ORDER_STATUS_LABEL[ORDER_STATUS.DELIVERED],
  },
  {
    key: ORDER_STATUS.CANCELLED,
    label: ORDER_STATUS_LABEL[ORDER_STATUS.CANCELLED],
  },
];

const OrdersListPage = () => {
  const navigate = useNavigate();
  const { orders, pagination, loading, error, fetchOrders, cancelOrder } =
    useOrder();

  const [activeTab, setActiveTab] = useState("");
  const [page, setPage] = useState(1);
  const [cancelTarget, setCancelTarget] = useState(null); // orderId being cancelled
  const [cancelReason, setCancelReason] = useState("");

  // Fetch whenever tab or page changes
  useEffect(() => {
    fetchOrders({ page, limit: 10, status: activeTab || undefined });
  }, [activeTab, page, fetchOrders]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    setPage(1);
  };

  const handleCancelConfirm = async () => {
    if (!cancelReason.trim()) return;
    await cancelOrder(cancelTarget, cancelReason.trim());
    setCancelTarget(null);
    setCancelReason("");
    fetchOrders({ page, limit: 10, status: activeTab || undefined });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-teal-50 to-cyan-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate("/products")}
            className="p-2 rounded-xl hover:bg-white/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h1 className="text-2xl font-black text-slate-900">My Orders</h1>
        </div>

        {/* Filter tabs — horizontal scroll with snap */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide snap-x snap-mandatory" style={{ WebkitOverflowScrolling: "touch" }}>
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`snap-start shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all border
                ${
                  activeTab === tab.key
                    ? "bg-brand text-white border-brand shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3 text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* Loading */}
        {loading && orders.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-brand" />
          </div>
        )}

        {/* Empty */}
        {!loading && orders.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h2 className="font-bold text-slate-700 text-lg">No orders yet</h2>
            <p className="text-slate-500 text-sm mt-1">
              {activeTab
                ? "No orders with this status."
                : "You haven't placed any orders yet."}
            </p>
            {!activeTab && (
              <button
                onClick={() => navigate("/products")}
                className="mt-6 px-6 py-2.5 bg-brand text-white rounded-xl font-semibold text-sm hover:bg-brand-dark transition-all"
              >
                Start Shopping
              </button>
            )}
          </div>
        )}

        {/* Order cards */}
        {orders.length > 0 && (
          <div className="space-y-3">
            {orders.map((order) => (
              <OrderCard
                key={order._id || order.orderId}
                order={order}
                onCancel={(id) => setCancelTarget(id)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              disabled={page === 1 || loading}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-semibold
                disabled:opacity-40 hover:bg-slate-50 transition-all"
            >
              Previous
            </button>
            <span className="text-sm text-slate-600 font-medium">
              {page} / {pagination.totalPages}
            </span>
            <button
              disabled={!pagination.hasMore || loading}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-semibold
                disabled:opacity-40 hover:bg-slate-50 transition-all"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Cancel modal */}
      {cancelTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <h3 className="font-bold text-slate-800 text-lg">Cancel Order?</h3>
            <p className="text-slate-500 text-sm mt-1 mb-4">
              Please tell us why you want to cancel.
            </p>
            <textarea
              className="w-full border border-slate-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
              rows={3}
              placeholder="Reason for cancellation…"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setCancelTarget(null);
                  setCancelReason("");
                }}
                className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm hover:bg-slate-200 transition-all"
              >
                Keep Order
              </button>
              <button
                disabled={!cancelReason.trim() || loading}
                onClick={handleCancelConfirm}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-semibold text-sm
                  hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersListPage;
