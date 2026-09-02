require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db/pool');
const authRoutes = require('./routes/auth');
const habitsRoutes = require('./routes/habits');
const coachesRoutes = require('./routes/coaches');
const bookingsRoutes = require('./routes/bookings');
const stripeRoutes = require('./routes/stripe');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check route – për të konfirmuar që serveri punon
app.get('/', (req, res) => {
  res.json({ message: 'Tandem API is running' });
});

// DB test route – për të konfirmuar lidhjen me Neon
app.get('/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ success: true, time: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Auth routes
app.use('/auth', authRoutes);

// Habits routes
app.use('/habits', habitsRoutes);

// Coaches routes
app.use('/coaches', coachesRoutes);

// Bookings routes
app.use('/bookings', bookingsRoutes);

// Stripe routes
app.use('/stripe', stripeRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});