import { useState } from 'react';
import api from '../api/axios';

const INIT_LOGIN    = { username: '', password: '' };
const INIT_REGISTER = { username: '', password: '', passwordConfirm: '', name: '' };

export default function Login({ onLogin }) {
  const [mode, setMode]       = useState('login');
  const [loginForm, setLogin] = useState(INIT_LOGIN);
  const [regForm, setReg]     = useState(INIT_REGISTER);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const setL = (k, v) => { setError(''); setLogin((s) => ({ ...s, [k]: v })); };
  const setR = (k, v) => { setError(''); setReg((s) => ({ ...s, [k]: v })); };

  const goRegister = () => { setMode('register'); setError(''); setSuccess(''); };
  const goLogin    = () => { setMode('login');    setError(''); setSuccess(''); };

  /* ── 로그인 ── */
  const submitLogin = async () => {
    if (!loginForm.username || !loginForm.password) {
      setError('아이디와 비밀번호를 입력하세요.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/auth/login', {
        username: loginForm.username,
        password: loginForm.password,
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('name',  res.data.name);
      localStorage.setItem('role',  res.data.role);
      onLogin(res.data);
    } catch {
      setError('아이디 또는 비밀번호가 올바르지 않습니다.');
    } finally {
      setLoading(false);
    }
  };

  /* ── 회원가입 ── */
  const submitRegister = async () => {
    const { username, password, passwordConfirm, name } = regForm;
    if (!username || !password || !name) {
      setError('모든 항목을 입력하세요.');
      return;
    }
    if (username.length < 3) {
      setError('아이디는 3자 이상이어야 합니다.');
      return;
    }
    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.');
      return;
    }
    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/api/auth/register', { username, password, name });
      setSuccess('가입이 완료되었습니다. 로그인해 주세요.');
      setReg(INIT_REGISTER);
      setTimeout(() => goLogin(), 1200);
    } catch (e) {
      if (e?.response?.status === 409) {
        setError('이미 사용 중인 아이디입니다.');
      } else {
        setError('가입 중 오류가 발생했습니다. 다시 시도해 주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter') mode === 'login' ? submitLogin() : submitRegister();
  };

  return (
    <div className="login-wrap">
      <div className="login-card">

        {/* 브랜드 헤더 */}
        <div className="login-brand">
          <div className="brand-mark">m</div>
          <div className="brand-text">
            <div className="brand-name">miniERP</div>
            <div className="brand-sub">면세점 운영 시스템</div>
          </div>
        </div>

        {/* ── 로그인 폼 ── */}
        {mode === 'login' && (
          <div className="login-body">
            <h2 className="login-title">로그인</h2>

            <label className="field">
              <span className="field-label">아이디</span>
              <input
                className="input"
                value={loginForm.username}
                onChange={(e) => setL('username', e.target.value)}
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
                value={loginForm.password}
                onChange={(e) => setL('password', e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="비밀번호 입력"
                autoComplete="current-password"
              />
            </label>

            {error && <div className="login-error">{error}</div>}

            <button
              className="btn btn--solid login-btn"
              onClick={submitLogin}
              disabled={loading}
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>

            {/* 회원가입 링크 */}
            <div className="login-foot">
              <span className="login-foot-text">계정이 없으신가요?</span>
              <button className="login-link" onClick={goRegister}>회원가입</button>
            </div>
          </div>
        )}

        {/* ── 회원가입 폼 ── */}
        {mode === 'register' && (
          <div className="login-body">
            {/* 뒤로가기 */}
            <button className="login-back" onClick={goLogin}>
              ← 로그인으로 돌아가기
            </button>

            <h2 className="login-title">회원가입</h2>

            <label className="field">
              <span className="field-label">아이디</span>
              <input
                className="input"
                value={regForm.username}
                onChange={(e) => setR('username', e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="영문·숫자, 3자 이상"
                autoComplete="username"
                autoFocus
              />
            </label>

            <label className="field">
              <span className="field-label">이름</span>
              <input
                className="input"
                value={regForm.name}
                onChange={(e) => setR('name', e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="실명 입력"
                autoComplete="name"
              />
            </label>

            <label className="field">
              <span className="field-label">비밀번호</span>
              <input
                className="input"
                type="password"
                value={regForm.password}
                onChange={(e) => setR('password', e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="6자 이상"
                autoComplete="new-password"
              />
            </label>

            <label className="field">
              <span className="field-label">비밀번호 확인</span>
              <input
                className="input"
                type="password"
                value={regForm.passwordConfirm}
                onChange={(e) => setR('passwordConfirm', e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="비밀번호 재입력"
                autoComplete="new-password"
              />
            </label>

            {error   && <div className="login-error">{error}</div>}
            {success && <div className="login-success">{success}</div>}

            <button
              className="btn btn--solid login-btn"
              onClick={submitRegister}
              disabled={loading}
            >
              {loading ? '처리 중...' : '가입하기'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}