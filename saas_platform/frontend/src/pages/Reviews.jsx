import React, { useState, useEffect } from 'react';
import { reviewService, productService } from '../services/api';
import { useBusinessStore } from '../stores';
import toast from 'react-hot-toast';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [formData, setFormData] = useState({
    productId: '',
    text: '',
    rating: 5,
    customerName: '',
  });
  const currentBusiness = useBusinessStore((state) => state.currentBusiness);

  useEffect(() => {
    fetchReviews();
    fetchProducts();
  }, [currentBusiness]);

  const fetchReviews = async () => {
    if (!currentBusiness?._id) return;
    try {
      const params = filter !== 'all' ? { sentiment: filter } : {};
      const { data } = await reviewService.list(currentBusiness._id, params);
      setReviews(data.reviews);
    } catch (error) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    if (!currentBusiness?._id) return;
    try {
      const { data } = await productService.list(currentBusiness._id, { limit: 100 });
      setProducts(data.products);
    } catch (error) {
      console.error('Failed to load products');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentBusiness?._id) return;

    try {
      await reviewService.submit({
        ...formData,
        businessId: currentBusiness._id,
      });
      toast.success('Review submitted for analysis!');
      setFormData({ productId: '', text: '', rating: 5, customerName: '' });
      setShowForm(false);
      fetchReviews();
    } catch (error) {
      toast.error('Failed to submit review');
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setLoading(true);
  };

  useEffect(() => {
    if (filter !== 'all') {
      fetchReviews();
    }
  }, [filter]);

  if (loading) {
    return <div className="text-center py-12">Loading reviews...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Customer Reviews</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          ➕ Add Review
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Product</label>
              <select
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                required
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="">Select a product</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Customer Name</label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Rating</label>
              <select
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border rounded-lg"
              >
                {[1, 2, 3, 4, 5].map((r) => (
                  <option key={r} value={r}>
                    {'⭐'.repeat(r)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Review Text</label>
              <textarea
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                required
                minLength="10"
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Write the customer review..."
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                Analyze & Submit
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Buttons */}
      <div className="flex gap-2">
        {['all', 'positive', 'negative', 'neutral', 'mixed'].map((f) => (
          <button
            key={f}
            onClick={() => handleFilterChange(f)}
            className={`px-4 py-2 rounded-lg capitalize ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review._id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold">{review.customerName || 'Anonymous'}</span>
                  <span className="text-yellow-500">{'⭐'.repeat(review.rating || 0)}</span>
                </div>
                <p className="text-gray-700 mb-3">{review.text}</p>
                <div className="flex gap-2 flex-wrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    review.analysis?.sentiment === 'positive' ? 'bg-green-100 text-green-700' :
                    review.analysis?.sentiment === 'negative' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {review.analysis?.sentiment || 'pending'}
                  </span>
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                    Confidence: {review.analysis?.overallConfidence || 0}%
                  </span>
                </div>
              </div>
              <div className="text-right text-sm text-gray-500">
                {new Date(review.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {reviews.length === 0 && !loading && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No reviews yet. Add your first review to get started!</p>
        </div>
      )}
    </div>
  );
}
