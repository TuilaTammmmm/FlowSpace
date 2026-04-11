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
    <div className="min-vh-100 d-flex align-items-center justify-content-center px-3 auth-aurora-bg">
      <div className="glass-card p-5 w-100 page-transition" style={{ maxWidth: '460px', zIndex: 1, position: 'relative' }}>
1: 
        {/* Logo Section */}
        <div className="text-center mb-5">
          <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3 shadow-lg"
            style={{ width: '64px', height: '64px', background: 'var(--primary)', boxShadow: '0 0 20px var(--primary-glow)' }}>
            <i className="bi bi-layers-fill text-white fs-2"></i>
          </div>
          <h2 className="fw-bold text-white mb-0" style={{ fontSize: '28px', letterSpacing: '-1px' }}>FlowSpace</h2>
          <p className="text-secondary opacity-50 small text-uppercase tracking-widest mt-1" style={{ fontSize: '10px' }}>Hệ thống quản trị thông minh</p>
        </div>

        {error && (
          <div className="alert alert-danger py-2 px-3 mb-4 rounded-3 border-0 bg-danger bg-opacity-10 text-danger small fw-bold d-flex align-items-center gap-2 animate__animated animate__shakeX">
            <i className="bi bi-exclamation-circle-fill"></i> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="text-secondary fw-bold text-uppercase mb-2 d-block ms-1" style={{ fontSize: '11px', letterSpacing: '1px' }}>Địa chỉ Email</label>
            <div className="position-relative">
              <i className="bi bi-envelope position-absolute top-50 translate-middle-y ms-3 text-muted" style={{ zIndex: 5 }}></i>
              <input
                type="email"
                className="form-control auth-input py-3 ps-5 rounded-4 shadow-none"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
              />
            </div>
          </div>

          <div className="mb-5">
            <label className="text-secondary fw-bold text-uppercase mb-2 d-block ms-1" style={{ fontSize: '11px', letterSpacing: '1px' }}>Mật khẩu</label>
            <div className="position-relative">
              <i className="bi bi-shield-lock position-absolute top-50 translate-middle-y ms-3 text-muted" style={{ zIndex: 5 }}></i>
              <input
                type="password"
                className="form-control auth-input py-3 ps-5 rounded-4 shadow-none"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary-red w-100 py-3 fw-bold rounded-4 shadow-lg mb-4 transition-all"
            style={{ fontSize: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm me-2"></span>
            ) : (
              <i className="bi bi-box-arrow-in-right me-2"></i>
            )}
            {loading ? 'Đang vào...' : 'Đăng nhập'}
          </button>

          <div className="text-center">
            <Link to="/register" className="text-secondary text-decoration-none small transition-all hover-white">
              Chưa có tài khoản? <span className="text-white fw-bold">Tham gia ngay →</span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
