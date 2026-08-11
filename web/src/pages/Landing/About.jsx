import React from 'react';
import { Target, Eye } from 'lucide-react';

export default function About() {
  return (
    <div style={{ background: '#F4F3F8', color: '#1E1B4B', minHeight: '100vh', padding: '40px 16px', width: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', fontWeight: 800, marginBottom: '12px', color: '#1E1B4B' }}>
            About <span style={{ color: '#5B21B6' }}>CashBack Hub</span>
          </h1>
          <p style={{ color: '#4B5563', fontSize: 'clamp(0.95rem, 3vw, 1.15rem)', maxWidth: '700px', margin: '0 auto', fontWeight: 500, lineHeight: 1.5 }}>
            Empowering everyday digital users in India by turning simple daily app interactions into real monetary rewards.
          </p>
        </div>

        {/* Vision & Mission Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '40px', width: '100%' }}>
          <div className="card-white" style={{ padding: '24px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Eye color="#5B21B6" size={24} />
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1E1B4B', marginBottom: '10px' }}>Our Vision</h2>
            <p style={{ color: '#6B7280', lineHeight: 1.6, fontSize: '0.9rem' }}>
              To become India's most trusted daily rewards ecosystem, delivering transparent, gamified passive earnings and instant digital gift voucher fulfillments for millions of users.
            </p>
          </div>

          <div className="card-white" style={{ padding: '24px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Target color="#16A34A" size={24} />
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1E1B4B', marginBottom: '10px' }}>Our Mission</h2>
            <p style={{ color: '#6B7280', lineHeight: 1.6, fontSize: '0.9rem' }}>
              To connect advertisers and consumers through a fair, transparent reward distribution platform where every daily check-in, video watch, and spin delivers real value.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
