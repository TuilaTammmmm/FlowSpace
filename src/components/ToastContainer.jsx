import { useProjects } from '../context/ProjectContext';

function ToastContainer() {
  const { toasts, removeToast } = useProjects();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container-center">
      {toasts.map(toast => (
        <div key={toast.id} className="flow-toast" onClick={() => removeToast(toast.id)}>
          <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
            style={{ width: '32px', height: '32px', background: 'var(--primary)', color: 'white' }}>
            <i className="bi bi-info-circle-fill"></i>
          </div>
          <div className="toast-content">
            <div className="toast-title">{toast.title}</div>
            <div className="toast-desc">{toast.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ToastContainer;
