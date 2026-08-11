import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, Sparkles, CheckCircle, ShieldCheck, ArrowRight, DollarSign, Smartphone, Zap, Star } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [calcPoints, setCalcPoints] = useState(2500);

  const rupeeVal = (calcPoints / 10).toFixed(2);

  return (
    <div style={{ background: '#0E0B1F', color: '#FFF', minHeight: '100vh' }}>
      
      {/* HERO SECTION */}
      <section style={{ padding: '80px 24px 60px 24px', background: 'radial-gradient(circle at top center, rgba(124, 58, 237, 0.35) 0%, rgba(14, 11, 31, 1) 70%)', textAlignment: 'center' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(124, 58, 237, 0.2)', border: '1px solid rgba(167, 139, 250, 0.4)', padding: '6px 16px', borderRadius: '30px', color: '#4ADE80', fontSize: '0.875rem', fontWeight: 700, marginBottom: '24px' }}>
            <Sparkles size={16} /> INDIA'S #1 REWARDS PLATFORM
          </div>

          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.15, marginBottom: '20px', textShadow: '0 4px 20px rgba(124, 58, 237, 0.5)' }}>
            Turn Daily Check-Ins & Ads Into <br />
            <span style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #4ADE80 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Real Cash & Gift Vouchers!
            </span>
          </h1>

          <p style={{ color: '#C4B5FD', fontSize: '1.25rem', maxWidth: '720px', margin: '0 auto 36px auto', lineHeight: 1.6 }}>
            Complete simple daily activities, watch sponsored videos, spin the lucky wheel, and redeem your accumulated points for PhonePe, Flipkart, Amazon & Google Play vouchers instantly.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/signup')} className="btn-green" style={{ padding: '16px 36px', fontSize: '1.1rem', borderRadius: '30px' }}>
              Start Earning Now <ArrowRight size={20} />
            </button>
            <button onClick={() => navigate('/how-it-works')} className="btn-primary" style={{ padding: '16px 36px', fontSize: '1.1rem', borderRadius: '30px', background: 'rgba(255,255,255,0.1)', border: '1px solid #7C3AED' }}>
              See How It Works
            </button>
          </div>

        </div>
      </section>

      {/* REWARD CALCULATOR SECTION */}
      <section style={{ padding: '40px 24px', background: '#1A1033' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }} className="glass-card-dark">
          <div style={{ padding: '36px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFF', marginBottom: '8px' }}>
              🧮 Points to Rupee Conversion Calculator
            </h2>
            <p style={{ color: '#C4B5FD', fontSize: '0.95rem', marginBottom: '28px' }}>Base rate: <strong>10 Points = ₹1.00</strong></p>

            <div style={{ marginBottom: '24px' }}>
              <input
                type="range"
                min="500"
                max="10000"
                step="500"
                value={calcPoints}
                onChange={(e) => setCalcPoints(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: '#4ADE80', height: '8px', borderRadius: '4px', cursor: 'pointer' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
              <div style={{ background: '#1E1445', padding: '16px 32px', borderRadius: '16px', border: '1px solid #3B2F6B' }}>
                <span style={{ color: '#C4B5FD', fontSize: '0.85rem' }}>YOUR REWARD POINTS</span>
                <div style={{ color: '#7C3AED', fontSize: '2rem', fontWeight: 800 }}>{calcPoints.toLocaleString()} Pts</div>
              </div>
              <div style={{ fontSize: '2rem', color: '#4ADE80', fontWeight: 800 }}>=</div>
              <div style={{ background: '#1E1445', padding: '16px 32px', borderRadius: '16px', border: '1px solid #22C55E' }}>
                <span style={{ color: '#C4B5FD', fontSize: '0.85rem' }}>RUPEE VALUE</span>
                <div style={{ color: '#4ADE80', fontSize: '2rem', fontWeight: 800 }}>₹{rupeeVal}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE HIGHLIGHTS */}
      <section style={{ padding: '80px 24px', maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#FFF' }}>Why Choose CashBack Hub?</h2>
          <p style={{ color: '#C4B5FD', fontSize: '1.05rem', marginTop: '8px' }}>Engaging, transparent, and built for daily rewards.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          <div className="glass-card-dark" style={{ padding: '32px' }}>
            <div style={{ width: '54px', height: '54px', borderRadius: '14px', background: 'rgba(34, 197, 94, 0.2)', border: '1px solid #22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <Zap color="#4ADE80" size={28} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#FFF', marginBottom: '10px' }}>Instant Attendance</h3>
            <p style={{ color: '#C4B5FD', lineHeight: 1.6 }}>Mark your check-in daily in just 1 click and claim 10 instant reward points credited directly to your wallet.</p>
          </div>

          <div className="glass-card-dark" style={{ padding: '32px' }}>
            <div style={{ width: '54px', height: '54px', borderRadius: '14px', background: 'rgba(124, 58, 237, 0.2)', border: '1px solid #7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <Smartphone color="#A78BFA" size={28} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#FFF', marginBottom: '10px' }}>10 Daily Video Ads</h3>
            <p style={{ color: '#C4B5FD', lineHeight: 1.6 }}>Watch short 15-30 sec sponsored videos. Complete 10 ads daily to collect up to 100 points every single day.</p>
          </div>

          <div className="glass-card-dark" style={{ padding: '32px' }}>
            <div style={{ width: '54px', height: '54px', borderRadius: '14px', background: 'rgba(236, 72, 153, 0.2)', border: '1px solid #EC4899', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <Star color="#F472B6" size={28} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#FFF', marginBottom: '10px' }}>Gamified Spin Wheel</h3>
            <p style={{ color: '#C4B5FD', lineHeight: 1.6 }}>Test your luck daily on our 6-slice wheel with point rewards up to 1,000 Points per spin!</p>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section style={{ padding: '80px 24px', background: 'linear-gradient(135deg, #5B21B6 0%, #22C55E 100%)', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.8rem', fontWeight: 800, color: '#FFF', marginBottom: '16px' }}>Ready to Claim Your First Reward?</h2>
          <p style={{ fontSize: '1.2rem', color: '#E9D5FF', marginBottom: '32px' }}>Sign up now and receive 100 Bonus Points instantly in your wallet!</p>
          <button onClick={() => navigate('/signup')} style={{ background: '#FFF', color: '#5B21B6', border: 'none', padding: '16px 40px', borderRadius: '30px', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}>
            Get 100 Bonus Points Now!
          </button>
        </div>
      </section>

    </div>
  );
}
