import { lazy, Suspense } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./features/auth/context/AuthContext";
import { UserProvider } from "./features/user/context/UserContext";
import { ProductProvider } from "./features/products/context/ProductContext";
import { CartProvider } from "./features/cart/context/CartContext";
import { OrderProvider } from "./features/order/context/OrderContext";
import { WalletProvider } from "./features/wallet/context/WalletContext";
import { SubscriptionProvider } from "./features/subscription/context/SubscriptionContext";
import { DeliveryConfigProvider } from "./features/delivery/context/DeliveryConfigContext";
import { ToastProvider } from "./components/ToastProvider";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./features/auth/components/ProtectedRoute";
import AppShell from "./components/AppShell";

// ── Eagerly loaded (always needed) ───────────────────────────────────────────
import LoginPage from "./features/auth/pages/LoginPage";
import RegisterPage from "./features/auth/pages/RegisterPage";
import PendingApprovalPage from "./features/auth/pages/PendingApprovalPage";
import ProductsPage from "./features/products/pages/ProductsPage";
const ProductDetailPage = lazy(() => import("./features/products/pages/ProductDetailPage"));
const CartPage = lazy(() => import("./features/cart/pages/CartPage"));
const ProfilePage = lazy(() => import("./features/user/pages/ProfilePage"));

// ── Public pages ─────────────────────────────────────────────────────────────
const DownloadApp = lazy(() => import("./pages/DownloadApp"));
const PayPage = lazy(() => import("./pages/PayPage"));
const ContactUs = lazy(() => import("./pages/policy/ContactUs"));
const TermsAndConditions = lazy(
  () => import("./pages/policy/TermsAndConditions"),
);
const RefundsAndCancellations = lazy(
  () => import("./pages/policy/RefundsAndCancellations"),
);
const PrivacyPolicy = lazy(
  () => import("./pages/policy/PrivacyPolicy"),
);

// ── Lazily loaded (only when user navigates to them) ─────────────────────────
const CheckoutPage = lazy(() => import("./features/order/pages/CheckoutPage"));
const PaymentProcessingPage = lazy(
  () => import("./features/order/pages/PaymentProcessingPage"),
);
const OrderSuccessPage = lazy(
  () => import("./features/order/pages/OrderSuccessPage"),
);
const OrdersListPage = lazy(
  () => import("./features/order/pages/OrderListPage"),
);
const OrderDetailPage = lazy(
  () => import("./features/order/pages/OrderDetailPage"),
);
const WalletPage = lazy(() => import("./features/wallet/pages/WalletPage"));
const NewSubscriptionPage = lazy(() => import("./features/subscription/pages/NewSubscriptionPage"));
const FeedbackPage = lazy(() => import("./pages/FeedbackPage"));
const SubscriptionPage = lazy(() => import("./features/subscription/pages/SubscriptionPage"));
const SubscriptionDetailPage = lazy(() => import("./features/subscription/pages/SubscriptionDetailPage"));

// ── Shared suspense fallback ──────────────────────────────────────────────────
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-emerald-50 via-teal-50 to-cyan-50">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-full border-4 border-brand border-t-transparent animate-spin" />
      <p className="text-slate-500 text-sm font-medium">Loading…</p>
    </div>
  </div>
);

// ── Helper: wrap a page in AppShell + ProtectedRoute ─────────────────────────
const Shell = ({ children }) => (
  <ProtectedRoute requireApproval>
    <AppShell>{children}</AppShell>
  </ProtectedRoute>
);

// ── Helper: lazy page that needs AppShell ─────────────────────────────────────
const LazyShell = ({ children }) => (
  <ProtectedRoute requireApproval>
    <AppShell>
      <Suspense fallback={<PageLoader />}>{children}</Suspense>
    </AppShell>
  </ProtectedRoute>
);

// ── Helper: lazy page that does NOT need AppShell (full-screen flow pages) ────
const LazyFull = ({ children }) => (
  <ProtectedRoute requireApproval>
    <Suspense fallback={<PageLoader />}>{children}</Suspense>
  </ProtectedRoute>
);

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <UserProvider>
            <ProductProvider>
              <DeliveryConfigProvider>
                <CartProvider>
                  <WalletProvider>
                  <SubscriptionProvider>
                  <OrderProvider>
                    <Routes>
                      {/* ── Public ───────────────────────────────────────── */}
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />
                      <Route
                        path="/contact"
                        element={
                          <Suspense fallback={<PageLoader />}>
                            <ContactUs />
                          </Suspense>
                        }
                      />
                      <Route
                        path="/terms"
                        element={
                          <Suspense fallback={<PageLoader />}>
                            <TermsAndConditions />
                          </Suspense>
                        }
                      />
                      <Route
                        path="/refunds"
                        element={
                          <Suspense fallback={<PageLoader />}>
                            <RefundsAndCancellations />
                          </Suspense>
                        }
                      />
                      <Route
                        path="/privacy"
                        element={
                          <Suspense fallback={<PageLoader />}>
                            <PrivacyPolicy />
                          </Suspense>
                        }
                      />
                      <Route
                        path="/pay/:cashfreeOrderId"
                        element={
                          <Suspense fallback={<PageLoader />}>
                            <PayPage />
                          </Suspense>
                        }
                      />
                      <Route
                        path="/download"
                        element={
                          <Suspense fallback={<PageLoader />}>
                            <DownloadApp />
                          </Suspense>
                        }
                      />
                      <Route
                        path="/pending-approval"
                        element={
                          <ProtectedRoute requireApproval={false}>
                            <PendingApprovalPage />
                          </ProtectedRoute>
                        }
                      />

                      {/* ── Main app (AppShell + nav) ─────────────────────── */}
                      {["/", "/products"].map((path) => (
                        <Route
                          key={path}
                          path={path}
                          element={
                            <Shell>
                              <ProductsPage />
                            </Shell>
                          }
                        />
                      ))}

                      <Route
                        path="/products/:id"
                        element={
                          <LazyFull>
                            <ProductDetailPage />
                          </LazyFull>
                        }
                      />

                      <Route
                        path="/cart"
                        element={
                          <LazyFull>
                            <CartPage />
                          </LazyFull>
                        }
                      />

                      <Route
                        path="/profile"
                        element={
                          <LazyFull>
                            <ProfilePage />
                          </LazyFull>
                        }
                      />

                      <Route
                        path="/wallet"
                        element={
                          <LazyFull>
                            <WalletPage />
                          </LazyFull>
                        }
                      />

                      <Route
                        path="/subscriptions"
                        element={
                          <LazyShell>
                            <SubscriptionPage />
                          </LazyShell>
                        }
                      />

                      <Route
                        path="/subscriptions/new"
                        element={
                          <LazyFull>
                            <NewSubscriptionPage />
                          </LazyFull>
                        }
                      />

                      <Route
                        path="/subscriptions/:subscriptionId"
                        element={
                          <LazyFull>
                            <SubscriptionDetailPage />
                          </LazyFull>
                        }
                      />

                      <Route
                        path="/feedback"
                        element={
                          <Suspense fallback={<PageLoader />}>
                            <FeedbackPage />
                          </Suspense>
                        }
                      />

                      <Route
                        path="/orders"
                        element={
                          <LazyShell>
                            <OrdersListPage />
                          </LazyShell>
                        }
                      />

                      <Route
                        path="/orders/:orderId"
                        element={
                          <LazyFull>
                            <OrderDetailPage />
                          </LazyFull>
                        }
                      />

                      {/* ── Full-screen payment flow (NO AppShell nav) ───── */}
                      <Route
                        path="/checkout"
                        element={
                          <LazyFull>
                            <CheckoutPage />
                          </LazyFull>
                        }
                      />

                      <Route
                        path="/payment/processing"
                        element={
                          <LazyFull>
                            <PaymentProcessingPage />
                          </LazyFull>
                        }
                      />

                      <Route
                        path="/order/success"
                        element={
                          <LazyFull>
                            <OrderSuccessPage />
                          </LazyFull>
                        }
                      />

                      {/* ── Fallback ──────────────────────────────────────── */}
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </OrderProvider>
                  </SubscriptionProvider>
                  </WalletProvider>
                </CartProvider>
              </DeliveryConfigProvider>
            </ProductProvider>
          </UserProvider>
        </AuthProvider>
      </ToastProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
