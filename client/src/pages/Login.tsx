import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, {
        email,
        password,
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg)',
        overflow: 'hidden',
      }}
    >
      <svg
        width="100%"
        height="100%"
        style={{ position: 'absolute', top: 0, left: 0 }}
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1200 800"
      >
        <circle cx="90" cy="120" r="9" fill="#E8A33D" opacity="0.55" />
        <circle cx="120" cy="120" r="9" fill="#E8A33D" opacity="0.55" />
        <circle cx="150" cy="120" r="9" fill="#E8A33D" opacity="0.55" />
        <circle cx="180" cy="120" r="9" fill="#D8D4C6" opacity="0.5" />
        <circle cx="210" cy="120" r="9" fill="#D8D4C6" opacity="0.5" />

        <circle cx="1020" cy="660" r="9" fill="#E8A33D" opacity="0.5" />
        <circle cx="1050" cy="660" r="9" fill="#E8A33D" opacity="0.5" />
        <circle cx="1080" cy="660" r="9" fill="#E8A33D" opacity="0.5" />
        <circle cx="1110" cy="660" r="9" fill="#D8D4C6" opacity="0.45" />
        <circle cx="1140" cy="660" r="9" fill="#D8D4C6" opacity="0.45" />
      </svg>

      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 400,
          background: 'var(--color-card-bg)',
          border: '0.5px solid var(--color-border)',
          borderRadius: 'var(--radius-card)',
          padding: '40px 36px',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              border: '2px solid var(--color-header)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 26,
                fontWeight: 500,
                color: 'var(--color-accent)',
              }}
            >
              T
            </span>
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 26,
              fontWeight: 500,
              color: 'var(--color-text)',
              margin: '0 0 6px',
            }}
          >
            Tandem
          </h2>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0 }}>
            Daily habits. Real coaches. Real progress.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
        >
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--color-text-muted)',
                marginBottom: 6,
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: 14,
                border: '0.5px solid var(--color-border)',
                borderRadius: 'var(--radius-button)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--color-text-muted)',
                marginBottom: 6,
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: 14,
                border: '0.5px solid var(--color-border)',
                borderRadius: 'var(--radius-button)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {error && (
            <p style={{ color: '#B23A3A', fontSize: 13, margin: 0 }}>{error}</p>
          )}

          <button
            type="submit"
            style={{
              width: '100%',
              padding: 12,
              fontSize: 14,
              fontWeight: 500,
              color: '#F7F5F0',
              background: 'var(--color-header)',
              border: 'none',
              borderRadius: 'var(--radius-button)',
            }}
          >
            Log in
          </button>

          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--color-text-muted)', margin: 0 }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: 'var(--color-header)', fontWeight: 500 }}>
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;