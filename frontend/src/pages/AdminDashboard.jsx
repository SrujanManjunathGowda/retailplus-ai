import React, { useState, useEffect } from 'react';
import { Lock, LogOut, Users, BarChart2, TrendingUp, Building2 } from 'lucide-react';

export default function AdminDashboard({ admin, onLogout, onGoToAdminPanel, onLoadCompanies }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for admin dashboard
    setTimeout(() => {
      setStats({
        totalUsers: 12,
        totalReviews: 456,
        totalAnalyzed: 423,
        spamDetected: 33,
        avgSentiment: 65,
        recentUsers: [
          { email: 'srujan@gmail.com', name: 'Srujan', reviews: 60, joined: '2 hours ago' },
          { email: 'siriB@gmail.com', name: 'Siri B', reviews: 45, joined: '1 day ago' },
          { email: 'user3@email.com', name: 'User 3', reviews: 38, joined: '3 days ago' },
          { email: 'user4@email.com', name: 'User 4', reviews: 52, joined: '5 days ago' },
          { email: 'user5@email.com', name: 'User 5', reviews: 71, joined: '1 week ago' },
        ]
      });
      setLoading(false);
      // Load companies data
      if (onLoadCompanies) {
        onLoadCompanies();
      }
    }, 1000);
  }, [onLoadCompanies]);

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a' }}>
      {/* Header */}
      <header style={{ background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)', color: 'white', padding: '1.5rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Lock size={32} />
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Admin Dashboard</h1>
            <p style={{ fontSize: '0.85rem', opacity: 0.9, margin: 0 }}>{admin?.name || 'Administrator'}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={onGoToAdminPanel} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
            <Building2 size={18} /> View Companies
          </button>
          <button onClick={onLogout} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>

      {/* Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 2.5rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
            <div style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Loading dashboard...</div>
            <div style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
              <StatCard icon={<Users size={28} />} title="Total Users" value={stats.totalUsers} color="#3b82f6" />
              <StatCard icon={<BarChart2 size={28} />} title="Total Reviews" value={stats.totalReviews} color="#10b981" />
              <StatCard icon={<TrendingUp size={28} />} title="Reviewed" value={stats.totalAnalyzed} color="#f59e0b" />
              <StatCard icon={<span style={{ fontSize: '1.5rem' }}>🚩</span>} title="Spam Detected" value={stats.spamDetected} color="#ef4444" />
            </div>

            {/* Recent Users Table */}
            <div style={{ background: '#1e293b', borderRadius: '0.75rem', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
              <div style={{ padding: '1.5rem', borderBottom: '1px solid #334155' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', margin: 0 }}>Recent Users</h2>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #334155', background: '#0f172a' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', color: '#cbd5e1', fontWeight: 600 }}>Name</th>
                    <th style={{ padding: '1rem', textAlign: 'left', color: '#cbd5e1', fontWeight: 600 }}>Email</th>
                    <th style={{ padding: '1rem', textAlign: 'left', color: '#cbd5e1', fontWeight: 600 }}>Reviews</th>
                    <th style={{ padding: '1rem', textAlign: 'left', color: '#cbd5e1', fontWeight: 600 }}>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentUsers.map((user, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #334155', background: idx % 2 === 0 ? '#1e293b' : '#0f172a' }}>
                      <td style={{ padding: '1rem', color: 'white' }}>{user.name}</td>
                      <td style={{ padding: '1rem', color: '#94a3b8' }}>{user.email}</td>
                      <td style={{ padding: '1rem', color: '#10b981', fontWeight: 600 }}>{user.reviews}</td>
                      <td style={{ padding: '1rem', color: '#94a3b8' }}>{user.joined}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function StatCard({ icon, title, value, color }) {
  return (
    <div style={{ background: '#1e293b', borderRadius: '0.75rem', padding: '1.5rem', border: `2px solid ${color}`, boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', color }}>
        {icon}
      </div>
      <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0 0 0.5rem 0' }}>{title}</p>
      <p style={{ fontSize: '2.5rem', fontWeight: 700, color: 'white', margin: 0 }}>{value}</p>
    </div>
  );
}
