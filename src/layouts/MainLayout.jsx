import { Outlet, Navigate, useLocation } from 'react-router-dom';
import Navbar from '../components/navbar';
import Topbar from '../components/Topbar';
import { useAuth } from '../context/AuthContext';

function MainLayout() {
  const { user, loading } = useAuth();
  const location = useLocation(); // Theo dõi đường dẫn URL hiện hành
  
  if (loading) return <div className="text-white p-5 d-flex justify-content-center">Đang tải cấu hình FlowSpace...</div>;
  if (!user) return <Navigate to="/login" replace />; 

  return (
    <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-dark)', color: 'white' }}>
      {/* Sidebar - sticky via its own position:sticky */}
      <Navbar />
      
      {/* Right column: topbar + scrollable content */}
      <div className="d-flex flex-column flex-grow-1" style={{ minWidth: 0, height: '100vh', overflow: 'hidden' }}>
         <Topbar />
         <main className="flex-grow-1 p-4 overflow-auto" style={{ scrollBehavior: 'smooth' }}>
           <div key={location.pathname} className="page-transition">
              <Outlet />
           </div>
         </main>
      </div>
    </div>
  )
}

export default MainLayout;
