import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, Sparkles, ArrowRight, Smartphone, Zap, Star, ShieldCheck, CheckCircle2, TrendingUp, Users, Award, Play } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [calcPoints, setCalcPoints] = useState(2500);

  const rupeeVal = (calcPoints / 10).toFixed(2);
  const presets = [500, 1000, 2500, 5000, 10000];

  return (
    <div style={{ background: '#F4F3F8', color: '#1E1B4B', minHeight: '100vh', width: '100%', overflowX: 'hidden', boxSizing: 'border-box' }}>
      
      {/* 1. HERO SECTION WITH MOBILE FLUID TYPOGRAPHY */}
      <section style={{
        padding: '36px 14px 30px 14px',
        background: 'radial-gradient(circle at 50% 0%, #E9D5FF 0%, #F4F3F8 60%)',
        position: 'relative',
        width: '100%',
        boxSizing: 'border-box',
        overflowX: 'hidden'
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center', width: '100%', boxSizing: 'border-box' }}>
          
          {/* Welcome Badge Tag */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            background: '#FFFFFF',
            border: '1px solid #BBF7D0',
            padding: '6px 14px',
            borderRadius: '30px',
            color: '#15803D',
            fontSize: 'clamp(0.7rem, 2.5vw, 0.825rem)',
            fontWeight: 800,
            marginBottom: '18px',
            boxShadow: '0 4px 16px rgba(34, 197, 94, 0.12)',
            maxWidth: '96%',
            boxSizing: 'border-box'
          }}>
            <Sparkles size={14} color="#22C55E" style={{ flexShrink: 0 }} />
            <span style={{ wordBreak: 'break-word', textAlign: 'center' }}>🎁 GET +100 FREE BONUS POINTS ON SIGNUP</span>
          </div>

          {/* Main Hero Headline */}
          <h1 style={{
            fontSize: 'clamp(1.5rem, 5.5vw, 3.2rem)',
            fontWeight: 800,
            lineHeight: 1.18,
            marginBottom: '16px',
            color: '#1E1B4B',
            letterSpacing: '-0.5px',
            wordBreak: 'break-word',
            width: '100%'
          }}>
            Turn Your Daily Check-Ins & Ads Into <br style={{ display: 'none' }} />
            <span style={{
              background: 'linear-gradient(135deg, #5B21B6 0%, #7C3AED 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'inline-block'
            }}>
              Real Cash & Instant Gift Vouchers!
            </span>
          </h1>

          <p style={{
            color: '#4B5563',
            fontSize: 'clamp(0.875rem, 3vw, 1.15rem)',
            maxWidth: '720px',
            margin: '0 auto 24px auto',
            lineHeight: 1.5,
            fontWeight: 500,
            width: '100%'
          }}>
            India’s most rewarding platform. Mark attendance daily, watch sponsored videos, spin the wheel, and cash out points for PhonePe, Flipkart, Amazon Pay & Google Play codes instantly.
          </p>

          {/* Dual Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '32px', width: '100%' }}>
            <button onClick={() => navigate('/signup')} className="btn-green" style={{ padding: '14px 24px', fontSize: '0.95rem', borderRadius: '25px', boxShadow: '0 8px 25px rgba(34, 197, 94, 0.35)', flex: '1 1 140px', maxWidth: '280px' }}>
              Start Earning Now <ArrowRight size={18} />
            </button>
            <button onClick={() => navigate('/how-it-works')} className="btn-violet" style={{ padding: '14px 24px', fontSize: '0.95rem', borderRadius: '25px', boxShadow: '0 8px 25px rgba(91, 33, 182, 0.2)', flex: '1 1 140px', maxWidth: '280px' }}>
              How It Works
            </button>
          </div>

          {/* Responsive Floating Live Stats Counter Bar */}
          <div className="card-white" style={{
            padding: '16px 10px',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
            maxWidth: '960px',
            margin: '0 auto',
            textAlign: 'center',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <div style={{ padding: '4px' }}>
              <div style={{ fontSize: 'clamp(1.1rem, 4vw, 1.7rem)', fontWeight: 800, color: '#5B21B6' }}>₹10,00,000+</div>
              <div style={{ color: '#6B7280', fontSize: '0.725rem', fontWeight: 700, marginTop: '2px' }}>Total Paid</div>
            </div>
            <div style={{ padding: '4px' }}>
              <div style={{ fontSize: 'clamp(1.1rem, 4vw, 1.7rem)', fontWeight: 800, color: '#22C55E' }}>50,000+</div>
              <div style={{ color: '#6B7280', fontSize: '0.725rem', fontWeight: 700, marginTop: '2px' }}>Active Users</div>
            </div>
            <div style={{ padding: '4px' }}>
              <div style={{ fontSize: 'clamp(1.1rem, 4vw, 1.7rem)', fontWeight: 800, color: '#5B21B6' }}>100% Instant</div>
              <div style={{ color: '#6B7280', fontSize: '0.725rem', fontWeight: 700, marginTop: '2px' }}>Vouchers</div>
            </div>
            <div style={{ padding: '4px' }}>
              <div style={{ fontSize: 'clamp(1.1rem, 4vw, 1.7rem)', fontWeight: 800, color: '#F59E0B' }}>4.9 ★★★★★</div>
              <div style={{ color: '#6B7280', fontSize: '0.725rem', fontWeight: 700, marginTop: '2px' }}>Rating</div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. INTERACTIVE POINTS CONVERSION CALCULATOR */}
      <section style={{ padding: '32px 14px', maxWidth: '1000px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        <div className="card-white" style={{ padding: '24px 14px', position: 'relative', overflow: 'hidden', width: '100%', boxSizing: 'border-box' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'inline-flex', padding: '4px 10px', borderRadius: '20px', background: '#F3E8FF', color: '#5B21B6', fontSize: '0.7rem', fontWeight: 800, marginBottom: '6px' }}>
              TRANSPARENT VALUE FORMULA
            </div>
            <h2 style={{ fontSize: 'clamp(1.2rem, 4vw, 2rem)', fontWeight: 800, color: '#1E1B4B' }}>
              Points to Rupee Calculator
            </h2>
            <p style={{ color: '#6B7280', fontSize: '0.85rem', fontWeight: 600, marginTop: '2px' }}>
              Exchange Rate: <span style={{ color: '#5B21B6', fontWeight: 800 }}>10 Points = ₹1.00</span>
            </p>
          </div>

          {/* Quick Preset Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '20px', width: '100%' }}>
            {presets.map(val => (
              <button
                key={val}
                onClick={() => setCalcPoints(val)}
                style={{
                  background: calcPoints === val ? '#5B21B6' : '#F4F3F8',
                  color: calcPoints === val ? '#FFFFFF' : '#5B21B6',
                  border: '1px solid #EDE9FE',
                  padding: '6px 12px',
                  borderRadius: '16px',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {val.toLocaleString()} Pts
              </button>
            ))}
          </div>

          {/* Range Slider */}
          <div style={{ marginBottom: '24px', padding: '0 2px', width: '100%' }}>
            <input
              type="range"
              min="500"
              max="20000"
              step="500"
              value={calcPoints}
              onChange={(e) => setCalcPoints(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: '#22C55E', height: '8px', borderRadius: '4px', cursor: 'pointer' }}
            />
          </div>

          {/* Value Display Box */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', flexWrap: 'wrap', width: '100%' }}>
            
            <div style={{ background: '#F8F7FC', padding: '14px 16px', borderRadius: '14px', border: '1px solid #E5E7EB', textAlign: 'center', flex: '1 1 120px', minWidth: '120px' }}>
              <span style={{ color: '#6B7280', fontSize: '0.7rem', fontWeight: 800 }}>YOUR POINTS</span>
              <div style={{ color: '#5B21B6', fontSize: 'clamp(1.3rem, 4.5vw, 2.2rem)', fontWeight: 800, marginTop: '2px' }}>{calcPoints.toLocaleString()} Pts</div>
            </div>

            <div style={{ fontSize: '1.4rem', color: '#22C55E', fontWeight: 800 }}>=</div>

            <div style={{ background: '#DCFCE7', padding: '14px 16px', borderRadius: '14px', border: '2px solid #22C55E', textAlign: 'center', flex: '1 1 120px', minWidth: '120px' }}>
              <span style={{ color: '#15803D', fontSize: '0.7rem', fontWeight: 800 }}>RUPEE VALUE</span>
              <div style={{ color: '#16A34A', fontSize: 'clamp(1.3rem, 4.5vw, 2.2rem)', fontWeight: 800, marginTop: '2px' }}>₹{rupeeVal}</div>
            </div>

          </div>

          {/* Eligible Vouchers Preview */}
          <div style={{ marginTop: '20px', paddingTop: '14px', borderTop: '1px solid #F3F4F6', textAlign: 'center', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px' }}>
            <span style={{ color: '#6B7280', fontSize: '0.75rem', fontWeight: 700, width: '100%', marginBottom: '2px' }}>Eligible Voucher Rewards: </span>
            <span style={{ background: '#F3E8FF', color: '#5B21B6', padding: '4px 8px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 800 }}>PhonePe</span>
            <span style={{ background: '#DCFCE7', color: '#15803D', padding: '4px 8px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 800 }}>Amazon Pay</span>
            <span style={{ background: '#FEF3C7', color: '#D97706', padding: '4px 8px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 800 }}>Flipkart</span>
          </div>

        </div>
      </section>

      {/* 3. 4-STEP REWARD ENGINE */}
      <section style={{ padding: '32px 14px', maxWidth: '1280px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: 'clamp(1.3rem, 4vw, 2.2rem)', fontWeight: 800, color: '#1E1B4B' }}>How You Earn Daily Rewards</h2>
          <p style={{ color: '#6B7280', fontSize: '0.85rem', marginTop: '4px', fontWeight: 500 }}>Four simple daily activities for maximum payout.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', width: '100%' }}>
          
          <div className="card-white" style={{ padding: '20px 14px', textAlign: 'center' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: '#DCFCE7', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
              <Zap color="#16A34A" size={24} />
            </div>
            <div style={{ color: '#22C55E', fontWeight: 800, fontSize: '0.7rem', marginBottom: '2px' }}>STEP 01</div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1E1B4B', marginBottom: '6px' }}>Daily Attendance</h3>
            <p style={{ color: '#6B7280', fontSize: '0.8rem', lineHeight: 1.4 }}>1-click daily check-in. Earn +10 points instantly every day.</p>
          </div>

          <div className="card-white" style={{ padding: '20px 14px', textAlign: 'center' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: '#FFEDD5', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
              <Play color="#EA580C" size={24} />
            </div>
            <div style={{ color: '#EA580C', fontWeight: 800, fontSize: '0.7rem', marginBottom: '2px' }}>STEP 02</div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1E1B4B', marginBottom: '6px' }}>Watch Video Ads</h3>
            <p style={{ color: '#6B7280', fontSize: '0.8rem', lineHeight: 1.4 }}>Watch 10 short video ads daily and earn 10 points per ad.</p>
          </div>

          <div className="card-white" style={{ padding: '20px 14px', textAlign: 'center' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: '#FCE7F3', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
              <Sparkles color="#DB2777" size={24} />
            </div>
            <div style={{ color: '#DB2777', fontWeight: 800, fontSize: '0.7rem', marginBottom: '2px' }}>STEP 03</div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1E1B4B', marginBottom: '6px' }}>Lucky Spin Wheel</h3>
            <p style={{ color: '#6B7280', fontSize: '0.8rem', lineHeight: 1.4 }}>Spin our daily wheel of fortune and win up to 1,000 points in one spin!</p>
          </div>

          <div className="card-white" style={{ padding: '20px 14px', textAlign: 'center' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: '#F3E8FF', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
              <Gift color="#5B21B6" size={24} />
            </div>
            <div style={{ color: '#5B21B6', fontWeight: 800, fontSize: '0.7rem', marginBottom: '2px' }}>STEP 04</div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1E1B4B', marginBottom: '6px' }}>Instant Vouchers</h3>
            <p style={{ color: '#6B7280', fontSize: '0.8rem', lineHeight: 1.4 }}>Redeem eligible balance for PhonePe, Flipkart & Amazon vouchers.</p>
          </div>

        </div>
      </section>

      {/* 4. FINAL HIGH-CONVERTING HERO CTA BANNER */}
      <section style={{ padding: '32px 14px 50px 14px', width: '100%', boxSizing: 'border-box' }}>
        <div className="card-violet-banner" style={{
          maxWidth: '1050px',
          margin: '0 auto',
          padding: '32px 16px',
          textAlign: 'center',
          position: 'relative',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <h2 style={{ fontSize: 'clamp(1.3rem, 4.5vw, 2.4rem)', fontWeight: 800, marginBottom: '10px' }}>
            Join 50,000+ Happy Earners Today!
          </h2>
          <p style={{ fontSize: 'clamp(0.85rem, 3vw, 1.1rem)', opacity: 0.95, maxWidth: '640px', margin: '0 auto 20px auto', lineHeight: 1.4 }}>
            Create your account in under 30 seconds and receive your instant 100 Welcome Points right into your wallet.
          </p>
          
          <button onClick={() => navigate('/signup')} className="btn-green" style={{
            padding: '14px 28px',
            fontSize: '0.95rem',
            borderRadius: '25px',
            boxShadow: '0 8px 30px rgba(34, 197, 94, 0.4)',
            maxWidth: '100%'
          }}>
            Claim My +100 Bonus Points <ArrowRight size={18} />
          </button>
        </div>
      </section>

    </div>
  );
}
