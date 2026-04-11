import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../context/ProjectContext';
import { MOCK_API } from '../services/api';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from 'recharts';

/* ── Stat card ── */
const StatCard = ({ label, value, icon, color, bg }) => (
  <div className="flex-fill text-center rounded-4 p-4 d-flex flex-column align-items-center justify-content-center gap-2"
    style={{ background: bg, border: `1px solid ${color}22`, minWidth: 0 }}>
    <i className={`${icon} fs-4`} style={{ color }}></i>
    <h3 className="fw-bold mb-0" style={{ color, lineHeight: 1 }}>{value}</h3>
    <span className="fw-bold text-uppercase" style={{ fontSize: '10px', color: color + 'aa', letterSpacing: '1px' }}>{label}</span>
  </div>
);

function Home() {
  const { user } = useAuth();
  const { projects, activeProjectId, changeActiveProject, addProject } = useProjects();

  // Per-project stats
  const [tasks, setTasks]             = useState([]); // tasks of active project
  const [allTasks, setAllTasks]       = useState([]); // tasks of ALL projects

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

  // Load stats history for the chart
  useEffect(() => {
    if (!user) return;
    
    const loadHistory = async () => {
      // 1. Fetch historical stats from DB
      const history = await MOCK_API.getDailyStats(user.id);
      
      // 2. Local check: Did we save stats for today yet?
      const todayStr = new Date().toISOString().split('T')[0];
      const hasToday = history.some(s => s.date === todayStr);
      
      if (!hasToday || history.length === 0) {
        // Fetch all tasks to compute current snapshot
        const all = await MOCK_API.getAllTasks(user.id);
        const todaySnap = {
          date: todayStr,
          total: all.length,
          done: all.filter(t => t.status === 'done').length,
          active: all.filter(t => t.status !== 'done').length,
          overdue: all.filter(t => {
             const d = t.deadline ? new Date(t.deadline) : null;
             d?.setHours(0,0,0,0);
             return d && t.status !== 'done' && d < new Date().setHours(0,0,0,0);
          }).length
        };
        await MOCK_API.saveDailyStats(user.id, todaySnap);
        
        // Refresh chart data
        const updatedHistory = await MOCK_API.getDailyStats(user.id);
        formatChartData(updatedHistory);
      } else {
        formatChartData(history);
      }
    };

    const formatChartData = (raw) => {
      // Format the last 7-30 days for Recharts
      const data = raw.slice(-7).map(s => ({
        name: new Date(s.date).toLocaleDateString('vi-VN', { weekday: 'short' }),
        fullDate: s.date,
        total: s.total,
        done: s.done
      }));
      setChartData(data);
    };

    loadHistory();
  }, [user, projects]);

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

  const handleAddProject = () => {
    const name = prompt('Nhập tên dự án mới:');
    if (name && name.trim()) addProject(name.trim());
  };

  return (
    <div className="container-fluid p-0" style={{ maxWidth: '1200px' }}>

      {/* Project Tabs */}
      <div className="d-flex mb-4 px-1 align-items-center overflow-auto scrollbar-hide"
        style={{ gap: '4px', borderBottom: '1px solid var(--border-thin)' }}>
        {projects.map(proj => (
          <div key={proj.id} onClick={() => changeActiveProject(proj.id)}
            style={{ cursor: 'pointer', borderBottom: activeProjectId === proj.id ? '2px solid var(--primary)' : '2px solid transparent', marginBottom: '-1px', flexShrink: 0 }}>
            <div className="px-4 py-2 fw-bold rounded-3 small"
              style={{ color: activeProjectId === proj.id ? 'var(--primary)' : 'var(--text-secondary)', background: activeProjectId === proj.id ? 'rgba(255,61,61,0.08)' : 'transparent', whiteSpace: 'nowrap' }}>
              {proj.name}
            </div>
          </div>
        ))}
        <div onClick={handleAddProject}
          className="fw-bold px-3 py-2 flex-shrink-0"
          style={{ cursor: 'pointer', color: 'var(--text-muted)', whiteSpace: 'nowrap', opacity: 0.6, transition: 'opacity 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '1'}
          onMouseLeave={e => e.currentTarget.style.opacity = '0.6'}>
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
      <div className="d-flex gap-3 mb-4 flex-wrap">
        <StatCard label="Chưa làm"   value={todoCount}        icon="bi-circle"                   color="#94A3B8" bg="rgba(148,163,184,0.05)" />
        <StatCard label="Đang làm"   value={inProgressCount}  icon="bi-clock-fill"               color="#F59E0B" bg="rgba(245,158,11,0.05)"  />
        <StatCard label="Hoàn thành" value={doneCount}        icon="bi-check-circle-fill"         color="#10B981" bg="rgba(16,185,129,0.05)"  />
        <StatCard label="Quá hạn"    value={overdueCount}     icon="bi-exclamation-triangle-fill" color="#FF3D3D" bg="rgba(255,61,61,0.05)"   />
        <StatCard label="Tổng task"  value={tasks.length}     icon="bi-list-task"                 color="#818CF8" bg="rgba(129,140,248,0.05)" />
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

    </div>
  );
}

export default Home;
