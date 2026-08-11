import React from 'react';
import { Target, Eye } from 'lucide-react';

export default function About() {
  return (
    <div style={{ background: '#F4F3F8', color: '#1E1B4B', minHeight: '100vh', padding: '60px 24px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '16px', color: '#1E1B4B' }}>
            About <span style={{ color: '#5B21B6' }}>CashBack Hub</span>
          </h1>
          <p style={{ color: '#4B5563', fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto', fontWeight: 500 }}>
            Empowering everyday digital users in India by turning simple daily app interactions into real monetary rewards.
          </p>
        </div>

        {/* Vision & Mission Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', marginBottom: '60px' }}>
          <div className="card-white" style={{ padding: '36px' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <Eye color="#5B21B6" size={28} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E1B4B', marginBottom: '12px' }}>Our Vision</h2>
            <p style={{ color: '#6B7280', lineHeight: 1.7 }}>
              To become India's most trusted daily rewards ecosystem, delivering transparent, gamified passive earnings and instant digital gift voucher fulfillments for millions of users.
            </p>
          </div>

          <div className="card-white" style={{ padding: '36px' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <Target color="#16A34A" size={28} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E1B4B', marginBottom: '12px' }}>Our Mission</h2>
            <p style={{ color: '#6B7280', lineHeight: 1.7 }}>
              To connect advertisers and consumers through a fair, transparent reward distribution platform where every daily check-in, video watch, and spin delivers real value.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
