import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, Sparkles, ArrowRight, Smartphone, Zap, Star } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [calcPoints, setCalcPoints] = useState(2500);

  const rupeeVal = (calcPoints / 10).toFixed(2);

  return (
    <div style={{ background: '#F4F3F8', color: '#1E1B4B', minHeight: '100vh' }}>
      
      {/* HERO SECTION */}
      <section style={{ padding: '80px 24px 60px 24px', background: 'linear-gradient(180deg, #EDE9FE 0%, #F4F3F8 100%)', textAlign: 'center' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#DCFCE7', border: '1px solid #BBF7D0', padding: '6px 18px', borderRadius: '30px', color: '#15803D', fontSize: '0.875rem', fontWeight: 800, marginBottom: '24px' }}>
            <Sparkles size={16} /> INDIA'S #1 REWARDS PLATFORM
          </div>

          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.15, marginBottom: '20px', color: '#1E1B4B' }}>
            Turn Daily Check-Ins & Ads Into <br />
            <span style={{ color: '#5B21B6' }}>
              Real Cash & Gift Vouchers!
            </span>
          </h1>

          <p style={{ color: '#4B5563', fontSize: '1.2rem', maxWidth: '720px', margin: '0 auto 36px auto', lineHeight: 1.6, fontWeight: 500 }}>
            Complete simple daily activities, watch sponsored videos, spin the lucky wheel, and redeem your accumulated points for PhonePe, Flipkart, Amazon & Google Play vouchers instantly.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/signup')} className="btn-green" style={{ padding: '16px 36px', fontSize: '1.1rem', borderRadius: '30px' }}>
              Start Earning Now <ArrowRight size={20} />
            </button>
            <button onClick={() => navigate('/how-it-works')} className="btn-violet" style={{ padding: '16px 36px', fontSize: '1.1rem', borderRadius: '30px' }}>
              See How It Works
            </button>
          </div>

        </div>
      </section>

      {/* REWARD CALCULATOR SECTION */}
      <section style={{ padding: '40px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '36px', textAlign: 'center' }} className="card-white">
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1E1B4B', marginBottom: '8px' }}>
            🧮 Points to Rupee Conversion Calculator
          </h2>
          <p style={{ color: '#6B7280', fontSize: '0.95rem', marginBottom: '28px', fontWeight: 600 }}>
            Base conversion rate: <strong style={{ color: '#5B21B6' }}>10 Points = ₹1.00</strong>
          </p>

          <div style={{ marginBottom: '24px' }}>
            <input
              type="range"
              min="500"
              max="10000"
              step="500"
              value={calcPoints}
              onChange={(e) => setCalcPoints(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: '#22C55E', height: '8px', borderRadius: '4px', cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ background: '#F8F7FC', padding: '16px 32px', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
              <span style={{ color: '#6B7280', fontSize: '0.85rem', fontWeight: 700 }}>YOUR REWARD POINTS</span>
              <div style={{ color: '#5B21B6', fontSize: '2rem', fontWeight: 800 }}>{calcPoints.toLocaleString()} Pts</div>
            </div>
            <div style={{ fontSize: '2rem', color: '#22C55E', fontWeight: 800 }}>=</div>
            <div style={{ background: '#F8F7FC', padding: '16px 32px', borderRadius: '16px', border: '1px solid #22C55E' }}>
              <span style={{ color: '#6B7280', fontSize: '0.85rem', fontWeight: 700 }}>RUPEE VALUE</span>
              <div style={{ color: '#22C55E', fontSize: '2rem', fontWeight: 800 }}>₹{rupeeVal}</div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE HIGHLIGHTS */}
      <section style={{ padding: '60px 24px', maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#1E1B4B' }}>Why Choose CashBack Hub?</h2>
          <p style={{ color: '#6B7280', fontSize: '1.05rem', marginTop: '8px', fontWeight: 500 }}>Engaging, transparent, and built for daily rewards.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          <div className="card-white" style={{ padding: '32px' }}>
            <div style={{ width: '54px', height: '54px', borderRadius: '14px', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <Zap color="#16A34A" size={28} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1E1B4B', marginBottom: '10px' }}>Instant Attendance</h3>
            <p style={{ color: '#6B7280', lineHeight: 1.6 }}>Mark your check-in daily in just 1 click and claim 10 instant reward points credited directly to your wallet.</p>
          </div>

          <div className="card-white" style={{ padding: '32px' }}>
            <div style={{ width: '54px', height: '54px', borderRadius: '14px', background: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <Smartphone color="#5B21B6" size={28} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1E1B4B', marginBottom: '10px' }}>10 Daily Video Ads</h3>
            <p style={{ color: '#6B7280', lineHeight: 1.6 }}>Watch short 15-30 sec sponsored videos. Complete 10 ads daily to collect up to 100 points every single day.</p>
          </div>

          <div className="card-white" style={{ padding: '32px' }}>
            <div style={{ width: '54px', height: '54px', borderRadius: '14px', background: '#FCE7F3', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <Star color="#DB2777" size={28} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1E1B4B', marginBottom: '10px' }}>Gamified Spin Wheel</h3>
            <p style={{ color: '#6B7280', lineHeight: 1.6 }}>Test your luck daily on our 6-slice wheel with point rewards up to 1,000 Points per spin!</p>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section style={{ padding: '60px 24px' }}>
        <div className="card-violet-banner" style={{ maxWidth: '1000px', margin: '0 auto', padding: '48px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '12px' }}>Ready to Claim Your First Reward?</h2>
          <p style={{ fontSize: '1.1rem', opacity: 0.9, marginBottom: '28px' }}>Sign up now and receive 100 Bonus Points instantly in your wallet!</p>
          <button onClick={() => navigate('/signup')} className="btn-green" style={{ padding: '16px 40px', fontSize: '1.1rem', borderRadius: '30px' }}>
            Get 100 Bonus Points Now!
          </button>
        </div>
      </section>

    </div>
  );
}
