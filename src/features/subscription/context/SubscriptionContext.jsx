import { createContext, useContext, useState, useCallback, useEffect } from "react";
import subscriptionAPI from "../../../api/endpoints/subscription.api";
import { errorBus } from "../../../api/errorBus";

const SubscriptionContext = createContext(null);

export function SubscriptionProvider({ children }) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);

  // ── Fetch list ─────────────────────────────────────────────────────────────
  const fetchSubscriptions = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await subscriptionAPI.getSubscriptions(page);
      if (res.success) {
        setSubscriptions(res.data || []);
        setPagination(res.pagination || null);
      }
    } catch (err) {
      errorBus.emit(err.message, "error");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch once when the provider mounts (like ProductContext)
  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  // ── Create subscription ────────────────────────────────────────────────────
  const createSubscription = useCallback(async (items, dates, paymentMethod) => {
    setLoading(true);
    try {
      const res = await subscriptionAPI.createSubscription(items, dates, paymentMethod);
      if (!res.success) throw new Error(res.message || "Failed to create subscription");
      return res.data;
    } catch (err) {
      errorBus.emit(err.message, "error");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Verify online payment ──────────────────────────────────────────────────
  const verifyPayment = useCallback(async (subscriptionId) => {
    setLoading(true);
    try {
      const res = await subscriptionAPI.verifyPayment(subscriptionId);
      if (!res.success) throw new Error(res.message || "Verification failed");
      return res.data;
    } catch (err) {
      errorBus.emit(err.message, "error");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Skip date ──────────────────────────────────────────────────────────────
  const skipDate = useCallback(async (subscriptionId, date) => {
    setLoading(true);
    try {
      const res = await subscriptionAPI.skipDate(subscriptionId, date);
      if (!res.success) throw new Error(res.message || "Failed to skip date");
      // Update in-place
      setSubscriptions((prev) =>
        prev.map((s) =>
          s.subscriptionId === subscriptionId ? res.data : s,
        ),
      );
      errorBus.emit("Date skipped, refund added to wallet", "success");
      return res.data;
    } catch (err) {
      errorBus.emit(err.message, "error");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Pause ──────────────────────────────────────────────────────────────────
  const pauseSubscription = useCallback(async (subscriptionId) => {
    setLoading(true);
    try {
      const res = await subscriptionAPI.pause(subscriptionId);
      if (!res.success) throw new Error(res.message || "Failed to pause");
      setSubscriptions((prev) =>
        prev.map((s) =>
          s.subscriptionId === subscriptionId ? res.data : s,
        ),
      );
      errorBus.emit("Subscription paused", "success");
      return res.data;
    } catch (err) {
      errorBus.emit(err.message, "error");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Resume ─────────────────────────────────────────────────────────────────
  const resumeSubscription = useCallback(async (subscriptionId) => {
    setLoading(true);
    try {
      const res = await subscriptionAPI.resume(subscriptionId);
      if (!res.success) throw new Error(res.message || "Failed to resume");
      setSubscriptions((prev) =>
        prev.map((s) =>
          s.subscriptionId === subscriptionId ? res.data : s,
        ),
      );
      errorBus.emit("Subscription resumed", "success");
      return res.data;
    } catch (err) {
      errorBus.emit(err.message, "error");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Cancel ─────────────────────────────────────────────────────────────────
  const cancelSubscription = useCallback(async (subscriptionId, reason) => {
    setLoading(true);
    try {
      const res = await subscriptionAPI.cancel(subscriptionId, reason);
      if (!res.success) throw new Error(res.message || "Failed to cancel");
      setSubscriptions((prev) =>
        prev.map((s) =>
          s.subscriptionId === subscriptionId ? res.data.subscription : s,
        ),
      );
      errorBus.emit(res.message || "Subscription cancelled", "success");
      return res.data;
    } catch (err) {
      errorBus.emit(err.message, "error");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <SubscriptionContext.Provider
      value={{
        subscriptions,
        pagination,
        loading,
        fetchSubscriptions,
        createSubscription,
        verifyPayment,
        skipDate,
        pauseSubscription,
        resumeSubscription,
        cancelSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscriptionContext() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error("useSubscriptionContext must be used within SubscriptionProvider");
  return ctx;
}
