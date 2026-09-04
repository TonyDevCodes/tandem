import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';

function Landing() {
  const navigate = useNavigate();

  const steps = [
    {
      number: '1',
      title: 'Find a coach',
      description: 'Browse coaches and send a request to the one that fits you.',
      borderColor: '#F0997B',
      leftBorder: '#D85A30',
    },
    {
      number: '2',
      title: 'Set your habits',
      description: 'Your coach creates daily habits tailored to your goals.',
      borderColor: '#EF9F27',
      leftBorder: '#BA7517',
    },
    {
      number: '3',
      title: 'Track your streak',
      description: 'Check in every day and watch your progress build up.',
      borderColor: '#97C459',
      leftBorder: '#3B6D11',
    },
  ];

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: 'var(--color-bg)', overflow: 'hidden' }}>
      <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }} preserveAspectRatio="xMidYMid slice" viewBox="0 0 1200 800">
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

      <div style={{ position: 'relative', maxWidth: 640, margin: '0 auto', padding: '80px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <Logo size={100} />

        <p style={{ fontSize: 15, color: 'var(--color-text-muted)', margin: '20px 0 40px' }}>Daily habits. Real coaches. Real progress.</p>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 40 }}>
          {steps.map((step) => (
            <div
              key={step.number}
              style={{
                background: '#fff',
                border: `1px solid ${step.borderColor}`,
                borderLeft: `4px solid ${step.leftBorder}`,
                borderRadius: 14,
                padding: '18px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                textAlign: 'left',
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3B6D11, #639922)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  fontWeight: 500,
                  flexShrink: 0,
                }}
              >
                {step.number}
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text)', margin: '0 0 2px' }}>{step.title}</p>
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0 }}>{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ width: '100%', display: 'flex', gap: 12 }}>
          <button
            onClick={() => navigate('/signup')}
            style={{
              flex: 1,
              padding: 13,
              fontSize: 15,
              fontWeight: 500,
              color: '#fff',
              background: 'linear-gradient(135deg, #3B6D11, #639922)',
              border: 'none',
              borderRadius: 12,
              cursor: 'pointer',
            }}
          >
            Sign up
          </button>
          <button
            onClick={() => navigate('/login')}
            style={{
              flex: 1,
              padding: 13,
              fontSize: 15,
              fontWeight: 500,
              color: 'var(--color-header)',
              background: '#fff',
              border: '1.5px solid var(--color-header)',
              borderRadius: 12,
              cursor: 'pointer',
            }}
          >
            Log in
          </button>
        </div>
      </div>
    </div>
  );
}

export default Landing;