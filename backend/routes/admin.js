const express = require('express');
const { getDb } = require('../db');

const router = express.Router();

function requireAdmin(req, res, next) {
  const password = req.headers['x-admin-password'];
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin_panini_2026';
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  next();
}

// Stats generales
router.get('/stats', requireAdmin, (req, res) => {
  const db = getDb();
  const totalUsers = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
  const totalStickers = db.prepare('SELECT COUNT(*) as c FROM user_stickers').get().c;
  const activeUsers = db.prepare(
    'SELECT COUNT(DISTINCT user_id) as c FROM user_stickers'
  ).get().c;
  res.json({ totalUsers, totalStickers, activeUsers });
});

// Lista de usuarios
router.get('/users', requireAdmin, (req, res) => {
  const db = getDb();
  const users = db.prepare(`
    SELECT
      u.id,
      u.username,
      u.email,
      u.created_at,
      COUNT(us.sticker_id) as stickers_count,
      COALESCE(SUM(CASE WHEN us.quantity >= 2 THEN 1 ELSE 0 END), 0) as duplicates_count
    FROM users u
    LEFT JOIN user_stickers us ON us.user_id = u.id
    GROUP BY u.id
    ORDER BY u.created_at DESC
  `).all();
  res.json(users);
});

// Borrar usuario
router.delete('/users/:id', requireAdmin, (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
