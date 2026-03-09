import { useState } from "react";
import { ArrowLeft, Download, Smartphone, ShieldCheck, Zap, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

const APK_VARIANTS = [
  {
    key: "arm64",
    label: "Modern Phones (64-bit)",
    description: "Most phones from 2016 onwards",
    url: "https://drive.google.com/uc?export=download&id=1wa2oTFfpZZZCA9od5AQKqBJoC5VepZNC",
    size: "~20 MB",
    recommended: true,
  },
  {
    key: "armeabi",
    label: "Older Phones (32-bit)",
    description: "Older Android devices",
    url: "https://drive.google.com/uc?export=download&id=1OGugwQKsoVjz6sMl3QFwzt15p1833kGG",
    size: "~18 MB",
    recommended: false,
  },
];

const DownloadApp = () => {
  const [showOther, setShowOther] = useState(false);

  const primary = APK_VARIANTS[0];
  const others = APK_VARIANTS.slice(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand mb-8 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Hero */}
          <div className="bg-brand px-6 py-10 sm:py-14 text-center">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-white/20 flex items-center justify-center mb-5 shadow-lg">
              <span className="text-5xl">🥬</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 tracking-tight">
              Genzy Basket
            </h1>
            <p className="text-emerald-100 font-medium text-sm sm:text-base">
              Fresh vegetables delivered to your doorstep
            </p>
          </div>

          {/* Content */}
          <div className="px-6 py-8 sm:px-10 sm:py-10">
            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="flex flex-col items-center text-center p-4 rounded-xl bg-emerald-50">
                <Zap className="w-6 h-6 text-brand mb-2" />
                <span className="text-sm font-bold text-slate-800">Fast Ordering</span>
                <span className="text-xs text-slate-500 mt-1">Quick & easy checkout</span>
              </div>
              <div className="flex flex-col items-center text-center p-4 rounded-xl bg-emerald-50">
                <Smartphone className="w-6 h-6 text-brand mb-2" />
                <span className="text-sm font-bold text-slate-800">Native App</span>
                <span className="text-xs text-slate-500 mt-1">Smooth experience</span>
              </div>
              <div className="flex flex-col items-center text-center p-4 rounded-xl bg-emerald-50">
                <ShieldCheck className="w-6 h-6 text-brand mb-2" />
                <span className="text-sm font-bold text-slate-800">Secure Payments</span>
                <span className="text-xs text-slate-500 mt-1">Safe & trusted</span>
              </div>
            </div>

            {/* Primary download */}
            <a
              href={primary.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full py-4 bg-brand text-white rounded-xl font-bold text-lg
                hover:bg-brand-dark transition-all shadow-lg shadow-emerald-200
                active:scale-[0.98]"
            >
              <Download className="w-6 h-6" />
              Download for Android
            </a>
            <p className="text-center text-xs text-slate-400 mt-2">
              {primary.label} &middot; {primary.size}
            </p>

            {/* Other versions toggle */}
            <div className="mt-6 border-t border-slate-100 pt-4">
              <button
                onClick={() => setShowOther(!showOther)}
                className="flex items-center justify-center gap-2 w-full text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
              >
                Not working? Try other versions
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${showOther ? "rotate-180" : ""}`}
                />
              </button>

              {showOther && (
                <div className="mt-4 space-y-3">
                  {others.map((variant) => (
                    <a
                      key={variant.key}
                      href={variant.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-4 w-full p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-brand hover:bg-emerald-50 transition-all group"
                    >
                      <div>
                        <p className="text-sm font-bold text-slate-800 group-hover:text-brand">
                          {variant.label}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {variant.description} &middot; {variant.size}
                        </p>
                      </div>
                      <Download className="w-5 h-5 text-slate-400 group-hover:text-brand shrink-0" />
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Coming soon on Play Store */}
            <div className="mt-8 flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-slate-500" fill="currentColor">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-1.902l2.036 1.18a1 1 0 0 1 0 1.73l-2.036 1.18-2.574-2.574 2.574-2.516zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700">Google Play Store</p>
                <p className="text-xs text-slate-500">Coming soon</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadApp;
