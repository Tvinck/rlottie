/**
 * @file src/client/pages/LoginPage.tsx
 * Страница входа в BAZZAR. Demo-режим: любой email + пароль ≥ 4 символов.
 *
 * При успешном входе:
 *  - сохраняет AuthUser в localStorage
 *  - возвращает на исходный путь (если был редирект от ProtectedRoute)
 *  - иначе → /home
 */

import { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { Spinner } from '../components/ui/Spinner';
import { login, isAuthenticated } from '../auth/auth';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/home';

  // Если уже залогинен — сразу на главную
  if (isAuthenticated()) {
    return <Navigate to={from} replace />;
  }

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    await new Promise((r) => setTimeout(r, 500));

    try {
      login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка входа');
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at top right, rgba(170,255,71,.08), transparent 50%), var(--bg-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              width: 56, height: 56, borderRadius: 14,
              background: 'linear-gradient(135deg, var(--accent), #8b5cf6)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: 24, fontWeight: 800, color: '#fff',
              boxShadow: '0 8px 24px rgba(170,255,71,.25)',
            }}
          >
            B
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em' }}>BAZZAR</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            Платформа управления бизнесом
          </div>
        </div>

        {/* Form card */}
        <div className="card" style={{ padding: 28 }}>
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, marginBottom: 4 }}>
              Вход в аккаунт
            </h2>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Введите данные для доступа к панели
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Email</label>
              <div className="field-with-icon">
                <Mail size={15} className="field-icon" />
                <input
                  className="form-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@bazzar.ru"
                  autoComplete="email"
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label className="form-label" style={{ margin: 0 }}>Пароль</label>
                <a
                  href="#"
                  style={{ fontSize: 11, color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}
                  onClick={(e) => { e.preventDefault(); alert('Восстановление пароля — TODO'); }}
                >
                  Забыли?
                </a>
              </div>
              <div className="field-with-icon">
                <Lock size={15} className="field-icon" />
                <input
                  className="form-input has-action"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="field-action"
                  onClick={() => setShowPass((v) => !v)}
                  aria-label={showPass ? 'Скрыть пароль' : 'Показать пароль'}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, cursor: 'pointer', fontSize: 12, color: 'var(--text-sub)' }}>
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                style={{ width: 14, height: 14, cursor: 'pointer' }}
              />
              Запомнить меня на этом устройстве
            </label>

            {/* Error */}
            {error && (
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'rgba(239,68,68,.1)',
                  border: '1px solid rgba(239,68,68,.25)',
                  borderRadius: 8,
                  padding: '8px 12px',
                  fontSize: 12,
                  color: '#ef4444',
                  marginBottom: 16,
                }}
              >
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              className="btn btn-primary"
              type="submit"
              style={{ width: '100%', height: 40, fontSize: 13 }}
              disabled={loading}
            >
              {loading ? (
                <Spinner size={14} />
              ) : (
                <>
                  <LogIn size={14} />
                  Войти в аккаунт
                </>
              )}
            </button>
          </form>

          {/* Divider + demo hint */}
          <div style={{
            marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border)',
            textAlign: 'center', fontSize: 11, color: 'var(--text-muted)',
          }}>
            <strong style={{ color: 'var(--text-sub)' }}>Demo-режим:</strong> любой email + пароль (мин. 4 символа)
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: 'var(--text-muted)' }}>
          © {new Date().getFullYear()} BAZZAR · Все права защищены
        </div>
      </div>
    </div>
  );
}
