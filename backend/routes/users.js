const express = require('express');
const { getDb } = require('../db');
const { requireAuth } = require('../middleware/auth');
const { STICKERS } = require('../data/stickers');

const router = express.Router();

router.get('/me/stickers', requireAuth, (req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT sticker_id, quantity FROM user_stickers WHERE user_id = ?').all(req.userId);
  const collection = {};
  for (const row of rows) collection[row.sticker_id] = row.quantity;
  res.json(collection);
});

router.put('/me/stickers/:stickerId', requireAuth, (req, res) => {
  const stickerId = parseInt(req.params.stickerId, 10);
  const quantity = parseInt(req.body.quantity, 10);

  if (isNaN(stickerId) || isNaN(quantity) || quantity < 0) {
    return res.status(400).json({ error: 'Datos inválidos' });
  }
  if (!STICKERS.find(s => s.id === stickerId)) {
    return res.status(404).json({ error: 'Figurita no encontrada' });
  }

  const db = getDb();
  if (quantity === 0) {
    db.prepare('DELETE FROM user_stickers WHERE user_id = ? AND sticker_id = ?').run(req.userId, stickerId);
  } else {
    db.prepare(`
      INSERT INTO user_stickers (user_id, sticker_id, quantity) VALUES (?, ?, ?)
      ON CONFLICT(user_id, sticker_id) DO UPDATE SET quantity = excluded.quantity
    `).run(req.userId, stickerId, quantity);
  }
  res.json({ ok: true });
});

router.get('/:username/stickers', requireAuth, (req, res) => {
  const db = getDb();
  const user = db.prepare('SELECT id FROM users WHERE username = ?').get(req.params.username.toLowerCase());
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

  const rows = db.prepare('SELECT sticker_id, quantity FROM user_stickers WHERE user_id = ?').all(user.id);
  const collection = {};
  for (const row of rows) collection[row.sticker_id] = row.quantity;
  res.json(collection);
});

router.get('/compare/:username', requireAuth, (req, res) => {
  const db = getDb();
  const otherUser = db.prepare('SELECT id, username FROM users WHERE username = ?')
    .get(req.params.username.toLowerCase());

  if (!otherUser) return res.status(404).json({ error: 'Usuario no encontrado' });
  if (otherUser.id === req.userId) return res.status(400).json({ error: 'No puedes comparar contigo mismo' });

  const myRows = db.prepare('SELECT sticker_id, quantity FROM user_stickers WHERE user_id = ?').all(req.userId);
  const theirRows = db.prepare('SELECT sticker_id, quantity FROM user_stickers WHERE user_id = ?').all(otherUser.id);

  const myCol = {};
  for (const r of myRows) myCol[r.sticker_id] = r.quantity;
  const theirCol = {};
  for (const r of theirRows) theirCol[r.sticker_id] = r.quantity;

  const theyCanGiveMe = [];
  const iCanGiveThem = [];

  for (const sticker of STICKERS) {
    const myQty = myCol[sticker.id] || 0;
    const theirQty = theirCol[sticker.id] || 0;
    if (theirQty >= 2 && myQty === 0) theyCanGiveMe.push(sticker);
    if (myQty >= 2 && theirQty === 0) iCanGiveThem.push(sticker);
  }

  res.json({
    otherUser: { username: otherUser.username },
    theyCanGiveMe,
    iCanGiveThem,
    matchCount: Math.min(theyCanGiveMe.length, iCanGiveThem.length),
  });
});

module.exports = router;
