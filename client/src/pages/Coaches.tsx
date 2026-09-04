import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Logo from '../components/Logo';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface Coach {
  id: number;
  name: string;
  email: string;
}

const GEAR_PATH =
  'M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z';

function Gear({ size, color, style }: { size: number; color: string; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ position: 'absolute', ...style }}>
      <path d={GEAR_PATH} fill={color} />
    </svg>
  );
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function BookingModal({
  coach,
  onClose,
  onSuccess,
}: {
  coach: Coach;
  onClose: () => void;
  onSuccess: (coachId: number) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [cardError, setCardError] = useState('');
  const [processing, setProcessing] = useState(false);

  const token = localStorage.getItem('token');

  const handleConfirmPayment = async () => {
    setCardError('');

    if (!stripe || !elements) return;

    setProcessing(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ coachId: coach.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        setCardError(data.error || 'Failed to create request');
        setProcessing(false);
        return;
      }

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        setCardError('Card details not found');
        setProcessing(false);
        return;
      }

      const result = await stripe.confirmCardPayment(data.client_secret, {
        payment_method: { card: cardElement },
      });

      if (result.error) {
        setCardError(result.error.message || 'Card authorization failed');
        setProcessing(false);
        return;
      }

      onSuccess(coach.id);
    } catch (err) {
      setCardError('Something went wrong. Please try again.');
      setProcessing(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(23, 32, 27, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: 20,
      }}
    >
      <div
        style={{
          background: 'var(--color-card-bg)',
          borderRadius: 'var(--radius-card)',
          padding: 24,
          width: '100%',
          maxWidth: 380,
        }}
      >
        <p style={{ fontSize: 16, fontWeight: 500, margin: '0 0 4px' }}>Request {coach.name}</p>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '0 0 18px' }}>
          Your card is authorized now and only charged once {coach.name.split(' ')[0]} accepts.
        </p>

        <div
          style={{
            border: '0.5px solid var(--color-border)',
            borderRadius: 'var(--radius-button)',
            padding: '12px 10px',
            marginBottom: 12,
          }}
        >
          <CardElement
            options={{
              style: {
                base: { fontSize: '14px', color: '#17201B', '::placeholder': { color: '#9A9689' } },
              },
            }}
          />
        </div>

        {cardError && (
          <p style={{ color: '#B23A3A', fontSize: 13, marginBottom: 12 }}>{cardError}</p>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onClose}
            disabled={processing}
            style={{
              flex: 1,
              background: 'transparent',
              border: '0.5px solid var(--color-border)',
              borderRadius: 'var(--radius-button)',
              padding: '10px',
              fontSize: 13,
              color: 'var(--color-text-muted)',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmPayment}
            disabled={processing || !stripe}
            style={{
              flex: 1,
              background: 'linear-gradient(135deg, #3B6D11, #639922)',
              color: '#F7F5F0',
              border: 'none',
              borderRadius: 'var(--radius-button)',
              padding: '10px',
              fontSize: 13,
              fontWeight: 500,
              opacity: processing ? 0.6 : 1,
            }}
          >
            {processing ? 'Confirming...' : 'Confirm & Pay'}
          </button>
        </div>
      </div>
    </div>
  );
}

function CoachesInner() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requestedIds, setRequestedIds] = useState<number[]>([]);
  const [modalCoach, setModalCoach] = useState<Coach | null>(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchCoaches = async () => {
      try {
        if (!token) {
          setError('You must be logged in to view coaches.');
          setLoading(false);
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/coaches`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch coaches');
        }

        const data = await response.json();
        setCoaches(data);
      } catch (err) {
        setError('Something went wrong while loading coaches.');
      } finally {
        setLoading(false);
      }
    };

    fetchCoaches();
  }, []);

  const handleBookingSuccess = (coachId: number) => {
    setRequestedIds((prev) => [...prev, coachId]);
    setModalCoach(null);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: 480, margin: '40px 0' }}>
        <div style={{ background: 'var(--color-card-bg)', borderRadius: 'var(--radius-card)', overflow: 'hidden', border: '0.5px solid var(--color-border)' }}>
          <div
            style={{
              background: 'var(--color-header)',
              padding: '28px 20px',
              color: '#F7F5F0',
              textAlign: 'center',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
              <Logo size={64} showText={false} />
            </div>
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 22,
                fontWeight: 500,
                margin: '0 0 4px',
              }}
            >
              Find a coach
            </p>
            <p style={{ fontSize: 13, color: 'var(--color-header-light)', margin: 0 }}>
              Send a request — coaches accept before you start together.
            </p>
          </div>

          <div style={{ position: 'relative' }}>
            <svg width="70" height="20" style={{ position: 'absolute', top: 12, left: 8, opacity: 0.5, zIndex: 2 }}>
              <circle cx="10" cy="10" r="5" fill="#E8A33D" />
              <circle cx="30" cy="10" r="5" fill="#D8D4C6" />
              <circle cx="50" cy="10" r="5" fill="#D8D4C6" />
            </svg>

            <div style={{ height: 26 }} />
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ position: 'relative', width: 70, height: 44 }}>
                <Gear size={32} color="#D85A30" style={{ left: 0, top: 6 }} />
                <Gear size={26} color="#3B6D11" style={{ left: 22, top: -6 }} />
                <Gear size={32} color="#E8A33D" style={{ left: 40, top: 6 }} />
              </div>
            </div>
            <div style={{ height: 26 }} />

            <div style={{ padding: '0 18px', textAlign: 'center' }}>
              {!loading && !error && coaches.length > 0 && (
                <>
                  <p style={{ fontSize: 20, fontWeight: 500, color: '#3B6D11', margin: '0 0 3px' }}>
                    {coaches.length} coach{coaches.length !== 1 ? 'es' : ''} available
                  </p>
                  <p style={{ fontSize: 14, color: 'var(--color-text-muted)', margin: 0 }}>
                    Pick one and send a request to get started.
                  </p>
                </>
              )}
              {loading && (
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Loading coaches...</p>
              )}
              {error && <p style={{ color: '#B23A3A', fontSize: 13 }}>{error}</p>}
              {!loading && !error && coaches.length === 0 && (
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                  No coaches available yet.
                </p>
              )}
            </div>

            {!loading && !error && coaches.length > 0 && (
              <div style={{ padding: '16px 18px 4px' }}>
                {coaches.map((coach) => (
                  <div
                    key={coach.id}
                    style={{
                      background: '#fff',
                      border: '0.5px solid var(--color-border)',
                      borderRadius: 'var(--radius-card)',
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 10,
                      boxShadow: '0 1px 3px rgba(23, 32, 27, 0.06)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          background: 'transparent',
                          border: '2px solid #D85A30',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 14,
                          fontWeight: 500,
                          color: '#D85A30',
                          flexShrink: 0,
                        }}
                      >
                        {getInitials(coach.name)}
                      </div>
                      <div>
                        <p style={{ fontSize: 16, fontWeight: 500, margin: 0 }}>{coach.name}</p>
                        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0 }}>
                          {coach.email}
                        </p>
                      </div>
                    </div>

                    {requestedIds.includes(coach.id) ? (
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 500,
                          color: '#8A8676',
                          background: '#EFEBE0',
                          borderRadius: 'var(--radius-pill)',
                          padding: '6px 13px',
                          flexShrink: 0,
                        }}
                      >
                        Request sent
                      </span>
                    ) : (
                      <button
                        onClick={() => setModalCoach(coach)}
                        style={{
                          background: 'linear-gradient(135deg, #3B6D11, #639922)',
                          color: '#F7F5F0',
                          border: 'none',
                          borderRadius: 'var(--radius-button)',
                          padding: '9px 16px',
                          fontSize: 13,
                          fontWeight: 500,
                          flexShrink: 0,
                        }}
                      >
                        Request coach
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {!loading && !error && coaches.length > 0 && (
              <p
                style={{
                  fontSize: 14,
                  color: 'var(--color-text-muted)',
                  textAlign: 'center',
                  margin: '10px 0 4px',
                }}
              >
                Coaches typically respond within a day.
              </p>
            )}

            <div style={{ padding: '12px 18px 20px', display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  background: 'transparent',
                  border: '0.5px solid var(--color-border)',
                  borderRadius: 'var(--radius-button)',
                  padding: '8px 16px',
                  fontSize: 13,
                  color: 'var(--color-text-muted)',
                }}
              >
                Back to dashboard
              </button>
            </div>

            <svg width="70" height="20" style={{ position: 'absolute', bottom: 12, right: 8, opacity: 0.5, zIndex: 2 }}>
              <circle cx="10" cy="10" r="5" fill="#D8D4C6" />
              <circle cx="30" cy="10" r="5" fill="#E8A33D" />
              <circle cx="50" cy="10" r="5" fill="#E8A33D" />
            </svg>
          </div>
        </div>
      </div>

      {modalCoach && (
        <BookingModal
          coach={modalCoach}
          onClose={() => setModalCoach(null)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
}

function Coaches() {
  return (
    <Elements stripe={stripePromise}>
      <CoachesInner />
    </Elements>
  );
}

export default Coaches;