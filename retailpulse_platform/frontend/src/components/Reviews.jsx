import React, { useState } from 'react';
import { useProductStore, useReviewStore } from '../stores';
import { Button, Input, Modal } from './Layout';
import { ReviewCard, LoadingSpinner, EmptyState } from './Charts';
import { MessageSquare, Send } from 'lucide-react';

export const ReviewSubmissionForm = ({ productId, onSuccess }) => {
  const { submitReview, isLoading } = useReviewStore();
  const [formData, setFormData] = useState({
    text: '',
    rating: 5
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitReview(productId, formData.text, formData.rating);
      setFormData({ text: '', rating: 5 });
      onSuccess?.();
    } catch (error) {
      console.error('Failed to submit review:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-lg font-semibold mb-4">Submit New Review</h3>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rating
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, rating: star }))}
              className={`text-3xl cursor-pointer transition ${
                star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'
              }`}
            >
              ⭐
            </button>
          ))}
        </div>
      </div>

      <textarea
        name="text"
        value={formData.text}
        onChange={handleChange}
        placeholder="Share your experience with this product..."
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 resize-none"
        rows={4}
        required
      />

      <Button
        variant="primary"
        className="w-full mt-4"
        type="submit"
        disabled={isLoading || !formData.text.trim()}
      >
        {isLoading ? 'Submitting...' : 'Submit Review'}
      </Button>
    </form>
  );
};

export const ReviewsList = ({ productId, onRefresh }) => {
  const { reviews, isLoading, fetchReviews } = useReviewStore();
  const [selectedReview, setSelectedReview] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [filter, setFilter] = useState(null);

  React.useEffect(() => {
    if (productId) {
      fetchReviews(productId, 50, 0, filter);
    }
  }, [productId, filter, fetchReviews]);

  const handleRespond = (review) => {
    setSelectedReview(review);
    setResponseText(review.response || '');
    setShowResponseModal(true);
  };

  const submitResponse = async () => {
    if (selectedReview && responseText.trim()) {
      try {
        // TODO: Call updateReview from store
        console.log('Submitting response:', responseText);
        setShowResponseModal(false);
        setResponseText('');
        onRefresh?.();
      } catch (error) {
        console.error('Failed to submit response:', error);
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MessageSquare size={20} className="text-purple-600" />
          Recent Reviews
        </h3>
        
        <div className="flex gap-2">
          <button
            onClick={() => setFilter(null)}
            className={`px-3 py-1 rounded text-sm font-medium transition ${
              filter === null
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('positive')}
            className={`px-3 py-1 rounded text-sm font-medium transition ${
              filter === 'positive'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Positive
          </button>
          <button
            onClick={() => setFilter('negative')}
            className={`px-3 py-1 rounded text-sm font-medium transition ${
              filter === 'negative'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Negative
          </button>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : reviews.length === 0 ? (
        <EmptyState message="No reviews yet. Be the first to share your thoughts!" icon={MessageSquare} />
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {reviews.map((review) => (
            <ReviewCard
              key={review._id}
              review={review}
              onRespond={() => handleRespond(review)}
              onResolve={() => console.log('Mark resolved:', review._id)}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={showResponseModal}
        onClose={() => setShowResponseModal(false)}
        title="Respond to Review"
      >
        <textarea
          value={responseText}
          onChange={(e) => setResponseText(e.target.value)}
          placeholder="Write your response..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 resize-none mb-4"
          rows={4}
        />
        <div className="flex justify-end gap-2">
          <Button
            variant="secondary"
            onClick={() => setShowResponseModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={submitResponse}
            className="flex items-center gap-2"
          >
            <Send size={16} />
            Send Response
          </Button>
        </div>
      </Modal>
    </div>
  );
};
