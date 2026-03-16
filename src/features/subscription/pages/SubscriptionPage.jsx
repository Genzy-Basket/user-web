import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import ActiveSubscriptions from "../components/ActiveSubscriptions";

const SubscriptionPage = () => {
  const [fabExpanded, setFabExpanded] = useState(true);

  // Collapse FAB on scroll down, expand on scroll up (matches user-app)
  const handleScroll = useCallback(() => {
    let lastY = 0;
    return () => {
      const y = window.scrollY;
      setFabExpanded(y < lastY || y < 50);
      lastY = y;
    };
  }, []);

  useEffect(() => {
    const fn = handleScroll();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, [handleScroll]);

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-teal-50 to-cyan-50 pb-24">
      {/* Header — mobile only (desktop uses AppShell header) */}
      <div className="md:hidden sticky top-0 z-40 bg-brand px-4 py-3.5">
        <h1 className="text-lg font-black text-white max-w-2xl mx-auto">
          My Subscriptions
        </h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4">
        <ActiveSubscriptions />
      </div>

      {/* FAB — animated expand/collapse like user-app */}
      <Link
        to="/subscriptions/new"
        className="fixed z-50 right-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] md:bottom-8 md:right-8"
      >
        <div
          className="flex items-center gap-2 h-[52px] bg-brand text-white rounded-2xl shadow-[0_4px_12px_rgba(9,158,14,0.3)] transition-all duration-300 overflow-hidden"
          style={{ padding: fabExpanded ? "0 16px" : "0 14px", borderRadius: fabExpanded ? "16px" : "26px" }}
        >
          <Plus className="w-[22px] h-[22px] shrink-0" />
          <span
            className="text-sm font-bold whitespace-nowrap transition-all duration-300 overflow-hidden"
            style={{
              maxWidth: fabExpanded ? "200px" : "0px",
              opacity: fabExpanded ? 1 : 0,
              marginLeft: fabExpanded ? "0" : "-4px",
            }}
          >
            New Subscription
          </span>
        </div>
      </Link>
    </div>
  );
};

export default SubscriptionPage;
