import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MOCK_API } from '../services/api';

function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [showNotif, setShowNotif]       = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [overdueNotifs, setOverdueNotifs] = useState([]);
  const [readIds, setReadIds]           = useState(new Set()); 

  // Load persistent read notifications
  useEffect(() => {
    const saved = localStorage.getItem('flowspace_read_notifs');
    if (saved) setReadIds(new Set(JSON.parse(saved)));
  }, []);

  const notifRef = useRef(null);
  const userRef  = useRef(null);

  // Load overdue task notifications
  useEffect(() => {
    if (!user) return;
    MOCK_API.getAllTasks(user.id).then(tasks => {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      setOverdueNotifs(
        tasks.filter(t => t.deadline && t.status !== 'done' && new Date(t.deadline) < today)
      );
    });
  }, [user]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
      if (userRef.current  && !userRef.current.contains(e.target))  setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unreadCount = overdueNotifs.filter(t => !readIds.has(t.id)).length;

  const markRead = (id) => {
    const next = new Set([...readIds, id]);
    setReadIds(next);
    localStorage.setItem('flowspace_read_notifs', JSON.stringify([...next]));
  };

  const markAllRead = () => {
    const next = new Set(overdueNotifs.map(t => t.id));
    setReadIds(next);
    localStorage.setItem('flowspace_read_notifs', JSON.stringify([...next]));
  };

  const deleteNotif = (id) => setOverdueNotifs(prev => prev.filter(n => n.id !== id));

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '';

  const dropdownStyle = {
    position: 'absolute',
    top: 'calc(100% + 10px)',
    right: 0,
    zIndex: 9999,
    background: 'var(--surface-1)',
    border: '1px solid var(--border-thin)',
    borderRadius: '14px',
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
  };

  return (
    <div className="d-flex justify-content-between align-items-center py-3 px-4 topbar-wrapper w-100"
      style={{ position: 'relative', zIndex: 200 }}>

      {/* Left spacer (was Search) */}
      <div style={{ width: '340px' }}></div>

      {/* Right group */}
      <div className="d-flex align-items-center gap-3">

        {/* ── Bell ── */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button id="notif-btn"
            className="btn p-0 d-flex align-items-center justify-content-center position-relative"
            style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-thin)', borderRadius: '10px' }}
            onClick={() => { setShowNotif(p => !p); setShowUserMenu(false); }}>
            <i className="bi bi-bell-fill text-secondary" style={{ fontSize: '15px' }}></i>
            {unreadCount > 0 && (
              <span className="position-absolute d-flex align-items-center justify-content-center fw-bold text-white"
                style={{ top: '-5px', right: '-5px', width: '16px', height: '16px', background: 'var(--primary)', borderRadius: '50%', fontSize: '9px' }}>
                {unreadCount}
              </span>
            )}
          </button>

          {showNotif && (
            <div id="notif-dropdown" style={{ ...dropdownStyle, width: '320px' }}>
              {/* Header */}
              <div className="px-4 py-3 d-flex justify-content-between align-items-center" style={{ borderBottom: '1px solid var(--border-thin)' }}>
                <span className="fw-bold small" style={{ color: 'var(--text-primary)' }}>Thông báo</span>
                <div className="d-flex align-items-center gap-2">
                  {unreadCount > 0 && (
                    <span className="badge rounded-pill fw-bold"
                      style={{ background: 'rgba(255,61,61,0.15)', color: 'var(--primary)', fontSize: '11px' }}>
                      {unreadCount} chưa đọc
                    </span>
                  )}
                  {overdueNotifs.length > 0 && unreadCount > 0 && (
                    <button onClick={markAllRead}
                      className="btn btn-sm fw-bold px-2 py-1"
                      style={{ fontSize: '11px', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-thin)', borderRadius: '6px' }}>
                      Đọc tất cả
                    </button>
                  )}
                </div>
              </div>

              {overdueNotifs.length === 0 ? (
                <div className="py-5 text-center">
                  <i className="bi bi-bell-slash fs-3 d-block mb-2" style={{ color: 'var(--text-muted)' }}></i>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Không có thông báo mới</span>
                </div>
              ) : (
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {overdueNotifs.map(task => {
                    const isRead = readIds.has(task.id);
                    return (
                      <div key={task.id}
                        className={`px-4 py-3 d-flex align-items-start gap-3 position-relative ${isRead ? 'notif-item-read' : ''}`}
                        onClick={() => { markRead(task.id); navigate('/kanban'); setShowNotif(false); }}
                        style={{
                          borderBottom: '1px solid var(--border-thin)', cursor: 'pointer',
                          transition: 'background 0.15s, opacity 0.3s, filter 0.3s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        {/* Delete button */}
                        <button 
                          className="btn p-1 position-absolute top-0 end-0 mt-2 me-2"
                          style={{ color: 'var(--text-muted)', fontSize: '10px' }}
                          onClick={(e) => { e.stopPropagation(); deleteNotif(task.id); }}
                        >
                          <i className="bi bi-x-lg"></i>
                        </button>

                        <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 mt-1"
                          style={{ width: '28px', height: '28px', background: isRead ? 'rgba(255,255,255,0.05)' : 'rgba(255,61,61,0.12)' }}>
                          <i className="bi bi-exclamation-triangle-fill"
                            style={{ fontSize: '12px', color: isRead ? 'var(--text-muted)' : 'var(--primary)' }}></i>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="fw-bold small mb-1" style={{ color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.title}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                            Quá hạn từ <span style={{ color: isRead ? 'var(--text-muted)' : 'var(--primary)' }}>{fmtDate(task.deadline)}</span>
                          </div>
                        </div>
                        {!isRead && (
                          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--primary)', flexShrink: 0, marginTop: '6px' }}></span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {overdueNotifs.length > 0 && unreadCount === 0 && (
                <div className="px-4 py-3 text-center" style={{ borderTop: '1px solid var(--border-thin)' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>✓ Tất cả đã được đọc</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ width: '1px', height: '24px', background: 'var(--border-thin)' }}></div>

        {/* ── User button ── */}
        <div style={{ position: 'relative' }} ref={userRef}>
          <button id="user-topbar-btn"
            className="btn p-0 d-flex align-items-center gap-2"
            style={{ background: 'none', border: 'none' }}
            onClick={() => { setShowUserMenu(p => !p); setShowNotif(false); }}>
            <div className="text-end d-none d-md-block" style={{ lineHeight: '1.2' }}>
              <div className="fw-bold" style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{user?.name || 'Người dùng'}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Thành viên</div>
            </div>
            <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0 overflow-hidden"
              style={{ width: '36px', height: '36px', fontSize: '13px', background: 'var(--primary)', boxShadow: '0 4px 12px var(--primary-glow)' }}>
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                user?.name?.substring(0, 2).toUpperCase() || 'DT'
              )}
            </div>
          </button>

          {showUserMenu && (
            <div id="user-dropdown" style={{ ...dropdownStyle, width: '210px' }}>
              <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border-thin)' }}>
                <div className="fw-bold small" style={{ color: 'var(--text-primary)' }}>{user?.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{user?.email}</div>
              </div>
              {[
                { icon: 'bi-person-circle', label: 'Trang cá nhân', path: '/user' },
                { icon: 'bi-gear',          label: 'Cài đặt',       path: '/setting' },
              ].map(item => (
                <button key={item.path}
                  onClick={() => { navigate(item.path); setShowUserMenu(false); }}
                  className="btn w-100 text-start d-flex align-items-center gap-3 px-4 py-2"
                  style={{ background: 'none', border: 'none', fontSize: '13px', color: 'var(--text-secondary)', borderRadius: 0 }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                  <i className={item.icon}></i> {item.label}
                </button>
              ))}
              <div style={{ borderTop: '1px solid var(--border-thin)' }}>
                <button onClick={logout}
                  className="btn w-100 text-start d-flex align-items-center gap-3 px-4 py-2"
                  style={{ background: 'none', border: 'none', fontSize: '13px', color: '#ef4444', borderRadius: 0 }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.06)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                  <i className="bi bi-box-arrow-right"></i> Đăng xuất
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Topbar;
