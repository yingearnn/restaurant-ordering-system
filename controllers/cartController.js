const cartModel = require('../models/CartModel');

module.exports.createCartItems = async (req, res, next) => {
    try {
        const memberId = req.user.user_id;
        const { product_id, quantity } = req.body;

        if (!product_id || !quantity || quantity <= 0) {
            return res.status(400).json({ message: 'product_id and a positive quantity are required' });
        }

        const item = await cartModel.createCartItems(memberId, Number(product_id), Number(quantity));
        return res.status(200).json({ message: 'Item added to cart', item });
    } catch (error) {
        console.error('Error createCartItems:', error);
        return res.status(error.status || 500).json({ message: error.message });
    }
};

module.exports.getCartItems = async (req, res, next) => {
    try {
        const memberId = req.user.user_id;
        const items = await cartModel.getCartItems(memberId);
        return res.status(200).json({ items });
    } catch (error) {
        console.error('Error getCartItems:', error);
        return res.status(error.status || 500).json({ message: error.message });
    }
};

module.exports.getCartSummary = async (req, res, next) => {
    try {
        const memberId = req.user.user_id;
        const summary = await cartModel.getCartSummary(memberId);
        return res.status(200).json(summary);
    } catch (error) {
        console.error('Error getCartSummary:', error);
        return res.status(error.status || 500).json({ message: error.message });
    }
};

module.exports.updateCartItems = async (req, res, next) => {
    try {
        const memberId = req.user.user_id;
        const cartItemId = Number(req.params.id);
        const { quantity } = req.body;

        if (!quantity) {
            return res.status(400).json({ message: 'quantity is required' });
        }

        const item = await cartModel.updateCartItems(memberId, cartItemId, Number(quantity));
        return res.status(200).json({ message: 'Cart item updated', item });
    } catch (error) {
        console.error('Error updateCartItems:', error);
        return res.status(error.status || 500).json({ message: error.message });
    }
};

module.exports.deleteCartItems = async (req, res, next) => {
    try {
        const memberId = req.user.user_id;
        const cartItemId = Number(req.params.id);

        await cartModel.deleteCartItems(memberId, cartItemId);
        return res.status(200).json({ message: 'Cart item deleted' });
    } catch (error) {
        console.error('Error deleteCartItems:', error);
        return res.status(error.status || 500).json({ message: error.message });
    }
};