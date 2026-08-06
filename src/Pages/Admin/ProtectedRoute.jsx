import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/admin" replace />;

  try {
    const user = jwtDecode(token);
    // Reject expired tokens instead of letting them pass.
    if (user.exp && user.exp * 1000 < Date.now()) {
      localStorage.removeItem("token");
      return <Navigate to="/admin" replace />;
    }
    return children;
  } catch {
    localStorage.removeItem("token");
    return <Navigate to="/admin" replace />;
  }
}
