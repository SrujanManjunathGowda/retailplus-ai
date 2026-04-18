import React from 'react';
import { Zap } from 'lucide-react';

export default function LandingPage({ onGetStarted, onViewDemo, onAdminClick }) {
  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5rem 2.5rem', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#667eea' }}>
          <Zap size={28} /> RetailPulseAI
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={onViewDemo} style={{ padding: '0.75rem 1.5rem', border: 'none', background: 'transparent', cursor: 'pointer', color: '#667eea', fontWeight: 500 }}>
            View Demo
          </button>
          <button onClick={onGetStarted} style={{ padding: '0.75rem 1.5rem', background: '#667eea', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 500 }}>
            Sign Up
          </button>
          {onAdminClick && (
            <button onClick={onAdminClick} style={{ padding: '0.75rem 1.5rem', background: '#dc2626', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 500 }}>
              🔐 Admin
            </button>
          )}
        </div>
      </nav>
      <section style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '4rem 2.5rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '1rem' }}>Understand Your Customers Better</h1>
        <p style={{ fontSize: '1.1rem', marginBottom: '2rem', opacity: 0.95 }}>AI-powered review analysis that turns customer feedback into actionable insights.</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button onClick={onGetStarted} style={{ padding: '1rem 2rem', background: 'white', color: '#667eea', border: 'none', borderRadius: '0.5rem', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}>
            Get Started
          </button>
          <button onClick={onViewDemo} style={{ padding: '1rem 2rem', background: 'rgba(255,255,255,0.2)', color: 'white', border: '2px solid white', borderRadius: '0.5rem', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}>
            View Demo
          </button>
        </div>
      </section>
      <section style={{ padding: '3rem 2.5rem', textAlign: 'center', background: '#f8fafc' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem', color: '#1e293b' }}>Ready to transform your feedback?</h2>
        <button onClick={onGetStarted} style={{ padding: '1rem 2.5rem', background: '#667eea', color: 'white', border: 'none', borderRadius: '0.5rem', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer' }}>
          Get Started Free
        </button>
      </section>
    </div>
  );
}
