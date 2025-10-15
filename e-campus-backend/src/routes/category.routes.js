const express = require('express');
const router = express.Router();
const { getAllCategories, getCategoryById } = require('../controllers/category.controller');

// Public routes
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);

module.exports = router;
