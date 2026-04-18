import React, { useEffect, useState } from 'react';
import { reviewService } from '../services/api';
import { useBusinessStore } from '../stores';
import toast from 'react-hot-toast';

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const currentBusiness = useBusinessStore((state) => state.currentBusiness);

  useEffect(() => {
    fetchAnalytics();
  }, [currentBusiness]);

  const fetchAnalytics = async () => {
    if (!currentBusiness?._id) return;
    try {
      const { data } = await reviewService.analytics(currentBusiness._id);
      setAnalytics(data);
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Review Analytics</h2>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Total Reviews</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{analytics?.totalReviews || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Average Confidence</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {analytics?.metrics?.averageConfidence || 0}%
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">CSAT Score</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            {analytics?.metrics?.csat || 0}%
          </p>
        </div>
      </div>

      {/* Sentiment Distribution */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4">Sentiment Distribution</h3>
        <div className="grid grid-cols-4 gap-4">
          {analytics?.sentimentBreakdown &&
            Object.entries(analytics.sentimentBreakdown).map(([sentiment, count]) => (
              <div key={sentiment} className="text-center">
                <div className="text-2xl font-bold text-blue-600">{count}</div>
                <div className="text-gray-600 capitalize mt-2">{sentiment}</div>
              </div>
            ))}
        </div>
      </div>

      {/* Top Aspects */}
      {analytics?.topAspects && analytics.topAspects.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4">Most Mentioned Aspects</h3>
          <div className="space-y-3">
            {analytics.topAspects.map((aspect, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="font-medium">{aspect.aspect}</span>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {aspect.mentions} mentions
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Insights */}
      {analytics?.keyInsights && analytics.keyInsights.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4">Key Insights</h3>
          <ul className="space-y-2">
            {analytics.keyInsights.map((insight, idx) => (
              <li key={idx} className="flex items-start">
                <span className="text-blue-600 mr-3">💡</span>
                <span className="text-gray-700">{insight.insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
