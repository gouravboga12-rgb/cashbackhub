import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Eye, ShieldCheck, Zap, Award, Users, HeartHandshake, ArrowRight, CheckCircle2, Sparkles, Gift } from 'lucide-react';

export default function About() {
  const navigate = useNavigate();

  const coreValues = [
    {
      icon: Zap,
      bg: '#F3E8FF',
      color: '#5B21B6',
      title: 'Instant Voucher Fulfillment',
      desc: 'Our automated reward engine processes digital gift cards instantly into your account history without delays.'
    },
    {
      icon: ShieldCheck,
      bg: '#DCFCE7',
      color: '#16A34A',
      title: '100% Transparent Formula',
      desc: 'No hidden math or tricky redemption terms. 10 Reward Points always equals exactly ₹1.00 Rupee value.'
    },
    {
      icon: Award,
      bg: '#FEF3C7',
      color: '#D97706',
      title: 'Verified Brand Partners',
      desc: 'We partner directly with leading Indian e-commerce & payment gateways including PhonePe, Flipkart & Amazon Pay.'
    },
    {
      icon: HeartHandshake,
      bg: '#FCE7F3',
      color: '#DB2777',
      title: 'User-First Gamification',
      desc: 'Daily check-in streaks, interactive video ad rewards, and daily spin wheels make passive earning fun and simple.'
    }
  ];

  return (
    <div style={{ background: '#F4F3F8', color: '#1E1B4B', minHeight: '100vh', padding: '36px 14px 60px 14px', width: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
      <div style={{ maxWidth: '1050px', margin: '0 auto', width: '100%' }}>
        
        {/* 1. HERO HEADER SECTION */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#FFFFFF',
            border: '1px solid #E5E7EB',
            padding: '6px 16px',
            borderRadius: '30px',
            color: '#5B21B6',
            fontSize: '0.8rem',
            fontWeight: 800,
            marginBottom: '16px',
            boxShadow: '0 4px 14px rgba(91, 33, 182, 0.08)'
          }}>
            <Sparkles size={14} color="#22C55E" /> INDIA'S #1 DAILY REWARDS PLATFORM
          </div>

          <h1 style={{ fontSize: 'clamp(1.8rem, 5.5vw, 3rem)', fontWeight: 800, marginBottom: '14px', color: '#1E1B4B', lineHeight: 1.2 }}>
            About <span style={{ color: '#5B21B6' }}>CashBack Hub</span>
          </h1>
          <p style={{ color: '#4B5563', fontSize: 'clamp(0.95rem, 3vw, 1.15rem)', maxWidth: '750px', margin: '0 auto', fontWeight: 500, lineHeight: 1.6 }}>
            Empowering everyday digital users in India by turning simple daily app check-ins, sponsored video views, and lucky spins into real cash value and instant digital gift vouchers.
          </p>
        </div>

        {/* 2. VISION & MISSION CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px', width: '100%' }}>
          <div className="card-white" style={{ padding: '28px 24px' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
              <Eye color="#5B21B6" size={26} />
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1E1B4B', marginBottom: '10px' }}>Our Vision</h2>
            <p style={{ color: '#6B7280', lineHeight: 1.6, fontSize: '0.925rem' }}>
              To become India's most trusted and transparent daily rewards ecosystem, delivering seamless passive earnings and instant digital gift voucher fulfillments for millions of users nationwide.
            </p>
          </div>

          <div className="card-white" style={{ padding: '28px 24px' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
              <Target color="#16A34A" size={26} />
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1E1B4B', marginBottom: '10px' }}>Our Mission</h2>
            <p style={{ color: '#6B7280', lineHeight: 1.6, fontSize: '0.925rem' }}>
              To bridge advertisers and consumers through a fair, transparent reward distribution model where every user interaction creates real, measurable value paid out in digital gift codes.
            </p>
          </div>
        </div>

        {/* 3. PLATFORM IMPACT METRICS STRIP */}
        <div className="card-violet-banner" style={{ padding: '24px 20px', marginBottom: '40px', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: 'clamp(1.4rem, 4.5vw, 2.2rem)', fontWeight: 800, color: '#4ADE80' }}>50,000+</div>
              <div style={{ color: '#E9D5FF', fontSize: '0.8rem', fontWeight: 700, marginTop: '2px' }}>Active Users</div>
            </div>
            <div>
              <div style={{ fontSize: 'clamp(1.4rem, 4.5vw, 2.2rem)', fontWeight: 800, color: '#FFFFFF' }}>₹10,00,000+</div>
              <div style={{ color: '#E9D5FF', fontSize: '0.8rem', fontWeight: 700, marginTop: '2px' }}>Rewards Paid</div>
            </div>
            <div>
              <div style={{ fontSize: 'clamp(1.4rem, 4.5vw, 2.2rem)', fontWeight: 800, color: '#4ADE80' }}>100%</div>
              <div style={{ color: '#E9D5FF', fontSize: '0.8rem', fontWeight: 700, marginTop: '2px' }}>Instant Fulfillment</div>
            </div>
            <div>
              <div style={{ fontSize: 'clamp(1.4rem, 4.5vw, 2.2rem)', fontWeight: 800, color: '#FFD700' }}>4.9 ★★★★★</div>
              <div style={{ color: '#E9D5FF', fontSize: '0.8rem', fontWeight: 700, marginTop: '2px' }}>User Satisfaction</div>
            </div>
          </div>
        </div>

        {/* 4. CORE PLATFORM PILLARS (4 CARDS) */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h2 style={{ fontSize: 'clamp(1.4rem, 4.5vw, 2.2rem)', fontWeight: 800, color: '#1E1B4B' }}>Why Millions Trust CashBack Hub</h2>
            <p style={{ color: '#6B7280', fontSize: '0.9rem', marginTop: '4px', fontWeight: 500 }}>Built on transparency, instant delivery, and verified merchant redemptions.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '16px', width: '100%' }}>
            {coreValues.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div key={idx} className="card-white" style={{ padding: '22px 18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IconComp color={item.color} size={24} />
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E1B4B', margin: 0 }}>{item.title}</h3>
                  <p style={{ color: '#6B7280', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. CALL TO ACTION BANNER */}
        <div className="card-white" style={{ padding: '32px 24px', textAlign: 'center', border: '2px solid #EDE9FE', background: 'linear-gradient(135deg, #FFFFFF 0%, #F8F7FC 100%)' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
            <Gift color="#16A34A" size={28} />
          </div>
          <h2 style={{ fontSize: 'clamp(1.4rem, 4.5vw, 2.2rem)', fontWeight: 800, color: '#1E1B4B', marginBottom: '8px' }}>
            Ready to Start Earning Daily Rewards?
          </h2>
          <p style={{ color: '#6B7280', fontSize: '0.95rem', maxWidth: '600px', margin: '0 auto 24px auto', lineHeight: 1.5 }}>
            Create your free CashBack Hub account today and claim your instant +100 Welcome Points bonus.
          </p>

          <button onClick={() => navigate('/signup')} className="btn-green" style={{ padding: '12px 28px', fontSize: '0.95rem', borderRadius: '20px', boxShadow: '0 8px 24px rgba(34, 197, 94, 0.3)' }}>
            Get Started Now (+100 Bonus Pts) <ArrowRight size={18} />
          </button>
        </div>

      </div>
    </div>
  );
}
