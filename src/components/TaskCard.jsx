import { useState, useEffect } from 'react';
import { Modal, Form } from 'react-bootstrap';

/* --------------------------------------------------------
   Inline editable title on card
-------------------------------------------------------- */
function InlineTitle({ value, onSave }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal]         = useState(value);

  useEffect(() => { setVal(value); }, [value]);

  const save = () => {
    setEditing(false);
    if (val.trim() && val !== value) onSave(val.trim());
  };

  if (editing) return (
    <input
      autoFocus
      className="fw-bold text-white w-100 inline-edit-input"
      style={{ fontSize: '14px', lineHeight: '1.4' }}
      value={val}
      onChange={e => setVal(e.target.value)}
      onBlur={save}
      onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false); }}
    />
  );

  return (
    <h6
      className="fw-bold text-white mb-0"
      style={{ fontSize: '14px', lineHeight: '1.4', cursor: 'text' }}
      title="Nhấn đúp để đổi tên"
      onDoubleClick={() => setEditing(true)}
    >
      {value}
    </h6>
  );
}

/* --------------------------------------------------------
   Main TaskCard
-------------------------------------------------------- */
function TaskCard({ task, onDragStart, onUpdate, onDelete }) {
  const [showModal, setShowModal] = useState(false);

  const [title, setTitle]           = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [deadline, setDeadline]     = useState(task.deadline || '');
  const [priority, setPriority]     = useState(task.priority || 'Trung bình');
  const [tagInput, setTagInput]     = useState('');
  const [tags, setTags]             = useState(Array.isArray(task.tags) ? task.tags : []);

  // Sync when task prop changes
  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description || '');
    setDeadline(task.deadline || '');
    setPriority(task.priority || 'Trung bình');
    setTags(Array.isArray(task.tags) ? task.tags : []);
  }, [task]);

  const today = () => { const d = new Date(); d.setHours(0,0,0,0); return d; };
  const isOverdue = task.deadline && task.status !== 'done' && new Date(task.deadline) < today();

  const priorityBadge = (tag) => {
    if (tag === 'High')   return { bg: 'rgba(255,61,61,0.15)',   color: 'var(--primary)' };
    if (tag === 'Medium') return { bg: 'rgba(245,158,11,0.18)',  color: '#F59E0B' };
    return                       { bg: 'rgba(16,185,129,0.15)',  color: '#10B981' };
  };

  const tagLabel = (tag) => ({ High: 'Quan trọng', Medium: 'Trung bình', Low: 'Thấp' }[tag] || 'Thấp');
  const fmtDate  = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : null;

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  };

  const handleInlineSave = (newTitle) => {
    onUpdate(task.id, { title: newTitle });
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onUpdate(task.id, {
      title, description, deadline, priority, tags,
      tag: priority === 'Quan trọng' || priority === 'Cao' ? 'High' : priority === 'Trung bình' ? 'Medium' : 'Low'
    });
    setShowModal(false);
  };

  const handleDelete = () => {
    if (window.confirm('Bạn có chắc muốn xóa task này?')) {
      onDelete(task.id);
      setShowModal(false);
    }
  };

  const badge = priorityBadge(task.tag);

  return (
    <>
      {/* ── Card ── */}
      <div
        className="task-card p-3 shadow-premium"
        style={{ cursor: 'grab', borderLeft: isOverdue ? '3px solid var(--primary)' : undefined }}
        draggable
        onDragStart={(e) => onDragStart(e, task.id)}
        onDoubleClick={() => setShowModal(true)}
      >
        {/* Overdue banner */}
        {isOverdue && (
          <div className="d-flex align-items-center gap-2 mb-2 px-2 py-1 rounded-3"
            style={{ background: 'rgba(255,61,61,0.1)', border: '1px solid rgba(255,61,61,0.2)' }}>
            <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: '11px', color: 'var(--primary)' }}></i>
            <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 600 }}>Đã quá hạn – {fmtDate(task.deadline)}</span>
          </div>
        )}

        {/* Badge + menu */}
        <div className="d-flex justify-content-between align-items-start mb-2">
          <span className="fw-bold rounded-3 px-2 py-1"
            style={{ ...badge, background: badge.bg, fontSize: '10px', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
            {tagLabel(task.tag)}
          </span>
          <i className="bi bi-three-dots text-muted opacity-50"
            style={{ cursor: 'pointer', fontSize: '16px' }}
            onClick={() => setShowModal(true)} />
        </div>

        {/* Inline-editable title */}
        <div className="mb-2">
          <InlineTitle value={task.title} onSave={handleInlineSave} />
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="d-flex flex-wrap gap-1 mb-2">
            {tags.map((t, i) => (
              <span key={i} className="rounded-2 px-2"
                style={{ background: 'rgba(255,255,255,0.07)', color: 'var(--text-secondary)', fontSize: '11px', lineHeight: '20px' }}>
                #{t}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="d-flex justify-content-between align-items-center mt-2">
          <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
            style={{ width: '22px', height: '22px', fontSize: '9px', background: 'var(--primary)', opacity: 0.85 }}>
            DT
          </div>
          <div className="d-flex align-items-center gap-1"
            style={{ fontSize: '11px', color: isOverdue ? 'var(--primary)' : 'var(--text-muted)' }}>
            <i className="bi bi-calendar3" style={{ fontSize: '10px' }}></i>
            <span>{fmtDate(task.deadline) || 'Chưa đặt'}</span>
          </div>
        </div>
      </div>

      {/* ── Edit Modal ── */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered contentClassName="border-0 shadow-premium" style={{ '--bs-modal-bg': 'transparent' }}>
        <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border-thin)', borderRadius: '16px', overflow: 'hidden' }}>

          <div className="d-flex justify-content-between align-items-center px-5 py-4 border-bottom" style={{ borderColor: 'var(--border-thin)' }}>
            <div className="d-flex align-items-center gap-3">
              <span className="fw-bold text-white text-uppercase" style={{ fontSize: '12px', letterSpacing: '1.5px' }}>Chi tiết nhiệm vụ</span>
              {isOverdue && (
                <span className="d-flex align-items-center gap-1 px-2 py-1 rounded-3 fw-bold"
                  style={{ background: 'rgba(255,61,61,0.12)', color: 'var(--primary)', fontSize: '11px' }}>
                  <i className="bi bi-exclamation-triangle-fill"></i> Quá hạn
                </span>
              )}
            </div>
            <button type="button" onClick={() => setShowModal(false)}
              className="btn p-0 text-secondary" style={{ background: 'none', border: 'none', fontSize: '18px' }}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          <Form onSubmit={handleUpdate} className="px-5 py-4">

            <Form.Group className="mb-4">
              <Form.Label className="fw-bold text-secondary mb-2" style={{ fontSize: '11px', letterSpacing: '1.2px', textTransform: 'uppercase' }}>
                Tiêu đề <span style={{ color: 'var(--primary)' }}>*</span>
              </Form.Label>
              <Form.Control type="text" value={title} onChange={e => setTitle(e.target.value)} required autoFocus />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-bold text-secondary mb-2" style={{ fontSize: '11px', letterSpacing: '1.2px', textTransform: 'uppercase' }}>
                Mô tả
              </Form.Label>
              <Form.Control as="textarea" rows={3} value={description} onChange={e => setDescription(e.target.value)} />
            </Form.Group>

            <div className="row mb-4">
              <Form.Group className="col-md-6">
                <Form.Label className="fw-bold text-secondary mb-2" style={{ fontSize: '11px', letterSpacing: '1.2px', textTransform: 'uppercase' }}>
                  Hạn chót
                </Form.Label>
                <Form.Control type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
                {deadline && new Date(deadline) < today() && (
                  <div className="mt-1 d-flex align-items-center gap-1" style={{ color: 'var(--primary)', fontSize: '11px' }}>
                    <i className="bi bi-exclamation-circle-fill"></i> Hạn chót đã qua!
                  </div>
                )}
              </Form.Group>

              <Form.Group className="col-md-6">
                <Form.Label className="fw-bold text-secondary mb-2" style={{ fontSize: '11px', letterSpacing: '1.2px', textTransform: 'uppercase' }}>
                  Mức độ ưu tiên
                </Form.Label>
                <Form.Select value={priority} onChange={e => setPriority(e.target.value)}>
                  <option value="Thấp">Thấp</option>
                  <option value="Trung bình">Trung bình</option>
                  <option value="Quan trọng">Quan trọng</option>
                </Form.Select>
              </Form.Group>
            </div>

            <Form.Group className="mb-4">
              <Form.Label className="fw-bold text-secondary mb-2" style={{ fontSize: '11px', letterSpacing: '1.2px', textTransform: 'uppercase' }}>
                Thẻ phân loại
              </Form.Label>
              <div className="d-flex gap-2 mb-2">
                <Form.Control type="text" placeholder="Nhập tag rồi nhấn Thêm..."
                  value={tagInput} onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} />
                <button type="button" onClick={addTag}
                  className="btn flex-shrink-0 fw-bold px-3"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid var(--border-thin)', color: 'var(--text-primary)', borderRadius: '10px' }}>
                  + Thêm
                </button>
              </div>
              {tags.length > 0 && (
                <div className="d-flex flex-wrap gap-2">
                  {tags.map((t, i) => (
                    <span key={i} className="d-inline-flex align-items-center gap-1 px-3 py-1 rounded-3 fw-bold"
                      style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--text-primary)', fontSize: '12px' }}>
                      #{t}
                      <i className="bi bi-x" style={{ cursor: 'pointer', opacity: 0.6 }} onClick={() => setTags(tags.filter(x => x !== t))}></i>
                    </span>
                  ))}
                </div>
              )}
            </Form.Group>

            <div className="d-flex justify-content-between align-items-center pt-4 border-top" style={{ borderColor: 'var(--border-thin)' }}>
              <button type="button" onClick={handleDelete}
                className="btn fw-bold px-4"
                style={{ color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px' }}>
                <i className="bi bi-trash me-2"></i> Xóa nhiệm vụ
              </button>
              <div className="d-flex gap-3">
                <button type="button" className="btn text-secondary fw-bold" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary-red fw-bold px-5">Cập nhật</button>
              </div>
            </div>
          </Form>
        </div>
      </Modal>
    </>
  );
}

export default TaskCard;
