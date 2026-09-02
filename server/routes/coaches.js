const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const verifyToken = require('../middleware/verifyToken');

// GET /coaches - lista e te gjithe coach-eve (protected, kerkon token)
router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email FROM users WHERE role = $1 ORDER BY name ASC',
      ['coach']
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching coaches:', err);
    res.status(500).json({ error: 'Server error while fetching coaches' });
  }
});

// PATCH /coaches/me - coach-i vendos/perditeson cmimin e tij
router.patch('/me', verifyToken, async (req, res) => {
  if (req.user.role !== 'coach') {
    return res.status(403).json({ success: false, error: 'Only coaches can set a price' });
  }

  const { price_cents } = req.body;

  if (price_cents === undefined || price_cents === null) {
    return res.status(400).json({ success: false, error: 'price_cents is required' });
  }

  const priceNum = Number(price_cents);

  if (!Number.isInteger(priceNum) || priceNum < 0) {
    return res.status(400).json({ success: false, error: 'price_cents must be a non-negative integer' });
  }

  try {
    const result = await pool.query(
      'UPDATE users SET price_cents = $1 WHERE id = $2 RETURNING id, price_cents',
      [priceNum, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Coach not found' });
    }

    res.json({ success: true, price_cents: result.rows[0].price_cents });
  } catch (err) {
    console.error('Error updating price:', err);
    res.status(500).json({ success: false, error: 'Server error while updating price' });
  }
});

module.exports = router;