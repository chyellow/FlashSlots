import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute({ children, requiredRole }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    if (user.role === "BUSINESS") {
      return <Navigate to="/vendor" replace />;
    }

    if (user.role === "CLIENT") {
      return <Navigate to="/client" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  return children;
}