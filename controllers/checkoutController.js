const checkoutModel = require('../models/CheckoutModel');

module.exports.getCheckoutSummary = async (req, res, next) => {
    try {
        const memberId = req.user.user_id;
        const summary = await checkoutModel.getCheckoutSummary(memberId);
        return res.status(200).json(summary);
    } catch (error) {
        console.error('Error getCheckoutSummary:', error);
        return res.status(error.status || 500).json({ message: error.message });
    }
};