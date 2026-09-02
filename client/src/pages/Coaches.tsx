import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface Coach {
  id: number;
  name: string;
  email: string;
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
              background: 'var(--color-header)',
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
  const [actionError, setActionError] = useState('');
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
    <div style={{ position: 'relative', minHeight: '100vh', background: 'var(--color-bg)', overflow: 'hidden' }}>
      <svg
        width="100%"
        height="100%"
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 0 }}
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1200 900"
      >
        <circle cx="90" cy="260" r="9" fill="#E8A33D" opacity="0.4" />
        <circle cx="120" cy="260" r="9" fill="#E8A33D" opacity="0.4" />
        <circle cx="150" cy="260" r="9" fill="#E8A33D" opacity="0.4" />
        <circle cx="180" cy="260" r="9" fill="#D8D4C6" opacity="0.35" />
        <circle cx="210" cy="260" r="9" fill="#D8D4C6" opacity="0.35" />

        <circle cx="1020" cy="820" r="9" fill="#E8A33D" opacity="0.35" />
        <circle cx="1050" cy="820" r="9" fill="#E8A33D" opacity="0.35" />
        <circle cx="1080" cy="820" r="9" fill="#D8D4C6" opacity="0.3" />
        <circle cx="1110" cy="820" r="9" fill="#D8D4C6" opacity="0.3" />
      </svg>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div
          style={{
            background: 'var(--color-header)',
            padding: '24px 80px 28px',
            color: '#F7F5F0',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                border: '2px solid #F7F5F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 24,
                  fontWeight: 500,
                  color: 'var(--color-accent)',
                }}
              >
                T
              </span>
            </div>
          </div>
          <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 24,
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
        </div>

        <div
          style={{
            minHeight: 'calc(100vh - 190px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div style={{ width: '100%', maxWidth: 480 }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  background: 'transparent',
                  border: '0.5px solid var(--color-border)',
                  borderRadius: 'var(--radius-button)',
                  padding: '6px 12px',
                  fontSize: 13,
                  color: 'var(--color-text-muted)',
                  marginBottom: 20,
                }}
              >
                Back to dashboard
              </button>
            </div>

            {loading && (
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Loading coaches...</p>
            )}
            {error && <p style={{ color: '#B23A3A', fontSize: 13 }}>{error}</p>}
            {actionError && <p style={{ color: '#B23A3A', fontSize: 13 }}>{actionError}</p>}

            {!loading && !error && coaches.length === 0 && (
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                No coaches available yet.
              </p>
            )}

            {!loading &&
              !error &&
              coaches.map((coach) => (
                <div
                  key={coach.id}
                  style={{
                    background: 'var(--color-card-bg)',
                    border: '0.5px solid var(--color-border)',
                    borderRadius: 'var(--radius-card)',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 8,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: '50%',
                        background: 'var(--color-avatar-bg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 500,
                        color: 'var(--color-text)',
                      }}
                    >
                      {getInitials(coach.name)}
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>{coach.name}</p>
                      <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: 0 }}>
                        {coach.email}
                      </p>
                    </div>
                  </div>

                  {requestedIds.includes(coach.id) ? (
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 500,
                        color: 'var(--color-streak-zero-text)',
                        background: 'var(--color-streak-zero-bg)',
                        borderRadius: 'var(--radius-pill)',
                        padding: '5px 12px',
                      }}
                    >
                      Request sent
                    </span>
                  ) : (
                    <button
                      onClick={() => setModalCoach(coach)}
                      style={{
                        background: 'var(--color-header)',
                        color: '#F7F5F0',
                        border: 'none',
                        borderRadius: 'var(--radius-button)',
                        padding: '7px 14px',
                        fontSize: 12,
                        fontWeight: 500,
                      }}
                    >
                      Request coach
                    </button>
                  )}
                </div>
              ))}

            {!loading && !error && coaches.length > 0 && (
              <p
                style={{
                  fontSize: 12,
                  color: 'var(--color-text-muted)',
                  textAlign: 'center',
                  marginTop: 24,
                }}
              >
                Coaches typically respond within a day.
              </p>
            )}
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