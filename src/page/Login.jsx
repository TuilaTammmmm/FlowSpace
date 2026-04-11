import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Form, Button, Alert } from 'react-bootstrap';

function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('dragonkiller2k5@gmail.com');
  const [password, setPassword] = useState('123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="vh-100 w-100 d-flex align-items-center justify-content-center page-transition" style={{ background: 'var(--bg-deep)' }}>
        <div className="card-premium p-5 shadow-premium text-center" style={{ width: '450px', border: '1px solid var(--border-thin)' }}>
            
            {/* Branding Section */}
            <div className="mb-5">
                <div className="bg-primary rounded-4 d-inline-flex justify-content-center align-items-center shadow-lg mb-3" 
                     style={{ width: '64px', height: '64px', boxShadow: '0 0 30px var(--primary-glow)' }}>
                    <i className="bi bi-layers-fill text-white" style={{ fontSize: '32px' }}></i>
                </div>
                <h2 className="text-white fw-bold tracking-tight mb-1" style={{ fontSize: '28px' }}>FlowSpace</h2>
                <p className="text-secondary small fw-medium">Không gian làm việc sáng tạo</p>
            </div>

            {error && <Alert variant="danger" className="border-0 small fw-bold py-2 mb-4" style={{ backgroundColor: 'rgba(255, 61, 61, 0.1)', color: 'var(--primary)' }}>{error}</Alert>}

            <Form onSubmit={handleSubmit} className="text-start">
                <Form.Group className="mb-3">
                    <Form.Label className="text-secondary extra-small fw-bold text-uppercase tracking-widest mb-2" style={{ fontSize: '10px' }}>Email Hệ Thống</Form.Label>
                    <Form.Control 
                        type="email" 
                        className="bg-surface-1 border-thin text-white"
                        placeholder="email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-4">
                    <Form.Label className="text-secondary extra-small fw-bold text-uppercase tracking-widest mb-2" style={{ fontSize: '10px' }}>Mật Khẩu</Form.Label>
                    <Form.Control 
                        type="password" 
                        className="bg-surface-1 border-thin text-white"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100 btn-primary-red py-3 mb-4 d-flex align-items-center justify-content-center gap-2" disabled={loading}>
                    {loading ? (
                        <>
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            Đang kết nối...
                        </>
                    ) : (
                        <>
                            <i className="bi bi-box-arrow-in-right"></i>
                            Đăng nhập ngay
                        </>
                    )}
                </Button>

                <div className="text-center">
                    <span className="text-muted extra-small fw-bold text-uppercase tracking-widest" style={{ fontSize: '11px' }}>
                        Chưa có tài khoản? 
                        <a href="#" className="text-primary text-decoration-none ms-2">Phòng Công Nghệ <i className="bi bi-arrow-right small"></i></a>
                    </span>
                </div>
            </Form>
        </div>
    </div>
  )
}

export default Login;
