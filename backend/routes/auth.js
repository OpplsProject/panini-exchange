const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Resend } = require('resend');
const { getDb } = require('../db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'panini_mundial_2026_secret';

function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

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
  const result = db.prepare('INSERT INTO users (email, username, password_hash) VALUES (?, ?, ?)')
    .run(email.toLowerCase(), username.toLowerCase(), passwordHash);

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

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email requerido' });

  // Always return success to avoid user enumeration
  res.json({ ok: true, message: 'Si el email existe, recibirás un enlace en breve.' });

  const db = getDb();
  const user = db.prepare('SELECT id, username FROM users WHERE email = ?').get(email.toLowerCase());
  if (!user) return;

  // Invalidate old tokens
  db.prepare('UPDATE password_reset_tokens SET used = 1 WHERE user_id = ?').run(user.id);

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

  db.prepare('INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)')
    .run(user.id, token, expiresAt);

  const APP_URL = process.env.APP_URL || 'https://panini-exchange-production-95ec.up.railway.app';
  const resetLink = `${APP_URL}/reset-password?token=${token}`;

  const resend = getResend();
  if (resend) {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Panini Mundial 2026 <noreply@resend.dev>',
      to: email.toLowerCase(),
      subject: '⚽ Recuperá tu contraseña - Panini Mundial 2026',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <div style="background: #0052A5; padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 20px;">⚽ Panini Mundial 2026</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb;">
            <p style="color: #374151;">Hola <strong>@${user.username}</strong>,</p>
            <p style="color: #374151;">Recibiste este email porque solicitaste recuperar tu contraseña.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}"
                 style="background: #0052A5; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
                Restablecer contraseña
              </a>
            </div>
            <p style="color: #6b7280; font-size: 13px;">Este enlace expira en 1 hora. Si no pediste esto, podés ignorar este email.</p>
          </div>
        </div>
      `,
    }).catch(err => console.error('Error enviando email:', err));
  } else {
    // Dev mode: log the link
    console.log(`\n🔑 Reset link para ${email}: ${resetLink}\n`);
  }
});

router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: 'Token y contraseña requeridos' });
  if (password.length < 6) return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });

  const db = getDb();
  const record = db.prepare(`
    SELECT * FROM password_reset_tokens
    WHERE token = ? AND used = 0 AND expires_at > datetime('now')
  `).get(token);

  if (!record) {
    return res.status(400).json({ error: 'El enlace es inválido o ya expiró. Pedí uno nuevo.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(passwordHash, record.user_id);
  db.prepare('UPDATE password_reset_tokens SET used = 1 WHERE id = ?').run(record.id);

  res.json({ ok: true, message: 'Contraseña actualizada correctamente.' });
});

module.exports = router;
