import React, { useState } from 'react';
import { Zap, CheckCircle } from 'lucide-react';

export default function PricingPage({ onSelectPlan, onBack }) {
  const plans = [
    { name: 'Free', price: '$0', desc: 'Perfect for getting started', features: ['5,000 reviews/month', 'Basic analysis', 'Dashboard access'], rec: false },
    { name: 'Pro', price: '$25', desc: 'Best for growing businesses', features: ['100,000 reviews/month', 'Advanced NLP', 'Priority support', 'Up to 5 team members'], rec: true },
    { name: 'Business', price: '$50', desc: 'For established companies', features: ['Unlimited reviews', 'Enterprise features', '24/7 support', 'Unlimited team'], rec: false },
    { name: 'Enterprise', price: 'Custom', desc: 'For large organizations', features: ['Everything', 'White-label', 'Custom SLA', 'On-premise'], rec: false },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9ff' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2.5rem' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#667eea' }}>
          <Zap size={28} /> RetailPulseAI
        </div>
        <button onClick={onBack} style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: '1px solid #e2e8f0', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 500, color: '#64748b' }}>
          ← Back
        </button>
      </header>

      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>Pricing</h1>
          <p style={{ fontSize: '1.1rem', color: '#64748b' }}>Choose the perfect plan. No hidden fees.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
          {plans.map((plan) => (
            <Card key={plan.name} plan={plan} onSelect={() => onSelectPlan(plan.name)} />
          ))}
        </div>
      </section>

      <section style={{ background: 'white', padding: '3rem 2.5rem', marginTop: '3rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem', textAlign: 'center' }}>FAQ</h2>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <FAQ q="Can I change plans?" a="Yes, anytime." />
            <FAQ q="Free trial?" a="14-day free trial on Pro/Business." />
            <FAQ q="Payment methods?" a="Credit cards, PayPal, bank transfers." />
            <FAQ q="Annual discount?" a="Save 20% with annual billing." />
          </div>
        </div>
      </section>
    </div>
  );
}

function Card({ plan, onSelect }) {
  return (
    <div style={{ background: 'white', border: plan.rec ? '2px solid #667eea' : '1px solid #e2e8f0', borderRadius: '1rem', padding: '2rem', position: 'relative', transform: plan.rec ? 'scale(1.05)' : '1' }}>
      {plan.rec && <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#667eea', color: 'white', padding: '0.4rem 1rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 700 }}>RECOMMENDED</div>}
      <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>{plan.name}</h3>
      <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{plan.desc}</p>
      <div style={{ marginBottom: '1.5rem' }}><span style={{ fontSize: '2rem', fontWeight: 700 }}>{plan.price}</span></div>
      <button onClick={onSelect} style={{ width: '100%', padding: '0.75rem', background: plan.rec ? '#667eea' : '#f1f5f9', color: plan.rec ? 'white' : '#667eea', border: 'none', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer', marginBottom: '1.5rem' }}>
        {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
      </button>
      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {plan.features.map((f) => <div key={f} style={{ display: 'flex', gap: '0.5rem' }}><CheckCircle size={18} style={{ color: '#10b981', flexShrink: 0 }} /><span style={{ color: '#475569', fontSize: '0.9rem' }}>{f}</span></div>)}
      </div>
    </div>
  );
}

function FAQ({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: '0.75rem' }}>
      <button onClick={() => setOpen(!open)} style={{ width: '100%', padding: '1rem', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
        {q} <span style={{ transform: open ? 'rotate(180deg)' : '0' }}>▼</span>
      </button>
      {open && <div style={{ padding: '1rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', color: '#64748b' }}>{a}</div>}
    </div>
  );
}
