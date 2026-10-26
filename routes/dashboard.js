const express = require('express');
const path = require('path');
const { ensureAuthenticated, ensureAdmin } = require('../middleware/auth');
const dashboardController = require('../controllers/dashboardController');

const router = express.Router();

// Dashboard page
router.get('/', ensureAuthenticated, ensureAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, '../views/dashboard.html'));
});

router.get('/data', ensureAuthenticated, ensureAdmin, dashboardController.getSaleOrderSummary);

module.exports = router;