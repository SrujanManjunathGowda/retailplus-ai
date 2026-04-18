import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DashboardLayout, PageHeader } from '../components/Layout';
import {
  SentimentChart,
  TrendChart,
  KPICard,
  LoadingSpinner,
  EmptyState,
  AspectChart
} from '../components/Charts';
import { ReviewSubmissionForm, ReviewsList } from '../components/Reviews';
import { useProductStore, useReviewStore } from '../stores';
import { BarChart3, TrendingUp, AlertCircle } from 'lucide-react';

export default function ProductPage() {
  const { productId } = useParams();
  const { currentProduct, getProductSummary, setProduct } = useProductStore();
  const { analytics, getAnalytics } = useReviewStore();
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadData();
  }, [productId, refreshKey]);

  const loadData = async () => {
    if (!productId) return;
    
    setIsLoading(true);
    try {
      const [productSummary, reviewsAnalytics] = await Promise.all([
        getProductSummary(productId),
        getAnalytics(productId)
      ]);
      setSummary(productSummary);
    } catch (error) {
      console.error('Failed to load product data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  if (!summary) {
    return (
      <DashboardLayout>
        <EmptyState message="Product not found" icon={BarChart3} />
      </DashboardLayout>
    );
  }

  const sentimentData = [
    { name: 'Positive', value: summary.sentiment?.positive || 0 },
    { name: 'Negative', value: summary.sentiment?.negative || 0 },
    { name: 'Neutral', value: summary.sentiment?.neutral || 0 },
    { name: 'Mixed', value: summary.sentiment?.mixed || 0 }
  ];

  const trendData = [
    { date: 'Mon', positive: 24, negative: 4, neutral: 8 },
    { date: 'Tue', positive: 32, negative: 6, neutral: 10 },
    { date: 'Wed', positive: 28, negative: 5, neutral: 12 },
    { date: 'Thu', positive: 35, negative: 8, neutral: 14 },
    { date: 'Fri', positive: 40, negative: 7, neutral: 11 },
    { date: 'Sat', positive: 38, negative: 9, neutral: 13 },
    { date: 'Sun', positive: 42, negative: 6, neutral: 10 }
  ];

  const aspectData = analytics?.topAspects?.slice(0, 5).map((a) => ({
    name: a.name,
    count: a.count
  })) || [];

  return (
    <DashboardLayout>
      <PageHeader
        title={summary.productName}
        subtitle="Monitor customer feedback and sentiment trends"
      />

      <div className="space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            icon={BarChart3}
            label="Total Reviews"
            value={summary.totalReviews}
            subtext="All time"
          />
          <KPICard
            icon={TrendingUp}
            label="Positive %"
            value={`${summary.sentimentPercentage.positive}%`}
            subtext="of all reviews"
          />
          <KPICard
            icon={AlertCircle}
            label="Negative %"
            value={`${summary.sentimentPercentage.negative}%`}
            subtext="require action"
          />
          <KPICard
            icon={BarChart3}
            label="Avg Confidence"
            value={`${summary.averageConfidence}%`}
            subtext="analysis confidence"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sentimentData.length > 0 && <SentimentChart data={sentimentData} />}
          {trendData.length > 0 && <TrendChart data={trendData} />}
        </div>

        {/* Aspects */}
        {aspectData.length > 0 && <AspectChart data={aspectData} />}

        {/* Review Submission */}
        <ReviewSubmissionForm productId={productId} onSuccess={handleRefresh} />

        {/* Reviews List */}
        <ReviewsList productId={productId} onRefresh={handleRefresh} />
      </div>
    </DashboardLayout>
  );
}
