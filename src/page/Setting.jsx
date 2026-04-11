import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { MOCK_API } from '../services/api';

function Setting() {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('interface');
  const [accentColor, setAccentColor] = useState('#FF3D3D');

  useEffect(() => {
    // Restore accent color
    const savedColor = localStorage.getItem('flowspace_color');
    if (savedColor) {
      setAccentColor(savedColor);
      document.documentElement.style.setProperty('--primary', savedColor);
    }
    // Force Dark Mode on mount
    document.body.classList.remove('light-mode');
  }, []);

  const handleColorChange = (color) => {
    setAccentColor(color);
    localStorage.setItem('flowspace_color', color);
    document.documentElement.style.setProperty('--primary', color);
    // Update glow
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    document.documentElement.style.setProperty('--primary-glow', `rgba(${r},${g},${b},0.4)`);
  };

  const handleClearData = () => {
    if (window.confirm('Cảnh báo: Hành động này sẽ xóa toàn bộ dữ liệu. Bạn có chắc chắn?')) {
      MOCK_API.clearData();
      localStorage.removeItem('flowspace_color');
      localStorage.removeItem('flowspace_user');
      logout();
      window.location.href = '/login';
    }
  };

  const TABS = [
    { id: 'interface', label: 'Tùy chỉnh', icon: 'bi-palette' },
    { id: 'advanced',  label: 'Nâng cao',   icon: 'bi-sliders' },
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
    <div className="container-fluid py-2 d-flex flex-column align-items-center mb-5 page-transition">

      {/* Tabs */}
      <div className="d-flex mb-5 border-bottom w-100" style={{ borderColor: 'var(--border-thin)', maxWidth: '850px', gap: '0' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`btn fw-bold d-flex align-items-center gap-2 px-4 py-3 rounded-0 border-0 transition-all ${activeTab === tab.id ? 'text-primary' : 'text-secondary opacity-50'}`}
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
          <i className={`bi ${activeTab === 'interface' ? 'bi-palette-fill' : 'bi-sliders'}`} style={{ color: 'var(--primary)' }}></i>
          <h6 className="fw-bold mb-0 text-white">
            {activeTab === 'interface' ? 'Tùy chỉnh nội dung' : 'Quản lý nâng cao'}
          </h6>
        </div>

        <div className="p-5 d-flex flex-column gap-5">

          {/* ---- TAB GIAO DIỆN ---- */}
          {activeTab === 'interface' && (
            <>
              {/* Info */}
              <div className="mb-2">
                 <h6 className="fw-bold text-white mb-1">Giao diện Premium Dark</h6>
                 <p className="text-secondary small mb-0">Ứng dụng đã được tối ưu hóa cho chế độ tối chuyên nghiệp.</p>
              </div>

              <hr style={{ borderColor: 'var(--border-thin)', margin: '0' }} />

              {/* Accent Color */}
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-4">
                <div>
                  <h6 className="fw-bold text-white mb-1">Màu Chủ Đạo</h6>
                  <p className="text-secondary small mb-0">Chọn tông màu yêu thích cho không gian làm việc.</p>
                </div>
                <div className="d-flex gap-3 align-items-center flex-wrap">
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
                          borderRadius: '10px',
                          cursor: 'pointer',
                          border: isSelected ? '2px solid white' : '2px solid transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
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

          {/* ---- TAB NÂNG CAO ---- */}
          {activeTab === 'advanced' && (
            <div className="d-flex flex-column gap-4">
              {/* Danger Zone only */}
              <div className="p-4 rounded-4" style={{ border: '1px solid rgba(255,61,61,0.3)', backgroundColor: 'rgba(255,61,61,0.03)' }}>
                <h6 className="fw-bold text-danger mb-1">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i> Danger Zone
                </h6>
                <p className="text-secondary small mb-4">
                  Hành động này sẽ xóa toàn bộ dữ liệu người dùng và dự án. Không thể hoàn tác.
                </p>
                <button
                  onClick={handleClearData}
                  className="btn fw-bold px-4 py-2"
                  style={{ background: '#dc3545', color: 'white', border: 'none', borderRadius: '10px' }}
                >
                  <i className="bi bi-trash me-2"></i> Xóa toàn bộ dữ liệu tài khoản
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
