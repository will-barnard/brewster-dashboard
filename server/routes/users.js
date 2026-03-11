const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

// GET /api/users/me — current user profile
router.get('/me', (req, res) => {
  res.json({ user: req.user });
});

// PUT /api/users/me — update own profile (name, password)
router.put('/me', async (req, res) => {
  const { name, currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  const updates = [];
  const params = [];

  if (name) {
    updates.push('name = ?');
    params.push(name);
  }

  if (newPassword) {
    if (!currentPassword) {
      return res
        .status(400)
        .json({ error: 'Current password is required to set a new password' });
    }
    const user = db.prepare('SELECT password FROM users WHERE id = ?').get(userId);
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    const hash = await bcrypt.hash(newPassword, 12);
    updates.push('password = ?');
    params.push(hash);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'Nothing to update' });
  }

  updates.push("updated_at = datetime('now')");
  params.push(userId);

  db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...params);

  const updated = db
    .prepare('SELECT id, email, name, role, updated_at FROM users WHERE id = ?')
    .get(userId);

  res.json({ user: updated });
});

module.exports = router;
