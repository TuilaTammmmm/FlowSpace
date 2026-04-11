import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MOCK_API } from '../services/api';

function Register() {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      await MOCK_API.signInWithGoogle();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(email, password, name);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại');
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
                style={{ width: '70px', height: '70px', background: 'var(--primary)' }}>
             <i className="bi bi-layers-fill text-white fs-1"></i>
           </div>
           <h1 className="fw-bold text-white mb-1" style={{ fontSize: '32px', letterSpacing: '-0.5px' }}>Gia nhập FlowSpace</h1>
           <p className="text-secondary small tracking-widest text-uppercase fw-medium" style={{ opacity: 0.7 }}>Khởi tạo không gian làm việc của bạn</p>
        </div>

        {error && (
          <div className="alert alert-danger py-2 px-3 mb-4 rounded-3 border-0 bg-danger bg-opacity-10 text-danger small fw-bold d-flex align-items-center gap-2">
            <i className="bi bi-exclamation-circle-fill"></i> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="text-muted fw-bold text-uppercase mb-2 d-block" style={{ fontSize: '10px', letterSpacing: '1.2px' }}>Họ và tên</label>
            <input 
              type="text" 
              className="form-control bg-dark border-0 text-white rounded-3 py-3 px-4 shadow-none"
              style={{ background: 'rgba(0,0,0,0.2) !important', border: '1px solid rgba(255,255,255,0.05) !important' }}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Nguyễn Văn A"
              required
            />
          </div>

          <div className="mb-3">
            <label className="text-muted fw-bold text-uppercase mb-2 d-block" style={{ fontSize: '10px', letterSpacing: '1.2px' }}>Email cá nhân</label>
            <input 
              type="email" 
              className="form-control bg-dark border-0 text-white rounded-3 py-3 px-4 shadow-none"
              style={{ background: 'rgba(0,0,0,0.2) !important', border: '1px solid rgba(255,255,255,0.05) !important' }}
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="example@mail.com"
              required
            />
          </div>

          <div className="mb-5">
            <label className="text-muted fw-bold text-uppercase mb-2 d-block" style={{ fontSize: '10px', letterSpacing: '1.2px' }}>Mật khẩu bảo mật</label>
            <input 
              type="password" 
              className="form-control bg-dark border-0 text-white rounded-3 py-3 px-4 shadow-none"
              style={{ background: 'rgba(0,0,0,0.2) !important', border: '1px solid rgba(255,255,255,0.05) !important' }}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary-red w-100 py-3 fw-bold rounded-3 shadow-lg mb-3"
            style={{ fontSize: '15px' }}
          >
            <i className={`bi ${loading ? 'bi-hourglass-split' : 'bi-person-plus-fill'} me-2`}></i>
            {loading ? 'Đang tạo tài khoản...' : 'Đăng ký tham gia'}
          </button>

          <button 
            type="button"
            onClick={handleGoogleLogin}
            className="btn w-100 py-3 fw-bold rounded-3 mb-4 d-flex align-items-center justify-content-center gap-2"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-thin)', color: 'white', fontSize: '15px' }}
          >
            <i className="bi bi-google text-primary"></i> Đăng ký bằng Google
          </button>

          <div className="text-center">
            <Link to="/login" className="text-decoration-none fw-bold" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>
              ĐÃ CÓ TÀI KHOẢN? <span style={{ color: 'var(--primary)' }}>ĐĂNG NHẬP NGAY →</span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
