require('dotenv').config();
const pool = require('./pool');

const createUsersTable = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('coach', 'client')),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
`;

const createHabitsTable = `
CREATE TABLE IF NOT EXISTS habits (
  id SERIAL PRIMARY KEY,
  coach_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  frequency VARCHAR(20) NOT NULL DEFAULT 'daily',
  created_at TIMESTAMP DEFAULT NOW()
);
`;

const createHabitLogsTable = `
CREATE TABLE IF NOT EXISTS habit_logs (
  id SERIAL PRIMARY KEY,
  habit_id INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(habit_id, date)
);
`;

const createBookingsTable = `
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  coach_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(coach_id, client_id)
);
`;

const addStripeColumnsToUsers = `
ALTER TABLE users ADD COLUMN IF NOT EXISTS price_cents INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_account_id VARCHAR(255);
`;

const addStripeColumnsToBookings = `
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS stripe_payment_intent_id VARCHAR(255);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'authorized', 'captured', 'canceled'));
`;

async function migrate() {
  try {
    await pool.query(createUsersTable);
    console.log('Users table OK');

    await pool.query(createHabitsTable);
    console.log('Habits table OK');

    await pool.query(createHabitLogsTable);
    console.log('Habit_logs table OK');

    await pool.query(createBookingsTable);
    console.log('Bookings table OK');

    await pool.query(addStripeColumnsToUsers);
    console.log('Stripe columns added to users');

    await pool.query(addStripeColumnsToBookings);
    console.log('Stripe columns added to bookings');

    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();