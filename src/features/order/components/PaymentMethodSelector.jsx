import { PAYMENT_METHOD_CONFIG } from "../../../constants/order.constants";

const PaymentMethodSelector = ({ selected, onChange, disabled = false }) => {
  return (
    <div className="space-y-3">
      {Object.entries(PAYMENT_METHOD_CONFIG).map(([key, config]) => {
        const isSelected = selected === key;

        return (
          <button
            key={key}
            type="button"
            disabled={disabled}
            onClick={() => onChange(key)}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border-2 text-left transition-all duration-150
              ${
                isSelected
                  ? "border-[#009661] bg-emerald-50 shadow-sm"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
              }
              ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            `}
          >
            <span className="text-2xl w-8 text-center flex-shrink-0 select-none">
              {config.icon}
            </span>

            <div className="flex-1 min-w-0">
              <span
                className={`font-semibold text-sm ${
                  isSelected ? "text-[#009661]" : "text-slate-800"
                }`}
              >
                {config.label}
              </span>
              <p className="text-xs text-slate-500 mt-0.5">
                {config.description}
              </p>
            </div>

            <div
              className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all
                ${isSelected ? "border-[#009661]" : "border-slate-300"}`}
            >
              {isSelected && (
                <div className="w-2.5 h-2.5 rounded-full bg-[#009661]" />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default PaymentMethodSelector;
