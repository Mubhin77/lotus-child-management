import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  allowedRoles: ("admin" | "teacher" | "parent")[];
  children: React.ReactNode;
}

function ProtectedRoute({
  allowedRoles,
  children,
}: ProtectedRouteProps) {
  const accessToken = localStorage.getItem("access_token");
  const userRole = localStorage.getItem("user_role");

  // Not logged in
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but wrong role
  if (!userRole || !allowedRoles.includes(userRole as any)) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;