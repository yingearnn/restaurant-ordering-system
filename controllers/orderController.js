const orderModel = require('../models/OrderModel');

module.exports.placeOrders = (req, res, next) => {
    const memberId = req.user.user_id;

    orderModel.placeOrders(memberId, (error, result) => {
        if (error) {
            console.error('Error placeOrders:', error);
            return res.status(500).json({ message: error.message });
        }

        if (!result.order_id) {
            return res.status(200).json({
                message: 'No items were available to order. Nothing was placed.',
                order_id: null
            });
        }

        return res.status(200).json({
            message: 'Order placed successfully',
            order_id: result.order_id
        });
    });
};