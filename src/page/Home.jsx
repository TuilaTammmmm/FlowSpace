import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../context/ProjectContext';
import { MOCK_API } from '../services/api';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from 'recharts';

/* ── Add Project Modal ── */
function AddProjectModal({ onAdd, onClose }) {
  const [name, setName] = useState('');
  return (
    <div className="position-fixed d-flex align-items-center justify-content-center"
      style={{ inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 2000, backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div className="card-premium p-5 shadow-premium" style={{ width: '400px' }} onClick={e => e.stopPropagation()}>
        <h5 className="fw-bold text-white mb-3">Tạo dự án mới</h5>
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
  const [mode, setMode]       = useState('menu'); // 'menu' | 'rename' | 'delete'
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
          <span className="fw-bold text-white" style={{ fontSize: '13px' }}>Quản lý dự án: {project.name}</span>
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
                  Hành động này sẽ xóa vĩnh viễn dự án và <strong className="text-white">tất cả task</strong> bên trong. Không thể hoàn tác!
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

/* ── Stat card ── */
const StatCard = ({ label, value, icon, color, bg }) => (
  <div className="flex-fill text-center rounded-4 p-4 d-flex flex-column align-items-center justify-content-center gap-2"
    style={{ background: bg, border: `1px solid ${color}22`, minWidth: 0, transition: 'all 0.3s ease' }}>
    <i className={`${icon} fs-4`} style={{ color }}></i>
    <h3 className="fw-bold mb-0" style={{ color, lineHeight: 1 }}>{value}</h3>
    <span className="fw-bold text-uppercase" style={{ fontSize: '10px', color: color + 'aa', letterSpacing: '1px' }}>{label}</span>
  </div>
);

function Home() {
  const { user } = useAuth();
  const { projects, activeProjectId, changeActiveProject, addProject, deleteProject, renameProject } = useProjects();

  // Per-project stats
  const [tasks, setTasks]             = useState([]); // tasks of active project
  const [allTasks, setAllTasks]       = useState([]); // tasks of ALL projects
  const [projectAction, setProjectAction] = useState(null);
  const [showAddProject, setShowAddProject] = useState(false);

  // Derived
  const [doneCount, setDoneCount]           = useState(0);
  const [todoCount, setTodoCount]           = useState(0);
  const [inProgressCount, setInProgressCount] = useState(0);
  const [overdueCount, setOverdueCount]     = useState(0);
  const [percent, setPercent]               = useState(0);
  const [chartData, setChartData]           = useState([]);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Chào buổi sáng';
    if (h < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  // Load stats history for the chart + Live Update today's stats
  useEffect(() => {
    if (!user) return;
    
    const updateAndLoadStats = async () => {
      // 1. Compute current day snapshot LIVE from allTasks
      const todayStr = new Date().toISOString().split('T')[0];
      const todaySnap = {
        date: todayStr,
        total: allTasks.length,
        done: allTasks.filter(t => t.status === 'done').length,
        active: allTasks.filter(t => t.status !== 'done').length,
        overdue: allTasks.filter(t => {
           const d = t.deadline ? new Date(t.deadline) : null;
           d?.setHours(0,0,0,0);
           return d && t.status !== 'done' && d < new Date().setHours(0,0,0,0);
        }).length
      };

      // 2. Only save if we actually have tasks (avoid blanking stats on initial load if sync is slow)
      if (allTasks.length > 0) {
        await MOCK_API.saveDailyStats(user.id, todaySnap);
      }

      // 3. Fetch full history for the chart
      const history = await MOCK_API.getDailyStats(user.id);
      formatChartData(history);
    };

    const formatChartData = (raw) => {
      const data = raw.slice(-7).map(s => ({
        name: new Date(s.date).toLocaleDateString('vi-VN', { weekday: 'short' }),
        fullDate: s.date,
        total: s.total,
        done: s.done
      }));
      setChartData(data);
    };

    updateAndLoadStats();
  }, [user, allTasks]); // Runs whenever tasks change

  // Load current project tasks for the ring/stats
  useEffect(() => {
    if (!activeProjectId) {
      setTasks([]); setDoneCount(0); setInProgressCount(0); setTodoCount(0); setOverdueCount(0); setPercent(0);
      return;
    }
    MOCK_API.getTasksByProjectId(activeProjectId).then(data => {
      setTasks(data);
      const todayDay   = new Date(); todayDay.setHours(0, 0, 0, 0);
      const done       = data.filter(t => t.status === 'done').length;
      const inProg     = data.filter(t => t.status === 'in-progress').length;
      const todo       = data.filter(t => t.status === 'todo').length;
      const total      = data.length;
      const overdue    = data.filter(t => t.deadline && t.status !== 'done' && new Date(t.deadline) < todayDay).length;

      setDoneCount(done);
      setInProgressCount(inProg);
      setTodoCount(todo);
      setOverdueCount(overdue);
      setPercent(total > 0 ? Math.round((done / total) * 100) : 0);
    });
  }, [activeProjectId]);

  // Load all tasks across all projects for the overdue hero warning
  useEffect(() => {
    if (!user) return;
    MOCK_API.getAllTasks(user.id).then(setAllTasks);
  }, [user, projects]);

  const allOverdueCount = (() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return allTasks.filter(t => t.deadline && t.status !== 'done' && new Date(t.deadline) < today).length;
  })();

  const handleAddProject = () => setShowAddProject(true);

  if (projects.length === 0) return (
    <div className="container-fluid p-0 d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '70vh' }}>
      <div className="text-center p-5 rounded-5 shadow-premium" style={{ background: 'var(--surface-1)', border: '1px solid var(--border-thin)', maxWidth: '400px' }}>
        <i className="bi bi-folder-plus display-1 text-primary mb-4 d-block opacity-25"></i>
        <h4 className="fw-bold text-white mb-3">Chưa có dự án nào</h4>
        <p className="text-secondary small mb-5">Khởi tạo không gian làm việc đầu tiên của bạn để bắt đầu quản lý nhiệm vụ hiệu quả hơn.</p>
        <button onClick={handleAddProject} className="btn btn-primary-red px-5 py-3 fw-bold rounded-3 shadow-lg w-100">
           Tạo dự án đầu tiên ngay
        </button>
      </div>
      {showAddProject && <AddProjectModal onAdd={addProject} onClose={() => setShowAddProject(false)} />}
    </div>
  );

  return (
    <div className="container-fluid p-0" style={{ maxWidth: '1200px' }}>

      {/* Project Tabs */}
      <div className="d-flex mb-4 px-1 align-items-center workspace-tabs-scroll"
        style={{ gap: '4px', borderBottom: '1px solid var(--border-thin)', paddingBottom: '4px' }}>
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
              
              {/* Internal Tab Controls */}
              <div className="d-flex align-items-center gap-1 ms-1">
                {proj.isMuted && (
                  <i className="bi bi-bell-slash-fill" style={{ fontSize: '10px', opacity: 0.8 }}></i>
                )}
                <div onClick={(e) => { 
                  e.stopPropagation(); 
                  setProjectAction(proj);
                }} className="hover-scale">
                  <i className="bi bi-gear-fill" style={{ fontSize: '10px', opacity: 0.6 }}></i>
                </div>
              </div>
            </div>
          </div>
        ))}
        <div onClick={handleAddProject}
          className="fw-bold px-3 py-2 flex-shrink-0"
          style={{ cursor: 'pointer', color: 'var(--text-muted)', whiteSpace: 'nowrap', opacity: 0.6 }}>
          <i className="bi bi-plus-lg"></i>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="px-5 py-4 rounded-4 mb-4 shadow-premium position-relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #8B0000 100%)' }}>
        <div style={{ zIndex: 2, position: 'relative' }}>
          <h1 className="fw-bold mb-1 text-white" style={{ fontSize: '26px' }}>
            {getGreeting()}, {user?.name?.split(' ').pop() || 'bạn'}! 👋
          </h1>
          <p className="mb-0 text-white" style={{ opacity: 0.85, fontSize: '14px' }}>
            {tasks.length === 0
              ? 'Chưa có task nào. Hãy tạo task đầu tiên!'
              : `Bạn đang có ${tasks.filter(t => t.status !== 'done').length} nhiệm vụ chưa hoàn thành.`}
            {allOverdueCount > 0 && (
              <span className="ms-3 fw-bold" style={{ color: '#FFD700' }}>
                ⚠ {allOverdueCount} task quá hạn!
              </span>
            )}
          </p>
        </div>
        <div className="position-absolute d-flex gap-3" style={{ right: '5%', top: '15%', opacity: 0.12 }}>
          <div className="border border-4 border-white rounded-3" style={{ width: '70px', height: '100px' }}></div>
          <div className="border border-4 border-white rounded-3" style={{ width: '70px', height: '100px' }}></div>
        </div>
      </div>

      {/* 5 Stat Cards — including Chưa làm */}
      <div className="stat-grid-adaptive mb-4">
        <StatCard label="Chưa làm"   value={todoCount}        icon="bi-circle"                   color="#94A3B8" bg="rgba(148,163,184,0.08)" />
        <StatCard label="Đang làm"   value={inProgressCount}  icon="bi-clock-fill"               color="#F59E0B" bg="rgba(245,158,11,0.08)"  />
        <StatCard label="Hoàn thành" value={doneCount}        icon="bi-check-circle-fill"         color="#10B981" bg="rgba(16,185,129,0.08)"  />
        <StatCard label="Quá hạn"    value={overdueCount}     icon="bi-exclamation-triangle-fill" color="#FF3D3D" bg="rgba(255,61,61,0.08)"   />
        <StatCard label="Tổng task"  value={tasks.length}     icon="bi-list-task"                 color="#818CF8" bg="rgba(129,140,248,0.08)" />
      </div>

      {/* Charts Row */}
      <div className="row g-4 mb-4">

        {/* Area Chart */}
        <div className="col-lg-8">
          <div className="card-premium h-100 shadow-premium">
            <div className="d-flex justify-content-between align-items-start mb-4">
              <div>
                <h6 className="fw-bold mb-1" style={{ fontSize: '14px', color: 'var(--text-primary)' }}>Hiệu suất tuần này</h6>
                <p className="mb-0" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {activeProjectId ? `Dự án: ${projects.find(p => p.id === activeProjectId)?.name}` : 'Chọn dự án để xem hiệu suất'}
                </p>
              </div>
              <div className="d-flex gap-3 align-items-center">
                <span className="small fw-bold d-flex align-items-center gap-1" style={{ color: '#10B981' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }}></span> Hoàn thành
                </span>
                <span className="small fw-bold d-flex align-items-center gap-1" style={{ color: 'var(--primary)' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', display: 'inline-block' }}></span> Tổng
                </span>
              </div>
            </div>

            {chartData.length > 0 ? (
              <div style={{ height: '230px', marginLeft: '-10px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="gTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="var(--primary)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}   />
                      </linearGradient>
                      <linearGradient id="gDone" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#10B981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}   />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} dy={8} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border-thin)', borderRadius: '10px', padding: '10px 14px' }}
                      itemStyle={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '13px' }}
                      labelStyle={{ color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '4px' }}
                    />
                    <Area type="monotone" dataKey="total" stroke="var(--primary)" strokeWidth={3} fill="url(#gTotal)" dot={false} activeDot={{ r: 5, fill: 'var(--primary)', stroke: 'white', strokeWidth: 2 }} />
                    <Area type="monotone" dataKey="done"  stroke="#10B981"        strokeWidth={3} fill="url(#gDone)"  dot={false} activeDot={{ r: 5, fill: '#10B981',        stroke: 'white', strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="d-flex align-items-center justify-content-center" style={{ height: '230px' }}>
                <div className="text-center opacity-40">
                  <i className="bi bi-bar-chart-line fs-1 d-block mb-2" style={{ color: 'var(--text-muted)' }}></i>
                  <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Chọn dự án để xem biểu đồ</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SVG Ring Progress */}
        <div className="col-lg-4">
          <div className="card-premium h-100 shadow-premium d-flex flex-column">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h6 className="fw-bold mb-1" style={{ fontSize: '14px', color: 'var(--text-primary)' }}>Tiến độ dự án</h6>
                <p className="mb-0" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Tỷ lệ hoàn thành</p>
              </div>
              <i className="bi bi-pie-chart-fill" style={{ fontSize: '18px', color: 'var(--text-muted)' }}></i>
            </div>

            <div className="flex-grow-1 d-flex align-items-center justify-content-center my-2">
              <div style={{ position: 'relative', width: '140px', height: '140px' }}>
                <svg width="140" height="140" viewBox="0 0 140 140">
                  <circle cx="70" cy="70" r="56" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
                  <circle cx="70" cy="70" r="56" fill="none"
                    stroke="var(--primary)" strokeWidth="12" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - percent / 100)}`}
                    transform="rotate(-90 70 70)"
                    style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                  />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="fw-bold" style={{ fontSize: '28px', color: 'var(--primary)', lineHeight: 1 }}>{percent}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>%</span>
                </div>
              </div>
            </div>

            <div className="d-flex gap-3">
              <div className="flex-fill text-center rounded-3 py-3" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.12)' }}>
                <h4 className="fw-bold mb-0" style={{ color: '#10B981' }}>{doneCount}</h4>
                <span className="fw-bold" style={{ fontSize: '10px', color: '#10B981', letterSpacing: '0.5px' }}>ĐÃ XONG</span>
              </div>
              <div className="flex-fill text-center rounded-3 py-3" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)' }}>
                <h4 className="fw-bold mb-0" style={{ color: '#F59E0B' }}>{inProgressCount}</h4>
                <span className="fw-bold" style={{ fontSize: '10px', color: '#F59E0B', letterSpacing: '0.5px' }}>ĐANG LÀM</span>
              </div>
            </div>
          </div>
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

export default Home;
