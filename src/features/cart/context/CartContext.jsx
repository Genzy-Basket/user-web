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
  const { isAuthenticated } = useAuth();

  const [cart, setCart] = useState(null);

  const { execute: runFetchCart, loading: fetchLoading } = useApiCall(
    cartAPI.getCart,
    { silent: true },
  );

  const { execute: runAddItem, loading: addLoading, error: addError } =
    useApiCall(cartAPI.addItem);

  const { execute: runUpdateQuantity, loading: updateLoading, error: updateError } =
    useApiCall(cartAPI.updateItemQuantity);

  const { execute: runRemoveItem, loading: removeLoading, error: removeError } =
    useApiCall(cartAPI.removeItem);

  const { execute: runClearCart, loading: clearLoading } = useApiCall(
    cartAPI.clearCart,
    { successMessage: "Cart cleared." },
  );

  const loading =
    fetchLoading || addLoading || updateLoading || removeLoading || clearLoading;

  const error =
    addError?.message || updateError?.message || removeError?.message || null;

  // ── Actions ──────────────────────────────────────────────────────────────

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }
    const response = await runFetchCart();
    if (response?.success) {
      setCart(response.data);
    }
  }, [isAuthenticated, runFetchCart]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addItem = useCallback(
    async (productId, priceConfigId, quantity = 1) => {
      const response = await runAddItem(productId, priceConfigId, quantity);
      if (response?.success) setCart(response.data);
      return response;
    },
    [runAddItem],
  );

  const updateQuantity = useCallback(
    async (cartItemId, action) => {
      const response = await runUpdateQuantity(cartItemId, action);
      if (response?.success) setCart(response.data);
      return response;
    },
    [runUpdateQuantity],
  );

  const removeItem = useCallback(
    async (cartItemId) => {
      const response = await runRemoveItem(cartItemId);
      if (response?.success) setCart(response.data);
      return response;
    },
    [runRemoveItem],
  );

  const clearCart = useCallback(async () => {
    const response = await runClearCart();
    if (response?.success) setCart(response.data);
    return response;
  }, [runClearCart]);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const getCartItem = useCallback(
    (pid, cid) =>
      cart?.items?.find(
        (item) =>
          (item.productId?._id ?? item.productId)?.toString() === pid?.toString() &&
          item.priceConfigId?.toString() === cid?.toString(),
      ) ?? null,
    [cart],
  );

  const isInCart = useCallback(
    (pid, cid) => !!getCartItem(pid, cid),
    [getCartItem],
  );

  // ── Computed totals ───────────────────────────────────────────────────────

  const totals = useMemo(() => {
    if (!cart?.items?.length) {
      return { totalAmount: 0, totalMrp: 0, totalSavings: 0, itemCount: 0 };
    }

    return cart.items.reduce(
      (acc, item) => {
        const config = item.productId?.priceConfigs?.find(
          (c) =>
            c._id?.toString() === item.priceConfigId?.toString() ||
            c.id?.toString() === item.priceConfigId?.toString(),
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

  const isEmpty = !cart?.items?.length;

  const value = useMemo(
    () => ({
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
      isEmpty,
    }),
    [
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
      totals,
      isEmpty,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
