import React, { useState } from 'react';
import { Zap, Eye, EyeOff, Lock } from 'lucide-react';

export default function AdminSignup({ onBack, onAdminAuthSuccess }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', adminKey: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate
    if (!form.name.trim()) { setError('Name required'); setLoading(false); return; }
    if (!form.email.includes('@')) { setError('Valid email required'); setLoading(false); return; }
    if (form.password.length < 6) { setError('Password 6+ chars'); setLoading(false); return; }
    if (form.adminKey !== 'ADMIN_2024_SECRET_KEY') { setError('Invalid admin key'); setLoading(false); return; }

    setTimeout(() => {
      localStorage.setItem('adminUser', JSON.stringify({
        name: form.name,
        email: form.email,
      }));
      localStorage.setItem('isAdminLoggedIn', 'true');
      onAdminAuthSuccess(form.name);
      setLoading(false);
    }, 500);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ background: 'white', borderRadius: '1rem', padding: '3rem', maxWidth: '450px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#dc2626' }}>
            <Lock size={32} /> <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>Admin Panel</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
            Admin Registration
          </h1>
          <p style={{ color: '#64748b' }}>
            Register as an administrator
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Full Name</label>
            <input type="text" name="name" placeholder="Admin Name" value={form.name} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontFamily: 'inherit', boxSizing: 'border-box' }} />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Email</label>
            <input type="email" name="email" placeholder="admin@email.com" value={form.email} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontFamily: 'inherit', boxSizing: 'border-box' }} />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input type={showPassword ? 'text' : 'password'} name="password" placeholder="••••••••" value={form.password} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontFamily: 'inherit', boxSizing: 'border-box' }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}>
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Admin Key</label>
            <input type="password" name="adminKey" placeholder="Enter admin key" value={form.adminKey} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontFamily: 'inherit', boxSizing: 'border-box' }} />
            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>Admin key required to register</p>
          </div>

          {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem' }}>❌ {error}</div>}
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.75rem', background: '#dc2626', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Processing...' : 'Register Admin'}
          </button>
        </form>

        <button onClick={onBack} style={{ width: '100%', padding: '0.75rem', background: '#f1f5f9', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', marginTop: '1rem', fontWeight: 500, color: '#64748b' }}>
          ← Back to Home
        </button>
      </div>
    </div>
  );
}
