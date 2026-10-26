const pool = require('../config/database');

module.exports.placeOrders = (memberId, callback) => {
    const query = 'CALL place_orders($1, NULL)';

    pool.query(query, [memberId], (error, results) => {
        if (error) return callback(error);

        const orderId = results.rows[0] ? results.rows[0].p_order_id : null;
        callback(null, { order_id: orderId });
    });
};