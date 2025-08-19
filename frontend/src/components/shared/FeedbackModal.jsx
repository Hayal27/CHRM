import React, { useState } from 'react';

// Named export
export const FeedbackModal = ({ show, handleClose, handleSubmitFeedback }) => {
  const [feedbackText, setFeedbackText] = useState('');

  const handleFeedbackChange = (event) => {
    setFeedbackText(event.target.value);
  };

  const handleSubmit = () => {
    // Pass the feedback text to the parent component's handler
    if (handleSubmitFeedback) {
      handleSubmitFeedback(feedbackText);
    }
    setFeedbackText(''); // Clear the textarea
    handleClose(); // Close the modal
  };

  // Render nothing if the modal is not supposed to show
  if (!show) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div className="modal-backdrop fade show"></div>

      {/* Modal Dialog */}
      <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-labelledby="feedbackModalLabel" aria-modal="true">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="feedbackModalLabel">Submit Feedback</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={handleClose}></button>
            </div>
            <div className="modal-body">
              <form>
                <div className="mb-3">
                  <label htmlFor="feedbackTextarea" className="form-label">Your Feedback</label>
                  <textarea
                    className="form-control"
                    id="feedbackTextarea"
                    rows="4"
                    value={feedbackText}
                    onChange={handleFeedbackChange}
                    placeholder="Please share your thoughts..."
                  ></textarea>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={handleClose}>
                Close
              </button>
              <button type="button" className="btn btn-primary" onClick={handleSubmit}>
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Note: No default export here
