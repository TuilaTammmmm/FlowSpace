import { useState } from 'react';
import { Modal, Form } from 'react-bootstrap';

function Newtask({ show, onHide, onAddTask, defaultStatus = 'todo' }) {
  const [title, setTitle]           = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline]     = useState('');
  const [priority, setPriority]     = useState('Trung bình');
  const [tagInput, setTagInput]     = useState('');
  const [tags, setTags]             = useState([]);

  const handleClose = () => {
    setTitle(''); setDescription(''); setDeadline(''); setPriority('Trung bình'); setTags([]);
    onHide();
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddTask({
      title, description, deadline, priority, tags,
      tag: priority === 'Quan trọng' ? 'High' : priority === 'Trung bình' ? 'Medium' : 'Low',
      status: defaultStatus
    });
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered contentClassName="border-0 shadow-premium" style={{ '--bs-modal-bg': 'transparent' }}>
      <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border-thin)', borderRadius: '16px', overflow: 'hidden' }}>

        <div className="d-flex justify-content-between align-items-center px-5 py-4 border-bottom" style={{ borderColor: 'var(--border-thin)' }}>
          <span className="fw-bold text-white text-uppercase" style={{ fontSize: '12px', letterSpacing: '1.5px' }}>Tạo nhiệm vụ mới</span>
          <button type="button" onClick={handleClose} className="btn p-0 text-secondary" style={{ background: 'none', border: 'none', fontSize: '18px' }}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <Form onSubmit={handleSubmit} className="px-5 py-4">

          <Form.Group className="mb-4">
            <Form.Label className="fw-bold text-secondary mb-2" style={{ fontSize: '11px', letterSpacing: '1.2px', textTransform: 'uppercase' }}>
              Tiêu đề nhiệm vụ <span style={{ color: 'var(--primary)' }}>*</span>
            </Form.Label>
            <Form.Control type="text" placeholder="Ví dụ: Thiết kế giao diện Dashboard..."
              value={title} onChange={e => setTitle(e.target.value)} required autoFocus />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="fw-bold text-secondary mb-2" style={{ fontSize: '11px', letterSpacing: '1.2px', textTransform: 'uppercase' }}>
              Mô tả công việc
            </Form.Label>
            <Form.Control as="textarea" rows={3} placeholder="Chi tiết các bước thực hiện..."
              value={description} onChange={e => setDescription(e.target.value)} />
          </Form.Group>

          <div className="row mb-4">
            <Form.Group className="col-md-6">
              <Form.Label className="fw-bold text-secondary mb-2" style={{ fontSize: '11px', letterSpacing: '1.2px', textTransform: 'uppercase' }}>
                Hạn chót (Deadline)
              </Form.Label>
              <Form.Control type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
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
              Thẻ phân loại (nhấn Enter hoặc "Thêm")
            </Form.Label>
            <div className="d-flex gap-2 mb-2">
              <Form.Control type="text" placeholder="Design, Code, Marketing..."
                value={tagInput} onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} />
              <button type="button" onClick={addTag}
                className="btn flex-shrink-0 fw-bold px-3"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid var(--border-thin)', color: 'var(--text-primary)', borderRadius: '10px' }}>
                + Thêm
              </button>
            </div>
            {tags.length > 0 && (
              <div className="d-flex flex-wrap gap-2 mt-2">
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

          <div className="d-flex justify-content-end gap-3 pt-4 border-top" style={{ borderColor: 'var(--border-thin)' }}>
            <button type="button" className="btn fw-bold text-secondary" onClick={handleClose}>Hủy bỏ</button>
            <button type="submit" className="btn btn-primary-red fw-bold px-5">Tạo nhiệm vụ</button>
          </div>
        </Form>
      </div>
    </Modal>
  );
}

export default Newtask;
