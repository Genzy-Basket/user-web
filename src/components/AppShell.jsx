import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ShoppingCart,
  User,
  Package,
  ClipboardList,
  CalendarCheck,
  Headset,
  ArrowRight,
  MapPin,
  ChevronDown,
} from "lucide-react";
import { useCart } from "../features/cart/hooks/useCart";
import { useUser } from "../features/user/hooks/useUser";

const navItems = [
  { path: "/products", icon: Package, label: "Products" },
  { path: "/subscriptions", icon: CalendarCheck, label: "Subscribe" },
  { path: "/orders", icon: ClipboardList, label: "Orders" },
  { path: "/profile", icon: User, label: "Profile", desktopOnly: true },
];

const CartThumbnails = () => {
  const { cart } = useCart();
  const items = cart?.items ?? [];
  const images = [];
  for (const item of items) {
    const url = item.productId?.imageUrl;
    if (url && !images.includes(url)) {
      images.push(url);
      if (images.length >= 3) break;
    }
  }

  if (!images.length) {
    return <ShoppingCart className="w-6 h-6 text-brand" />;
  }

  const size = 32;
  const overlap = 10;
  const totalWidth = size + (images.length - 1) * (size - overlap);

  return (
    <div className="relative" style={{ width: totalWidth, height: size }}>
      {images.map((url, i) => (
        <img
          key={url}
          src={url}
          alt=""
          className="absolute top-0 w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm"
          style={{ left: i * (size - overlap) }}
        />
      ))}
    </div>
  );
};

const AppShell = ({ children }) => {
  const location = useLocation();
  const { itemCount, totalAmount } = useCart();
  const { profile } = useUser();
  const isProductsPage =
    location.pathname === "/" ||
    location.pathname === "/products" ||
    location.pathname.startsWith("/products/");
  const showCartBar = itemCount > 0 && isProductsPage;

  // Hide bottom bars on scroll down, show on scroll up
  const [bottomVisible, setBottomVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setBottomVisible(y < lastScrollY.current || y < 50);
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
                src="/logo_wordmark.png"
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
                <Headset
                  className={`w-5 h-5 ${isActive("/contact") ? "fill-brand/20" : ""}`}
                />
                <span>Contact Us</span>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* ── Mobile Header (products page only) ──────────────────────────── */}
      {(location.pathname === "/" || location.pathname === "/products") && (
        <header className="md:hidden bg-brand">
          <div className="px-4 pt-2 pb-2.5">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <Link to="/">
                  <img
                    src="/logo_wordmark.png"
                    alt="Genzy Basket"
                    className="h-8 brightness-0 invert"
                  />
                </Link>
                <Link to="/profile" className="flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-white/70 shrink-0" />
                  <span className="text-[13px] text-white/70 font-medium truncate">
                    {profile?.address
                      ? `${profile.address.houseOrFlat}, ${profile.address.street}, ${profile.address.area}`
                      : "Set delivery address"}
                  </span>
                  <ChevronDown className="w-4 h-4 text-white/50 shrink-0" />
                </Link>
              </div>
              <Link
                to="/profile"
                className="ml-3 shrink-0 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
              >
                <span className="text-white text-lg font-bold">
                  {profile?.fullName?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </Link>
            </div>
          </div>
        </header>
      )}

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
            <Link to="/contact" className="hover:text-brand transition-colors">
              Contact Us
            </Link>
            <span className="hidden sm:inline">·</span>
            <Link to="/terms" className="hover:text-brand transition-colors">
              Terms &amp; Conditions
            </Link>
            <span className="hidden sm:inline">·</span>
            <Link to="/refunds" className="hover:text-brand transition-colors">
              Refunds &amp; Cancellations
            </Link>
            <span className="hidden sm:inline">·</span>
            <Link to="/privacy" className="hover:text-brand transition-colors">
              Privacy Policy
            </Link>
          </div>
        </footer>
      </main>

      {/* ── Floating View Cart Bar ─────────────────────────────────────────── */}
      {showCartBar && (
        <div
          className={`fixed z-50 left-0 right-0 md:bottom-6 flex justify-center pointer-events-none transition-all duration-300 ${
            bottomVisible
              ? "bottom-[calc(4.5rem+env(safe-area-inset-bottom))]"
              : "bottom-4"
          }`}
        >
          <Link
            to="/cart"
            className="pointer-events-auto flex items-center gap-2.5 h-13 px-3.5 bg-brand-100 border border-slate-200 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.12)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.18)] transition-shadow"
          >
            <CartThumbnails />
            <div className="flex flex-col justify-center">
              <span className="text-sm font-bold text-slate-900 leading-tight">
                View Cart
              </span>
              <span className="text-[11px] font-medium text-slate-500">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </span>
            </div>
            <ArrowRight className="w-4.5 h-4.5 text-slate-900" />
          </Link>
        </div>
      )}

      {/* ── Mobile Bottom Nav ─────────────────────────────────────────────── */}
      <nav
        className={`md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] transition-transform duration-300 ${
          bottomVisible ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-center justify-around h-16 px-2">
          {navItems
            .filter((i) => !i.desktopOnly)
            .map((item) => {
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
