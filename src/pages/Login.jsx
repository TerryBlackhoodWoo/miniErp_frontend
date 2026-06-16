import { useState } from 'react';
import api from '../api/axios';

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const submit = async () => {
    if (!form.username || !form.password) {
      setError('아이디와 비밀번호를 입력하세요.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/auth/login', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('name', res.data.name);
      localStorage.setItem('role', res.data.role);
      onLogin(res.data);
    } catch (e) {
      setError('아이디 또는 비밀번호가 올바르지 않습니다.');
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => { if (e.key === 'Enter') submit(); };

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-brand">
          <div className="brand-mark">m</div>
          <div className="brand-text">
            <div className="brand-name">miniERP</div>
            <div className="brand-sub">면세점 운영 시스템</div>
          </div>
        </div>

        <div className="login-body">
          <h2 className="login-title">로그인</h2>

          <label className="field">
            <span className="field-label">아이디</span>
            <input
              className="input"
              value={form.username}
              onChange={(e) => set('username', e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="아이디 입력"
              autoComplete="username"
              autoFocus
            />
          </label>

          <label className="field">
            <span className="field-label">비밀번호</span>
            <input
              className="input"
              type="password"
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="비밀번호 입력"
              autoComplete="current-password"
            />
          </label>

          {error && <div className="login-error">{error}</div>}

          <button className="btn btn--solid login-btn" onClick={submit} disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </div>
      </div>
    </div>
  );
}