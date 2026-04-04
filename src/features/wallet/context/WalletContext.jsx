import { createContext, useContext, useState, useCallback } from "react";
import walletAPI from "../../../api/endpoints/wallet.api";
import { errorBus } from "../../../api/errorBus";

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchWallet = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await walletAPI.getWallet(page);
      if (res.success) {
        setBalance(res.data.balance ?? 0);
        if (page === 1) {
          setTransactions(res.data.transactions ?? []);
        } else {
          setTransactions((prev) => [...prev, ...(res.data.transactions ?? [])]);
        }
        setPagination(res.data.pagination ?? null);
      }
    } catch (err) {
      errorBus.emit(err.message, "error");
    } finally {
      setLoading(false);
    }
  }, []);

  const addFunds = useCallback(async (amount) => {
    setLoading(true);
    try {
      const res = await walletAPI.addFunds(amount);
      if (!res.success) throw new Error(res.message || "Failed to add funds");
      return res.data;
    } catch (err) {
      errorBus.emit(err.message, "error");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyFunds = useCallback(async (razorpayOrderId) => {
    setLoading(true);
    try {
      const res = await walletAPI.verifyFunds(razorpayOrderId);
      if (res.success && res.data.status === "success" && res.data.balance != null) {
        setBalance(res.data.balance);
      }
      return res.data;
    } catch (err) {
      errorBus.emit(err.message, "error");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setBalance(0);
    setTransactions([]);
    setPagination(null);
  }, []);

  return (
    <WalletContext.Provider
      value={{
        balance,
        transactions,
        pagination,
        loading,
        fetchWallet,
        addFunds,
        verifyFunds,
        setBalance,
        reset,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWalletContext() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWalletContext must be used within WalletProvider");
  return ctx;
}
