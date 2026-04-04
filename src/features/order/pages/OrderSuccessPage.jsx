import { useEffect, useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { CheckCircle2, Package, ShoppingBag, ArrowRight } from "lucide-react";
import { useOrder } from "../hooks/useOrder";
import OrderSummary from "../components/OrderSummary";
import OrderStatusBadge from "../components/OrderStatusBadge";
import { ORDER_ROUTES } from "../../../constants/order.constants";

const OrderSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { fetchOrder, loading } = useOrder();

  const [order, setOrder] = useState(null);

  // orderId can arrive via router state or return_url query param
  const orderId = location.state?.orderId || searchParams.get("order_id");

  useEffect(() => {
    if (!orderId) return;
    fetchOrder(orderId).then((o) => {
      if (o) setOrder(o);
    });
  }, [orderId, fetchOrder]);

  if (!orderId) {
    return (
      <Page>
        <p className="text-slate-500">Order not found.</p>
        <BackButton onClick={() => navigate(ORDER_ROUTES.ORDERS)}>
          My Orders
        </BackButton>
      </Page>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-10 px-4">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Success hero */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Top green strip */}
          <div className="bg-brand px-6 py-8 text-center text-white">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4 ring-4 ring-white/30">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-black">
              {location.state?.isCod ? "Order Placed!" : "Payment Successful!"}
            </h1>
            <p className="mt-1 text-emerald-100 text-sm">
              {location.state?.isCod
                ? "Your order has been confirmed."
                : "Your payment was confirmed and order is being prepared."}
            </p>
          </div>

          {/* Order meta */}
          <div className="px-6 py-5 space-y-3">
            {order ? (
              <>
                <MetaRow label="Order ID" value={`#${order.orderId}`} mono />
                <MetaRow
                  label="Status"
                  value={<OrderStatusBadge status={order.orderStatus} />}
                />
                <MetaRow
                  label="Payment"
                  value={
                    order.payment?.method === "cod"
                      ? "Cash on Delivery"
                      : order.payment?.method?.toUpperCase()
                  }
                />
                {order.expectedDeliveryDate && (
                  <MetaRow
                    label="Expected Delivery"
                    value={new Date(
                      order.expectedDeliveryDate,
                    ).toLocaleDateString("en-IN", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                    accent
                  />
                )}
              </>
            ) : loading ? (
              <div className="flex items-center gap-3 py-2">
                <div className="w-4 h-4 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                <span className="text-slate-500 text-sm">
                  Loading order details…
                </span>
              </div>
            ) : (
              <p className="text-slate-500 text-sm">Order ID: #{orderId}</p>
            )}
          </div>
        </div>

        {/* Order summary */}
        {order && (
          <OrderSummary
            items={order.items}
            itemsTotal={order.itemsTotal}
            mrpTotal={order.mrpTotal}
            savings={order.savings}
            deliveryCharge={order.deliveryCharge}
            totalAmount={order.totalAmount}
          />
        )}

        {/* CTA buttons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate(ORDER_ROUTES.ORDER_DETAIL(orderId))}
            className="w-full py-4 bg-brand text-white rounded-xl font-bold
              hover:bg-brand-dark transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-100"
          >
            <Package className="w-5 h-5" />
            Track Order
          </button>

          <button
            onClick={() => navigate("/products")}
            className="w-full py-3 bg-white border border-slate-200 text-slate-700 rounded-xl
              font-semibold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            Continue Shopping
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const Page = ({ children }) => (
  <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center space-y-4">
      {children}
    </div>
  </div>
);

const BackButton = ({ children, onClick }) => (
  <button
    onClick={onClick}
    className="px-6 py-2 bg-brand text-white rounded-xl font-semibold hover:bg-brand-dark transition-all"
  >
    {children}
  </button>
);

const MetaRow = ({ label, value, mono, accent }) => (
  <div className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
    <span className="text-sm text-slate-500">{label}</span>
    <span
      className={`text-sm font-semibold ${
        mono
          ? "font-mono text-slate-700"
          : accent
            ? "text-brand"
            : "text-slate-800"
      }`}
    >
      {value}
    </span>
  </div>
);

export default OrderSuccessPage;
