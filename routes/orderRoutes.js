const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { ensureAuthenticated } = require('../middleware/auth');

router.post('/place', ensureAuthenticated, orderController.placeOrders);

module.exports = router;