import { Navigate } from "react-router";
import { isLoggedIn, getRole } from "@/lib/auth";

export function ProtectedRoute({ children, requiredRole }) {
  // Not logged in at all → send to login
  if (!isLoggedIn()) {
    return <Navigate to="/FlashSlots/login" replace />;
  }

  // Logged in but wrong role → send them to their correct view
  if (requiredRole && getRole() !== requiredRole) {
    const role = getRole();
    if (role === "BUSINESS") return <Navigate to="/FlashSlots/vendor" replace />;
    if (role === "CLIENT") return <Navigate to="/FlashSlots/client" replace />;
    return <Navigate to="/FlashSlots/login" replace />;
  }

  return children;
}