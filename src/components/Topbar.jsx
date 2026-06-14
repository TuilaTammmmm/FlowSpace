import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../context/ProjectContext';
import { MOCK_API } from '../services/api';

/* ── Add Project Modal ── */
function AddProjectModal({ onAdd, onClose }) {
  const [name, setName] = useState('');
  return (
    <div className="position-fixed d-flex align-items-center justify-content-center"
      style={{ inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 2000, backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div className="card-premium p-5 shadow-premium" style={{ width: '400px' }} onClick={e => e.stopPropagation()}>
        <h5 className="fw-bold mb-3" style={{ color: 'var(--text-primary)' }}>Tạo dự án mới</h5>
        <input autoFocus className="form-control mb-4" placeholder="Tên dự án..." value={name} onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && name.trim()) { onAdd(name.trim()); onClose(); } }} />
        <div className="d-flex gap-3 justify-content-end">
          <button className="btn text-secondary fw-bold" onClick={onClose}>Hủy</button>
          <button className="btn btn-primary-red fw-bold px-4" onClick={() => { if (name.trim()) { onAdd(name.trim()); onClose(); } }}>Bắt đầu ngay</button>
        </div>
      </div>
    </div>
  );
}

/* ── Project Rename/Delete confirmation ── */
function ProjectActionsModal({ project, onRename, onDelete, onClose }) {
  const [mode, setMode]       = useState('menu'); 
  const [newName, setNewName] = useState(project?.name || '');
  const [deleteInput, setDeleteInput] = useState('');

  useEffect(() => { setNewName(project?.name || ''); setDeleteInput(''); setMode('menu'); }, [project]);

  if (!project) return null;
  const expectedDelete = `DELETE/${project.name}`;

  return (
    <div
      className="position-fixed d-flex align-items-center justify-content-center"
      style={{ inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 2000, backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="shadow-premium"
        style={{ background: 'var(--surface-1)', border: '1px solid var(--border-thin)', borderRadius: '16px', width: '420px', overflow: 'hidden' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="d-flex justify-content-between align-items-center px-5 py-4 border-bottom" style={{ borderColor: 'var(--border-thin)' }}>
          <span className="fw-bold" style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Quản lý dự án: {project.name}</span>
          <button className="btn p-0 text-secondary" style={{ background: 'none', border: 'none', fontSize: '18px' }} onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <div className="p-5">
          {mode === 'menu' && (
            <div className="d-flex flex-column gap-3">
              <button onClick={() => setMode('rename')}
                className="btn fw-bold w-100 py-3 d-flex align-items-center gap-3 rounded-3"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-thin)', color: 'var(--text-primary)' }}>
                <i className="bi bi-pencil-fill" style={{ color: 'var(--primary)' }}></i> Đổi tên dự án
              </button>
              <button onClick={() => {
                  MOCK_API.toggleMuteProject(project.id, !project.isMuted).then(() => window.location.reload());
                }}
                className="btn fw-bold w-100 py-3 d-flex align-items-center gap-3 rounded-3"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-thin)', color: 'var(--text-primary)' }}>
                <i className={`bi ${project.isMuted ? 'bi-bell-fill' : 'bi-bell-slash-fill'}`} style={{ color: 'var(--warning)' }}></i> 
                {project.isMuted ? 'Bật thông báo' : 'Tắt thông báo'}
              </button>
              <button onClick={() => setMode('delete')}
                className="btn fw-bold w-100 py-3 d-flex align-items-center gap-3 rounded-3"
                style={{ background: 'rgba(255,61,61,0.04)', border: '1px solid rgba(255,61,61,0.2)', color: '#ef4444' }}>
                <i className="bi bi-trash-fill"></i> Xóa dự án
              </button>
            </div>
          )}

          {mode === 'rename' && (
            <div>
              <p className="text-secondary small mb-3">Nhập tên mới cho dự án:</p>
              <input
                autoFocus
                className="form-control mb-4"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { onRename(project.id, newName); onClose(); } }}
              />
              <div className="d-flex gap-3 justify-content-end">
                <button className="btn text-secondary fw-bold" onClick={() => setMode('menu')}>Quay lại</button>
                <button className="btn btn-primary-red fw-bold px-4"
                  onClick={() => { if (newName.trim()) { onRename(project.id, newName.trim()); onClose(); } }}>
                  Lưu tên mới
                </button>
              </div>
            </div>
          )}

          {mode === 'delete' && (
            <div>
              <div className="p-3 rounded-3 mb-4" style={{ background: 'rgba(255,61,61,0.06)', border: '1px solid rgba(255,61,61,0.2)' }}>
                <p className="text-secondary small mb-2">
                  Hành động này sẽ xóa vĩnh viễn dự án và <strong style={{ color: 'var(--text-primary)' }}>tất cả task</strong> bên trong. Không thể hoàn tác!
                </p>
                <p className="mb-0 small" style={{ color: '#ef4444', fontWeight: 600 }}>
                  Nhập: <code style={{ background: 'rgba(255,61,61,0.15)', padding: '2px 6px', borderRadius: '4px', color: '#ef4444' }}>{expectedDelete}</code> để xác nhận
                </p>
              </div>
              <input
                autoFocus
                className="form-control mb-4"
                placeholder={expectedDelete}
                value={deleteInput}
                onChange={e => setDeleteInput(e.target.value)}
              />
              <div className="d-flex gap-3 justify-content-end">
                <button className="btn text-secondary fw-bold" onClick={() => setMode('menu')}>Quay lại</button>
                <button
                  className="btn fw-bold px-4"
                  style={{ background: '#dc3545', color: 'white', border: 'none', borderRadius: '10px', opacity: deleteInput === expectedDelete ? 1 : 0.4 }}
                  disabled={deleteInput !== expectedDelete}
                  onClick={() => { onDelete(project.id); onClose(); }}>
                  <i className="bi bi-trash me-2"></i> Xóa vĩnh viễn
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { projects, activeProjectId, changeActiveProject, addProject, deleteProject, renameProject } = useProjects();

  const hideProjectTabs = location.pathname === '/setting' || location.pathname === '/user';
  const [projectAction, setProjectAction] = useState(null);
  const [showAddProject, setShowAddProject] = useState(false);

  const [showNotif, setShowNotif]       = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [overdueNotifs, setOverdueNotifs] = useState([]);
  const [readIds, setReadIds]           = useState(new Set()); 

  // Pomodoro state
  const [pomoDuration, setPomoDuration] = useState(25 * 60);
  const [pomoTime, setPomoTime] = useState(25 * 60);
  const [pomoActive, setPomoActive] = useState(false);

  const playSound = () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.play().catch(e => console.log('Audio error:', e));
  };

  useEffect(() => {
    let interval = null;
    if (pomoActive && pomoTime > 0) {
      interval = setInterval(() => setPomoTime(t => t - 1), 1000);
    } else if (pomoTime === 0 && pomoActive) {
      setPomoActive(false);
      playSound();
      alert("Hết giờ tập trung (Pomodoro)!");
    }
    return () => clearInterval(interval);
  }, [pomoActive, pomoTime]);

  const togglePomo = () => setPomoActive(!pomoActive);
  const resetPomo = () => { setPomoActive(false); setPomoTime(pomoDuration); };

  const changeDuration = () => {
    if (pomoActive) return;
    const next = pomoDuration === 25*60 ? 15*60 : pomoDuration === 15*60 ? 5*60 : 25*60;
    setPomoDuration(next);
    setPomoTime(next);
  };
  
  const formatPomo = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

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

      {/* Left side: Pomodoro & Project Tabs */}
      <div className="d-flex align-items-center gap-3">
        
        {/* Pomodoro */}
        <div className="d-flex align-items-center gap-2" style={{ background: 'var(--surface-2)', padding: '4px 12px', borderRadius: '20px', border: '1px solid var(--border-thin)' }}>
          <i className="bi bi-clock-history text-danger hover-scale" style={{ cursor: 'pointer' }} onClick={changeDuration} title="Nhấn để đổi thời gian (25m/15m/5m)"></i>
          <span className="fw-bold fs-5" style={{ color: pomoTime < 60 ? 'var(--primary)' : 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
            {formatPomo(pomoTime)}
          </span>
          <button className="btn btn-sm p-0 ms-2 text-secondary hover-scale" onClick={togglePomo}>
            <i className={`bi ${pomoActive ? 'bi-pause-fill' : 'bi-play-fill'} fs-5`}></i>
          </button>
          <button className="btn btn-sm p-0 ms-1 text-secondary hover-scale" onClick={resetPomo}>
            <i className="bi bi-arrow-counterclockwise fs-5"></i>
          </button>
        </div>

        {/* Project Switcher */}
        {!hideProjectTabs && (
          <div className="d-flex align-items-center workspace-tabs-scroll" style={{ gap: '4px' }}>
            {projects.map(proj => (
              <div key={proj.id} 
                className="position-relative group"
                style={{ flexShrink: 0 }}>
                <div 
                  onClick={() => changeActiveProject(proj.id)}
                  className="px-4 py-2 fw-bold rounded-3 small d-flex align-items-center gap-2 transition-all"
                  style={{ 
                    cursor: 'pointer',
                    color: activeProjectId === proj.id ? '#FFF' : 'var(--text-secondary)', 
                    background: activeProjectId === proj.id ? 'var(--primary)' : 'transparent',
                    border: activeProjectId === proj.id ? 'none' : '1px solid transparent',
                    whiteSpace: 'nowrap' 
                  }}>
                  <span>{proj.name}</span>
                  
                  <div className="d-flex align-items-center gap-1 ms-1">
                    {proj.isMuted && (
                      <i className="bi bi-bell-slash-fill" style={{ fontSize: '10px', opacity: 0.8 }}></i>
                    )}
                    <div onClick={(e) => { 
                      e.stopPropagation(); 
                      setProjectAction(proj);
                    }} className="hover-scale ms-1" style={{ cursor: 'pointer', opacity: 0.6 }}>
                      <i className="bi bi-gear-fill" style={{ fontSize: '10px' }}></i>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div onClick={() => setShowAddProject(true)}
              className="fw-bold px-3 py-2 flex-shrink-0"
              style={{ cursor: 'pointer', color: 'var(--text-muted)', whiteSpace: 'nowrap', opacity: 0.6 }}>
              <i className="bi bi-plus-lg"></i>
            </div>
          </div>
        )}
      </div>

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
                <button onClick={async () => {
                    setShowUserMenu(false); // Đóng menu ngay lập tức
                    try {
                      await logout();
                      navigate('/login');
                    } catch (err) {
                      console.error("Logout failed:", err);
                      // Vẫn reset state local để thoát kẹt
                      window.location.href = '/login';
                    }
                  }}
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

      {/* Project manage modal */}
      {projectAction && (
        <ProjectActionsModal
          project={projectAction}
          onRename={renameProject}
          onDelete={deleteProject}
          onClose={() => setProjectAction(null)}
        />
      )}

      {/* Add Project Modal */}
      {showAddProject && (
        <AddProjectModal onAdd={addProject} onClose={() => setShowAddProject(false)} />
      )}
    </div>
  );
}

export default Topbar;
