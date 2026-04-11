import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layout toàn màn hình KHÔNG SIDEBAR - Dành cho Đăng Nhập / Đăng Ký
function AuthLayout() {
  const { user, loading } = useAuth();

  if (loading) return null;
  
  // Đã đăng nhập rồi thì cấm quay lại trang Đăng Nhập nữa, đá thẳng vào Trang chủ (Home)
  if (user) return <Navigate to="/" replace />; 

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center auth-theme-bg">
        <Outlet /> 
    </div>
  )
}

export default AuthLayout;
