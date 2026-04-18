import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
} from 'recharts';
import {
  Zap,
  RefreshCw,
  Database,
  LogOut,
  MessageSquare,
  Flag,
  Smile,
  TrendingUp,
  Target,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Building2,
  ArrowLeft,
  Lock,
} from 'lucide-react';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import PricingPage from './pages/PricingPage';
import AdminSignup from './pages/AdminSignup';
import AdminDashboard from './pages/AdminDashboard';

axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5051';

const sentimentColors = {
  positive: '#10b981',
  negative: '#ef4444',
  neutral: '#cbd5e1',
  mixed: '#f59e0b',
};

function getRouteState(pathname, isLoggedIn, isAdminLoggedIn) {
  if (pathname.startsWith('/admin-signup')) {
    return { page: 'admin-signup', companyId: null };
  }
  if (pathname.startsWith('/admin-dashboard')) {
    return { page: 'admin-dashboard', companyId: null };
  }
  if (pathname.startsWith('/admin/')) {
    return {
      page: 'admin-detail',
      companyId: pathname.replace('/admin/', ''),
    };
  }
  if (pathname === '/admin') {
    return { page: 'admin', companyId: null };
  }
  if (pathname === '/pricing') {
    return { page: 'pricing', companyId: null };
  }
  if (pathname === '/auth') {
    return { page: 'auth', companyId: null };
  }
  return {
    page: isLoggedIn ? 'dashboard' : 'landing',
    companyId: null,
  };
}

function App() {
  const savedUser = localStorage.getItem('user');
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const savedAdmin = localStorage.getItem('adminUser');
  const isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
  const initialRoute = getRouteState(window.location.pathname, isLoggedIn, isAdminLoggedIn);

  const [currentPage, setCurrentPage] = useState(initialRoute.page);
  const [selectedCompanyId, setSelectedCompanyId] = useState(initialRoute.companyId);
  const [user, setUser] = useState(savedUser ? JSON.parse(savedUser) : null);
  const [admin, setAdmin] = useState(savedAdmin ? JSON.parse(savedAdmin) : null);
  const [dashboardData, setDashboardData] = useState(null);
  const [dashboardError, setDashboardError] = useState('');
  const [loading, setLoading] = useState(false);
  const [adminCompanies, setAdminCompanies] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [companyDetail, setCompanyDetail] = useState(null);
  const [companyDetailLoading, setCompanyDetailLoading] = useState(false);
  const [companyDetailError, setCompanyDetailError] = useState('');

  useEffect(() => {
    const onPopState = () => {
      const route = getRouteState(
        window.location.pathname,
        localStorage.getItem('isLoggedIn') === 'true',
        localStorage.getItem('isAdminLoggedIn') === 'true',
      );
      setCurrentPage(route.page);
      setSelectedCompanyId(route.companyId);
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigateTo = (path, page, companyId = null) => {
    window.history.pushState({}, '', path);
    setCurrentPage(page);
    setSelectedCompanyId(companyId);
  };

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setDashboardError('');
      const res = await axios.get('/api/dashboard', {
        params: { email: user?.email || '' },
      });
      setDashboardData(res.data);
    } catch (e) {
      setDashboardData(null);
      setDashboardError(
        e?.response?.data?.error || e?.message || 'Failed to load dashboard data',
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminCompanies = async () => {
    try {
      setAdminLoading(true);
      setAdminError('');
      const res = await axios.get('/api/admin/companies');
      setAdminCompanies(res.data.companies || []);
    } catch (e) {
      setAdminError(
        e?.response?.data?.error || e?.message || 'Failed to load companies',
      );
    } finally {
      setAdminLoading(false);
    }
  };

  const fetchCompanyDetail = async (companyId) => {
    try {
      setCompanyDetailLoading(true);
      setCompanyDetailError('');
      const res = await axios.get(`/api/admin/companies/${companyId}`);
      setCompanyDetail(res.data);
    } catch (e) {
      setCompanyDetail(null);
      setCompanyDetailError(
        e?.response?.data?.error || e?.message || 'Failed to load company details',
      );
    } finally {
      setCompanyDetailLoading(false);
    }
  };



  const loadSampleData = async () => {
    try {
      setLoading(true);
      await axios.post('/api/analyze', {
        loadSampleData: true,
        email: user?.email || '',
        company: user?.company || user?.name || 'Demo Company',
      });
      await fetchDashboard();
    } catch (e) {
      console.error('Failed to load sample data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentPage === 'dashboard' && user?.email) {
      fetchDashboard();
    }
  }, [currentPage, user?.email]);

  useEffect(() => {
    if (currentPage === 'admin') {
      fetchAdminCompanies();
    }
  }, [currentPage]);

  useEffect(() => {
    if (currentPage === 'admin-detail' && selectedCompanyId) {
      fetchCompanyDetail(selectedCompanyId);
    }
  }, [currentPage, selectedCompanyId]);

  const handleAuthSuccess = (authenticatedUser) => {
    setUser(authenticatedUser);
    localStorage.setItem('user', JSON.stringify(authenticatedUser));
    localStorage.setItem('isLoggedIn', 'true');
    navigateTo('/', 'dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    setUser(null);
    setDashboardData(null);
    navigateTo('/', 'landing');
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    localStorage.removeItem('adminUser');
    setAdmin(null);
    setAdminCompanies([]);
    setCompanyDetail(null);
    navigateTo('/', 'landing');
  };

  const handleSelectPlan = (plan) => {
    setUser((prev) => ({ ...(prev || {}), plan }));
    navigateTo('/auth', 'auth');
  };

  if (currentPage === 'landing') {
    return (
      <LandingPage
        onGetStarted={() => navigateTo('/auth', 'auth')}
        onViewDemo={() => navigateTo('/pricing', 'pricing')}
        onAdminClick={() => navigateTo('/admin-signup', 'admin-signup')}
      />
    );
  }

  if (currentPage === 'admin-signup') {
    return (
      <AdminSignup
        onBack={() => navigateTo('/', 'landing')}
        onAdminAuthSuccess={(adminName) => {
          setAdmin({ name: adminName });
          localStorage.setItem('adminUser', JSON.stringify({ name: adminName }));
          localStorage.setItem('isAdminLoggedIn', 'true');
          navigateTo('/admin-dashboard', 'admin-dashboard');
        }}
      />
    );
  }

  if (currentPage === 'admin-dashboard') {
    return (
      <AdminDashboard
        admin={admin}
        onLogout={handleAdminLogout}
        onGoToAdminPanel={() => navigateTo('/admin', 'admin')}
      />
    );
  }

  if (currentPage === 'admin') {
    return (
      <AdminPanel
        companies={adminCompanies}
        loading={adminLoading}
        error={adminError}
        onOpenCompany={(companyId) =>
          navigateTo(`/admin/${companyId}`, 'admin-detail', companyId)
        }
        onLogout={handleAdminLogout}
        onRefresh={fetchAdminCompanies}
      />
    );
  }

  if (currentPage === 'admin-detail') {
    return (
      <AdminDetailPage
        company={companyDetail}
        loading={companyDetailLoading}
        error={companyDetailError}
        onBack={() => navigateTo('/admin', 'admin')}
        onLogout={handleAdminLogout}
        onRefresh={() => fetchCompanyDetail(selectedCompanyId)}
      />
    );
  }

  if (currentPage === 'auth') {
    return (
      <AuthPage
        onBack={() => navigateTo('/', 'landing')}
        onAuthSuccess={handleAuthSuccess}
      />
    );
  }

  if (currentPage === 'pricing') {
    return (
      <PricingPage
        onSelectPlan={handleSelectPlan}
        onBack={() => navigateTo('/', 'landing')}
      />
    );
  }



  if (currentPage === 'dashboard' && user) {
    return (
      <AppShell
        user={user}
        onLogout={handleLogout}
        title="RetailPulseAI"
        subtitle={user.plan ? `Plan: ${user.plan}` : 'Review intelligence'}
        actions={
          <>
            <button onClick={fetchDashboard} disabled={loading} style={secondaryButtonStyle(!loading)}>
              <RefreshCw size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Refresh
            </button>
            {dashboardData && dashboardData.totalReviews === 0 && (
              <button onClick={loadSampleData} style={primaryLightButtonStyle}>
                <Database size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Load Demo Data
              </button>
            )}
          </>
        }
      >
        {!dashboardData ? (
          <EmptyState
            title={dashboardError ? 'Dashboard failed to load' : 'Loading Intelligence Engine...'}
            message={dashboardError}
            buttonLabel={dashboardError ? 'Retry Dashboard' : null}
            onAction={dashboardError ? fetchDashboard : null}
          />
        ) : (
          <DashboardView
            data={dashboardData}
            fetchDashboard={fetchDashboard}
            loading={loading}
            user={user}
          />
        )}
      </AppShell>
    );
  }

  return null;
}

function AdminPanel({ companies, loading, error, onOpenCompany, onLogout, onRefresh }) {
  if (loading) {
    return (
      <AdminPanelShell onLogout={onLogout}>
        <EmptyState title="Loading companies..." />
      </AdminPanelShell>
    );
  }

  if (error) {
    return (
      <AdminPanelShell onLogout={onLogout}>
        <EmptyState title="Error loading companies" message={error} />
      </AdminPanelShell>
    );
  }

  if (!companies.length) {
    return (
      <AdminPanelShell onLogout={onLogout}>
        <EmptyState title="No companies yet" message="Companies will appear here when users submit reviews." />
      </AdminPanelShell>
    );
  }

  return (
    <AdminPanelShell onLogout={onLogout} onRefresh={onRefresh}>
      <div style={{ ...responsiveGrid('repeat(auto-fit, minmax(300px, 1fr))'), marginBottom: '2rem' }}>
        {companies.map((company) => (
          <div key={company.id} style={{ ...plainCardStyle, borderTop: '5px solid #667eea' }}>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>{company.company}</div>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>By: {company.userEmail || 'Unknown'}</div>
            </div>

            <div style={{ ...responsiveGrid('repeat(2, minmax(0, 1fr))'), gap: '0.9rem', marginBottom: '1rem' }}>
              <MiniStat label="Total Reviews" value={company.totalReviews} bg="#f8fafc" color="#334155" />
              <MiniStat label="Spam Count" value={company.spam} bg="#fef2f2" color="#b91c1c" />
              <MiniStat label="Avg CSAT" value={`${company.avgCSAT}%`} bg="#f0fdf4" color="#15803d" />
              <MiniStat label="Alerts" value={company.alerts?.length || 0} bg="#fff7ed" color="#c2410c" />
            </div>

            <button onClick={() => onOpenCompany(company.id)} style={primaryDarkButtonStyle}>
              View Details
            </button>
          </div>
        ))}
      </div>
    </AdminPanelShell>
  );
}

function AdminPanelShell({ children, onLogout, onRefresh }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <header style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '1.5rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Lock size={32} />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Admin Panel - Companies</h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {onRefresh && (
            <button onClick={onRefresh} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
              <RefreshCw size={18} /> Refresh
            </button>
          )}
          <button onClick={onLogout} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>
      <div style={{ padding: '2rem 2.5rem', maxWidth: '1400px', margin: '0 auto' }}>
        {children}
      </div>
    </div>
  );
}

function AdminDetailPage({ company, loading, error, onBack, onLogout, onRefresh }) {
  if (loading) {
    return (
      <AdminDetailShell onBack={onBack} onLogout={onLogout}>
        <EmptyState title="Loading company details..." />
      </AdminDetailShell>
    );
  }

  if (error) {
    return (
      <AdminDetailShell onBack={onBack} onLogout={onLogout}>
        <EmptyState title="Error loading company" message={error} />
      </AdminDetailShell>
    );
  }

  if (!company) {
    return (
      <AdminDetailShell onBack={onBack} onLogout={onLogout}>
        <EmptyState title="Company not found" />
      </AdminDetailShell>
    );
  }

  return (
    <AdminDetailShell onBack={onBack} onLogout={onLogout} onRefresh={onRefresh}>
      <div style={{ ...responsiveGrid('repeat(auto-fit, minmax(200px, 1fr))'), marginBottom: '2rem' }}>
        <div style={plainCardStyle}>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.3rem', fontWeight: 600 }}>COMPANY</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0f172a' }}>{company.company}</div>
        </div>
        <div style={plainCardStyle}>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.3rem', fontWeight: 600 }}>TOTAL REVIEWS</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#3b82f6' }}>{company.totalReviews}</div>
        </div>
        <div style={plainCardStyle}>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.3rem', fontWeight: 600 }}>SPAM COUNT</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#dc2626' }}>{company.spam}</div>
        </div>
        <div style={plainCardStyle}>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.3rem', fontWeight: 600 }}>AVG CSAT</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#16a34a' }}>{company.avgCSAT}%</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={plainCardStyle}>
          <h3 style={sectionTitle}>Alerts</h3>
          {company.alerts?.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {company.alerts.map((alert, index) => (
                <div key={index} style={{ background: '#fff1f2', padding: '0.75rem', borderRadius: '0.5rem', borderLeft: '4px solid #dc2626' }}>
                  <div style={{ fontSize: '0.9rem', color: '#1f2937', fontWeight: 500 }}>{alert}</div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#64748b' }}>No alerts</p>
          )}
        </div>

        <div style={plainCardStyle}>
          <h3 style={sectionTitle}>Feature Analysis</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>
              <span style={{ fontWeight: 600, color: '#334155' }}>Battery</span>
              <span style={{ color: getFeatureColor(company.featureStats?.battery), fontWeight: 700 }}>{company.featureStats?.battery || 'No data'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>
              <span style={{ fontWeight: 600, color: '#334155' }}>Packaging</span>
              <span style={{ color: getFeatureColor(company.featureStats?.packaging), fontWeight: 700 }}>{company.featureStats?.packaging || 'No data'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 600, color: '#334155' }}>Delivery</span>
              <span style={{ color: getFeatureColor(company.featureStats?.delivery), fontWeight: 700 }}>{company.featureStats?.delivery || 'No data'}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div style={plainCardStyle}>
          <h3 style={sectionTitle}>Top Issues</h3>
          {company.topIssues?.length ? (
            <ul style={listStyle}>
              {company.topIssues.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          ) : (
            <p style={{ color: '#64748b' }}>No issues identified</p>
          )}
        </div>
        <div style={plainCardStyle}>
          <h3 style={sectionTitle}>Top Praise</h3>
          {company.topPraise?.length ? (
            <ul style={listStyle}>
              {company.topPraise.map((praise, index) => (
                <li key={index}>{praise}</li>
              ))}
            </ul>
          ) : (
            <p style={{ color: '#64748b' }}>No praise data yet</p>
          )}
        </div>
      </div>
    </AdminDetailShell>
  );
}

function AdminDetailShell({ children, onBack, onLogout, onRefresh }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <header style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '1.5rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Company Details</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {onRefresh && (
            <button onClick={onRefresh} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
              <RefreshCw size={18} /> Refresh
            </button>
          )}
          <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
            <ArrowLeft size={18} /> Back
          </button>
          <button onClick={onLogout} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>
      <div style={{ padding: '2rem 2.5rem', maxWidth: '1400px', margin: '0 auto' }}>
        {children}
      </div>
    </div>
  );
}

function getFeatureColor(sentiment) {
  if (!sentiment) return '#64748b';
  const lower = sentiment.toLowerCase();
  if (lower.includes('positive')) return '#16a34a';
  if (lower.includes('negative')) return '#dc2626';
  return '#64748b';
}

function AppShell({ user, onLogout, title, subtitle, actions, children }) {
  return (
    <div className="app-container">
      <header
        className="header"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '2rem 2.5rem',
          borderRadius: '1rem',
          marginBottom: '2rem',
          boxShadow: '0 18px 45px rgba(91, 82, 173, 0.2)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="title-container" style={{ color: 'white' }}>
            <div className="logo-circle" style={{ background: 'rgba(255,255,255,0.2)' }}>
              <Zap size={24} fill="white" color="white" />
            </div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{title}</div>
              <div style={{ fontSize: '0.95rem', opacity: 0.82 }}>{subtitle}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', flexWrap: 'wrap' }}>
            {actions}
            {user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '1rem', borderLeft: '1px solid rgba(255,255,255,0.3)' }}>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>{user.name}</div>
                  <div style={{ fontSize: '0.78rem', opacity: 0.8 }}>{user.email}</div>
                </div>
                <button onClick={onLogout} style={iconButtonStyle} title="Logout">
                  <LogOut size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {children}
    </div>
  );
}

function DashboardView({ data, fetchDashboard, loading, user }) {
  const { totalReviews, sentimentCounts, cxMetrics, alerts, reviews, topComplaints, topPraise, categories, statistics } = data;

  const chartData = useMemo(() => {
    const map = {};
    reviews.forEach((review) => {
      const dateStr = new Date(review.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      if (!map[dateStr]) {
        map[dateStr] = { name: dateStr, positive: 0, neutral: 0, negative: 0, mixed: 0 };
      }
      const sentiment = review.overallSentiment?.toLowerCase() || 'neutral';
      if (map[dateStr][sentiment] !== undefined) {
        map[dateStr][sentiment] += 1;
      }
    });
    return Object.values(map).slice(-10);
  }, [reviews]);

  const categoryData = categories
    ? Object.entries(categories).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value: value.total,
        positive: value.positive,
      }))
    : [];

  return (
    <div className="dashboard-content" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {alerts?.length > 0 && (
        <div style={sectionCard('#fef3c7', '#fcd34d', '1.5rem', '2rem')}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <AlertCircle size={24} style={{ color: '#d97706', flexShrink: 0, marginTop: '0.25rem' }} />
            <div style={{ flex: 1 }}>
              <h3 style={{ color: '#d97706', marginBottom: '0.75rem', fontWeight: 700 }}>Active Alerts & Trends</h3>
              <div style={responsiveGrid('repeat(auto-fit, minmax(280px, 1fr))')}>
                {alerts.slice(0, 4).map((alert, index) => (
                  <div
                    key={index}
                    style={{
                      background: 'white',
                      padding: '0.9rem',
                      borderRadius: '0.75rem',
                      borderLeft: `4px solid ${alert.type === 'danger' ? '#ef4444' : alert.type === 'warning' ? '#f59e0b' : '#3b82f6'}`,
                    }}
                  >
                    <div style={{ fontWeight: 600, color: '#334155' }}>{alert.message}</div>
                    {alert.severity && (
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.3rem' }}>
                        Severity: {alert.severity}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ ...responsiveGrid('repeat(auto-fit, minmax(220px, 1fr))'), marginBottom: '2rem' }}>
        <KPICard title="Total Reviews" value={totalReviews} icon={<MessageSquare size={24} />} subtext="Customer feedback analyzed" color="#667eea" />
        <KPICard title="Spam Reviews" value={reviews?.filter((r) => r.spamAnalysis?.isSpam || r.isSpamFlagged).length || 0} icon={<Flag size={24} />} subtext="Flagged as spam" color="#dc2626" />
        <KPICard title="CSAT Score" value={cxMetrics?.csat || '0%'} icon={<Smile size={24} />} subtext="Customer satisfaction" color="#10b981" />
        <KPICard title="NPS" value={cxMetrics?.nps || '0'} icon={<TrendingUp size={24} />} subtext="Net promoter score" color="#3b82f6" />
        <KPICard title="CES" value={cxMetrics?.ces || '3.0/5'} icon={<Target size={24} />} subtext="Customer effort score" color="#8b5cf6" />
        <KPICard title="At-Risk Customers" value={cxMetrics?.atRiskCustomers || '0'} icon={<AlertTriangle size={24} />} subtext="Require attention" color="#ef4444" />
        <KPICard title="Data Quality" value={`${statistics?.avgConfidence || 0}%`} icon={<CheckCircle size={24} />} subtext="Confidence score" color="#06b6d4" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <ChartCard title="Sentiment Timeline">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <RechartsTooltip />
              <Legend />
              <Bar dataKey="positive" fill="#10b981" />
              <Bar dataKey="negative" fill="#ef4444" />
              <Bar dataKey="neutral" fill="#cbd5e1" />
              <Bar dataKey="mixed" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Sentiment Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Positive', value: sentimentCounts.positive || 0, fill: '#10b981' },
                  { name: 'Negative', value: sentimentCounts.negative || 0, fill: '#ef4444' },
                  { name: 'Neutral', value: sentimentCounts.neutral || 0, fill: '#cbd5e1' },
                  { name: 'Mixed', value: sentimentCounts.mixed || 0, fill: '#f59e0b' },
                ]}
                cx="50%"
                cy="50%"
                outerRadius={84}
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                dataKey="value"
              />
              <RechartsTooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div style={{ ...responsiveGrid('repeat(auto-fit, minmax(300px, 1fr))'), marginBottom: '2rem' }}>
        <InsightListCard title="Top Complaints" color="#ef4444" items={topComplaints} emptyText="No complaints yet - great start!" />
        <InsightListCard title="Top Praise" color="#10b981" items={topPraise} emptyText="No praise data yet" />
        <CategoryCard categoryData={categoryData} />
      </div>

      <AnalyzeBlock
        fetchDashboard={fetchDashboard}
        loading={loading}
        user={user}
      />

      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
          Recent Reviews ({reviews.length})
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {reviews.slice(0, 500).map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </div>
    </div>
  );
}



function AnalyzeBlock({ fetchDashboard, user }) {
  const [text, setText] = useState('');
  const [companyName, setCompanyName] = useState(user?.company || user?.name || '');
  const [analyzing, setAnalyzing] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setCompanyName(user?.company || user?.name || '');
  }, [user?.company, user?.name]);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setAnalyzing(true);
    try {
      await axios.post('/api/process', {
        company: companyName,
        email: user?.email || '',
        text,
      });
      setText('');
      await fetchDashboard();
      alert('Reviews processed successfully');
    } catch (e) {
      console.error(e);
      alert('Failed to analyze reviews. Check API connection.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.csv')) {
      alert('Please upload a CSV file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('email', user?.email || '');
    formData.append('company', companyName);

    setAnalyzing(true);
    try {
      const response = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const { processed, total, spamCount } = response.data;
      await fetchDashboard();
      alert(`Processed ${processed}/${total} reviews. Spam detected: ${spamCount || 0}`);
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    } finally {
      setAnalyzing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div style={plainCardStyle}>
      <h3 style={sectionTitle}>Process Reviews</h3>
      <div style={{ marginBottom: '1rem' }}>
        <label style={labelStyle}>Company Name</label>
        <input
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Enter company name"
          style={inputStyle}
        />
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label style={labelStyle}>Reviews</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste one review per line..."
          style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }}
          disabled={analyzing}
        />
      </div>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button onClick={handleAnalyze} disabled={analyzing || !text.trim()} style={primaryDarkButtonStyle}>
          {analyzing ? 'Processing...' : 'Submit via /api/process'}
        </button>
        <button onClick={() => fileInputRef.current?.click()} disabled={analyzing} style={outlineButtonStyle}>
          Upload CSV Reviews
        </button>
        <input ref={fileInputRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleFileUpload} />
      </div>
    </div>
  );
}

function KPICard({ title, value, icon, subtext, color }) {
  return (
    <div style={plainCardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '0.5rem', fontWeight: 700, textTransform: 'uppercase' }}>
            {title}
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color, marginBottom: '0.45rem', wordBreak: 'break-word' }}>
            {value}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{subtext}</div>
        </div>
        <div style={{ background: `${color}15`, padding: '1rem', borderRadius: '0.8rem', color }}>{icon}</div>
      </div>
    </div>
  );
}

function ReviewCard({ review }) {
  const priorityColors = { HIGH: '#ef4444', MEDIUM: '#f59e0b', LOW: '#3b82f6' };
  const isSpam = review.spamAnalysis?.isSpam || review.isSpamFlagged;

  return (
    <div
      style={{
        ...plainCardStyle,
        background: isSpam ? '#fef2f2' : 'white',
        border: isSpam ? '2px solid #fca5a5' : `2px solid ${sentimentColors[review.overallSentiment?.toLowerCase()] || '#e2e8f0'}`,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <p style={{ fontSize: '1rem', color: '#334155', lineHeight: '1.7', fontStyle: 'italic', flex: 1 }}>
          "{review.originalText || review.text}"
        </p>
        {isSpam && (
          <div style={{ background: '#dc2626', color: 'white', padding: '0.55rem 0.75rem', borderRadius: '0.6rem', fontSize: '0.75rem', fontWeight: 700 }}>
            SPAM
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.7rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <Badge color={sentimentColors[review.overallSentiment?.toLowerCase()] || '#64748b'}>
          {review.overallSentiment || 'unknown'}
        </Badge>
        <Badge color={priorityColors[review.priority] || '#3b82f6'}>
          {review.priority || 'NORMAL'}
        </Badge>
        <Badge color="#7c3aed">{review.department || 'General'}</Badge>
        <Badge color="#0f766e">Confidence: {review.overallConfidence || 0}%</Badge>
      </div>

      {Array.isArray(review.aspects) && review.aspects.length > 0 && (
        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.75rem' }}>
          <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '0.65rem', fontWeight: 700, textTransform: 'uppercase' }}>
            Aspects
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {review.aspects.map((aspect, index) => (
              <div
                key={index}
                style={{
                  background: 'white',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.5rem',
                  border: `1px solid ${sentimentColors[aspect.sentiment?.toLowerCase()] || '#e2e8f0'}`,
                }}
              >
                <span style={{ fontWeight: 700, color: '#334155' }}>{aspect.aspect || 'General'}</span>
                <span style={{ marginLeft: '0.5rem', color: sentimentColors[aspect.sentiment?.toLowerCase()] || '#64748b' }}>
                  {aspect.sentiment || 'unknown'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InsightListCard({ title, color, items, emptyText }) {
  return (
    <div style={plainCardStyle}>
      <h3 style={{ ...sectionTitle, color }}>{title}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {items?.length ? (
          items.map((item, index) => (
            <div key={index} style={{ background: `${color}12`, padding: '0.75rem', borderRadius: '0.65rem', borderLeft: `3px solid ${color}` }}>
              <div style={{ fontWeight: 700, color: '#1f2937', textTransform: 'capitalize' }}>{item.aspect}</div>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                {item.count} mentions • {item.percentage}% of reviews
              </div>
            </div>
          ))
        ) : (
          <p style={{ color: '#64748b' }}>{emptyText}</p>
        )}
      </div>
    </div>
  );
}

function CategoryCard({ categoryData }) {
  return (
    <div style={plainCardStyle}>
      <h3 style={sectionTitle}>Product Categories</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
        {categoryData.length ? (
          categoryData.map((category, index) => (
            <div key={index}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <span style={{ fontWeight: 600, color: '#334155' }}>{category.name}</span>
                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>{category.value} reviews</span>
              </div>
              <div style={{ background: '#e2e8f0', height: '8px', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ background: '#10b981', height: '100%', width: `${(category.positive / category.value) * 100}%` }} />
              </div>
            </div>
          ))
        ) : (
          <p style={{ color: '#64748b' }}>No category data</p>
        )}
      </div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div style={plainCardStyle}>
      <h3 style={sectionTitle}>{title}</h3>
      {children}
    </div>
  );
}

function EmptyState({ title, message, buttonLabel, onAction }) {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748b' }}>
      <div style={{ fontSize: '1.35rem', marginBottom: '0.8rem', color: '#334155', fontWeight: 700 }}>{title}</div>
      {message ? <div style={{ marginBottom: '1rem', color: '#dc2626' }}>{message}</div> : null}
      {buttonLabel && onAction ? (
        <button onClick={onAction} style={primaryDarkButtonStyle}>
          {buttonLabel}
        </button>
      ) : null}
    </div>
  );
}

function MiniStat({ label, value, bg, color }) {
  return (
    <div style={{ background: bg, padding: '1rem', borderRadius: '0.8rem' }}>
      <div style={{ color: '#64748b', fontSize: '0.82rem', marginBottom: '0.4rem', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: '1.4rem', fontWeight: 800, color }}>{value}</div>
    </div>
  );
}

function FeatureRow({ label, value }) {
  const color =
    value === 'Positive' ? '#16a34a' : value === 'Negative' ? '#dc2626' : '#475569';

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.85rem 0', borderBottom: '1px solid #e2e8f0' }}>
      <span style={{ fontWeight: 600, color: '#334155' }}>{label}</span>
      <span style={{ fontWeight: 700, color }}>{value || 'No data'}</span>
    </div>
  );
}

function Badge({ color, children }) {
  return (
    <span
      style={{
        background: `${color}18`,
        color,
        padding: '0.42rem 0.8rem',
        borderRadius: '999px',
        fontSize: '0.82rem',
        fontWeight: 700,
        textTransform: 'capitalize',
      }}
    >
      {children}
    </span>
  );
}

const plainCardStyle = {
  background: 'white',
  padding: '1.5rem',
  borderRadius: '1rem',
  border: '1px solid #e2e8f0',
  boxShadow: '0 10px 24px rgba(15, 23, 42, 0.05)',
};

const sectionTitle = {
  marginBottom: '1rem',
  fontWeight: 700,
  color: '#0f172a',
  fontSize: '1.08rem',
};

const labelStyle = {
  display: 'block',
  marginBottom: '0.45rem',
  fontWeight: 700,
  color: '#334155',
};

const inputStyle = {
  width: '100%',
  padding: '0.85rem 1rem',
  borderRadius: '0.75rem',
  border: '1px solid #dbe3ee',
  fontFamily: 'inherit',
  fontSize: '0.95rem',
  boxSizing: 'border-box',
};

const primaryDarkButtonStyle = {
  background: '#4f46e5',
  border: 'none',
  color: 'white',
  padding: '0.85rem 1rem',
  borderRadius: '0.75rem',
  cursor: 'pointer',
  fontWeight: 700,
};

const primaryLightButtonStyle = {
  background: 'rgba(255,255,255,0.9)',
  border: 'none',
  color: '#4f46e5',
  padding: '0.75rem 1rem',
  borderRadius: '0.75rem',
  cursor: 'pointer',
  fontWeight: 700,
};

function secondaryButtonStyle(enabled) {
  return {
    background: 'rgba(255,255,255,0.18)',
    border: '1px solid rgba(255,255,255,0.14)',
    color: 'white',
    padding: '0.75rem 1rem',
    borderRadius: '0.75rem',
    cursor: enabled ? 'pointer' : 'not-allowed',
    fontWeight: 700,
    opacity: enabled ? 1 : 0.7,
  };
}

const outlineButtonStyle = {
  background: 'white',
  border: '1px solid #cbd5e1',
  color: '#334155',
  padding: '0.85rem 1rem',
  borderRadius: '0.75rem',
  cursor: 'pointer',
  fontWeight: 700,
};

const iconButtonStyle = {
  background: 'rgba(255,255,255,0.2)',
  border: 'none',
  color: 'white',
  padding: '0.6rem',
  borderRadius: '0.75rem',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const listStyle = {
  margin: 0,
  paddingLeft: '1.2rem',
  color: '#334155',
  lineHeight: 1.8,
};

function responsiveGrid(columns) {
  return {
    display: 'grid',
    gridTemplateColumns: columns,
    gap: '1.5rem',
  };
}

function sectionCard(bg, border, padding, marginBottom) {
  return {
    background: bg,
    border: `1px solid ${border}`,
    borderRadius: '1rem',
    padding,
    marginBottom,
  };
}

export default App;
