import {
  ArrowLeft,
  ExternalLink,
  Smartphone,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";

const PACKAGE_NAME = "com.genzybasket.app";
const PLAY_STORE_URL = `https://play.google.com/store/apps/details?id=${PACKAGE_NAME}`;
const INTENT_URL = `intent://launch/#Intent;package=${PACKAGE_NAME};scheme=genzybasket;S.browser_fallback_url=${encodeURIComponent(PLAY_STORE_URL)};end`;

const DownloadApp = () => {
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
            <div className="w-20 h-20 mx-auto rounded-2xl bg-white/20 flex items-center justify-center mb-5 shadow-lg p-3">
              <img
                src="/logo_icon_white.png"
                alt="Genzy Basket"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 tracking-tight">
              Genzy Basket
            </h1>
            <p className="text-emerald-100 font-medium text-sm sm:text-base">
              Fresh vegetables & daily essentials delivered to your doorstep
            </p>
          </div>

          {/* Content */}
          <div className="px-6 py-8 sm:px-10 sm:py-10">
            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="flex flex-col items-center text-center p-4 rounded-xl bg-emerald-50">
                <Zap className="w-6 h-6 text-brand mb-2" />
                <span className="text-sm font-bold text-slate-800">
                  Fast Ordering
                </span>
                <span className="text-xs text-slate-500 mt-1">
                  Quick & easy checkout
                </span>
              </div>
              <div className="flex flex-col items-center text-center p-4 rounded-xl bg-emerald-50">
                <Smartphone className="w-6 h-6 text-brand mb-2" />
                <span className="text-sm font-bold text-slate-800">
                  Daily Subscriptions
                </span>
                <span className="text-xs text-slate-500 mt-1">
                  Milk, curd & more daily
                </span>
              </div>
              <div className="flex flex-col items-center text-center p-4 rounded-xl bg-emerald-50">
                <ShieldCheck className="w-6 h-6 text-brand mb-2" />
                <span className="text-sm font-bold text-slate-800">
                  Secure Payments
                </span>
                <span className="text-xs text-slate-500 mt-1">
                  Safe & trusted
                </span>
              </div>
            </div>

            {/* Play Store download */}
            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full py-4 bg-brand text-white rounded-xl font-bold text-lg
                hover:bg-brand-dark transition-all shadow-lg shadow-emerald-200
                active:scale-[0.98]"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-1.902l2.036 1.18a1 1 0 0 1 0 1.73l-2.036 1.18-2.574-2.574 2.574-2.516zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z" />
              </svg>
              Download on Google Play
            </a>
            <p className="text-center text-xs text-slate-400 mt-2">
              Free &middot; Android 5.0+
            </p>

            {/* Open app if already installed */}
            <div className="mt-6 border-t border-slate-100 pt-6">
              <p className="text-center text-sm text-slate-500 mb-3">
                Already have the app installed?
              </p>
              <a
                href={INTENT_URL}
                className="flex items-center justify-center gap-2 w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold text-sm
                  hover:bg-slate-200 transition-all active:scale-[0.98]"
              >
                <ExternalLink className="w-4 h-4" />
                Open Genzy Basket App
              </a>
              <p className="text-center text-xs text-slate-400 mt-2">
                If the app is not installed, this will take you to the Play
                Store
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadApp;
