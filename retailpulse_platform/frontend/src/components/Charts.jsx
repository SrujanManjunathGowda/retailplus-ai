import React from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const SentimentChart = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Sentiment Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
            <Cell fill="#8b5cf6" />
            <Cell fill="#ef4444" />
            <Cell fill="#6366f1" />
            <Cell fill="#f59e0b" />
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export const TrendChart = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Review Trends</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="positive" stroke="#8b5cf6" name="Positive" />
          <Line type="monotone" dataKey="negative" stroke="#ef4444" name="Negative" />
          <Line type="monotone" dataKey="neutral" stroke="#6366f1" name="Neutral" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export const ConfidenceChart = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Confidence Scores</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Bar dataKey="confidence" fill="#8b5cf6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const AspectChart = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Top Aspects Mentioned</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 200, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="name" type="category" width={190} />
          <Tooltip />
          <Bar dataKey="count" fill="#8b5cf6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const KPICard = ({ icon: Icon, label, value, subtext, trend }) => {
  const isPositive = trend && trend > 0;
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-600">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
          {subtext && <p className="text-gray-500 text-xs mt-1">{subtext}</p>}
        </div>
        <div className="bg-purple-100 p-3 rounded-full">
          <Icon className="text-purple-600" size={24} />
        </div>
      </div>
      {trend !== undefined && (
        <div className={`mt-3 text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? '↑' : '↓'} {Math.abs(trend)}%
        </div>
      )}
    </div>
  );
};

export const ReviewCard = ({ review, onRespond, onResolve }) => {
  const sentimentColors = {
    positive: 'bg-green-100 text-green-800',
    negative: 'bg-red-100 text-red-800',
    neutral: 'bg-gray-100 text-gray-800',
    mixed: 'bg-amber-100 text-amber-800'
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-purple-600 mb-3">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <p className="text-gray-800 font-medium line-clamp-2">{review.text}</p>
          <div className="mt-2 flex gap-2 items-center">
            <span className={`px-2 py-1 rounded text-xs font-medium ${sentimentColors[review.analysis?.sentiment] || sentimentColors.neutral}`}>
              {review.analysis?.sentiment?.toUpperCase() || 'NEUTRAL'}
            </span>
            <span className="text-xs text-gray-500">
              Confidence: {review.analysis?.confidence || 0}%
            </span>
            {review.analysis?.priority === 'high' && (
              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded font-medium">
                HIGH PRIORITY
              </span>
            )}
          </div>
        </div>
        {review.rating && (
          <div className="text-2xl ml-4">
            {'⭐'.repeat(review.rating)}
          </div>
        )}
      </div>

      {review.analysis?.aspects && review.analysis.aspects.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {review.analysis.aspects.map((aspect, idx) => (
            <span key={idx} className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
              {aspect.name}
            </span>
          ))}
        </div>
      )}

      {!review.isResolved && (
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => onRespond?.(review._id)}
            className="text-xs px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Respond
          </button>
          <button
            onClick={() => onResolve?.(review._id)}
            className="text-xs px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Mark Resolved
          </button>
        </div>
      )}

      {review.response && (
        <div className="mt-3 p-2 bg-purple-50 rounded border border-purple-200">
          <p className="text-xs text-gray-600 font-medium mb-1">Your Response:</p>
          <p className="text-sm text-gray-700">{review.response}</p>
        </div>
      )}
    </div>
  );
};

export const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin">
      <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full"></div>
    </div>
  </div>
);

export const EmptyState = ({ message, icon: Icon }) => (
  <div className="flex flex-col items-center justify-center p-12">
    {Icon && <Icon size={48} className="text-gray-300 mb-4" />}
    <p className="text-gray-500 font-medium">{message}</p>
  </div>
);
