const feedbackModel = require('../models/FeedbackModel.js');

// FEEDBACK


module.exports.createFeedback = (req, res, next) => {
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error createFeedback:", error);
             return res.status(500).json({ message: error.message });
        }
        else return res.status(200).json({ message: "Feedback created successfully" });
    }

    const memberId     = req.user.user_id;
    const { product_id, order_id, rating, comment_text } = req.body;

   

    feedbackModel.createFeedback(memberId, product_id, order_id, rating, comment_text, callback);
}

module.exports.updateFeedback = (req, res, next) => {
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error updateFeedback:", error);
             return res.status(500).json({ message: error.message });
        }
        else return res.status(200).json({ message: "Feedback updated successfully" });
    }

    const feedbackId               = req.params.id;
    const memberId                 = req.user.user_id;
    const { rating, comment_text } = req.body;

    feedbackModel.updateFeedback(feedbackId, memberId, rating, comment_text, callback);
}

module.exports.deleteFeedback = (req, res, next) => {
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error deleteFeedback:", error);
             return res.status(500).json({ message: error.message });
        }
        else return res.status(200).json({ message: "Feedback deleted successfully" });
    }

    const feedbackId = req.params.id;
    const memberId   = req.user.user_id;

    feedbackModel.deleteFeedback(feedbackId, memberId, callback);
}

module.exports.getFeedback = (req, res, next) => {
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error getFeedback:", error);
             return res.status(500).json({ message: error.message });
        }
        else return res.status(200).json(results.rows);
    }

    const memberId = req.user.user_id;

    feedbackModel.getFeedback(memberId, callback);
}

//Response
module.exports.createResponse = (req, res, next) => {
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error createResponse:", error);
            return res.status(400).json({ message: error.message });
        }
        else return res.status(200).json({ message: "Response created successfully" });
    }

    const feedbackId   = req.params.feedbackId;
    const memberId     = req.user.user_id;
    const { response_text } = req.body;

    feedbackModel.createResponse(feedbackId, memberId, response_text, callback);
}

module.exports.getResponse = (req, res, next) => {
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error getResponse:", error);
            return res.status(500).json({ message: error.detail || error.message });
        }
         
        return res.status(200).json({ responses: results.rows }); 
     
    }

    const feedbackId = req.params.feedbackId;
    
    feedbackModel.getResponse(feedbackId, callback);
   
}

module.exports.deleteResponse = (req, res, next) => {
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error deleteResponse:", error);
             return res.status(500).json({ message: error.message });
        }
        else return res.status(200).json({ message: "Response deleted successfully" });
    }

    const responseId = req.params.responseId;
    const memberId   = req.user.user_id;

    feedbackModel.deleteResponse(responseId, memberId, callback);
}
module.exports.getFeedbackByProduct = (req, res, next) => {
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error getFeedbackByProduct:", error);
            return res.status(500).json({ message: error.message });
        }
        else return res.status(200).json({ feedback: results.rows });
    }

    const productId = req.params.productId;
    feedbackModel.getFeedbackByProduct(productId, callback);
}