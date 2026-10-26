const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { ensureAuthenticated, ensureAdmin } = require('../middleware/auth');

// Feedback routes - any logged in user
router.post('/', ensureAuthenticated, feedbackController.createFeedback);
router.get('/', ensureAuthenticated, feedbackController.getFeedback);
router.put('/:id', ensureAuthenticated, feedbackController.updateFeedback);
router.delete('/:id', ensureAuthenticated, feedbackController.deleteFeedback);
router.get('/product/:productId', ensureAuthenticated, feedbackController.getFeedbackByProduct);

// Response routes - any logged in user
router.post('/:feedbackId/responses', ensureAuthenticated, feedbackController.createResponse);
router.get('/:feedbackId/responses', ensureAuthenticated, feedbackController.getResponse);
router.delete('/:feedbackId/responses/:responseId', ensureAuthenticated, feedbackController.deleteResponse);
module.exports = router;