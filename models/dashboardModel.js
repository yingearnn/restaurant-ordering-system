const pool = require('../config/database');

module.exports.getSaleOrderSummaryAsync = (startDate, endDate, category, sortBy, sortOrder) => {
    const SQLSTATEMENT = `SELECT * FROM get_sale_order_summary($1, $2, $3, $4, $5)`;
    return pool.query(SQLSTATEMENT, [startDate, endDate, category, sortBy, sortOrder]);
}