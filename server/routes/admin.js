const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);
router.use(requireRole('super_admin'));

// GET /api/admin/users — list all users
router.get('/users', (_req, res) => {
  const users = db
    .prepare('SELECT id, email, name, role, created_at, updated_at FROM users')
    .all();
  res.json({ users });
});

// POST /api/admin/users — create a new user
router.post('/users', async (req, res) => {
  const { email, name, password, role } = req.body;
  if (!email || !name || !password) {
    return res.status(400).json({ error: 'Email, name, and password are required' });
  }

  const validRoles = ['user', 'admin'];
  const userRole = validRoles.includes(role) ? role : 'user';

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(409).json({ error: 'A user with that email already exists' });
  }

  const hash = await bcrypt.hash(password, 12);
  const result = db
    .prepare('INSERT INTO users (email, name, password, role) VALUES (?, ?, ?, ?)')
    .run(email, name, hash, userRole);

  const user = db
    .prepare('SELECT id, email, name, role, created_at FROM users WHERE id = ?')
    .get(result.lastInsertRowid);

  res.status(201).json({ user });
});

// DELETE /api/admin/users/:id — delete a user (cannot delete yourself)
router.delete('/users/:id', (req, res) => {
  const targetId = Number(req.params.id);
  if (targetId === req.user.id) {
    return res.status(400).json({ error: 'Cannot delete your own account' });
  }

  const target = db.prepare('SELECT id, role FROM users WHERE id = ?').get(targetId);
  if (!target) {
    return res.status(404).json({ error: 'User not found' });
  }

  db.prepare('DELETE FROM users WHERE id = ?').run(targetId);
  res.json({ ok: true });
});

module.exports = router;
