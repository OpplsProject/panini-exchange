const express = require('express');
const { STICKERS, TEAMS } = require('../data/stickers');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(STICKERS);
});

router.get('/teams', (req, res) => {
  res.json(TEAMS);
});

module.exports = router;
