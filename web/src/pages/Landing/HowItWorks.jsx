import React from 'react';
import { UserPlus, Calendar, Film, Gift } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    { num: 1, title: 'Create Free Account', desc: 'Sign up with your email or mobile number in 30 seconds and receive +100 bonus points immediately.', icon: UserPlus, bg: '#F3E8FF', color: '#5B21B6' },
    { num: 2, title: 'Complete Daily Activities', desc: 'Check-in once daily (+10 pts), watch 10 sponsored video ads (+10 pts/ad), and play the Spin Wheel (+50 to +1000 pts).', icon: Calendar, bg: '#DCFCE7', color: '#16A34A' },
    { num: 3, title: 'Track Wallet Balance', desc: 'Watch your reward points grow in real-time with automatic rupee conversion calculation (10 Points = ₹1).', icon: Film, bg: '#FEF3C7', color: '#D97706' },
    { num: 4, title: 'Redeem Gift Vouchers', desc: 'Select from PhonePe, Flipkart, Amazon Pay & Google Play gift vouchers. Submit redemption and receive your code!', icon: Gift, bg: '#FCE7F3', color: '#DB2777' }
  ];

  return (
    <div style={{ background: '#F4F3F8', color: '#1E1B4B', minHeight: '100vh', padding: '40px 16px', width: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', fontWeight: 800, marginBottom: '12px', color: '#1E1B4B' }}>
            How <span style={{ color: '#5B21B6' }}>CashBack Hub</span> Works
          </h1>
          <p style={{ color: '#6B7280', fontSize: 'clamp(0.95rem, 3vw, 1.15rem)', fontWeight: 500 }}>4 simple steps to turn daily app interactions into real gift vouchers</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.num} className="card-white" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', width: '100%', boxSizing: 'border-box' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: step.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon color={step.color} size={26} />
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ color: '#22C55E', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>STEP 0{step.num}</div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1E1B4B', marginBottom: '4px' }}>{step.title}</h3>
                  <p style={{ color: '#6B7280', lineHeight: 1.5, fontSize: '0.875rem' }}>{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
