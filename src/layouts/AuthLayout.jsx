import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layout toàn màn hình KHÔNG SIDEBAR - Dành cho Đăng Nhập / Đăng Ký
function AuthLayout() {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center auth-aurora-bg">
      <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}></div>
      <p className="text-secondary small fw-bold text-uppercase tracking-widest">Khởi động FlowSpace...</p>
    </div>
  );
  
  if (user) return <Navigate to="/" replace />; 

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center auth-theme-bg">
        <Outlet /> 
    </div>
  )
}

export default AuthLayout;
