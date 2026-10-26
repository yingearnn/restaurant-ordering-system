const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');
const { ensureAuthenticated } = require('../middleware/auth');

router.get('/', ensureAuthenticated, (req, res) => {
    res.sendFile('checkout.html', { root: './views' });
});

router.get('/summary', ensureAuthenticated, checkoutController.getCheckoutSummary);

module.exports = router;