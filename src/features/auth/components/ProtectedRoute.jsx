import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

/**
 * ProtectedRoute - Wraps routes that require authentication
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {boolean} props.requireApproval - Whether route requires admin approval
 * @param {boolean} props.requireProfile - Whether route requires completed profile (address)
 */
const ProtectedRoute = ({
  children,
  requireApproval = false,
  requireProfile = false,
}) => {
  const { isAuthenticated, isApproved, isPending, loading, user } = useAuth();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-brand mx-auto"></div>
          <p className="mt-4 text-slate-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If route requires approval and user is pending, redirect to pending page
  if (requireApproval && isPending) {
    return <Navigate to="/pending-approval" replace />;
  }

  // Render children if all checks pass
  return children;
};

export default ProtectedRoute;
