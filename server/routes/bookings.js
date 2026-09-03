const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const verifyToken = require('../middleware/verifyToken');
const requireRole = require('../middleware/requireRole');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// POST /bookings - client kerkon nje coach (dhe autorizohet pagesa me Stripe)
router.post('/', verifyToken, requireRole('client'), async (req, res) => {
  const { coachId } = req.body;
  const clientId = req.user.id;

  if (!coachId) {
    return res.status(400).json({ error: 'coachId is required' });
  }

  try {
    const coachResult = await pool.query(
      'SELECT price_cents, stripe_account_id FROM users WHERE id = $1 AND role = $2',
      [coachId, 'coach']
    );

    const coach = coachResult.rows[0];

    if (!coach) {
      return res.status(404).json({ error: 'Coach not found' });
    }

    if (!coach.stripe_account_id) {
      return res.status(400).json({ error: "This coach hasn't set up payments yet" });
    }

    if (!coach.price_cents) {
      return res.status(400).json({ error: "This coach hasn't set their price yet" });
    }

    const bookingResult = await pool.query(
      `INSERT INTO bookings (coach_id, client_id, status)
       VALUES ($1, $2, 'pending')
       RETURNING id, coach_id, client_id, status, created_at`,
      [coachId, clientId]
    );

    const booking = bookingResult.rows[0];

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: coach.price_cents,
        currency: 'eur',
        capture_method: 'manual',
        transfer_data: { destination: coach.stripe_account_id },
      });

      const updateResult = await pool.query(
        `UPDATE bookings SET stripe_payment_intent_id = $1, payment_status = 'authorized'
         WHERE id = $2
         RETURNING id, coach_id, client_id, status, payment_status, stripe_payment_intent_id, created_at`,
        [paymentIntent.id, booking.id]
      );

      res.status(201).json({
        ...updateResult.rows[0],
        client_secret: paymentIntent.client_secret,
      });
    } catch (stripeErr) {
      console.error('Error creating PaymentIntent:', stripeErr);
      await pool.query('DELETE FROM bookings WHERE id = $1', [booking.id]);
      res.status(402).json({ error: 'Payment authorization failed. Please check your card details.' });
    }
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

// PATCH /bookings/:bookingId - coach pranon ose refuzon (capture/cancel pagesen ne Stripe)
router.patch('/:bookingId', verifyToken, requireRole('coach'), async (req, res) => {
  console.log('>>> PATCH BOOKINGS ROUTE HIT — NEW CODE <<<');
  const { bookingId } = req.params;
  const { status } = req.body;

  if (!['accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ error: "status must be 'accepted' or 'rejected'" });
  }

  try {
    const bookingResult = await pool.query(
      `SELECT id, coach_id, client_id, status, stripe_payment_intent_id
       FROM bookings
       WHERE id = $1 AND coach_id = $2`,
      [bookingId, req.user.id]
    );

    const booking = bookingResult.rows[0];

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found or not yours' });
    }

    if (booking.status !== 'pending') {
      return res.status(409).json({ error: 'This request has already been handled' });
    }

    let paymentStatus = null;

    if (booking.stripe_payment_intent_id) {
      try {
        if (status === 'accepted') {
          await stripe.paymentIntents.capture(booking.stripe_payment_intent_id);
          paymentStatus = 'captured';
        } else {
          await stripe.paymentIntents.cancel(booking.stripe_payment_intent_id);
          paymentStatus = 'canceled';
        }
      } catch (stripeErr) {
        console.error('Error updating PaymentIntent:', stripeErr);
        return res.status(402).json({ error: 'Failed to process payment for this request. Please try again.' });
      }
    }

    const updateResult = await pool.query(
      `UPDATE bookings SET status = $1, payment_status = COALESCE($2, payment_status)
       WHERE id = $3 AND coach_id = $4
       RETURNING id, coach_id, client_id, status, payment_status, stripe_payment_intent_id, created_at`,
      [status, paymentStatus, bookingId, req.user.id]
    );

    res.json(updateResult.rows[0]);
  } catch (err) {
    console.error('Error updating booking:', err);
    res.status(500).json({ error: 'Server error while updating booking' });
  }
});

module.exports = router;