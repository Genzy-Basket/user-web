import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useDeliveryConfig } from "../../delivery/context/DeliveryConfigContext";
import authAPI from "../../../api/endpoints/auth.api";

const PendingApprovalPage = () => {
  const navigate = useNavigate();
  const { user, logout, isApproved } = useAuth();
  const { contactEmail } = useDeliveryConfig();
  const supportEmail = contactEmail || "nandishhmn@gmail.com";
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    if (isApproved) {
      navigate("/", { replace: true });
    }
  }, [user, isApproved, navigate]);

  const checkStatus = useCallback(async () => {
    if (!user?._id) return;
    setChecking(true);
    try {
      const res = await authAPI.checkApprovalStatus(user._id);
      if (res.data?.isApproved) {
        logout();
        navigate("/login", { replace: true });
      }
    } catch {
      // silently ignore — user can retry
    } finally {
      setChecking(false);
    }
  }, [user, logout, navigate]);

  // Check approval status on mount
  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-100 via-white to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Pending Icon */}
          <div className="mx-auto flex items-center justify-center w-20 h-20 bg-amber-100 rounded-full mb-6">
            <svg
              className="w-10 h-10 text-amber-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Account Pending Approval
          </h1>

          {/* Message */}
          <p className="text-gray-600 mb-6">
            Thank you for registering,{" "}
            <span className="font-semibold">{user.fullName}</span>! Your account
            is currently under review by our admin team.
          </p>

          {/* Info Box */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-left">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-amber-600 mt-0.5 mr-3 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-amber-900 mb-2">
                  What happens next?
                </h3>
                <ul className="text-sm text-amber-800 space-y-1">
                  <li>• Our team will review your account details</li>
                  <li>• You'll receive a notification once approved</li>
                  <li>• This usually takes 24-48 hours</li>
                  <li>• You can check back anytime by logging in</li>
                </ul>
              </div>
            </div>
          </div>

          {/* User Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Your Account Details
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium text-gray-900">
                  {user.fullName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phone:</span>
                <span className="font-medium text-gray-900">
                  {user.phoneNumber}
                </span>
              </div>
              {user.email && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium text-gray-900">
                    {user.email}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                  Pending Approval
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={checkStatus}
              disabled={checking}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {checking ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Checking...
                </>
              ) : (
                "Check Status"
              )}
            </button>

            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="w-full px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
            >
              Logout
            </button>
          </div>

          {/* Help Text */}
          <p className="mt-6 text-xs text-gray-500">
            Need help? Contact support at{" "}
            <a
              href={`mailto:${supportEmail}`}
              className="text-indigo-600 hover:text-indigo-500"
            >
              {supportEmail}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PendingApprovalPage;
