import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { MOCK_API } from '../services/api';
import { Nav, Button } from 'react-bootstrap';

function Setting() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('interface');
  const [accentColor, setAccentColor] = useState('#FF3D3D');
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    // Restore accent color
    const savedColor = localStorage.getItem('flowspace_color');
    if (savedColor) {
      setAccentColor(savedColor);
      document.documentElement.style.setProperty('--primary', savedColor);
    }

    // Restore dark mode preference
    const savedMode = localStorage.getItem('flowspace_darkmode');
    const isDark = savedMode !== 'false';
    setIsDarkMode(isDark);
    if (isDark) {
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
    }
  }, []);

  const handleColorChange = (color) => {
    setAccentColor(color);
    localStorage.setItem('flowspace_color', color);
    document.documentElement.style.setProperty('--primary', color);
    // Also update glow
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    document.documentElement.style.setProperty('--primary-glow', `rgba(${r},${g},${b},0.4)`);
  };

  const handleDarkModeToggle = (e) => {
    const isDark = e.target.checked;
    setIsDarkMode(isDark);
    localStorage.setItem('flowspace_darkmode', String(isDark));
    if (isDark) {
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
    }
  };

  const handleClearData = () => {
    if (window.confirm('Cảnh báo: Hành động này sẽ xóa toàn bộ dữ liệu trên trình duyệt. Bạn có chắc chắn?')) {
      MOCK_API.clearData();
      localStorage.removeItem('flowspace_color');
      localStorage.removeItem('flowspace_darkmode');
      localStorage.removeItem('flowspace_user');
      window.location.href = '/login';
    }
  };

  const TABS = [
    { id: 'interface', label: 'Giao diện', icon: 'bi-palette' },
    { id: 'notifications', label: 'Thông báo', icon: 'bi-bell' },
    { id: 'advanced', label: 'Nâng cao', icon: 'bi-sliders' },
  ];

  const COLORS = [
    { hex: '#FF3D3D', label: 'Đỏ' },
    { hex: '#4F46E5', label: 'Tím lam' },
    { hex: '#10B981', label: 'Xanh lá' },
    { hex: '#F59E0B', label: 'Vàng' },
    { hex: '#06B6D4', label: 'Cyan' },
    { hex: '#8B5CF6', label: 'Violet' },
    { hex: '#EC4899', label: 'Hồng' },
    { hex: '#64748B', label: 'Xám' },
  ];

  return (
    <div className="container-fluid py-2 d-flex flex-column align-items-center mb-5">

      {/* Tabs */}
      <div className="d-flex mb-5 border-bottom w-100" style={{ borderColor: 'var(--border-thin)', maxWidth: '850px', gap: '0' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`btn fw-bold d-flex align-items-center gap-2 px-4 py-3 rounded-0 border-0 ${activeTab === tab.id ? 'text-primary' : 'text-secondary opacity-50'}`}
            style={{
              background: 'none',
              borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
              letterSpacing: '0.5px',
              fontSize: '14px',
            }}
          >
            <i className={tab.icon}></i> {tab.label}
          </button>
        ))}
      </div>

      {/* Panel */}
      <div className="card-premium p-0 overflow-hidden shadow-premium" style={{ width: '100%', maxWidth: '850px' }}>
        <div className="px-5 py-3 border-bottom d-flex align-items-center gap-2" style={{ borderColor: 'var(--border-thin)' }}>
          <i className={`bi ${activeTab === 'interface' ? 'bi-palette-fill' : activeTab === 'notifications' ? 'bi-bell-fill' : 'bi-sliders'}`} style={{ color: 'var(--primary)' }}></i>
          <h6 className="fw-bold mb-0 text-white">
            {activeTab === 'interface' ? 'Giao diện' : activeTab === 'notifications' ? 'Thông báo' : 'Nâng cao'}
          </h6>
        </div>

        <div className="p-5 d-flex flex-column gap-5">

          {/* ---- TAB GIAO DIỆN ---- */}
          {activeTab === 'interface' && (
            <>
              {/* Dark Mode */}
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="fw-bold text-white mb-1">Giao diện tối (Dark Mode)</h6>
                  <p className="text-secondary small mb-0">Bảo vệ mắt của bạn khi làm việc vào ban đêm.</p>
                </div>
                <div className="form-check form-switch fs-4 m-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    checked={isDarkMode}
                    onChange={handleDarkModeToggle}
                    style={{ cursor: 'pointer', backgroundColor: isDarkMode ? 'var(--primary)' : undefined, borderColor: 'var(--primary)' }}
                  />
                </div>
              </div>

              <hr style={{ borderColor: 'var(--border-thin)', margin: '0' }} />

              {/* Accent Color */}
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="fw-bold text-white mb-1">Màu Chủ Đạo</h6>
                  <p className="text-secondary small mb-0">Chọn tông màu yêu thích cho không gian làm việc.</p>
                </div>
                <div className="d-flex gap-3 align-items-center">
                  {COLORS.map(({ hex }) => {
                    const isSelected = accentColor === hex;
                    return (
                      <div
                        key={hex}
                        onClick={() => handleColorChange(hex)}
                        title={hex}
                        style={{
                          width: isSelected ? '30px' : '22px',
                          height: isSelected ? '30px' : '22px',
                          backgroundColor: hex,
                          borderRadius: '50%',
                          cursor: 'pointer',
                          border: isSelected ? '2px solid white' : '2px solid transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s ease',
                          boxShadow: isSelected ? `0 0 0 3px ${hex}55` : 'none',
                        }}
                      >
                        {isSelected && <i className="bi bi-check-lg text-white" style={{ fontSize: '12px' }}></i>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* ---- TAB THÔNG BÁO ---- */}
          {activeTab === 'notifications' && (
            <div className="text-center py-5 opacity-50">
              <i className="bi bi-bell display-4 text-muted mb-3 d-block"></i>
              <p className="text-secondary fw-medium">Tính năng đang được phát triển...</p>
            </div>
          )}

          {/* ---- TAB NÂNG CAO ---- */}
          {activeTab === 'advanced' && (
            <div className="d-flex flex-column gap-4">
              {/* Danger Zone only */}
              <div className="p-4 rounded-4" style={{ border: '1px solid rgba(255,61,61,0.3)', backgroundColor: 'rgba(255,61,61,0.03)' }}>
                <h6 className="fw-bold text-danger mb-1">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i> Danger Zone
                </h6>
                <p className="text-secondary small mb-4">
                  Hành động này sẽ xóa toàn bộ dữ liệu hiện tại và đưa ứng dụng về trạng thái nguyên bản. Không thể hoàn tác.
                </p>
                <button
                  onClick={handleClearData}
                  className="btn fw-bold px-4 py-2"
                  style={{ background: '#dc3545', color: 'white', border: 'none', borderRadius: '10px' }}
                >
                  <i className="bi bi-trash me-2"></i> Xóa toàn bộ dữ liệu
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Setting;
