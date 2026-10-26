const pool = require('../config/database');

// FEEDBACK

module.exports.createFeedback = (memberId, productId, orderId, rating, comment_text, callback) => {
    const SQLSTATEMENT = `CALL create_feedback($1, $2, $3, $4, $5)`;
    pool.query(SQLSTATEMENT, [memberId, productId, orderId, rating, comment_text], callback);
}

module.exports.updateFeedback = (feedbackId, memberId, rating, comment_text, callback) => {
    const SQLSTATEMENT = `CALL update_feedback($1, $2, $3, $4)`;
    pool.query(SQLSTATEMENT, [feedbackId, memberId, rating, comment_text], callback);
}

module.exports.deleteFeedback = (feedbackId, memberId, callback) => {
    const SQLSTATEMENT = `CALL delete_feedback($1, $2)`;
    pool.query(SQLSTATEMENT, [feedbackId, memberId], callback);
}

module.exports.getFeedback = (memberId, callback) => {
    const SQLSTATEMENT = `SELECT * FROM get_feedback($1)`;
    pool.query(SQLSTATEMENT, [memberId], callback);
}

module.exports.createResponse = (feedbackId, memberId, responseText, callback) => {
    const SQLSTATEMENT = `CALL create_response($1, $2, $3)`;
    pool.query(SQLSTATEMENT, [feedbackId, memberId, responseText], callback);
}

module.exports.getResponse = (feedbackId, callback) => {
    const SQLSTATEMENT = `SELECT * FROM get_response($1)`;
    pool.query(SQLSTATEMENT, [feedbackId], callback);
}

module.exports.deleteResponse = (responseId, memberId, callback) => {
    const SQLSTATEMENT = `CALL delete_response($1, $2)`;
    pool.query(SQLSTATEMENT, [responseId, memberId], callback);
}
module.exports.getFeedbackByProduct = (productId, callback) => {
    const SQLSTATEMENT = `SELECT * FROM get_feedback_by_product($1)`;
    pool.query(SQLSTATEMENT, [productId], callback);
}