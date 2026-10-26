const dashboardModel = require('../models/dashboardModel');

class DashboardController {
    static async getSaleOrderSummary(req, res) {
        try {
            const { start_date, end_date, category, sort_by, sort_order } = req.query;

            const result = await dashboardModel.getSaleOrderSummaryAsync(
                start_date || null,
                end_date   || null,
                category   || null,
                sort_by    || 'order_date',
                sort_order || 'DESC'
            );

            return res.status(200).json({ 
                orders: result.rows,
                user: { name: req.session.userName }
             });

        } catch (error) {
            console.error('Error getSaleOrderSummary:', error);
            return res.status(500).json({ message: error.message });
        }
    }
}

module.exports = DashboardController;