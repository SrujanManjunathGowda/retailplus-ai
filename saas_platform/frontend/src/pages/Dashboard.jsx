import React, { useEffect, useState } from 'react';
import { useBusinessStore } from '../stores';
import { businessService } from '../services/api';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const currentBusiness = useBusinessStore((state) => state.currentBusiness);

  useEffect(() => {
    fetchAnalytics();
  }, [currentBusiness]);

  const fetchAnalytics = async () => {
    if (!currentBusiness?._id) return;

    setLoading(true);
    try {
      const { data } = await businessService.analytics(currentBusiness._id);
      setAnalytics(data);
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  const metrics = analytics?.summary || {};

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg">
        <h1 className="text-3xl font-bold">{currentBusiness?.name}</h1>
        <p className="text-blue-100 mt-2">
          Welcome to your RetailPulse AI Review Analysis Dashboard
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Reviews"
          value={metrics.totalReviews || 0}
          icon="📊"
          color="bg-blue-50"
        />
        <MetricCard
          title="Customer Satisfaction (CSAT)"
          value={`${metrics.csat || 0}%`}
          icon="😊"
          color="bg-green-50"
        />
        <MetricCard
          title="Net Promoter Score (NPS)"
          value={metrics.nps || 0}
          icon="📈"
          color="bg-purple-50"
        />
        <MetricCard
          title="Avg Confidence"
          value={`${metrics.averageConfidence || 0}%`}
          icon="🎯"
          color="bg-orange-50"
        />
      </div>

      {/* Sentiment Breakdown */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Sentiment Breakdown</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {analytics?.sentimentBreakdown && Object.entries(analytics.sentimentBreakdown).map(
            ([sentiment, count]) => (
              <div key={sentiment} className="text-center">
                <div className="text-2xl font-bold text-blue-600">{count}</div>
                <div className="text-gray-600 capitalize">{sentiment}</div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Top Products */}
      {analytics?.topProducts && analytics.topProducts.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Top Performing Products</h2>
          <div className="space-y-3">
            {analytics.topProducts.map((product) => (
              <div key={product._id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-semibold">{product.name}</p>
                  <p className="text-sm text-gray-600">{product.reviews} reviews</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600">{product.csat}% CSAT</div>
                  <div className="text-sm text-gray-600">NPS: {product.nps}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Department Issues */}
      {analytics?.departmentIssues && Object.keys(analytics.departmentIssues).length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">High Priority Issues by Department</h2>
          <div className="space-y-2">
            {Object.entries(analytics.departmentIssues).map(([dept, count]) => (
              count > 0 && (
                <div key={dept} className="flex justify-between items-center p-3 bg-red-50 rounded">
                  <span className="font-medium">{dept}</span>
                  <span className="bg-red-200 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {count} issues
                  </span>
                </div>
              )
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition text-left">
            <p className="font-semibold text-blue-700">📝 Add Review</p>
            <p className="text-sm text-gray-600">Manually add a customer review</p>
          </button>
          <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition text-left">
            <p className="font-semibold text-green-700">📊 View Analytics</p>
            <p className="text-sm text-gray-600">Detailed analytics and insights</p>
          </button>
          <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition text-left">
            <p className="font-semibold text-purple-700">⚙️ Settings</p>
            <p className="text-sm text-gray-600">Configure your preferences</p>
          </button>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, color }) {
  return (
    <div className={`${color} rounded-lg shadow p-6`}>
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-gray-600 text-sm">{title}</p>
      <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
    </div>
  );
}
