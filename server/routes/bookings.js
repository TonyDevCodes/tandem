const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const verifyToken = require('../middleware/verifyToken');
const requireRole = require('../middleware/requireRole');

// POST /bookings - client kerkon nje coach
router.post('/', verifyToken, requireRole('client'), async (req, res) => {
  const { coachId } = req.body;
  const clientId = req.user.id;

  if (!coachId) {
    return res.status(400).json({ error: 'coachId is required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO bookings (coach_id, client_id, status)
       VALUES ($1, $2, 'pending')
       RETURNING id, coach_id, client_id, status, created_at`,
      [coachId, clientId]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      // unique_violation - UNIQUE(coach_id, client_id)
      return res.status(409).json({ error: 'You have already requested this coach' });
    }
    console.error('Error creating booking:', err);
    res.status(500).json({ error: 'Server error while creating booking' });
  }
});

// GET /bookings/coach/:coachId - coach sheh kerkesat e tij (te gjitha statuset)
router.get('/coach/:coachId', verifyToken, requireRole('coach'), async (req, res) => {
  const { coachId } = req.params;

  try {
    const result = await pool.query(
      `SELECT bookings.id, bookings.status, bookings.created_at,
              users.id AS client_id, users.name AS client_name, users.email AS client_email
       FROM bookings
       JOIN users ON users.id = bookings.client_id
       WHERE bookings.coach_id = $1
       ORDER BY bookings.created_at DESC`,
      [coachId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ error: 'Server error while fetching bookings' });
  }
});

// GET /bookings/coach/:coachId/accepted-clients - vetem client-et e pranuar, per dropdown
router.get('/coach/:coachId/accepted-clients', verifyToken, requireRole('coach'), async (req, res) => {
  const { coachId } = req.params;

  try {
    const result = await pool.query(
      `SELECT users.id, users.name, users.email
       FROM bookings
       JOIN users ON users.id = bookings.client_id
       WHERE bookings.coach_id = $1 AND bookings.status = 'accepted'
       ORDER BY users.name ASC`,
      [coachId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching accepted clients:', err);
    res.status(500).json({ error: 'Server error while fetching accepted clients' });
  }
});

// PATCH /bookings/:bookingId - coach pranon ose refuzon
router.patch('/:bookingId', verifyToken, requireRole('coach'), async (req, res) => {
  const { bookingId } = req.params;
  const { status } = req.body;

  if (!['accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ error: "status must be 'accepted' or 'rejected'" });
  }

  try {
    const result = await pool.query(
      `UPDATE bookings SET status = $1
       WHERE id = $2 AND coach_id = $3
       RETURNING id, coach_id, client_id, status, created_at`,
      [status, bookingId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found or not yours' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating booking:', err);
    res.status(500).json({ error: 'Server error while updating booking' });
  }
});

module.exports = router;