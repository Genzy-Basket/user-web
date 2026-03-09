import { useDeliveryConfig } from "../../delivery/context/DeliveryConfigContext";

/**
 * Reusable order pricing card.
 *
 * Props:
 *   items        - array of order items (from cart or saved order)
 *   itemsTotal   - number
 *   mrpTotal     - number
 *   savings      - number
 *   deliveryCharge - number (optional, computed if omitted)
 *   totalAmount  - number
 *   compact      - boolean — hides item list, shows only totals
 */
const OrderSummary = ({
  items = [],
  itemsTotal = 0,
  mrpTotal = 0,
  savings = 0,
  deliveryCharge,
  totalAmount = 0,
  compact = false,
}) => {
  const { deliveryCharge: deliveryRate, freeDeliveryThreshold } = useDeliveryConfig();

  const charge =
    deliveryCharge !== undefined
      ? deliveryCharge
      : itemsTotal >= freeDeliveryThreshold
        ? 0
        : deliveryRate;

  const amountToFreeDelivery = freeDeliveryThreshold - itemsTotal;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
        <h3 className="font-bold text-slate-800">Order Summary</h3>
        {!compact && items.length > 0 && (
          <p className="text-xs text-slate-500 mt-0.5">
            {items.length} {items.length === 1 ? "item" : "items"}
          </p>
        )}
      </div>

      {/* Items list */}
      {!compact && items.length > 0 && (
        <ul className="divide-y divide-slate-50 px-5">
          {items.map((item) => {
            const name =
              item.productSnapshot?.name || item.product?.name || "Product";
            const image =
              item.productSnapshot?.imageUrl || item.product?.imageUrl;

            return (
              <li key={item._id} className="flex items-center gap-3 py-3">
                {image && (
                  <img
                    src={image}
                    alt={name}
                    className="w-10 h-10 rounded-lg object-cover bg-slate-100 flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {item.value} {item.unit} × {item.quantity}
                  </p>
                </div>
                <span className="text-sm font-semibold text-slate-800 flex-shrink-0">
                  ₹{item.totalPrice.toFixed(2)}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {/* Pricing breakdown */}
      <div className="px-5 py-4 space-y-3 border-t border-slate-100">
        <Row label="Subtotal (MRP)" value={`₹${mrpTotal.toFixed(2)}`} muted />

        {savings > 0 && (
          <Row
            label="Discount"
            value={`−₹${savings.toFixed(2)}`}
            accent="text-brand"
          />
        )}

        <Row
          label="Delivery"
          value={charge === 0 ? "FREE" : `₹${charge.toFixed(2)}`}
          accent={charge === 0 ? "text-brand" : undefined}
        />

        {/* Free delivery nudge */}
        {charge > 0 && amountToFreeDelivery > 0 && (
          <p className="text-[11px] text-amber-600 bg-amber-50 rounded-lg px-3 py-2 font-medium">
            Add ₹{amountToFreeDelivery.toFixed(0)} more for free delivery
          </p>
        )}

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="font-bold text-slate-800">Total</span>
          <span className="text-xl font-black text-slate-900">
            ₹{totalAmount.toFixed(2)}
          </span>
        </div>

        {savings > 0 && (
          <p className="text-[11px] text-brand font-semibold text-center">
            🎉 You save ₹{savings.toFixed(2)} on this order
          </p>
        )}
      </div>
    </div>
  );
};

// ── Internal helper ───────────────────────────────────────────────────────────
const Row = ({ label, value, muted, accent }) => (
  <div className="flex items-center justify-between">
    <span className={`text-sm ${muted ? "text-slate-400" : "text-slate-600"}`}>
      {label}
    </span>
    <span
      className={`text-sm font-semibold ${
        accent || (muted ? "text-slate-400 line-through" : "text-slate-800")
      }`}
    >
      {value}
    </span>
  </div>
);

export default OrderSummary;
