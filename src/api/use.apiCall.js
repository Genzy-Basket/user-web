import { useState, useCallback } from "react";
import { errorBus } from "../api/errorBus";

/**
 * Wraps an async API function with:
 *  - loading state
 *  - automatic error toasting
 *  - optional success toast
 *
 * @param {Function} fn           - The async function to wrap
 * @param {Object}   options
 * @param {string}   options.successMessage  - Toast on success (optional)
 * @param {boolean}  options.silent          - Suppress error toasts (default: false)
 * @param {Function} options.onSuccess       - Callback after success
 * @param {Function} options.onError         - Callback after error
 *
 * @returns {{ execute, loading, error, reset }}
 *
 * @example
 *   const { execute: addItem, loading } = useApiCall(cartAPI.addItem, {
 *     successMessage: "Added to cart!",
 *   });
 *   await addItem(productId, priceConfigId, qty);
 */
export function useApiCall(fn, options = {}) {
  const { successMessage, silent = false, onSuccess, onError } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fn(...args);

        if (successMessage) {
          errorBus.emit(successMessage, "success");
        }
        onSuccess?.(response);
        return response;
      } catch (err) {
        setError(err);
        if (!silent) {
          errorBus.emit(String(err?.message || err || "Unknown error"), "error");
        }
        onError?.(err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fn, successMessage, silent],
  );

  const reset = useCallback(() => setError(null), []);

  return { execute, loading, error, reset };
}
