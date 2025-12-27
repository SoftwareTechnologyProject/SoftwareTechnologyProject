import { Navigate } from 'react-router-dom';

/**
 * Component bảo vệ routes yêu cầu authentication và/hoặc role cụ thể
 * @param {ReactNode} children - Component con cần bảo vệ
 * @param {string} requiredRole - Role yêu cầu (optional): 'ADMIN', 'USER', 'STAFF'
 */
export function PrivateRoute({ children, requiredRole }) {
  const token = localStorage.getItem('accessToken');
  
  // Không có token → redirect đến login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    // Decode JWT để lấy thông tin (không cần library, tự parse)
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    // Kiểm tra token expired
    if (payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('accessToken');
      return <Navigate to="/login" replace />;
    }

    // Kiểm tra role nếu được yêu cầu
    if (requiredRole) {
      // Role trong JWT có thể ở dạng "ROLE_ADMIN" hoặc trong authorities array
      const userRole = payload.role || payload.authorities?.[0] || '';
      const hasRole = userRole.includes(requiredRole);
      
      if (!hasRole) {
        // Không đủ quyền → redirect về login
        return <Navigate to="/login" replace />;
      }
    }

    return children;
    
  } catch (error) {
    // Token invalid hoặc không parse được
    console.error('Invalid token:', error);
    localStorage.removeItem('accessToken');
    return <Navigate to="/login" replace />;
  }
}
