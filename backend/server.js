const express = require('express');
const cors = require('cors');
const path = require('path');
const { getDb } = require('./db');

const authRoutes = require('./routes/auth');
const stickerRoutes = require('./routes/stickers');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const messageRoutes = require('./routes/messages');
const searchRoutes = require('./routes/search');

const app = express();
const PORT = process.env.PORT || 3001;
const IS_PROD = process.env.NODE_ENV === 'production';

if (IS_PROD) {
  // In production, frontend is built and served from here
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
} else {
  app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
}

app.use(express.json());

getDb();

app.use('/api/auth', authRoutes);
app.use('/api/stickers', stickerRoutes);
app.use('/api/users', userRoutes);
app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/admin', adminRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/search', searchRoutes);

// In production, all non-API routes go to React
if (IS_PROD) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🌍 Panini Exchange corriendo en http://localhost:${PORT}`);
});
