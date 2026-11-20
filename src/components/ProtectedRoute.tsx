// src/components/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function ProtectedRoute() {
  const { currentUser } = useApp();
  const location = useLocation();

  // Strict check: User must be signed in with valid credentials
  // If not logged in, always redirect to /auth/signin and require ID + password
  if (!currentUser || !currentUser.email) {
    const redirectParam = location.pathname !== '/'
      ? `?redirect=${encodeURIComponent(location.pathname + location.search)}`
      : '';
    return <Navigate to={`/auth/signin${redirectParam}`} replace />;
  }

  return <Outlet />;
}
