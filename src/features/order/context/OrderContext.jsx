import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";
import orderAPI from "../../../api/endpoints/order.api";
import { errorBus } from "../../../api/errorBus";
import {
  PAYMENT_POLL_INITIAL_INTERVAL_MS,
  PAYMENT_POLL_MAX_INTERVAL_MS,
  PAYMENT_POLL_MAX_DURATION_MS,
  PAYMENT_STATUS,
  ORDER_STATUS,
} from "../../../constants/order.constants";

const OrderContext = createContext(null);

export function OrderProvider({ children }) {
  // ── State ──────────────────────────────────────────────────────────────────
  const [orders, setOrders] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Polling ref — lets us cancel the interval from anywhere
  const pollRef = useRef(null);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const clearError = useCallback(() => setError(null), []);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearTimeout(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  // ── Create Order ───────────────────────────────────────────────────────────
  /**
   * Creates the backend order and, for online payments, returns the
   * Razorpay order details so the caller can open the checkout.
   *
   * Returns:
   *  - { success: true, order, isCod: true }                      for COD
   *  - { success: true, order, razorpayOrderId, keyId }           for online
   *  - { success: false, message }                                on error
   */
  const createOrder = useCallback(async (paymentMethod, customerNotes = null) => {
    setLoading(true);
    setError(null);

    try {
      const result = await orderAPI.createOrder(paymentMethod, customerNotes);

      if (!result.success)
        throw new Error(result.message || "Failed to create order");

      const { order, razorpayOrderId, keyId } = result.data;
      setCurrentOrder(order);

      if (paymentMethod === "cod" || paymentMethod === "wallet") {
        errorBus.emit("Order placed successfully!", "success");
        return { success: true, order, isCod: paymentMethod === "cod" };
      }

      return { success: true, order, razorpayOrderId, keyId };
    } catch (err) {
      const msg = err.message || "Failed to create order";
      setError(msg);
      errorBus.emit(msg, "error");
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Poll Order Status ──────────────────────────────────────────────────────
  /**
   * Polls GET /orders/:orderId/status until payment is confirmed or max
   * attempts are exceeded.  Falls back to verifyPayment() as a final check.
   *
   * onUpdate(statusData) is called on every poll tick so the UI can react.
   * Resolves with the final status object.
   */
  const pollOrderStatus = useCallback(
    async (orderId, { onUpdate, onSuccess, onFail } = {}) => {
      stopPolling();
      const startTime = Date.now();
      let interval = PAYMENT_POLL_INITIAL_INTERVAL_MS;

      // Verify with gateway immediately — if payment is already confirmed
      // there's no need to wait for the webhook.
      try {
        const verifyRes = await orderAPI.verifyPayment(orderId);
        const d = verifyRes.data;
        if (d?.payment?.status === PAYMENT_STATUS.SUCCESS) {
          onSuccess?.(d);
          return { confirmed: true, data: d };
        }
        if (
          d?.payment?.status === PAYMENT_STATUS.FAILED ||
          d?.orderStatus === ORDER_STATUS.CANCELLED
        ) {
          onFail?.(d);
          return { confirmed: false, data: d };
        }
      } catch {
        // Verify failed — fall through to polling
      }

      return new Promise((resolve) => {
        const tick = async () => {
          try {
            const res = await orderAPI.getOrderStatus(orderId);
            const statusData = res.data;
            onUpdate?.(statusData);

            const { paymentStatus, orderStatus } = statusData;

            if (
              paymentStatus === PAYMENT_STATUS.SUCCESS ||
              orderStatus === ORDER_STATUS.CONFIRMED ||
              orderStatus === ORDER_STATUS.DELIVERED
            ) {
              stopPolling();
              onSuccess?.(statusData);
              return resolve({ confirmed: true, data: statusData });
            }

            if (
              paymentStatus === PAYMENT_STATUS.FAILED ||
              orderStatus === ORDER_STATUS.CANCELLED
            ) {
              stopPolling();
              onFail?.(statusData);
              return resolve({ confirmed: false, data: statusData });
            }
          } catch {
            // Network blip — keep polling
          }

          // Check if max duration exceeded — try manual verify as last resort
          if (Date.now() - startTime >= PAYMENT_POLL_MAX_DURATION_MS) {
            stopPolling();
            try {
              const verifyRes = await orderAPI.verifyPayment(orderId);
              const d = verifyRes.data;
              if (d?.payment?.status === PAYMENT_STATUS.SUCCESS) {
                onSuccess?.(d);
                return resolve({ confirmed: true, data: d });
              }
            } catch {
              // ignore
            }
            onFail?.({ timedOut: true });
            return resolve({ confirmed: false, timedOut: true });
          }

          // Exponential backoff: 2s → 3s → 4.5s → 5s (capped)
          interval = Math.min(interval * 1.5, PAYMENT_POLL_MAX_INTERVAL_MS);
          pollRef.current = setTimeout(tick, interval);
        };

        pollRef.current = setTimeout(tick, interval);
      });
    },
    [stopPolling],
  );

  // ── Fetch Single Order ─────────────────────────────────────────────────────
  const fetchOrder = useCallback(async (orderId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await orderAPI.getOrder(orderId);
      setCurrentOrder(res.data);
      return res.data;
    } catch (err) {
      const msg = err.message || "Order not found";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch Orders List ──────────────────────────────────────────────────────
  const fetchOrders = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await orderAPI.getUserOrders(params);
      setOrders(res.data || []);
      setPagination(res.pagination || null);
      return res.data;
    } catch (err) {
      const msg = err.message || "Failed to fetch orders";
      setError(msg);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Cancel Order ───────────────────────────────────────────────────────────
  const cancelOrder = useCallback(
    async (orderId, reason) => {
      setLoading(true);
      setError(null);
      try {
        const res = await orderAPI.cancelOrder(orderId, reason);
        if (!res.success) throw new Error(res.message);
        // Update in-place if this order is in our list
        setOrders((prev) =>
          prev.map((o) => (o.orderId === orderId ? res.data : o)),
        );
        if (currentOrder?.orderId === orderId) setCurrentOrder(res.data);
        errorBus.emit("Order cancelled successfully", "success");
        return { success: true, order: res.data };
      } catch (err) {
        const msg = err.message || "Failed to cancel order";
        setError(msg);
        errorBus.emit(msg, "error");
        return { success: false, message: msg };
      } finally {
        setLoading(false);
      }
    },
    [currentOrder],
  );

  // ── Value ──────────────────────────────────────────────────────────────────
  return (
    <OrderContext.Provider
      value={{
        orders,
        currentOrder,
        pagination,
        loading,
        error,
        clearError,
        createOrder,
        fetchOrder,
        fetchOrders,
        cancelOrder,
        pollOrderStatus,
        stopPolling,
        setCurrentOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrderContext() {
  const ctx = useContext(OrderContext);
  if (!ctx)
    throw new Error("useOrderContext must be used within OrderProvider");
  return ctx;
}
