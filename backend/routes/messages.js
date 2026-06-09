const express = require('express');
const { getDb } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Get all conversations (last message per contact + unread count)
router.get('/', requireAuth, (req, res) => {
  const db = getDb();
  const rows = db.prepare(`
    SELECT
      u.id AS contact_id,
      u.username AS contact_username,
      u.locality,
      u.province,
      m.content AS last_message,
      m.created_at AS last_at,
      m.from_user_id,
      SUM(CASE WHEN m2.read = 0 AND m2.to_user_id = ? THEN 1 ELSE 0 END) AS unread
    FROM users u
    JOIN messages m ON (
      (m.from_user_id = ? AND m.to_user_id = u.id) OR
      (m.to_user_id = ? AND m.from_user_id = u.id)
    )
    LEFT JOIN messages m2 ON (
      (m2.from_user_id = u.id AND m2.to_user_id = ?) OR
      (m2.to_user_id = u.id AND m2.from_user_id = ?)
    )
    WHERE u.id != ?
    AND m.id = (
      SELECT id FROM messages
      WHERE (from_user_id = ? AND to_user_id = u.id)
         OR (to_user_id = ? AND from_user_id = u.id)
      ORDER BY created_at DESC LIMIT 1
    )
    GROUP BY u.id
    ORDER BY m.created_at DESC
  `).all(req.userId, req.userId, req.userId, req.userId, req.userId, req.userId, req.userId, req.userId);

  res.json(rows);
});

// Get unread count total
router.get('/unread', requireAuth, (req, res) => {
  const db = getDb();
  const row = db.prepare(
    'SELECT COUNT(*) as count FROM messages WHERE to_user_id = ? AND read = 0'
  ).get(req.userId);
  res.json({ count: row.count });
});

// Get conversation with a specific user
router.get('/:username', requireAuth, (req, res) => {
  const db = getDb();
  const other = db.prepare('SELECT id, username, locality, province FROM users WHERE username = ?')
    .get(req.params.username.toLowerCase());
  if (!other) return res.status(404).json({ error: 'Usuario no encontrado' });

  const msgs = db.prepare(`
    SELECT m.id, m.from_user_id, m.to_user_id, m.content, m.read, m.created_at,
           u.username AS from_username
    FROM messages m
    JOIN users u ON u.id = m.from_user_id
    WHERE (m.from_user_id = ? AND m.to_user_id = ?)
       OR (m.from_user_id = ? AND m.to_user_id = ?)
    ORDER BY m.created_at ASC
  `).all(req.userId, other.id, other.id, req.userId);

  // Mark received messages as read
  db.prepare(
    'UPDATE messages SET read = 1 WHERE from_user_id = ? AND to_user_id = ? AND read = 0'
  ).run(other.id, req.userId);

  res.json({ contact: other, messages: msgs });
});

// Send a message
router.post('/:username', requireAuth, (req, res) => {
  const { content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'El mensaje no puede estar vacío' });
  }
  if (content.length > 500) {
    return res.status(400).json({ error: 'El mensaje no puede superar los 500 caracteres' });
  }

  const db = getDb();
  const other = db.prepare('SELECT id FROM users WHERE username = ?')
    .get(req.params.username.toLowerCase());
  if (!other) return res.status(404).json({ error: 'Usuario no encontrado' });
  if (other.id === req.userId) return res.status(400).json({ error: 'No podés enviarte mensajes a vos mismo' });

  const result = db.prepare(
    'INSERT INTO messages (from_user_id, to_user_id, content) VALUES (?, ?, ?)'
  ).run(req.userId, other.id, content.trim());

  res.status(201).json({
    id: Number(result.lastInsertRowid),
    from_user_id: req.userId,
    to_user_id: other.id,
    content: content.trim(),
    read: 0,
    created_at: new Date().toISOString(),
    from_username: req.username,
  });
});

module.exports = router;
