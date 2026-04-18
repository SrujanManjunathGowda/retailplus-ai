import React, { useState } from 'react';
import { Zap, Eye, EyeOff } from 'lucide-react';

export default function AuthPage({ onBack, onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ fullName: '', company: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    if (!isLogin && !form.fullName.trim()) { setError('Name required'); setLoading(false); return; }
    if (!form.company.trim()) { setError('Company required'); setLoading(false); return; }
    if (!form.email.includes('@')) { setError('Valid email required'); setLoading(false); return; }
    if (form.password.length < 6) { setError('Password 6+ chars'); setLoading(false); return; }

    setTimeout(() => {
      const authenticatedUser = {
        name: form.fullName || form.email.split('@')[0],
        company: form.company,
        email: form.email,
        plan: 'Pro',
      };
      localStorage.setItem('user', JSON.stringify(authenticatedUser));
      localStorage.setItem('isLoggedIn', 'true');
      onAuthSuccess(authenticatedUser);
      setLoading(false);
    }, 500);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ background: 'white', borderRadius: '1rem', padding: '3rem', maxWidth: '450px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#667eea' }}>
            <Zap size={32} /> <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>RetailPulseAI</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p style={{ color: '#64748b' }}>
            {isLogin ? 'Sign in to access' : 'Join thousands of businesses'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Full Name</label>
              <input type="text" name="fullName" placeholder="John Doe" value={form.fullName} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontFamily: 'inherit', boxSizing: 'border-box' }} />
            </div>
          )}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Company</label>
            <input type="text" name="company" placeholder="RetailPulse Store" value={form.company} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontFamily: 'inherit', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Email</label>
            <input type="email" name="email" placeholder="you@email.com" value={form.email} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontFamily: 'inherit', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input type={showPassword ? 'text' : 'password'} name="password" placeholder="••••••••" value={form.password} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontFamily: 'inherit', boxSizing: 'border-box' }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#667eea' }}>
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem' }}>❌ {error}</div>}
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.75rem', background: '#667eea', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
          <button onClick={() => { setIsLogin(!isLogin); setForm({ fullName: '', company: '', email: '', password: '' }); setError(''); }} style={{ background: 'none', border: 'none', color: '#667eea', fontWeight: 600, cursor: 'pointer' }}>
            {isLogin ? "Don't have account? Sign Up" : 'Have account? Login'}
          </button>
        </div>

        <button onClick={onBack} style={{ width: '100%', padding: '0.75rem', background: '#f1f5f9', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', marginTop: '1rem', fontWeight: 500, color: '#64748b' }}>
          ← Back to Home
        </button>
      </div>
    </div>
  );
}
