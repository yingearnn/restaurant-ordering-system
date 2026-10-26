let currentProductId = null;
let currentUserId    = null;

// ===== HELPER TO SHOW MESSAGE =====
function showMessage(message, isSuccess = false) {
  const msgDiv = document.getElementById('general-message');
  if (!msgDiv) return;
  msgDiv.style.display = 'block';
  msgDiv.className     = isSuccess ? 'alert alert-success' : 'alert alert-danger';
  msgDiv.textContent   = message;

  setTimeout(() => {
    msgDiv.style.display = 'none';
  }, 3000);
}

function showResponseMessage(feedbackId, message, isSuccess = false) {
    const msgDiv = document.getElementById(`response-message-${feedbackId}`);
    if (!msgDiv) return;
    msgDiv.style.display = 'block';
    msgDiv.className = isSuccess ? 'alert alert-success' : 'alert alert-danger';
    msgDiv.textContent = message;
    setTimeout(() => { msgDiv.style.display = 'none'; }, 3000);
}

// ===== FETCH FEEDBACK FOR THIS PRODUCT =====
async function fetchFeedbackForProduct(productId) {
  try {
    const res  = await fetch(`/feedback/product/${productId}`);
    const data = await res.json();

    const feedbackList = document.getElementById('feedback-list');

    if (!data.feedback || data.feedback.length === 0) {
      feedbackList.innerHTML = '<p class="text-muted text-center">No feedback yet. Be the first!</p>';
      return;
    }

    feedbackList.innerHTML = '';

    for (const fb of data.feedback) {
      const isOwner = currentUserId && fb.member_id == currentUserId;

      const fbDiv     = document.createElement('div');
      fbDiv.className = 'border rounded p-3 mb-3';
      fbDiv.innerHTML = `
        <p><strong>Member Username:</strong> ${fb.username}</p>
        <p><strong>Rating:</strong> ${createStarRating(fb.rating)}</p>
        <p><strong>Comment:</strong> ${fb.comment_text || '-'}</p>
        <p><strong>Last Updated:</strong> ${formatDate(fb.updated_at)}</p>

      

        <div class="mt-3 ps-3 border-start">
  <div id="responses-${fb.feedback_id}">
    <p class="text-muted small">Loading responses...</p>
  </div>
  <div id="response-message-${fb.feedback_id}" class="alert mt-1" style="display:none;"></div>
  <div class="mt-2">
    <textarea class="form-control form-control-sm mb-2"
      id="response-text-${fb.feedback_id}"
      rows="2"
      placeholder="Write a response...">
    </textarea>
    <button class="btn btn-sm btn-outline-primary"
      onclick="submitResponse(${fb.feedback_id})">
      Reply
    </button>
  </div>
</div>
      `;

      feedbackList.appendChild(fbDiv);
      fetchResponses(fb.feedback_id);
    }

  } catch (error) {
    console.error('Error fetching feedback:', error);
  }
}

// ===== FETCH ALL MY FEEDBACK =====
async function fetchMyFeedback() {
  try {
    const res  = await fetch('/feedback');
    const data = await res.json();

    const feedbackList = document.getElementById('feedback-list');
    const feedbacks    = Array.isArray(data) ? data : data.rows || [];

    if (!feedbacks || feedbacks.length === 0) {
      feedbackList.innerHTML = '<p class="text-muted text-center">You have not submitted any feedback yet.</p>';
      return;
    }

    feedbackList.innerHTML = '';

    feedbacks.forEach(fb => {
      const fbDiv     = document.createElement('div');
      fbDiv.className = 'border rounded p-3 mb-3';
      fbDiv.id        = `feedback-${fb.feedback_id}`;
      fbDiv.innerHTML = `
        <p><strong>Feedback ID: ${fb.feedback_id}</strong></p>
        <p><strong>Product Name:</strong> ${fb.product_name}</p>
        <p><strong>Rating:</strong> ${createStarRating(fb.rating)}</p>
        <p><strong>Comments:</strong> ${fb.comment_text || '-'}</p>
        <p><strong>Last Updated:</strong> ${formatDate(fb.updated_at)}</p>
        <button class="btn btn-sm btn-warning me-2"
          onclick="openUpdateModal(${fb.feedback_id}, ${fb.rating}, \`${fb.comment_text}\`)">
          Update
        </button>
        <button class="btn btn-sm btn-danger"
          onclick="deleteFeedback(${fb.feedback_id})">
          Delete
        </button>
        <hr>
      `;
      feedbackList.appendChild(fbDiv);
    });

  } catch (error) {
    console.error('Error fetching my feedback:', error);
  }
}

// ===== FETCH RESPONSES =====
async function fetchResponses(feedbackId) {
  try {
    const res  = await fetch(`/feedback/${feedbackId}/responses`);
    const data = await res.json();

    const responseDiv = document.getElementById(`responses-${feedbackId}`);
    const responses   = Array.isArray(data) ? data : data.responses;

    if (!responses || responses.length === 0) {
      responseDiv.innerHTML = '<p class="text-muted small">No responses yet.</p>';
      return;
    }

    responseDiv.innerHTML = responses.map(r => `
  <div class="bg-light rounded p-2 mb-2">
    <p class="mb-1 small">
      <strong>${r.username}</strong>: ${r.response_text}
    </p>

    <p class="mb-0 text-muted">
      ${formatDate(r.created_at)}
    </p>

    ${
      Number(r.member_id) === Number(currentUserId)
        ? `
          <button
            class="btn btn-sm btn-outline-danger mt-1"
            onclick="deleteResponse(${feedbackId}, ${r.response_id})">
            Delete
          </button>
        `
        : ""
    }
  </div>
`).join('');

  } catch (error) {
    console.error('Error fetching responses:', error);
  }
}

// ===== CREATE FEEDBACK =====
async function createFeedback(e) {
  e.preventDefault();

  const order_id     = document.getElementById('feedback-order-id').value;
  const rating       = document.getElementById('feedback-rating').value;
  const comment_text = document.getElementById('feedback-comment').value;
  const msgDiv       = document.getElementById('feedback-form-message');

  try {
    const res = await fetch('/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: currentProductId,
        order_id,
        rating,
        comment_text
      })
    });

    const data = await res.json();
    msgDiv.style.display = 'block';

    if (res.ok) {
      msgDiv.className   = 'alert alert-success';
      msgDiv.textContent = 'Feedback submitted!';
      document.getElementById('create-feedback-form').reset();
      fetchFeedbackForProduct(currentProductId);
    } else {
      msgDiv.className   = 'alert alert-danger';
      msgDiv.textContent = data.message || 'Failed to submit feedback.';
    }

  } catch (error) {
    console.error('Error creating feedback:', error);
    msgDiv.style.display = 'block';
    msgDiv.className     = 'alert alert-danger';
    msgDiv.textContent   = 'An error occurred while submitting feedback.';
  }
}

// ===== OPEN UPDATE MODAL =====
function openUpdateModal(feedbackId, rating, comment) {
  document.getElementById('update-feedback-id').value      = feedbackId;
  document.getElementById('update-feedback-rating').value  = rating;
  document.getElementById('update-feedback-comment').value = comment;
  new bootstrap.Modal(document.getElementById('updateFeedbackModal')).show();
}

// ===== UPDATE FEEDBACK =====
async function updateFeedback() {
  const feedbackId   = document.getElementById('update-feedback-id').value;
  const rating       = document.getElementById('update-feedback-rating').value;
  const comment_text = document.getElementById('update-feedback-comment').value;
  const msgDiv       = document.getElementById('update-feedback-message');

  try {
    const res = await fetch(`/feedback/${feedbackId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, comment_text })
    });

    const data = await res.json();
    msgDiv.style.display = 'block';

    if (res.ok) {
      msgDiv.className   = 'alert alert-success';
      msgDiv.textContent = 'Feedback updated!';
      bootstrap.Modal.getInstance(document.getElementById('updateFeedbackModal')).hide();

      if (currentProductId) {
        fetchFeedbackForProduct(currentProductId);
      } else {
        fetchMyFeedback();
      }

    } else {
      msgDiv.className   = 'alert alert-danger';
      msgDiv.textContent = data.message || 'Failed to update.';
    }

  } catch (error) {
    console.error('Error updating feedback:', error);
    msgDiv.style.display = 'block';
    msgDiv.className     = 'alert alert-danger';
    msgDiv.textContent   = 'An error occurred while updating feedback.';
  }
}

// ===== DELETE FEEDBACK =====
let pendingDeleteId = null; 

function deleteFeedback(feedbackId) {
  pendingDeleteId = feedbackId;
  new bootstrap.Modal(document.getElementById('deleteConfirmModal')).show();
}

// confirm delete button click
document.addEventListener('DOMContentLoaded', () => {
  const confirmBtn = document.getElementById('confirm-delete-btn');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', async () => {
      if (!pendingDeleteId) return;

      bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal')).hide();

      try {
        const res = await fetch(`/feedback/${pendingDeleteId}`, { method: 'DELETE' });

        if (res.ok) {
          showMessage('Feedback deleted successfully!', true);
          if (currentProductId) {
            fetchFeedbackForProduct(currentProductId);
          } else {
            fetchMyFeedback();
          }
        } else {
          const data = await res.json();
          showMessage(data.message || 'Failed to delete feedback.');
        }

      } catch (error) {
        console.error('Error deleting feedback:', error);
        showMessage('An error occurred while deleting feedback.');
      }

      pendingDeleteId = null;
    });
  }
});

// ===== SUBMIT RESPONSE =====
async function submitResponse(feedbackId) {
  const responseText = document.getElementById(`response-text-${feedbackId}`).value;

  if (!responseText.trim()) {
    showMessage('Response cannot be empty.');
    return;
  }

  try {
    const res = await fetch(`/feedback/${feedbackId}/responses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ response_text: responseText })
    });

    const data = await res.json();

if (res.ok) {
    document.getElementById(`response-text-${feedbackId}`).value = '';
    fetchResponses(feedbackId);
    showResponseMessage(feedbackId, 'Response submitted!', true);
} else {
    showResponseMessage(feedbackId, data.message || 'Failed to submit response.');
}

  } catch (error) {
    console.error('Error submitting response:', error);
    showMessage('An error occurred while submitting response.');
  }
}

// ===== DELETE RESPONSE =====
async function deleteResponse(feedbackId, responseId) {
  

  try {
    const res = await fetch(`/feedback/${feedbackId}/responses/${responseId}`, {
      method: 'DELETE'
    });

    if (res.ok) {
      fetchResponses(feedbackId);
      showResponseMessage(feedbackId,'Response deleted!', true);
    } else {
      const data = await res.json();
      showResponseMessage(feedbackId,data.message || 'Failed to delete response.');
    }

  } catch (error) {
    console.error('Error deleting response:', error);
    showResponseMessage(feedbackId,'An error occurred while deleting response.');
  }
}