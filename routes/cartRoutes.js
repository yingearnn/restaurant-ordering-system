const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { ensureAuthenticated } = require('../middleware/auth');

router.get('/create', ensureAuthenticated, (req, res) => {
    res.sendFile('cart/create.html', { root: './views' });
});

router.get('/retrieve/all', ensureAuthenticated, (req, res) => {
    res.sendFile('cart/retrieve-all.html', { root: './views' });
});

router.post('/', ensureAuthenticated, cartController.createCartItems);
router.get('/', ensureAuthenticated, cartController.getCartItems);
router.get('/summary', ensureAuthenticated, cartController.getCartSummary);
router.put('/:id', ensureAuthenticated, cartController.updateCartItems);
router.delete('/:id', ensureAuthenticated, cartController.deleteCartItems);

module.exports = router;