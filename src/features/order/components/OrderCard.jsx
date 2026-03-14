import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Package, RefreshCw, Loader2 } from "lucide-react";
import OrderStatusBadge from "./OrderStatusBadge";
import {
  ORDER_ROUTES,
  CANCELLABLE_STATUSES,
  ORDER_STATUS,
} from "../../../constants/order.constants";
import { useCart } from "../../cart/hooks/useCart";

const REORDERABLE_STATUSES = [ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED, ORDER_STATUS.REFUNDED];

const OrderCard = ({ order, onCancel }) => {
  const navigate = useNavigate();

  const firstItem = order.items?.[0];
  const extraCount = (order.items?.length ?? 0) - 1;
  const firstName =
    firstItem?.productSnapshot?.name || firstItem?.product?.name || "Item";
  const firstImage =
    firstItem?.productSnapshot?.imageUrl || firstItem?.product?.imageUrl;

  const date = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const canCancel = CANCELLABLE_STATUSES.includes(order.orderStatus);
  const canReorder = REORDERABLE_STATUSES.includes(order.orderStatus);
  const { addItem } = useCart();
  const [reordering, setReordering] = useState(false);

  const handleReorder = async (e) => {
    e.stopPropagation();
    setReordering(true);
    try {
      for (const item of order.items) {
        const productId = item.productId?._id || item.productId;
        await addItem(productId, item.priceConfigId, item.quantity);
      }
      navigate("/cart");
    } catch {
      // error toasted by cart context
    } finally {
      setReordering(false);
    }
  };

  return (
    <div
      className="bg-white rounded-2xl border border-slate-200 p-4 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer"
      onClick={() => navigate(ORDER_ROUTES.ORDER_DETAIL(order.orderId))}
    >
      <div className="flex items-start gap-4">
        {/* Thumbnail */}
        <div className="w-14 h-14 rounded-xl bg-slate-100 flex-shrink-0 overflow-hidden">
          {firstImage ? (
            <img
              src={firstImage}
              alt={firstName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-6 h-6 text-slate-400" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-slate-800 text-sm truncate">
                {firstName}
                {extraCount > 0 && (
                  <span className="text-slate-500 font-normal">
                    {" "}
                    + {extraCount} more
                  </span>
                )}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">#{order.orderId}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
          </div>

          <div className="flex items-center justify-between mt-3">
            <OrderStatusBadge status={order.orderStatus} size="sm" />
            <span className="font-bold text-slate-900 text-sm">
              ₹{order.totalAmount?.toFixed(2)}
            </span>
          </div>

          <p className="text-[11px] text-slate-400 mt-2">{date}</p>
        </div>
      </div>

      {/* Action buttons */}
      {(canCancel || canReorder) && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-4">
          {canReorder && (
            <button
              onClick={handleReorder}
              disabled={reordering}
              className="text-xs font-semibold text-brand hover:text-brand-dark transition-colors flex items-center gap-1"
            >
              {reordering ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <RefreshCw className="w-3 h-3" />
              )}
              Reorder
            </button>
          )}
          {canCancel && onCancel && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCancel(order.orderId);
              }}
              className="text-xs font-semibold text-red-500 hover:text-red-600 transition-colors"
            >
              Cancel Order
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderCard;
