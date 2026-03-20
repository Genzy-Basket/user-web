import { useState } from "react";
import { Wallet, CreditCard, Tag } from "lucide-react";

const SubscriptionSummary = ({
  items,
  selectedDates,
  walletBalance,
  onSubscribe,
  loading,
}) => {
  const [paymentMethod, setPaymentMethod] = useState("wallet");

  const dailyCost = items.reduce(
    (sum, item) => sum + item.config.price * item.quantity,
    0,
  );
  const totalDays = selectedDates.size;
  const totalCost = dailyCost * totalDays;
  const canAffordWallet = walletBalance >= totalCost;
  const remainingBalance = walletBalance - totalCost;
  const totalSavings = items.reduce((sum, item) => {
    if (item.config.mrp > item.config.price) {
      return sum + (item.config.mrp - item.config.price) * item.quantity * totalDays;
    }
    return sum;
  }, 0);

  if (items.length === 0 || totalDays === 0) return null;

  const canPay = paymentMethod === "online" || canAffordWallet;

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-200 p-5">
      {totalSavings > 0 && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5 mb-4 flex items-center gap-2">
          <Tag className="w-4 h-4 text-brand shrink-0" />
          <span className="text-sm font-bold text-brand">
            You save ₹{totalSavings} on this subscription!
          </span>
        </div>
      )}
      <h3 className="font-bold text-slate-800 text-lg mb-4">Subscription Summary</h3>

      {/* Line items */}
      <div className="space-y-2 mb-4">
        {items.map((item) => {
          const label = item.config.displayLabel || `${item.config.value} ${item.config.unit}`;
          const lineTotal = item.config.price * item.quantity * totalDays;
          return (
            <div key={item.productId} className="flex items-center justify-between text-sm">
              <span className="text-slate-600">
                {item.productName}{" "}
                <span className="text-slate-400">{label}</span>
                {item.quantity > 1 && (
                  <span className="text-slate-400"> x{item.quantity}</span>
                )}
              </span>
              <span className="font-semibold text-slate-700">
                ₹{item.config.price * item.quantity} x {totalDays} = ₹{lineTotal}
              </span>
            </div>
          );
        })}
      </div>

      <div className="border-t border-slate-100 pt-3 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Daily cost</span>
          <span className="font-bold text-slate-700">₹{dailyCost}/day</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Total days</span>
          <span className="font-bold text-slate-700">{totalDays} days</span>
        </div>
        <div className="flex justify-between text-base pt-2 border-t border-slate-100">
          <span className="font-bold text-slate-800">Total</span>
          <span className="font-black text-slate-900 text-lg">₹{totalCost}</span>
        </div>
      </div>

      {/* Payment method selector */}
      <div className="mt-4 space-y-2">
        <p className="text-sm font-semibold text-slate-700">Payment Method</p>

        {/* Wallet option */}
        <button
          type="button"
          onClick={() => setPaymentMethod("wallet")}
          disabled={!canAffordWallet}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all
            ${
              paymentMethod === "wallet" && canAffordWallet
                ? "border-brand bg-emerald-50"
                : canAffordWallet
                ? "border-slate-200 bg-white hover:border-slate-300"
                : "border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed"
            }
          `}
        >
          <Wallet className={`w-5 h-5 shrink-0 ${paymentMethod === "wallet" && canAffordWallet ? "text-brand" : "text-slate-400"}`} />
          <div className="flex-1 min-w-0">
            <span className={`text-sm font-bold ${paymentMethod === "wallet" && canAffordWallet ? "text-brand" : "text-slate-700"}`}>
              Pay with Wallet
            </span>
            <p className="text-xs text-slate-500 mt-0.5">
              {canAffordWallet
                ? `Balance: ₹${walletBalance.toFixed(0)} → ₹${remainingBalance.toFixed(0)} after`
                : `Insufficient (₹${walletBalance.toFixed(0)} available)`}
            </p>
          </div>
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
            paymentMethod === "wallet" && canAffordWallet ? "border-brand" : "border-slate-300"
          }`}>
            {paymentMethod === "wallet" && canAffordWallet && (
              <div className="w-2.5 h-2.5 rounded-full bg-brand" />
            )}
          </div>
        </button>

        {/* Online option */}
        <button
          type="button"
          onClick={() => setPaymentMethod("online")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all
            ${
              paymentMethod === "online"
                ? "border-brand bg-emerald-50"
                : "border-slate-200 bg-white hover:border-slate-300"
            }
          `}
        >
          <CreditCard className={`w-5 h-5 shrink-0 ${paymentMethod === "online" ? "text-brand" : "text-slate-400"}`} />
          <div className="flex-1 min-w-0">
            <span className={`text-sm font-bold ${paymentMethod === "online" ? "text-brand" : "text-slate-700"}`}>
              Pay Online
            </span>
            <p className="text-xs text-slate-500 mt-0.5">UPI, Cards, Net Banking & more</p>
          </div>
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
            paymentMethod === "online" ? "border-brand" : "border-slate-300"
          }`}>
            {paymentMethod === "online" && (
              <div className="w-2.5 h-2.5 rounded-full bg-brand" />
            )}
          </div>
        </button>
      </div>

      {/* Subscribe button */}
      <button
        type="button"
        onClick={() => onSubscribe(paymentMethod)}
        disabled={!canPay || loading}
        className="w-full mt-4 py-3.5 bg-brand text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
      >
        {paymentMethod === "wallet" ? (
          <>
            <Wallet className="w-4 h-4" />
            Pay ₹{totalCost} from Wallet
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4" />
            Pay ₹{totalCost} Online
          </>
        )}
      </button>
    </div>
  );
};

export default SubscriptionSummary;
