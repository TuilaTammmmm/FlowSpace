import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { login, loginWithGoogle } = useAuth();
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

  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      // Supabase sẽ redirect sang Google rồi quay lại, không cần navigate
    } catch (err) {
      setError(err.message || 'Đăng nhập Google thất bại');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center px-3 auth-aurora-bg">
      <div className="glass-card p-5 w-100 page-transition" style={{ maxWidth: '460px', zIndex: 1, position: 'relative' }}>
        
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
          <div className="alert alert-danger py-2 px-3 mb-4 rounded-3 border-0 bg-danger bg-opacity-10 text-danger small fw-bold d-flex align-items-center gap-2">
            <i className="bi bi-exclamation-circle-fill"></i> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="text-secondary fw-bold text-uppercase mb-2 d-block ms-1" style={{ fontSize: '11px', letterSpacing: '1px' }}>Địa chỉ Email</label>
            <div className="position-relative d-flex align-items-center">
              <i className="bi bi-envelope position-absolute ms-3 text-muted" style={{ zIndex: 5, fontSize: '18px' }}></i>
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
            <div className="position-relative d-flex align-items-center">
              <i className="bi bi-shield-lock position-absolute ms-3 text-muted" style={{ zIndex: 5, fontSize: '18px' }}></i>
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
            className="btn btn-primary-red w-100 py-3 fw-bold rounded-4 shadow-lg mb-3 transition-all"
            style={{ fontSize: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm me-2"></span>
            ) : (
              <i className="bi bi-box-arrow-in-right me-2"></i>
            )}
            {loading ? 'Đang vào...' : 'Đăng nhập'}
          </button>
        </form>

        {/* Divider */}
        <div className="d-flex align-items-center my-3">
          <hr className="flex-grow-1" style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
          <span className="px-3 text-secondary small text-uppercase" style={{ fontSize: '10px', letterSpacing: '1px' }}>hoặc</span>
          <hr className="flex-grow-1" style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
        </div>

        {/* Google Login Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="btn w-100 py-3 fw-bold rounded-4 mb-4 d-flex align-items-center justify-content-center gap-2 transition-all"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: '#fff',
            fontSize: '15px',
            backdropFilter: 'blur(10px)',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
        >
          {googleLoading ? (
            <span className="spinner-border spinner-border-sm"></span>
          ) : (
            <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.016 24.016 0 0 0 0 21.56l7.98-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
          )}
          {googleLoading ? 'Đang kết nối...' : 'Đăng nhập bằng Google'}
        </button>

        <div className="text-center">
          <Link to="/register" className="text-secondary text-decoration-none small transition-all hover-white">
            Chưa có tài khoản? <span className="text-white fw-bold">Tham gia ngay →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
