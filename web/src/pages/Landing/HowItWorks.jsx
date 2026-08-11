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
    <div style={{ background: '#F4F3F8', color: '#1E1B4B', minHeight: '100vh', padding: '60px 24px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '16px', color: '#1E1B4B' }}>
            How <span style={{ color: '#5B21B6' }}>CashBack Hub</span> Works
          </h1>
          <p style={{ color: '#6B7280', fontSize: '1.2rem', fontWeight: 500 }}>4 simple steps to turn daily app interactions into real gift vouchers</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.num} className="card-white" style={{ padding: '28px', display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: step.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon color={step.color} size={30} />
                </div>
                <div>
                  <div style={{ color: '#22C55E', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase' }}>STEP 0{step.num}</div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1E1B4B', marginBottom: '4px' }}>{step.title}</h3>
                  <p style={{ color: '#6B7280', lineHeight: 1.6 }}>{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
