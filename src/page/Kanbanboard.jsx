import { useState, useEffect } from 'react';
import { MOCK_API } from '../services/api';
import { useProjects } from '../context/ProjectContext';
import Newtask from '../components/Newtask';
import TaskCard from '../components/TaskCard';

/* ── Project Rename/Delete confirmation modal ── */
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

/* ── Kanban Column ── */
function KanbanColumn({ status, label, icon, color, accentBg, tasks, onDragOver, onDrop, onUpdate, onDelete, onAddTask }) {
  const [showNewTask, setShowNewTask] = useState(false);

  const colTasks = tasks.filter(t => t.status === status);

  return (
    <div
      className={`kanban-col kanban-col-${status === 'todo' ? 'todo' : status === 'in-progress' ? 'inprogress' : 'done'} p-3`}
      style={{ minWidth: '310px', maxWidth: '310px', flex: '0 0 310px' }}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, status)}
    >
      {/* Column header */}
      <div className="d-flex justify-content-between align-items-center mb-3 px-1">
        <div className="d-flex align-items-center gap-2">
          <i className={icon} style={{ fontSize: '14px', color }}></i>
          <span className="fw-bold text-white" style={{ fontSize: '14px' }}>{label}</span>
          <span className="badge rounded-pill fw-bold"
            style={{ background: accentBg, color, fontSize: '11px', padding: '2px 8px' }}>
            {colTasks.length}
          </span>
        </div>
        <button
          onClick={() => setShowNewTask(true)}
          className="btn btn-sm p-0 d-flex align-items-center justify-content-center text-secondary"
          style={{ background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: '8px', width: '28px', height: '28px' }}>
          <i className="bi bi-plus" style={{ fontSize: '16px' }}></i>
        </button>
      </div>

      {/* Tasks Scroll Area */}
      <div className="kanban-scroll-area d-flex flex-column gap-3">
        {colTasks.length === 0 ? (
          <div className="d-flex flex-column align-items-center justify-content-center p-5 rounded-4"
            style={{ border: '1px dashed var(--border-thin)', background: 'rgba(255,255,255,0.01)', minHeight: '160px' }}>
            <div className="rounded-circle d-flex align-items-center justify-content-center mb-3"
              style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.03)', color: 'var(--text-muted)' }}>
              <i className="bi bi-inbox fs-4 opacity-50"></i>
            </div>
            <span className="text-secondary opacity-50 fw-medium small">Khoảng trống sáng tạo</span>
          </div>
        ) : (
          colTasks.map(task => (
            <TaskCard key={task.id} task={task}
              onDragStart={(e, id) => e.dataTransfer.setData('taskId', id)}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))
        )}
      </div>

      <Newtask show={showNewTask} onHide={() => setShowNewTask(false)} defaultStatus={status}
        onAddTask={(data) => { onAddTask(data); setShowNewTask(false); }} />
    </div>
  );
}

/* ── Main Kanban Board ── */
function Kanbanboard() {
  const { projects, activeProjectId, changeActiveProject, renameProject, deleteProject, addProject, showToast } = useProjects();
  const [tasks, setTasks]     = useState([]);
  const [projectAction, setProjectAction] = useState(null);
  const [showAddProject, setShowAddProject] = useState(false);

  const handleCreateFirst = () => setShowAddProject(true);

  useEffect(() => {
    if (activeProjectId) {
      MOCK_API.getTasksByProjectId(activeProjectId).then(data => {
        setTasks(data);
      });
    }
  }, [activeProjectId]);

  const handleAddTask = async (taskData) => {
    const added = await MOCK_API.createTask({ ...taskData, projectId: activeProjectId });
    setTasks(prev => [...prev, added]);
    showToast('Nhiệm vụ mới', `Đã thêm "${taskData.title}"`);
  };

  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = async (e, newStatus) => {
    const id = e.dataTransfer.getData('taskId');
    setTasks(prev => prev.map(t => String(t.id) === String(id) ? { ...t, status: newStatus } : t));
    await MOCK_API.updateTaskStatus(id, newStatus);
  };

  const handleUpdate = async (taskId, data) => {
    const updated = await MOCK_API.updateTask(taskId, data);
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updated } : t));
  };

  const handleDelete = async (taskId) => {
    const taskTitle = tasks.find(t => t.id === taskId)?.title;
    await MOCK_API.deleteTask(taskId);
    setTasks(prev => prev.filter(t => t.id !== taskId));
    showToast('Đã xóa', `Đã xóa nhiệm vụ "${taskTitle}"`);
  };

  if (projects.length === 0) return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
      <div className="text-center">
        <i className="bi bi-kanban fs-1 d-block mb-3" style={{ color: 'var(--text-muted)' }}></i>
        <h5 className="fw-bold mb-2" style={{ color: 'var(--text-primary)' }}>Chưa có dự án nào</h5>
        <p className="mb-4" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Tạo dự án đầu tiên để bắt đầu quản lý công việc.</p>
        <button onClick={handleCreateFirst}
          className="btn btn-primary-red fw-bold px-5 py-2">
          <i className="bi bi-plus-lg me-2"></i> Tạo dự án mới
        </button>
      </div>
      {showAddProject && <AddProjectModal onAdd={addProject} onClose={() => setShowAddProject(false)} />}
    </div>
  );

  if (!activeProjectId) return null;

  const COLUMNS = [
    { status: 'todo',        label: 'Chưa làm',   icon: 'bi bi-circle',            color: 'var(--text-secondary)', accentBg: 'rgba(255,255,255,0.10)' },
    { status: 'in-progress', label: 'Đang làm',   icon: 'bi bi-clock-history',     color: '#F59E0B',               accentBg: 'rgba(245,158,11,0.18)' },
    { status: 'done',        label: 'Hoàn thành', icon: 'bi bi-check-circle-fill', color: '#10B981',               accentBg: 'rgba(16,185,129,0.18)' },
  ];

  return (
    <div className="container-fluid p-0 d-flex flex-column" style={{ minHeight: '100%' }}>

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
        <div onClick={handleCreateFirst}
          className="fw-bold px-3 py-2 flex-shrink-0"
          style={{ cursor: 'pointer', color: 'var(--text-muted)', whiteSpace: 'nowrap', opacity: 0.6 }}>
          <i className="bi bi-plus-lg"></i>
        </div>
      </div>

      {/* Columns */}
      <div className="d-flex gap-3 overflow-auto pb-4" 
        style={{ alignItems: 'flex-start', minHeight: '600px', flex: 1 }}>
        {COLUMNS.map(col => (
          <KanbanColumn key={col.status} {...col} tasks={tasks}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onAddTask={handleAddTask}
          />
        ))}
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

export default Kanbanboard;
