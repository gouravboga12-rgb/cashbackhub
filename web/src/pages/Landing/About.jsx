import React from 'react';
import { Target, Eye, ShieldCheck, Award } from 'lucide-react';

export default function About() {
  return (
    <div style={{ background: '#0E0B1F', color: '#FFF', minHeight: '100vh', padding: '60px 24px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '16px' }}>About <span style={{ color: '#4ADE80' }}>CashBack Hub</span></h1>
          <p style={{ color: '#C4B5FD', fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto' }}>
            Empowering everyday digital users in India by turning simple daily app interactions into real monetary rewards.
          </p>
        </div>

        {/* Vision & Mission Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', marginBottom: '60px' }}>
          <div className="glass-card-dark" style={{ padding: '36px' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(124, 58, 237, 0.2)', border: '1px solid #7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <Eye color="#A78BFA" size={28} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFF', marginBottom: '12px' }}>Our Vision</h2>
            <p style={{ color: '#C4B5FD', lineHeight: 1.7 }}>
              To become India's most trusted daily rewards ecosystem, delivering transparent, gamified passive earnings and instant digital gift voucher fulfillments for millions of users.
            </p>
          </div>

          <div className="glass-card-dark" style={{ padding: '36px' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(34, 197, 94, 0.2)', border: '1px solid #22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <Target color="#4ADE80" size={28} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFF', marginBottom: '12px' }}>Our Mission</h2>
            <p style={{ color: '#C4B5FD', lineHeight: 1.7 }}>
              To connect advertisers and consumers through a fair, transparent reward distribution platform where every daily check-in, video watch, and spin delivers real value.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
