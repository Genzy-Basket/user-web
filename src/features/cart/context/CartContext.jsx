import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import cartAPI from "../../../api/endpoints/cart.api";
import useAuth from "../../auth/hooks/useAuth";
import { useApiCall } from "../../../api/use.apiCall";

export const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated, isApproved } = useAuth();
  const [cart, setCart] = useState(null);

  const { execute: runFetchCart, loading: fetchLoading } = useApiCall(
    cartAPI.getCart,
    { silent: true }, // background fetch — don't toast on error
  );

  const { execute: runAddItem, loading: addLoading, error: addError } = useApiCall(
    cartAPI.addItem,
    // { successMessage: "Item added to cart!" },
  );

  const { execute: runUpdateQuantity, loading: updateLoading, error: updateError } = useApiCall(
    cartAPI.updateItemQuantity,
  );

  const { execute: runRemoveItem, loading: removeLoading, error: removeError } = useApiCall(
    cartAPI.removeItem,
    // { successMessage: "Item removed." },
  );

  const { execute: runClearCart, loading: clearLoading } = useApiCall(
    cartAPI.clearCart,
    { successMessage: "Cart cleared." },
  );

  const loading =
    fetchLoading ||
    addLoading ||
    updateLoading ||
    removeLoading ||
    clearLoading;

  // Most recent mutation error (add/update/remove) — used for inline display in CartPage
  const error = addError?.message || updateError?.message || removeError?.message || null;

  // ── Actions ──────────────────────────────────────────────────────────────

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated || !isApproved) {
      setCart(null);
      return;
    }
    const response = await runFetchCart();
    if (response?.success) setCart(response.data);
  }, [isAuthenticated, isApproved, runFetchCart]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addItem = useCallback(
    async (productId, priceConfigId, quantity = 1) => {
      const response = await runAddItem(productId, priceConfigId, quantity);
      if (response?.success) await fetchCart();
      return response;
    },
    [runAddItem, fetchCart],
  );

  const updateQuantity = useCallback(
    async (cartItemId, action) => {
      const response = await runUpdateQuantity(cartItemId, action);
      if (response?.success) await fetchCart();
      return response;
    },
    [runUpdateQuantity, fetchCart],
  );

  const removeItem = useCallback(
    async (cartItemId) => {
      const response = await runRemoveItem(cartItemId);
      if (response?.success) await fetchCart();
      return response;
    },
    [runRemoveItem, fetchCart],
  );

  const clearCart = useCallback(async () => {
    const response = await runClearCart();
    if (response?.success) await fetchCart();
    return response;
  }, [runClearCart, fetchCart]);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const getCartItem = useCallback(
    (pid, cid) =>
      cart?.items?.find(
        (item) =>
          (item.productId?._id === pid || item.productId === pid) &&
          item.priceConfigId === cid,
      ) ?? null,
    [cart],
  );

  const isInCart = useCallback(
    (pid, cid) => !!getCartItem(pid, cid),
    [getCartItem],
  );

  // ── Computed totals ──────────────────────────────────────────────────────

  const totals = useMemo(() => {
    if (!cart?.items) {
      return { totalAmount: 0, totalMrp: 0, totalSavings: 0, itemCount: 0 };
    }

    return cart.items.reduce(
      (acc, item) => {
        const config = item.productId?.priceConfigs?.find(
          (c) => c._id === item.priceConfigId || c.id === item.priceConfigId,
        );
        if (config) {
          acc.totalAmount += config.price * item.quantity;
          acc.totalMrp += config.mrp * item.quantity;
          acc.itemCount += item.quantity;
        }
        acc.totalSavings = acc.totalMrp - acc.totalAmount;
        return acc;
      },
      { totalAmount: 0, totalMrp: 0, totalSavings: 0, itemCount: 0 },
    );
  }, [cart]);

  const value = {
    cart,
    loading,
    error,
    fetchCart,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    getCartItem,
    isInCart,
    ...totals,
    isEmpty: !cart?.items?.length,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
