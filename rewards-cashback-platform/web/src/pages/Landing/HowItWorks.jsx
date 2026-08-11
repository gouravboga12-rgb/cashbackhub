import React from 'react';
import { UserPlus, Calendar, Film, Gift } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    { num: 1, title: 'Create Free Account', desc: 'Sign up with your email or mobile number in 30 seconds and receive +100 bonus points immediately.', icon: UserPlus, color: '#7C3AED' },
    { num: 2, title: 'Complete Daily Activities', desc: 'Check-in once daily (+10 pts), watch 10 sponsored video ads (+10 pts/ad), and play the Spin Wheel (+50 to +1000 pts).', icon: Calendar, color: '#22C55E' },
    { num: 3, title: 'Track Wallet Balance', desc: 'Watch your reward points grow in real-time with automatic rupee conversion calculation (10 Points = ₹1).', icon: Film, color: '#F59E0B' },
    { num: 4, title: 'Redeem Gift Vouchers', desc: 'Select from PhonePe, Flipkart, Amazon Pay & Google Play gift vouchers. Submit redemption and receive your code!', icon: Gift, color: '#EC4899' }
  ];

  return (
    <div style={{ background: '#0E0B1F', color: '#FFF', minHeight: '100vh', padding: '60px 24px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '16px' }}>How <span style={{ color: '#4ADE80' }}>CashBack Hub</span> Works</h1>
          <p style={{ color: '#C4B5FD', fontSize: '1.2rem' }}>4 simple steps to turn daily app interactions into real gift vouchers</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.num} className="glass-card-dark" style={{ padding: '32px', display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: step.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 8px 20px rgba(0,0,0,0.3)' }}>
                  <Icon color="#FFF" size={32} />
                </div>
                <div>
                  <div style={{ color: '#4ADE80', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase' }}>STEP 0{step.num}</div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFF', marginBottom: '6px' }}>{step.title}</h3>
                  <p style={{ color: '#C4B5FD', lineHeight: 1.6 }}>{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
