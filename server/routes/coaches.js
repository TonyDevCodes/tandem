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

module.exports = router;