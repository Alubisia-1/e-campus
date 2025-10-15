const express = require('express');
const router = express.Router();

// Placeholder - controllers will be created next
router.get('/profile', (req, res) => {
  res.status(501).json({ message: 'User routes - to be implemented' });
});

module.exports = router;
