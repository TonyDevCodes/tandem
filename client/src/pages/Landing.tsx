import { useNavigate } from 'react-router-dom';

function Landing() {
  const navigate = useNavigate();

  const steps = [
    {
      number: '1',
      title: 'Find a coach',
      description: 'Browse coaches and send a request to the one that fits you.',
    },
    {
      number: '2',
      title: 'Set your habits',
      description: 'Your coach creates daily habits tailored to your goals.',
    },
    {
      number: '3',
      title: 'Track your streak',
      description: 'Check in every day and watch your progress build up.',
    },
  ];

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
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
          maxWidth: 640,
          margin: '0 auto',
          padding: '80px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            border: '2px solid var(--color-header)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 30,
              fontWeight: 500,
              color: 'var(--color-accent)',
            }}
          >
            T
          </span>
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 36,
            fontWeight: 500,
            color: 'var(--color-text)',
            margin: '0 0 10px',
          }}
        >
          Tandem
        </h1>
        <p
          style={{
            fontSize: 15,
            color: 'var(--color-text-muted)',
            margin: '0 0 40px',
          }}
        >
          Daily habits. Real coaches. Real progress.
        </p>

        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            marginBottom: 40,
          }}
        >
          {steps.map((step) => (
            <div
              key={step.number}
              style={{
                background: 'var(--color-card-bg)',
                border: '0.5px solid var(--color-border)',
                borderRadius: 'var(--radius-card)',
                padding: '18px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                textAlign: 'left',
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'var(--color-header)',
                  color: '#F7F5F0',
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
                <p
                  style={{
                    fontSize: 15,
                    fontWeight: 500,
                    color: 'var(--color-text)',
                    margin: '0 0 2px',
                  }}
                >
                  {step.title}
                </p>
                <p
                  style={{
                    fontSize: 13,
                    color: 'var(--color-text-muted)',
                    margin: 0,
                  }}
                >
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ width: '100%', display: 'flex', gap: 12 }}>
          <button
            onClick={() => navigate('/signup')}
            style={{
              flex: 1,
              padding: 12,
              fontSize: 14,
              fontWeight: 500,
              color: '#F7F5F0',
              background: 'var(--color-header)',
              border: 'none',
              borderRadius: 'var(--radius-button)',
              cursor: 'pointer',
            }}
          >
            Sign up
          </button>
          <button
            onClick={() => navigate('/login')}
            style={{
              flex: 1,
              padding: 12,
              fontSize: 14,
              fontWeight: 500,
              color: 'var(--color-text)',
              background: 'transparent',
              border: '0.5px solid var(--color-border)',
              borderRadius: 'var(--radius-button)',
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