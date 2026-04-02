import { useState } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { useUser } from "../../features/user/hooks/useUser";
import { useDeliveryConfig } from "../../features/delivery/context/DeliveryConfigContext";

const DeleteAccount = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const { contactPhone, contactEmail } = useDeliveryConfig();
  const phone = contactPhone || "+916363784290";
  const email = contactEmail || "nandishhmn@gmail.com";

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand mb-6 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <h1 className="text-2xl font-black text-slate-900 mb-2">
            Delete Your Account
          </h1>
          <p className="text-sm text-slate-500 mb-6">
            We're sorry to see you go. Please read the following information
            carefully before proceeding.
          </p>

          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-800 mb-2">
              What happens when you delete your account?
            </h2>
            <div className="text-sm text-slate-600 space-y-2">
              <p>
                When you request account deletion, the following actions will be
                taken:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>
                  Your personal information (name, email, phone number) will be
                  deactivated and no longer accessible.
                </li>
                <li>Your delivery address and saved preferences will be removed.</li>
                <li>Your order history will be retained for legal and compliance purposes.</li>
                <li>Your wallet balance, if any, will be forfeited.</li>
                <li>Any active subscriptions will be cancelled.</li>
                <li>You will be immediately logged out and will not be able to log in again.</li>
              </ul>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-800 mb-2">
              Data Retention
            </h2>
            <div className="text-sm text-slate-600 space-y-2">
              <p>
                In accordance with applicable laws and regulations, we may retain
                certain transaction records and order data for a period required
                by law, even after your account is deleted. This data will not be
                used for marketing or any other purpose beyond legal compliance.
              </p>
            </div>
          </div>

          {isAuthenticated ? (
            <DeleteSection onDeleted={() => { logout(); navigate("/login"); }} />
          ) : (
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 text-center">
              <p className="text-sm text-slate-600 mb-3">
                You need to be logged in to delete your account.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand text-white rounded-xl text-sm font-semibold hover:bg-emerald-600 transition-colors"
              >
                Log in to continue
              </Link>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-2">
              Need Help?
            </h2>
            <p className="text-sm text-slate-600">
              If you have any questions or need assistance, please contact us at{" "}
              <a
                href={`mailto:${email}`}
                className="text-brand hover:underline"
              >
                {email}
              </a>{" "}
              or call{" "}
              <a href={`tel:${phone}`} className="text-brand hover:underline">
                {phone}
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const DeleteSection = ({ onDeleted }) => {
  const { deleteAccount, loading } = useUser();
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    if (!confirmed) return;
    setError(null);
    const result = await deleteAccount();
    if (result.success) {
      onDeleted();
    } else {
      setError(result.message || "Failed to delete account. Please try again.");
    }
  };

  return (
    <div className="bg-red-50 rounded-xl border border-red-200 p-5">
      <h3 className="text-base font-bold text-red-800 mb-3 flex items-center gap-2">
        <Trash2 className="w-5 h-5" />
        Permanently Delete Account
      </h3>
      <label className="flex items-start gap-3 cursor-pointer mb-4">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded border-red-300 text-red-600 focus:ring-red-500"
        />
        <span className="text-sm text-red-700">
          I understand that this action is permanent and all my data will be
          deleted. Any remaining wallet balance will be forfeited.
        </span>
      </label>
      {error && (
        <p className="text-sm text-red-600 mb-3">{error}</p>
      )}
      <button
        onClick={handleDelete}
        disabled={!confirmed || loading}
        className="w-full py-3 bg-red-600 text-white rounded-xl font-semibold text-sm hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? "Deleting..." : "Delete My Account"}
      </button>
    </div>
  );
};

export default DeleteAccount;
