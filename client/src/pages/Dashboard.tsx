import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function FlameIcon({ color }: { color: string }) {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 12c2 -2.96 0 -7 -1 -8c0 3.038 -1.773 4.741 -3 6c-1.226 1.26 -2 3.24 -2 5a6 6 0 1 0 12 0c0 -1.532 -1.056 -3.94 -2 -5c-1.243 2.302 -3.297 2.734 -4 2z" />
    </svg>
  );
}

function StreakBadge({ streak }: { streak: number | undefined }) {
  if (streak === undefined) {
    return (
      <span
        style={{
          background: 'var(--color-streak-zero-bg)',
          color: 'var(--color-streak-zero-text)',
          borderRadius: 'var(--radius-pill)',
          padding: '4px 10px',
          fontSize: 12,
          fontWeight: 500,
        }}
      >
        ...
      </span>
    );
  }

  if (streak === 0) {
    return (
      <span
        style={{
          background: 'var(--color-streak-zero-bg)',
          color: 'var(--color-streak-zero-text)',
          borderRadius: 'var(--radius-pill)',
          padding: '4px 10px',
          fontSize: 12,
          fontWeight: 500,
        }}
      >
        Start today
      </span>
    );
  }

  return (
    <span
      style={{
        background: 'var(--color-streak-bg)',
        color: 'var(--color-streak-text)',
        borderRadius: 'var(--radius-pill)',
        padding: '4px 10px',
        fontSize: 12,
        fontWeight: 500,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
      }}
    >
      <FlameIcon color="var(--color-streak-text)" />
      {streak}
    </span>
  );
}

function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [habits, setHabits] = useState<any[]>([]);
  const [streaks, setStreaks] = useState<Record<number, number>>({});
  const [clientId, setClientId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingError, setBookingError] = useState('');
  const [acceptedClients, setAcceptedClients] = useState<any[]>([]);
  const [stripeStatus, setStripeStatus] = useState<{ connected: boolean; chargesEnabled?: boolean } | null>(null);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [stripeError, setStripeError] = useState('');
  const [priceInput, setPriceInput] = useState('');
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceError, setPriceError] = useState('');
  const [priceSaved, setPriceSaved] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  const fetchStreak = async (habitId: number) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/habits/${habitId}/streak`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStreaks((prev) => ({ ...prev, [habitId]: res.data.streak }));
    } catch (err) {
      // silent fail per habit, s'ndalon UI
    }
  };

  const fetchHabits = async (currentUser: any) => {
    try {
      const url =
        currentUser.role === 'coach'
          ? `${import.meta.env.VITE_API_URL}/habits/coach/${currentUser.id}`
          : `${import.meta.env.VITE_API_URL}/habits/client/${currentUser.id}`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setHabits(res.data.habits);
      res.data.habits.forEach((h: any) => fetchStreak(h.id));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load habits');
    }
  };

  const fetchBookings = async (currentUser: any) => {
    if (currentUser.role !== 'coach') return;

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/bookings/coach/${currentUser.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBookings(res.data);
    } catch (err: any) {
      setBookingError(err.response?.data?.error || 'Failed to load booking requests');
    }
  };

  const fetchAcceptedClients = async (currentUser: any) => {
    if (currentUser.role !== 'coach') return;

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/bookings/coach/${currentUser.id}/accepted-clients`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAcceptedClients(res.data);
    } catch (err: any) {
      // silent fail, s'ndalon UI
    }
  };

  const fetchStripeStatus = async (currentUser: any) => {
    if (currentUser.role !== 'coach') return;

    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/stripe/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStripeStatus(res.data);
    } catch (err: any) {
      // silent fail, s'ndalon UI
    }
  };

  const fetchCoachPrice = async (currentUser: any) => {
    if (currentUser.role !== 'coach') return;

    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const cents = res.data.user.price_cents;
      if (cents !== null && cents !== undefined) {
        setPriceInput((cents / 100).toFixed(2));
      }
    } catch (err: any) {
      // silent fail, s'ndalon UI
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    fetchHabits(parsedUser);
    fetchBookings(parsedUser);
    fetchAcceptedClients(parsedUser);
    fetchStripeStatus(parsedUser);
    fetchCoachPrice(parsedUser);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/habits`,
        { clientId: Number(clientId), title, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setClientId('');
      setTitle('');
      setDescription('');
      fetchHabits(user);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create habit');
    }
  };

  const handleCheckin = async (habitId: number) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/habits/${habitId}/checkin`,
        { completed: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchStreak(habitId);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Check-in failed');
    }
  };

  const handleBookingAction = async (bookingId: number, status: 'accepted' | 'rejected') => {
    setBookingError('');

    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/bookings/${bookingId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchBookings(user);
      fetchAcceptedClients(user);
    } catch (err: any) {
      setBookingError(err.response?.data?.error || 'Failed to update request');
    }
  };

  const handleConnectStripe = async () => {
    setStripeError('');
    setStripeLoading(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/stripe/connect`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      window.location.href = res.data.url;
    } catch (err: any) {
      setStripeError(err.response?.data?.error || 'Failed to connect Stripe');
      setStripeLoading(false);
    }
  };

  const handleSavePrice = async () => {
    setPriceError('');
    setPriceSaved(false);

    const priceNum = Math.round(parseFloat(priceInput) * 100);

    if (isNaN(priceNum) || priceNum < 0) {
      setPriceError('Enter a valid price');
      return;
    }

    setPriceLoading(true);

    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/coaches/me`,
        { price_cents: priceNum },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPriceSaved(true);
      setTimeout(() => setPriceSaved(false), 2000);
    } catch (err: any) {
      setPriceError(err.response?.data?.error || 'Failed to save price');
    } finally {
      setPriceLoading(false);
    }
  };

  if (!user) return null;

  const pendingBookings = bookings.filter((b) => b.status === 'pending');

  const cardStyle: React.CSSProperties = {
    background: 'var(--color-card-bg)',
    border: '0.5px solid var(--color-border)',
    borderRadius: 'var(--radius-card)',
    padding: '12px 14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  };

  const sectionLabelStyle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text)',
    margin: '0 0 10px',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
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

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 500 }}>
            Tandem
          </span>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'var(--color-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              fontWeight: 500,
              color: 'var(--color-accent-text)',
            }}
          >
            {getInitials(user.name)}
          </div>
        </div>

        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <p style={{ fontSize: 13, color: 'var(--color-header-light)', margin: '0 0 2px' }}>
            Welcome
          </p>
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 22,
              fontWeight: 500,
              margin: 0,
            }}
          >
            {user.name}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '20px' }}>
        <button
          onClick={handleLogout}
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
          Log out
        </button>

        {user.role === 'client' && (
          <button
            onClick={() => navigate('/coaches')}
            style={{
              marginLeft: 10,
              background: 'var(--color-header)',
              color: '#F7F5F0',
              border: 'none',
              borderRadius: 'var(--radius-button)',
              padding: '7px 14px',
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            Find a coach
          </button>
        )}

        {user.role === 'coach' && (
          <div style={{ marginBottom: 28 }}>
            <p style={sectionLabelStyle}>Payments</p>
            {stripeError && (
              <p style={{ color: '#B23A3A', fontSize: 13, marginBottom: 8 }}>{stripeError}</p>
            )}
            <div
              style={{
                ...cardStyle,
                justifyContent: stripeStatus?.connected ? 'center' : 'space-between',
              }}
            >
              <div style={{ textAlign: stripeStatus?.connected ? 'center' : 'left' }}>
                <p style={{ fontSize: 14, fontWeight: 500, margin: '0 0 2px' }}>
                  {stripeStatus?.connected ? 'Stripe connected' : 'Connect Stripe to get paid'}
                </p>
                <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: 0 }}>
                  {stripeStatus?.connected
                    ? 'You can accept bookings and receive payouts.'
                    : 'Required before clients can book you.'}
                </p>
              </div>
              {!stripeStatus?.connected && (
                <button
                  onClick={handleConnectStripe}
                  disabled={stripeLoading}
                  style={{
                    background: 'var(--color-header)',
                    color: '#F7F5F0',
                    border: 'none',
                    borderRadius: 'var(--radius-button)',
                    padding: '7px 14px',
                    fontSize: 13,
                    fontWeight: 500,
                    opacity: stripeLoading ? 0.6 : 1,
                  }}
                >
                  {stripeLoading ? 'Connecting...' : 'Connect Stripe'}
                </button>
              )}
            </div>

            <div
              style={{
                ...cardStyle,
                flexDirection: 'column',
                alignItems: 'stretch',
                marginTop: 8,
                marginBottom: 0,
              }}
            >
              <p style={{ fontSize: 14, fontWeight: 500, margin: '0 0 2px' }}>Your rate</p>
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: '0 0 10px' }}>
                Clients see this price before requesting a session.
              </p>
              {priceError && (
                <p style={{ color: '#B23A3A', fontSize: 13, marginBottom: 8 }}>{priceError}</p>
              )}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '0.5px solid var(--color-border)',
                    borderRadius: 'var(--radius-button)',
                    padding: '9px 10px',
                    flex: 1,
                  }}
                >
                  <span style={{ fontSize: 14, color: 'var(--color-text-muted)', marginRight: 4 }}>
                    €
                  </span>
                  <input
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    inputMode="decimal"
                    placeholder="0.00"
                    style={{
                      border: 'none',
                      outline: 'none',
                      padding: 0,
                      fontSize: 14,
                      width: `${Math.max(priceInput.length, 4)}ch`,
                      textAlign: 'center',
                    }}
                  />
                  <span style={{ fontSize: 12, color: 'var(--color-text-muted)', marginLeft: 4 }}>
                    /session
                  </span>
                </div>
                <button
                  onClick={handleSavePrice}
                  disabled={priceLoading}
                  style={{
                    background: priceSaved ? 'var(--color-streak-text)' : 'var(--color-header)',
                    color: '#F7F5F0',
                    border: 'none',
                    borderRadius: 'var(--radius-button)',
                    padding: '9px 14px',
                    fontSize: 13,
                    fontWeight: 500,
                    opacity: priceLoading ? 0.6 : 1,
                  }}
                >
                  {priceLoading ? 'Saving...' : priceSaved ? 'Saved' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}

        {user.role === 'coach' && (
          <div style={{ marginBottom: 28 }}>
            <p style={sectionLabelStyle}>Pending requests</p>
            {bookingError && (
              <p style={{ color: '#B23A3A', fontSize: 13 }}>{bookingError}</p>
            )}
            {pendingBookings.length === 0 && (
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                No pending requests.
              </p>
            )}
            {pendingBookings.map((booking) => (
              <div key={booking.id} style={cardStyle}>
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
                    {getInitials(booking.client_name)}
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>
                      {booking.client_name}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: 0 }}>
                      {booking.client_email}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={() => handleBookingAction(booking.id, 'accepted')}
                    aria-label="Accept"
                    style={{
                      background: 'var(--color-header)',
                      color: '#F7F5F0',
                      border: 'none',
                      borderRadius: 7,
                      width: 30,
                      height: 30,
                    }}
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => handleBookingAction(booking.id, 'rejected')}
                    aria-label="Reject"
                    style={{
                      background: 'transparent',
                      color: 'var(--color-text-muted)',
                      border: '0.5px solid var(--color-border)',
                      borderRadius: 7,
                      width: 30,
                      height: 30,
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {user.role === 'coach' && (
          <div style={{ marginBottom: 28 }}>
            <p style={sectionLabelStyle}>Create a habit</p>
            {acceptedClients.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                No accepted clients yet — accept a request first.
              </p>
            ) : (
              <form
                onSubmit={handleCreateHabit}
                style={{
                  background: 'var(--color-card-bg)',
                  border: '0.5px solid var(--color-border)',
                  borderRadius: 'var(--radius-card)',
                  padding: 16,
                }}
              >
                <div style={{ marginBottom: 12 }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 12,
                      color: 'var(--color-text-muted)',
                      marginBottom: 4,
                    }}
                  >
                    Client
                  </label>
                  <select
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '9px 10px',
                      fontSize: 14,
                      border: '0.5px solid var(--color-border)',
                      borderRadius: 'var(--radius-button)',
                      textAlign: 'center',
                      textAlignLast: 'center',
                    }}
                  >
                    <option value="">Select a client</option>
                    {acceptedClients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name} ({client.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 12,
                      color: 'var(--color-text-muted)',
                      marginBottom: 4,
                    }}
                  >
                    Title
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '9px 10px',
                      fontSize: 14,
                      border: '0.5px solid var(--color-border)',
                      borderRadius: 'var(--radius-button)',
                    }}
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 12,
                      color: 'var(--color-text-muted)',
                      marginBottom: 4,
                    }}
                  >
                    Description
                  </label>
                  <input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 10px',
                      fontSize: 14,
                      border: '0.5px solid var(--color-border)',
                      borderRadius: 'var(--radius-button)',
                    }}
                  />
                </div>
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: 10,
                    fontSize: 14,
                    fontWeight: 500,
                    color: '#F7F5F0',
                    background: 'var(--color-header)',
                    border: 'none',
                    borderRadius: 'var(--radius-button)',
                  }}
                >
                  Create habit
                </button>
              </form>
            )}
          </div>
        )}

        {error && <p style={{ color: '#B23A3A', fontSize: 13, marginBottom: 16 }}>{error}</p>}

        <p style={sectionLabelStyle}>
          {user.role === 'coach' ? 'Habits you created' : 'Your habits'}
        </p>
        {habits.map((habit) => (
          <div key={habit.id} style={cardStyle}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 500, margin: '0 0 2px' }}>{habit.title}</p>
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: 0 }}>
                {user.role === 'coach' ? habit.client_name : habit.description}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <StreakBadge streak={streaks[habit.id]} />
              {user.role === 'client' && (
                <button
                  onClick={() => handleCheckin(habit.id)}
                  style={{
                    background: 'var(--color-header)',
                    color: '#F7F5F0',
                    border: 'none',
                    borderRadius: 'var(--radius-button)',
                    padding: '6px 10px',
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                >
                  Check in
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;