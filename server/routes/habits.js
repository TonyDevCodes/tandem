const express = require('express');
const pool = require('../db/pool');
const verifyToken = require('../middleware/verifyToken');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

// CREATE HABIT — vetëm coach, vetëm për client të pranuar
router.post('/', verifyToken, requireRole('coach'), async (req, res) => {
  const { clientId, title, description, frequency } = req.body;
  const coachId = req.user.id;

  if (!clientId || !title) {
    return res.status(400).json({ success: false, error: 'clientId and title are required' });
  }

  try {
    const bookingCheck = await pool.query(
      `SELECT id FROM bookings WHERE coach_id = $1 AND client_id = $2 AND status = 'accepted'`,
      [coachId, clientId]
    );

    if (bookingCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'You can only create habits for clients who have accepted your coaching request',
      });
    }

    const result = await pool.query(
      'INSERT INTO habits (coach_id, client_id, title, description, frequency) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [coachId, clientId, title, description || null, frequency || 'daily']
    );

    res.status(201).json({ success: true, habit: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET HABITS FOR A CLIENT
router.get('/client/:clientId', verifyToken, async (req, res) => {
  const { clientId } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM habits WHERE client_id = $1 ORDER BY created_at DESC',
      [clientId]
    );

    res.json({ success: true, habits: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET HABITS FOR A COACH — për dashboard, të gjithë klientët bashkë
router.get('/coach/:coachId', verifyToken, async (req, res) => {
  const { coachId } = req.params;

  try {
    const result = await pool.query(
      `SELECT habits.*, users.name AS client_name, users.email AS client_email
       FROM habits
       JOIN users ON habits.client_id = users.id
       WHERE habits.coach_id = $1
       ORDER BY habits.created_at DESC`,
      [coachId]
    );

    res.json({ success: true, habits: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// CHECK-IN — vetëm client
router.post('/:habitId/checkin', verifyToken, requireRole('client'), async (req, res) => {
  const { habitId } = req.params;
  const { completed } = req.body;
  const today = new Date().toISOString().split('T')[0];

  try {
    const result = await pool.query(
      `INSERT INTO habit_logs (habit_id, date, completed)
       VALUES ($1, $2, $3)
       ON CONFLICT (habit_id, date)
       DO UPDATE SET completed = $3
       RETURNING *`,
      [habitId, today, completed !== undefined ? completed : true]
    );

    res.json({ success: true, log: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET LOGS FOR A HABIT — historiku
router.get('/:habitId/logs', verifyToken, async (req, res) => {
  const { habitId } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM habit_logs WHERE habit_id = $1 ORDER BY date DESC',
      [habitId]
    );

    res.json({ success: true, logs: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET STREAK FOR A HABIT — sa ditë rresht, pa ndërprerje
router.get('/:habitId/streak', verifyToken, async (req, res) => {
  const { habitId } = req.params;

  try {
    const result = await pool.query(
      'SELECT date FROM habit_logs WHERE habit_id = $1 AND completed = true ORDER BY date DESC',
      [habitId]
    );

    const dates = result.rows.map((row) => row.date.toISOString().split('T')[0]);

    let streak = 0;
    let cursor = new Date();
    cursor.setUTCHours(0, 0, 0, 0);

    for (let i = 0; i < dates.length; i++) {
      const expected = cursor.toISOString().split('T')[0];
      if (dates[i] === expected) {
        streak++;
        cursor.setUTCDate(cursor.getUTCDate() - 1);
      } else if (i === 0 && dates[i] !== expected) {
        const yesterday = new Date(cursor);
        yesterday.setUTCDate(yesterday.getUTCDate() - 1);
        if (dates[i] === yesterday.toISOString().split('T')[0]) {
          streak++;
          cursor = yesterday;
          cursor.setUTCDate(cursor.getUTCDate() - 1);
        } else {
          break;
        }
      } else {
        break;
      }
    }

    res.json({ success: true, streak });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;