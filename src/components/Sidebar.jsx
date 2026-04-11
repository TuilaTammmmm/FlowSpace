import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('flowspace_nav_collapsed');
    if (saved === 'true') setCollapsed(true);
  }, []);

  const toggleCollapse = () => {
    setCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('flowspace_nav_collapsed', String(next));
      return next;
    });
  };

  const w = collapsed ? '68px' : '236px';

  // nav-link: dùng padding cố định cho icon để không bị nảy khi co/mở
  const navLinkStyle = (isActive) => ({
    padding: '11px 0',
    paddingLeft: collapsed ? '22px' : isActive ? '15px' : '18px', 
    justifyContent: 'flex-start', // Luôn giữ flex-start để icon không bị nảy ra giữa
    transition: 'all 0.2s ease',
    borderLeft: isActive && !collapsed ? '3px solid var(--primary)' : '3px solid transparent',
    borderRadius: 0,
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    marginBottom: '2px',
    color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
    background: isActive ? 'linear-gradient(90deg, rgba(255,255,255,0.06) 0%, transparent 100%)' : 'transparent',
    opacity: isActive ? 1 : 0.75,
  });

  const renderNavItem = (to, iconClass, text) => (
    <NavLink to={to} end={to === '/'} title={collapsed ? text : undefined}
      style={({ isActive }) => navLinkStyle(isActive)}
    >
      <i className={`${iconClass} fs-5`} style={{ minWidth: '22px', textAlign: 'center', flexShrink: 0 }}></i>
      <span
        className="fw-medium ms-3"
        style={{
          fontSize: '14px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          maxWidth: collapsed ? '0px' : '160px',
          opacity: collapsed ? 0 : 1,
          transition: 'max-width 0.25s ease, opacity 0.18s ease',
        }}
      >
        {text}
      </span>
    </NavLink>
  );

  return (
    <nav
      className="d-flex flex-column sidebar-wrapper shadow-premium"
      style={{
        width: w,
        minWidth: w,
        height: '100vh',
        position: 'sticky',
        top: 0,
        transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1), min-width 0.25s cubic-bezier(0.4,0,0.2,1)',
        overflowX: 'hidden',
        zIndex: 100,
        flexShrink: 0,
      }}
    >
      {/* Logo row */}
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: '16px 14px 16px 18px',
        paddingLeft: collapsed ? '17px' : '18px',
        marginBottom: '12px',
        transition: 'padding 0.25s ease',
        overflow: 'hidden'
      }}>
        {/* Red icon — click to toggle */}
        <div
          className="rounded-circle d-flex justify-content-center align-items-center flex-shrink-0 transition-all hover-scale"
          style={{ 
            width: '34px', height: '34px', 
            background: 'var(--surface-3)', 
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)', 
            cursor: 'pointer',
            overflow: 'hidden',
            border: '1px solid var(--border-medium)'
          }}
          onClick={toggleCollapse}
          title={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
        >
          <img src="/logo.jpg" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        <span className="fw-bold text-white transition-all"
          style={{ 
            letterSpacing: '-0.5px', 
            fontSize: '17px', 
            whiteSpace: 'nowrap', 
            marginLeft: '12px', 
            flex: 1,
            opacity: collapsed ? 0 : 1,
            maxWidth: collapsed ? '0' : '200px',
            overflow: 'hidden',
            visibility: collapsed ? 'hidden' : 'visible'
          }}>
          FlowSpace
        </span>

        <button onClick={toggleCollapse}
          className="btn p-0 d-flex align-items-center justify-content-center text-secondary transition-all hover-scale"
          style={{ 
            background: 'rgba(255,255,255,0.05)', border: 'none', width: '28px', height: '28px', flexShrink: 0, cursor: 'pointer',
            borderRadius: '8px',
            opacity: collapsed ? 0 : 1,
            maxWidth: collapsed ? '0' : '28px',
            overflow: 'hidden',
            visibility: collapsed ? 'hidden' : 'visible'
          }}
          title="Thu gọn">
          <i className="bi bi-chevron-left" style={{ fontSize: '12px' }}></i>
        </button>
      </div>

      {/* Main nav */}
      <div style={{ flex: 1 }}>
        {renderNavItem('/', 'bi bi-house-door', 'Trang chủ')}
        {renderNavItem('/kanban', 'bi bi-kanban', 'Bảng Kanban')}
      </div>

      {/* Bottom nav */}
      <div style={{ borderTop: '1px solid var(--border-thin)', paddingTop: '10px', paddingBottom: '14px' }}>
        {renderNavItem('/setting', 'bi bi-gear', 'Cài đặt')}
        {renderNavItem('/user', 'bi bi-person-circle', 'Tài khoản')}
      </div>
    </nav>
  );
}

export default Sidebar;
