import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import RegisterForm from "../components/RegisterForm";

const RegisterPage = () => {
  const navigate = useNavigate();
  const {
    register,
    isAuthenticated,
    isPending,
    loading: authLoading,
    error,
    clearError,
  } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      if (isPending) {
        navigate("/pending-approval", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  }, [isAuthenticated, isPending, authLoading, navigate]);

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleRegister = async (userData) => {
    setLoading(true);
    clearError();

    try {
      const result = await register(userData);

      if (result.success) {
        if (result.data.isApproved === false) {
          navigate("/pending-approval");
        } else {
          navigate("/");
        }
      }
    } catch (err) {
      if (import.meta.env.DEV) console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand rounded-2xl mb-4 shadow-lg">
            <span className="text-3xl">🥬</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="mt-2 text-gray-600">Join Genzy Basket today</p>
        </div>

        {/* Register Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 sm:p-8">
          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4" role="alert">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-red-600 mt-0.5 mr-3 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="flex-1 text-sm font-medium text-red-800">{error}</p>
                <button
                  onClick={clearError}
                  className="text-red-600 hover:text-red-800"
                  aria-label="Dismiss error"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Info Banner */}
          <div className="mb-6 bg-brand-50 border border-brand-100 rounded-xl p-4">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-brand mt-0.5 mr-3 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm text-emerald-800">
                Your account will require admin approval before you can access
                all features. You'll be notified once approved.
              </p>
            </div>
          </div>

          <RegisterForm onSubmit={handleRegister} loading={loading} />

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-brand hover:text-brand-dark transition-colors"
              >
                Login here
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

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-slate-500">
          &copy; 2025 Genzy Basket. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
