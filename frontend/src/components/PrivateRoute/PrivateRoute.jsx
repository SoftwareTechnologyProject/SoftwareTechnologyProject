import { Navigate } from "react-router-dom";

export function PrivateRoute({ children, requiredRoles = [] }) {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));

    // Token hết hạn
    if (payload.exp * 1000 < Date.now()) {
      localStorage.removeItem("accessToken");
      return <Navigate to="/login" replace />;
    }

    // Lấy roles từ JWT
    const roles =
      payload.authorities?.map(r => r.replace("ROLE_", "")) ||
      [payload.role?.replace("ROLE_", "")];

    // Check quyền
    if (
      requiredRoles.length > 0 &&
      !requiredRoles.some(role => roles.includes(role))
    ) {
      return <Navigate to="/" replace />;
    }

    return children;
  } catch (err) {
    localStorage.removeItem("accessToken");
    return <Navigate to="/login" replace />;
  }
}
