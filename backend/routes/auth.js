const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'panini_mundial_2026_secret';

router.post('/register', async (req, res) => {
  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    return res.status(400).json({ error: 'Email, nombre de usuario y contraseña son requeridos' });
  }
  if (username.length < 3 || username.length > 20) {
    return res.status(400).json({ error: 'El nombre de usuario debe tener entre 3 y 20 caracteres' });
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return res.status(400).json({ error: 'El nombre de usuario solo puede contener letras, números y guiones bajos' });
  }

  const db = getDb();

  const existingEmail = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (existingEmail) return res.status(409).json({ error: 'El email ya está registrado' });

  const existingUsername = db.prepare('SELECT id FROM users WHERE username = ?').get(username.toLowerCase());
  if (existingUsername) return res.status(409).json({ error: 'El nombre de usuario ya está en uso' });

  const passwordHash = await bcrypt.hash(password, 10);

  const stmt = db.prepare('INSERT INTO users (email, username, password_hash) VALUES (?, ?, ?)');
  const result = stmt.run(email.toLowerCase(), username.toLowerCase(), passwordHash);

  const token = jwt.sign(
    { userId: result.lastInsertRowid, username: username.toLowerCase() },
    JWT_SECRET,
    { expiresIn: '30d' }
  );

  res.status(201).json({
    token,
    user: { id: Number(result.lastInsertRowid), email: email.toLowerCase(), username: username.toLowerCase() },
  });
});

router.post('/login', async (req, res) => {
  const { login, password } = req.body;

  if (!login || !password) {
    return res.status(400).json({ error: 'Email/usuario y contraseña son requeridos' });
  }

  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE email = ? OR username = ?')
    .get(login.toLowerCase(), login.toLowerCase());

  if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: 'Credenciales inválidas' });

  const token = jwt.sign(
    { userId: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: '30d' }
  );

  res.json({
    token,
    user: { id: user.id, email: user.email, username: user.username },
  });
});

module.exports = router;
