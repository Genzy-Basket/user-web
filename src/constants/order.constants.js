// ─────────────────────────────────────────────────────────────────────────────
// Order & Payment constants
// Keep every magic string here so the backend enums and frontend UI stay in sync
// ─────────────────────────────────────────────────────────────────────────────

// ── Order status ─────────────────────────────────────────────────────────────
export const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PROCESSING: "processing",
  PACKED: "packed",
  OUT_FOR_DELIVERY: "out_for_delivery",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
};

export const ORDER_STATUS_LABEL = {
  [ORDER_STATUS.PENDING]: "Pending",
  [ORDER_STATUS.CONFIRMED]: "Confirmed",
  [ORDER_STATUS.PROCESSING]: "Processing",
  [ORDER_STATUS.PACKED]: "Packed",
  [ORDER_STATUS.OUT_FOR_DELIVERY]: "Out for Delivery",
  [ORDER_STATUS.DELIVERED]: "Delivered",
  [ORDER_STATUS.CANCELLED]: "Cancelled",
  [ORDER_STATUS.REFUNDED]: "Refunded",
};

// Tailwind colour tokens per status (bg + text)
export const ORDER_STATUS_STYLE = {
  [ORDER_STATUS.PENDING]: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-400",
  },
  [ORDER_STATUS.CONFIRMED]: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-400",
  },
  [ORDER_STATUS.PROCESSING]: {
    bg: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-200",
    dot: "bg-violet-400",
  },
  [ORDER_STATUS.PACKED]: {
    bg: "bg-teal-50",
    text: "text-teal-700",
    border: "border-teal-200",
    dot: "bg-teal-500",
  },
  [ORDER_STATUS.OUT_FOR_DELIVERY]: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    dot: "bg-orange-400",
  },
  [ORDER_STATUS.DELIVERED]: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  [ORDER_STATUS.CANCELLED]: {
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-200",
    dot: "bg-red-400",
  },
  [ORDER_STATUS.REFUNDED]: {
    bg: "bg-slate-50",
    text: "text-slate-600",
    border: "border-slate-200",
    dot: "bg-slate-400",
  },
};

// Steps shown in the order tracker (only active statuses)
export const ORDER_PROGRESS_STEPS = [
  { status: ORDER_STATUS.CONFIRMED, label: "Confirmed", icon: "✓" },
  { status: ORDER_STATUS.PROCESSING, label: "Processing", icon: "⚙" },
  { status: ORDER_STATUS.PACKED, label: "Packed", icon: "📦" },
  { status: ORDER_STATUS.OUT_FOR_DELIVERY, label: "On the way", icon: "🛵" },
  { status: ORDER_STATUS.DELIVERED, label: "Delivered", icon: "🏠" },
];

// Statuses that allow cancellation (mirrors backend canCancel())
export const CANCELLABLE_STATUSES = [
  ORDER_STATUS.PENDING,
  ORDER_STATUS.CONFIRMED,
];

// ── Payment status ────────────────────────────────────────────────────────────
export const PAYMENT_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  SUCCESS: "success",
  FAILED: "failed",
  REFUNDED: "refunded",
};

export const PAYMENT_STATUS_LABEL = {
  [PAYMENT_STATUS.PENDING]: "Awaiting Payment",
  [PAYMENT_STATUS.PROCESSING]: "Processing",
  [PAYMENT_STATUS.SUCCESS]: "Paid",
  [PAYMENT_STATUS.FAILED]: "Failed",
  [PAYMENT_STATUS.REFUNDED]: "Refunded",
};

export const PAYMENT_STATUS_STYLE = {
  [PAYMENT_STATUS.PENDING]: { bg: "bg-amber-50", text: "text-amber-700" },
  [PAYMENT_STATUS.PROCESSING]: { bg: "bg-blue-50", text: "text-blue-700" },
  [PAYMENT_STATUS.SUCCESS]: { bg: "bg-emerald-50", text: "text-emerald-700" },
  [PAYMENT_STATUS.FAILED]: { bg: "bg-red-50", text: "text-red-600" },
  [PAYMENT_STATUS.REFUNDED]: { bg: "bg-slate-50", text: "text-slate-600" },
};

// ── Payment methods ───────────────────────────────────────────────────────────
export const PAYMENT_METHOD = {
  ONLINE: "online",
  WALLET: "wallet",
  COD: "cod",
};

export const PAYMENT_METHOD_CONFIG = {
  [PAYMENT_METHOD.ONLINE]: {
    label: "Pay Online",
    description: "UPI, Cards, Net Banking & more",
    icon: "📱",
  },
  [PAYMENT_METHOD.WALLET]: {
    label: "Pay with Wallet",
    icon: "👛",
    // description is dynamic — set at render time based on balance
  },
  [PAYMENT_METHOD.COD]: {
    label: "Cash on Delivery",
    description: "Pay when your order arrives",
    icon: "💵",
  },
};

// ── Delivery ──────────────────────────────────────────────────────────────────
export const FREE_DELIVERY_THRESHOLD = 500; // ₹500 — mirrors backend logic
export const DELIVERY_CHARGE = 40;

// ── Polling ───────────────────────────────────────────────────────────────────
// How long to poll for payment confirmation before showing a manual retry
export const PAYMENT_POLL_INITIAL_INTERVAL_MS = 2000;
export const PAYMENT_POLL_MAX_INTERVAL_MS = 5000;
export const PAYMENT_POLL_MAX_DURATION_MS = 30000; // 30 s total

// ── Routes ────────────────────────────────────────────────────────────────────
export const ORDER_ROUTES = {
  CHECKOUT: "/checkout",
  PAYMENT_PROCESSING: "/payment/processing",
  ORDER_SUCCESS: "/order/success",
  ORDERS: "/orders",
  ORDER_DETAIL: (id = ":orderId") => `/orders/${id}`,
};
