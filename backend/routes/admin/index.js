const express = require('express');
const router = express.Router();

// Import admin routes
router.use('/categories', require('../categories'));
router.use('/subcategories', require('../subCategories'));
router.use('/access-levels', require('./userAccess'));
router.use('/file-types', require('./fileTypes'));

module.exports = router;