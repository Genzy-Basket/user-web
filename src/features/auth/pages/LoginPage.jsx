import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useApiCall } from "../../../api/use.apiCall";
import LoginForm from "../components/LoginForm";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isPending, loading: authLoading } = useAuth();

  const { execute: handleLogin, loading } = useApiCall(login, {
    onSuccess: (result) => {
      if (!result) return;
      if (result.data?.accountStatus === "pending") {
        navigate("/pending-approval");
      } else {
        navigate("/");
      }
    },
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate(isPending ? "/pending-approval" : "/", { replace: true });
    }
  }, [isAuthenticated, isPending, authLoading, navigate]);

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand rounded-2xl mb-4 shadow-lg">
            <span className="text-3xl">🥬</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="mt-2 text-gray-600">Login to your account</p>
        </div>

        {/* Card — no inline error banner; errors go to the global toast */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 sm:p-8">
          <LoginForm onSubmit={handleLogin} loading={loading} />

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-brand hover:text-brand-dark transition-colors"
              >
                Create one now
              </Link>
            </p>
          </div>
        </div>

        {/* Download App Banner */}
        <Link
          to="/download"
          className="mt-6 flex items-center justify-center gap-2 w-full py-3 bg-white border-2 border-brand text-brand rounded-xl font-bold text-sm hover:bg-brand hover:text-white transition-all"
        >
          <span className="text-lg">📱</span>
          Download our Android App
        </Link>

        <div className="mt-6 text-center">
          <div className="flex flex-wrap justify-center gap-3 text-xs text-slate-400">
            <Link to="/contact" className="hover:text-brand transition-colors">Contact Us</Link>
            <span>·</span>
            <Link to="/terms" className="hover:text-brand transition-colors">Terms &amp; Conditions</Link>
            <span>·</span>
            <Link to="/refunds" className="hover:text-brand transition-colors">Refunds &amp; Cancellations</Link>
          </div>
          <p className="mt-3 text-sm text-gray-500">
            &copy; 2025 Genzy Basket. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
