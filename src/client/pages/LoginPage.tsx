import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spinner } from '../components/ui/Spinner';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Demo auth — any credentials work for now
    await new Promise((r) => setTimeout(r, 600));

    if (!email || !password) {
      setError('Введите email и пароль');
      setLoading(false);
      return;
    }

    localStorage.setItem('bazzar_auth', '1');
    navigate('/');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div className="card" style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
              fontSize: 22,
              fontWeight: 800,
              color: '#fff',
            }}
          >
            B
          </div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>BAZZAR</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            Панель управления бизнесом
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@bazzar.ru"
              autoComplete="email"
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label className="form-label">Пароль</label>
            <input
              className="form-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div
              style={{
                background: 'var(--red-bg, rgba(255,80,80,.12))',
                border: '1px solid var(--red-border, rgba(255,80,80,.3))',
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 12,
                color: 'var(--red, #f87171)',
                marginBottom: 16,
              }}
            >
              {error}
            </div>
          )}

          <button className="btn btn-primary" type="submit" style={{ width: '100%' }} disabled={loading}>
            {loading ? <Spinner size={14} /> : 'Войти'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: 'var(--text-muted)' }}>
          Demo: любой email + пароль
        </div>
      </div>
    </div>
  );
}
