import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MOCK_API } from '../services/api';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth(); // Assume register might be used if unified
  const navigate = useNavigate();


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center px-3" style={{ background: '#0f172a' }}>
      <div className="card-premium p-5 shadow-premium w-100" style={{ maxWidth: '440px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.05)' }}>

        {/* Logo */}
        <div className="text-center mb-5">
          <div className="d-inline-flex align-items-center justify-content-center rounded-4 mb-4 shadow-lg"
            style={{ width: '70px', height: '70px', background: '#3b82f6' }}>
            <i className="bi bi-layers-fill text-white fs-1"></i>
          </div>
          <h1 className="fw-bold text-white mb-1" style={{ fontSize: '32px', letterSpacing: '-0.5px' }}>FlowSpace</h1>
          <p className="text-secondary small tracking-widest text-uppercase fw-medium" style={{ opacity: 0.7 }}>Không gian làm việc sáng tạo</p>
        </div>

        {error && (
          <div className="alert alert-danger py-2 px-3 mb-4 rounded-3 border-0 bg-danger bg-opacity-10 text-danger small fw-bold d-flex align-items-center gap-2">
            <i className="bi bi-exclamation-circle-fill"></i> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="text-muted fw-bold text-uppercase mb-2 d-block" style={{ fontSize: '10px', letterSpacing: '1.2px' }}>Email hệ thống</label>
            <input
              type="email"
              className="form-control bg-dark border-0 text-white rounded-3 py-3 px-4 shadow-none"
              style={{ background: 'rgba(0,0,0,0.2) !important', border: '1px solid rgba(255,255,255,0.05) !important' }}
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email"
              required
            />
          </div>

          <div className="mb-5">
            <label className="text-muted fw-bold text-uppercase mb-2 d-block" style={{ fontSize: '10px', letterSpacing: '1.2px' }}>Mật khẩu</label>
            <input
              type="password"
              className="form-control bg-dark border-0 text-white rounded-3 py-3 px-4 shadow-none"
              style={{ background: 'rgba(0,0,0,0.2) !important', border: '1px solid rgba(255,255,255,0.05) !important' }}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Mật khẩu"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary-red w-100 py-3 fw-bold rounded-3 shadow-lg mb-3"
            style={{ fontSize: '15px' }}
          >
            <i className={`bi ${loading ? 'bi-hourglass-split' : 'bi-box-arrow-in-right'} me-2`}></i>
            {loading ? 'Đang xác thực...' : 'Đăng nhập ngay'}
          </button>


          <div className="text-center">
            <Link to="/register" className="text-decoration-none fw-bold" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>
              CHƯA CÓ TÀI KHOẢN? <span style={{ color: '#3b82f6' }}>ĐĂNG KÝ NGAY→</span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
