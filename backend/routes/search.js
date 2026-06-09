const express = require('express');
const { getDb } = require('../db');
const { requireAuth } = require('../middleware/auth');
const { STICKERS } = require('../data/stickers');

const router = express.Router();

// Search users who have a specific sticker as duplicate (qty >= 2)
// GET /api/search/duplicates?stickerId=123&province=Buenos Aires&locality=Mar del Plata
router.get('/duplicates', requireAuth, (req, res) => {
  const { stickerId, province, locality } = req.query;

  if (!stickerId) return res.status(400).json({ error: 'stickerId es requerido' });

  const id = parseInt(stickerId, 10);
  const sticker = STICKERS.find(s => s.id === id);
  if (!sticker) return res.status(404).json({ error: 'Figurita no encontrada' });

  const db = getDb();

  let query = `
    SELECT u.id, u.username, u.locality, u.province, us.quantity
    FROM user_stickers us
    JOIN users u ON u.id = us.user_id
    WHERE us.sticker_id = ?
      AND us.quantity >= 2
      AND u.id != ?
  `;
  const params = [id, req.userId];

  if (province) {
    query += ` AND u.province = ?`;
    params.push(province);
  }
  if (locality) {
    query += ` AND u.locality LIKE ?`;
    params.push(`%${locality}%`);
  }

  query += ` ORDER BY u.province, u.locality, u.username`;

  const users = db.prepare(query).all(...params);

  res.json({ sticker, users });
});

// Sticker autocomplete search
router.get('/stickers', requireAuth, (req, res) => {
  const { q } = req.query;
  if (!q || String(q).length < 1) return res.json([]);

  const term = String(q).toLowerCase();
  const results = STICKERS.filter(s =>
    s.code.toLowerCase().includes(term) ||
    s.number.toLowerCase().includes(term) ||
    s.teamName.toLowerCase().includes(term) ||
    s.name.toLowerCase().includes(term)
  ).slice(0, 20);

  res.json(results);
});

module.exports = router;
