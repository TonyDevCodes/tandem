const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const verifyToken = require('../middleware/verifyToken');
const requireRole = require('../middleware/requireRole');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// POST /stripe/connect - coach fillon/vazhdon Stripe Connect onboarding
router.post('/connect', verifyToken, requireRole('coach'), async (req, res) => {
  const coachId = req.user.id;

  try {
    const userResult = await pool.query(
      'SELECT stripe_account_id FROM users WHERE id = $1',
      [coachId]
    );

    let stripeAccountId = userResult.rows[0]?.stripe_account_id;

    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'NL',
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });

      stripeAccountId = account.id;

      await pool.query(
        'UPDATE users SET stripe_account_id = $1 WHERE id = $2',
        [stripeAccountId, coachId]
      );
    }

    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: 'http://localhost:5173/dashboard',
      return_url: 'http://localhost:5173/dashboard',
      type: 'account_onboarding',
    });

    res.json({ url: accountLink.url });
  } catch (err) {
    console.error('Error creating Stripe Connect link:', err);
    res.status(500).json({ error: 'Server error while connecting to Stripe' });
  }
});

// GET /stripe/status - kontrollo nese coach ka mbaruar onboarding-un
router.get('/status', verifyToken, requireRole('coach'), async (req, res) => {
  const coachId = req.user.id;

  try {
    const userResult = await pool.query(
      'SELECT stripe_account_id FROM users WHERE id = $1',
      [coachId]
    );

    const stripeAccountId = userResult.rows[0]?.stripe_account_id;

    if (!stripeAccountId) {
      return res.json({ connected: false });
    }

    const account = await stripe.accounts.retrieve(stripeAccountId);

    res.json({
      connected: account.details_submitted === true,
      chargesEnabled: account.charges_enabled,
    });
  } catch (err) {
    console.error('Error checking Stripe status:', err);
    res.status(500).json({ error: 'Server error while checking Stripe status' });
  }
});

module.exports = router;