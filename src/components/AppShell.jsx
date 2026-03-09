import { Link, useLocation } from "react-router-dom";
import {
  ShoppingCart,
  User,
  Package,
  ClipboardList,
  Headset,
} from "lucide-react";
import { useCart } from "../features/cart/hooks/useCart";

const AppShell = ({ children }) => {
  const location = useLocation();
  const { itemCount } = useCart();

  const navItems = [
    { path: "/products", icon: Package, label: "Products" },
    { path: "/cart", icon: ShoppingCart, label: "Cart", badge: itemCount },
    { path: "/orders", icon: ClipboardList, label: "Orders" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  const isActive = (path) =>
    location.pathname === path ||
    (path === "/products" && location.pathname === "/") ||
    // Mark Orders active for /orders and /orders/:id
    (path === "/orders" && location.pathname.startsWith("/orders"));

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
      {/* ── Desktop Header ───────────────────────────────────────────────── */}
      <header className="hidden md:block sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center group">
              <img
                src="/Logo.png"
                alt="Genzy Basket"
                className="h-10 transition-transform group-hover:scale-105"
              />
            </Link>

            {/* Desktop Nav */}
            <nav className="flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
                      active
                        ? "bg-brand-50 text-brand"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${active ? "fill-brand/20" : ""}`}
                    />
                    <span>{item.label}</span>
                    {item.badge > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                        {item.badge > 9 ? "9+" : item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}

              <Link
                to="/contact"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
                  isActive("/contact")
                    ? "bg-brand-50 text-brand"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <Headset className={`w-5 h-5 ${isActive("/contact") ? "fill-brand/20" : ""}`} />
                <span>Contact Us</span>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* ── Mobile Header ────────────────────────────────────────────────── */}
      <header className="md:hidden sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="px-4 flex items-center justify-between h-14">
          <Link to="/" className="flex items-center">
            <img src="/Logo.png" alt="Genzy Basket" className="h-8" />
          </Link>

          <Link
            to="/contact"
            className="p-2 rounded-lg text-slate-600"
            aria-label="Customer Care"
          >
            <Headset className="w-5 h-5" aria-hidden="true" />
          </Link>
        </div>
      </header>

      {/* ── Page content ─────────────────────────────────────────────────── */}
      <main className="flex-1">
        {children}

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <footer className="border-t border-slate-100 mt-8 py-6 px-4">
          <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-4 text-xs text-slate-400">
            <Link
              to="/download"
              className="text-brand font-semibold hover:text-brand-dark transition-colors"
            >
              Download App
            </Link>
            <span className="hidden sm:inline">·</span>
            <Link
              to="/contact"
              className="hover:text-brand transition-colors"
            >
              Contact Us
            </Link>
            <span className="hidden sm:inline">·</span>
            <Link
              to="/terms"
              className="hover:text-brand transition-colors"
            >
              Terms &amp; Conditions
            </Link>
            <span className="hidden sm:inline">·</span>
            <Link
              to="/refunds"
              className="hover:text-brand transition-colors"
            >
              Refunds &amp; Cancellations
            </Link>
          </div>
        </footer>
      </main>

      {/* ── Mobile Bottom Nav ─────────────────────────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex flex-col items-center justify-center w-full h-full transition-all ${
                  active ? "text-brand" : "text-slate-400"
                }`}
              >
                <div className="relative mb-1">
                  <Icon
                    className={`w-6 h-6 transition-all duration-300 ${
                      active ? "scale-110 fill-brand" : ""
                    }`}
                    strokeWidth={active ? 2.5 : 2}
                  />
                  {item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 bg-red-500 text-white text-[10px] font-black rounded-full min-w-4.5 h-4.5 px-1 flex items-center justify-center border-2 border-white shadow-sm">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[11px] font-semibold ${
                    active ? "opacity-100" : "opacity-60"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default AppShell;
