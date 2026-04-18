import React, { useEffect, useState } from 'react';
import { DashboardLayout, PageHeader, Card, Button } from '../components/Layout';
import { KPICard, LoadingSpinner } from '../components/Charts';
import { useBusinessStore, useProductStore } from '../stores';
import { Plus, Package, TrendingUp, Star } from 'lucide-react';

export default function DashboardPage() {
  const { currentBusiness, getBusinessStats } = useBusinessStore();
  const { products, fetchProducts } = useProductStore();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewProduct, setShowNewProduct] = useState(false);

  useEffect(() => {
    if (currentBusiness?._id) {
      loadData();
    }
  }, [currentBusiness]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [businessStats, productList] = await Promise.all([
        getBusinessStats(currentBusiness._id),
        fetchProducts(currentBusiness._id)
      ]);
      setStats(businessStats);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentBusiness) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600 font-medium">Please select a business first</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title={currentBusiness.name}
        subtitle="Manage products and track customer sentiment"
        action={
          <Button variant="primary" onClick={() => setShowNewProduct(true)}>
            <Plus size={18} className="inline mr-2" />
            Add Product
          </Button>
        }
      />

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="space-y-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              icon={Package}
              label="Total Products"
              value={stats?.totalProducts || 0}
              subtext="Active products"
            />
            <KPICard
              icon={TrendingUp}
              label="Total Reviews"
              value={stats?.totalReviews || 0}
              subtext="All time"
            />
            <KPICard
              icon={Star}
              label="Average CSAT"
              value={`${Math.round(stats?.averageCSAT || 0)}%`}
              subtext="Customer satisfaction"
            />
            <KPICard
              icon={TrendingUp}
              label="Average NPS"
              value={Math.round(stats?.averageNPS || 0)}
              subtext="Net promoter score"
            />
          </div>

          {/* Products Grid */}
          <div>
            <h3 className="text-2xl font-bold mb-6">Your Products</h3>
            {products.length === 0 ? (
              <Card className="text-center py-12">
                <Package size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600 font-medium mb-4">No products yet</p>
                <Button variant="primary" onClick={() => setShowNewProduct(true)}>
                  Add Your First Product
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <Card key={product._id} className="hover:shadow-lg transition cursor-pointer" onClick={() => window.location.href = `/product/${product._id}`}>
                    <h4 className="text-lg font-semibold text-gray-800">{product.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{product.description || 'No description'}</p>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Reviews</p>
                          <p className="text-xl font-bold text-purple-600">
                            {product.analytics?.totalReviews || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Avg Confidence</p>
                          <p className="text-xl font-bold text-purple-600">
                            {Math.round(product.analytics?.averageConfidence || 0)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Subscription Info */}
          {stats?.subscription && (
            <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800">Current Plan</h4>
                  <p className="text-gray-600 capitalize mt-1">{stats.subscription.plan} Plan</p>
                </div>
                <Button variant="secondary">Upgrade</Button>
              </div>
            </Card>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
