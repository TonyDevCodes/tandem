import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Logo from '../components/Logo';

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'client' | 'coach'>('client');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/signup`, {
        email,
        password,
        name,
        role,
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Signup failed');
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
          <Logo size={70} showText={false} />
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 26,
              fontWeight: 500,
              color: 'var(--color-text)',
              margin: '14px 0 6px',
            }}
          >
            Create account
          </h2>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0 }}>
            Start your journey with a coach.
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
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              I am a
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={() => setRole('client')}
                style={{
                  flex: 1,
                  padding: 9,
                  fontSize: 13,
                  fontWeight: 500,
                  borderRadius: 20,
                  background: 'linear-gradient(135deg, #D89A3D, #C98A2D)',
                  color: '#fff',
                  border: role === 'client' ? '2px solid #4A2E0A' : '2px solid transparent',
                  boxShadow: role === 'client' ? '0 2px 6px rgba(0,0,0,0.2)' : 'none',
                  cursor: 'pointer',
                }}
              >
                Client
              </button>
              <button
                type="button"
                onClick={() => setRole('coach')}
                style={{
                  flex: 1,
                  padding: 9,
                  fontSize: 13,
                  fontWeight: 500,
                  borderRadius: 20,
                  background: 'linear-gradient(135deg, #F2C97A, #EAB85E)',
                  color: '#4A2E0A',
                  border: role === 'coach' ? '2px solid #4A2E0A' : '2px solid transparent',
                  boxShadow: role === 'coach' ? '0 2px 6px rgba(0,0,0,0.2)' : 'none',
                  cursor: 'pointer',
                }}
              >
                Coach
              </button>
            </div>
          </div>

          {error && (
            <p style={{ color: '#B23A3A', fontSize: 13, margin: 0 }}>{error}</p>
          )}

          <button
            type="submit"
            style={{
              width: '100%',
              padding: 13,
              fontSize: 15,
              fontWeight: 500,
              color: '#fff',
              background: 'linear-gradient(135deg, #3B6D11, #639922)',
              border: 'none',
              borderRadius: 12,
            }}
          >
            Sign up
          </button>

          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--color-text-muted)', margin: 0 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--color-header)', fontWeight: 500 }}>
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Signup;