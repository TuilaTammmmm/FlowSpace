import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../context/ProjectContext';
import { MOCK_API } from '../services/api';

/* ── Editable social link row ── */
function SocialLinkRow({ icon, platform, value, editMode, onSave }) {
  const [val, setVal] = useState(value || '');
  useEffect(() => { setVal(value || ''); }, [value]);

  return (
    <div className="d-flex align-items-center gap-3 mb-3">
      <button
        onClick={() => val && window.open(val, '_blank')}
        className="btn rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0"
        style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-thin)', opacity: val ? 0.85 : 0.4 }}
        onMouseEnter={e => val && (e.currentTarget.style.opacity = '1')}
        onMouseLeave={e => e.currentTarget.style.opacity = val ? '0.85' : '0.4'}
        title={val || platform}
      >
        <i className={`bi bi-${icon}`}></i>
      </button>
      {editMode ? (
        <input
          className="inline-edit-input flex-grow-1"
          style={{ fontSize: '13px' }}
          placeholder={`URL ${platform}...`}
          value={val}
          onChange={e => setVal(e.target.value)}
          onBlur={() => onSave(val)}
          onKeyDown={e => { if (e.key === 'Enter') onSave(val); }}
        />
      ) : (
        <span className="small fw-medium" style={{ color: val ? 'var(--text-secondary)' : 'var(--text-muted)', fontSize: '13px', wordBreak: 'break-all' }}>
          {val || <span className="fst-italic opacity-50">Chưa đặt link {platform}</span>}
        </span>
      )}
    </div>
  );
}

/* ── InlineField: only edit when editMode=true ── */
function InlineField({ label, value, type = 'text', textarea = false, editMode, onSave }) {
  const [val, setVal] = useState(value || '');
  useEffect(() => { setVal(value || ''); }, [value]);

  const save = () => { if (val !== value) onSave(val); };
  const handleKey = (e) => {
    if (e.key === 'Enter' && !textarea) save();
    if (e.key === 'Escape') setVal(value || '');
  };

  const inputStyle = {
    fontSize: '14px',
    width: '100%',
    display: 'block',
    background: 'rgba(255,255,255,0.07)',
    color: '#FFFFFF',
    border: 'none',
    borderBottom: '2px solid var(--primary)',
    borderRadius: '4px',
    padding: '5px 8px',
    outline: 'none',
    fontFamily: 'inherit',
  };

  return (
    <div className="mb-4">
      <div style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '6px' }}>
        {label}
      </div>
      {editMode ? (
        textarea ? (
          <textarea rows={3} style={{ ...inputStyle, resize: 'vertical' }}
            value={val} onChange={e => setVal(e.target.value)} onBlur={save} onKeyDown={handleKey} />
        ) : (
          <input type={type} style={inputStyle}
            value={val} onChange={e => setVal(e.target.value)} onBlur={save} onKeyDown={handleKey} />
        )
      ) : (
        <div style={{ minHeight: '22px', fontWeight: 600, fontSize: '14px', color: val ? 'var(--text-primary)' : '#475569' }}>
          {val || <span style={{ fontStyle: 'italic', color: '#475569' }}>Chưa có thông tin...</span>}
        </div>
      )}
    </div>
  );
}

/* ──────── Main User Page ──────── */
function User() {
  const { user, logout, updateUserProfile } = useAuth();
  const { projects } = useProjects();
  const [allTasks, setAllTasks]     = useState([]);
  const [editMode, setEditMode]     = useState(false);
  const [socials, setSocials]       = useState({
    facebook: user?.facebook || '',
    github:   user?.github   || '',
    twitter:  user?.twitter  || '',
  });

  // Load ALL tasks across all projects for stats
  useEffect(() => {
    if (!user) return;
    MOCK_API.getAllTasks(user.id).then(data => setAllTasks(data));
  }, [user, projects]);

  // Sync socials from user object
  useEffect(() => {
    setSocials({
      facebook: user?.facebook || '',
      github:   user?.github   || 'https://github.com/TuilaTammmmm',
      twitter:  user?.twitter  || '',
    });
  }, [user]);

  const handleSave = async (field, val) => {
    await updateUserProfile({ [field]: val });
  };

  const handleSaveSocial = async (platform, url) => {
    setSocials(prev => ({ ...prev, [platform]: url }));
    await updateUserProfile({ [platform]: url });
  };

  const handleSaveAll = () => setEditMode(false);

  const doneCount  = allTasks.filter(t => t.status === 'done').length;
  const totalCount = allTasks.length;

  return (
    <div className="container-fluid py-2 d-flex justify-content-center mb-5">
      <div className="card-premium p-0 overflow-hidden shadow-premium"
        style={{ width: '100%', maxWidth: '860px', border: '1px solid var(--border-thin)' }}>

        {/* Banner */}
        <div style={{ height: '140px', background: 'linear-gradient(135deg, var(--primary) 0%, #8B0000 100%)' }} />

        {/* Profile area */}
        <div className="px-5 pb-5" style={{ marginTop: '-52px' }}>

          {/* Avatar + Edit toggle */}
          <div className="d-flex justify-content-between align-items-end mb-4">
            <div className="d-flex align-items-end gap-4">
              <div 
                className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-premium position-relative overflow-hidden cursor-pointer"
                style={{ width: '104px', height: '104px', fontSize: '36px', background: 'var(--primary)', border: '4px solid var(--bg-deep)' }}
                onClick={() => document.getElementById('avatarInput').click()}
              >
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  user?.name?.substring(0, 2).toUpperCase() || 'DT'
                )}
                {editMode && (
                  <div className="position-absolute bottom-0 start-0 end-0 py-1 bg-dark bg-opacity-75 text-center" style={{ fontSize: '9px', opacity: 0.8 }}>
                    Sửa ảnh
                  </div>
                )}
              </div>
              <input 
                id="avatarInput" 
                type="file" 
                hidden 
                accept="image/*" 
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = async () => {
                      await handleSave('avatar_url', reader.result);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />

              <div className="pb-1">
                <h3 className="fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>{user?.name}</h3>
                <div className="d-flex gap-2 flex-wrap">
                  <span className="badge px-2 py-1" style={{ background: 'var(--primary)', fontSize: '10px' }}>
                    <i className="bi bi-patch-check-fill me-1"></i> Thành viên
                  </span>
                  <span className="badge px-2 py-1" style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--text-secondary)', fontSize: '10px' }}>
                    <i className="bi bi-fingerprint me-1"></i> ID: {user?.id?.toString().substring(0, 6) || '1'}
                  </span>
                </div>
              </div>
            </div>

            {editMode ? (
              <button onClick={handleSaveAll}
                className="btn fw-bold px-4 py-2 d-flex align-items-center gap-2"
                style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '10px', boxShadow: '0 4px 12px var(--primary-glow)' }}>
                <i className="bi bi-check2"></i> Lưu thay đổi
              </button>
            ) : (
              <button onClick={() => setEditMode(true)}
                className="btn fw-bold px-4 py-2 d-flex align-items-center gap-2"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-thin)', color: 'var(--text-secondary)', borderRadius: '10px' }}>
                <i className="bi bi-pencil-fill" style={{ color: 'var(--primary)' }}></i> Chỉnh sửa
              </button>
            )}
          </div>

          {editMode && (
            <div className="d-flex align-items-center gap-2 mb-4 px-4 py-2 rounded-3"
              style={{ background: 'rgba(255,61,61,0.06)', border: '1px solid rgba(255,61,61,0.2)', fontSize: '13px' }}>
              <i className="bi bi-pencil-square" style={{ color: 'var(--primary)' }}></i>
              <span style={{ color: 'var(--text-secondary)' }}>Đang chỉnh sửa — nhấn <strong style={{ color: 'var(--text-primary)' }}>Lưu thay đổi</strong> khi hoàn tất</span>
            </div>
          )}

          {/* Content grid */}
          <div className="row g-4">
            {/* Left */}
            <div className="col-md-5 d-flex flex-column gap-4">
              {/* Contact */}
              <div className="p-4 rounded-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-thin)' }}>
                <h6 className="fw-bold text-uppercase mb-4" style={{ fontSize: '10px', letterSpacing: '1.5px', color: 'var(--primary)' }}>
                  <i className="bi bi-person-lines-fill me-2"></i> Liên hệ
                </h6>
                <InlineField label="Họ và Tên" value={user?.name} editMode={editMode} onSave={val => handleSave('name', val)} />
                <InlineField label="Email" value={user?.email} type="email" editMode={editMode} onSave={val => handleSave('email', val)} />
                <InlineField label="Khoa / Ban" value={user?.department} editMode={editMode} onSave={val => handleSave('department', val)} />
              </div>

              {/* Social */}
              <div className="p-4 rounded-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-thin)' }}>
                <h6 className="fw-bold text-uppercase mb-4" style={{ fontSize: '10px', letterSpacing: '1.5px', color: 'var(--primary)' }}>
                  <i className="bi bi-share-fill me-2"></i> Mạng xã hội
                </h6>
                <SocialLinkRow icon="facebook"  platform="Facebook" value={socials.facebook} editMode={editMode} onSave={url => handleSaveSocial('facebook', url)} />
                <SocialLinkRow icon="github"    platform="GitHub"   value={socials.github}   editMode={editMode} onSave={url => handleSaveSocial('github', url)} />
                <SocialLinkRow icon="twitter-x" platform="X / Twitter" value={socials.twitter} editMode={editMode} onSave={url => handleSaveSocial('twitter', url)} />
              </div>
            </div>

            {/* Right */}
            <div className="col-md-7 d-flex flex-column gap-4">
              <div className="p-4 rounded-4 flex-grow-1" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-thin)' }}>
                <h6 className="fw-bold text-uppercase mb-4" style={{ fontSize: '10px', letterSpacing: '1.5px', color: 'var(--primary)' }}>
                  <i className="bi bi-info-circle-fill me-2"></i> Giới thiệu
                </h6>

                <InlineField label="Về bản thân" value={user?.bio} textarea editMode={editMode}
                  onSave={val => handleSave('bio', val)} />

                {/* Stats — tổng từ TẤT CẢ dự án */}
                <div className="row g-3 mt-2">
                  <div className="col-6">
                    <div className="text-center p-4 rounded-4" style={{ background: 'rgba(255, 61, 61, 0.08)', border: '1px solid rgba(255, 61, 61, 0.2)' }}>
                      <h1 className="fw-bold mb-1" style={{ color: '#FF4D4D' }}>{projects.length}</h1>
                      <div className="fw-bold" style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255, 255, 255, 0.5)' }}>Tổng dự án</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="text-center p-4 rounded-4" style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                      <h1 className="fw-bold mb-1" style={{ color: '#10B981' }}>{doneCount}</h1>
                      <div className="fw-bold" style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255, 255, 255, 0.5)' }}>Task xong</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Logout */}
          <div className="mt-5 pt-4 text-center border-top" style={{ borderColor: 'var(--border-thin)' }}>
            <button onClick={logout} className="btn fw-bold small"
              style={{ color: '#ef4444', opacity: 0.7, border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '8px 20px' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '1'}
              onMouseLeave={e => e.currentTarget.style.opacity = '0.7'}>
              <i className="bi bi-box-arrow-right me-2"></i> Đăng xuất tài khoản
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default User;
