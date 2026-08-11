import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, Sparkles, ArrowRight, Smartphone, Zap, Star, ShieldCheck, CheckCircle2, TrendingUp, Users, Award, Play } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [calcPoints, setCalcPoints] = useState(2500);

  const rupeeVal = (calcPoints / 10).toFixed(2);

  const presets = [500, 1000, 2500, 5000, 10000];

  return (
    <div style={{ background: '#F4F3F8', color: '#1E1B4B', minHeight: '100vh', overflowX: 'hidden' }}>
      
      {/* 1. HERO SECTION WITH VIBRANT LIGHT GRADIENT */}
      <section style={{
        padding: '90px 24px 70px 24px',
        background: 'radial-gradient(circle at 50% 0%, #E9D5FF 0%, #F4F3F8 60%)',
        position: 'relative'
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          
          {/* Welcome Badge Tag */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#FFFFFF',
            border: '1px solid #BBF7D0',
            padding: '8px 22px',
            borderRadius: '30px',
            color: '#15803D',
            fontSize: '0.875rem',
            fontWeight: 800,
            marginBottom: '28px',
            boxShadow: '0 4px 16px rgba(34, 197, 94, 0.12)'
          }}>
            <Sparkles size={16} color="#22C55E" />
            <span>🎁 GET +100 FREE BONUS POINTS ON SIGNUP</span>
          </div>

          {/* Main Hero Headline */}
          <h1 style={{
            fontSize: '3.6rem',
            fontWeight: 800,
            lineHeight: 1.12,
            marginBottom: '24px',
            color: '#1E1B4B',
            letterSpacing: '-1px'
          }}>
            Turn Your Daily Check-Ins & Ads Into <br />
            <span style={{
              background: 'linear-gradient(135deg, #5B21B6 0%, #7C3AED 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Real Cash & Instant Gift Vouchers!
            </span>
          </h1>

          <p style={{
            color: '#4B5563',
            fontSize: '1.25rem',
            maxWidth: '760px',
            margin: '0 auto 40px auto',
            lineHeight: 1.6,
            fontWeight: 500
          }}>
            India’s most rewarding platform. Mark attendance daily, watch sponsored videos, spin the wheel, and cash out points for PhonePe, Flipkart, Amazon Pay & Google Play codes instantly.
          </p>

          {/* Dual Action Buttons */}
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '60px' }}>
            <button onClick={() => navigate('/signup')} className="btn-green" style={{ padding: '16px 40px', fontSize: '1.1rem', borderRadius: '30px', boxShadow: '0 8px 25px rgba(34, 197, 94, 0.35)' }}>
              Start Earning Now <ArrowRight size={20} />
            </button>
            <button onClick={() => navigate('/how-it-works')} className="btn-violet" style={{ padding: '16px 36px', fontSize: '1.1rem', borderRadius: '30px', boxShadow: '0 8px 25px rgba(91, 33, 182, 0.2)' }}>
              How It Works
            </button>
          </div>

          {/* Floating Live Stats Counter Bar */}
          <div className="card-white" style={{
            padding: '24px 32px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '24px',
            maxWidth: '960px',
            margin: '0 auto',
            textAlign: 'center'
          }}>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#5B21B6' }}>₹10,00,000+</div>
              <div style={{ color: '#6B7280', fontSize: '0.85rem', fontWeight: 700, marginTop: '2px' }}>Total Rupee Value Paid</div>
            </div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#22C55E' }}>50,000+</div>
              <div style={{ color: '#6B7280', fontSize: '0.85rem', fontWeight: 700, marginTop: '2px' }}>Active Daily Users</div>
            </div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#5B21B6' }}>100% Verified</div>
              <div style={{ color: '#6B7280', fontSize: '0.85rem', fontWeight: 700, marginTop: '2px' }}>Instant Voucher Delivery</div>
            </div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#F59E0B' }}>4.9 ★★★★★</div>
              <div style={{ color: '#6B7280', fontSize: '0.85rem', fontWeight: 700, marginTop: '2px' }}>User Satisfaction</div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. INTERACTIVE POINTS CONVERSION CALCULATOR */}
      <section style={{ padding: '60px 24px', maxWidth: '1000px', margin: '0 auto' }}>
        <div className="card-white" style={{ padding: '40px 32px', position: 'relative', overflow: 'hidden' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ display: 'inline-flex', padding: '6px 16px', borderRadius: '20px', background: '#F3E8FF', color: '#5B21B6', fontSize: '0.8rem', fontWeight: 800, marginBottom: '10px' }}>
              TRANSPARENT VALUE FORMULA
            </div>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#1E1B4B' }}>
              Points to Rupee Conversion Calculator
            </h2>
            <p style={{ color: '#6B7280', fontSize: '1rem', fontWeight: 600, marginTop: '6px' }}>
              Standard Exchange Rate: <span style={{ color: '#5B21B6', fontWeight: 800 }}>10 Points = ₹1.00</span>
            </p>
          </div>

          {/* Quick Preset Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '28px' }}>
            {presets.map(val => (
              <button
                key={val}
                onClick={() => setCalcPoints(val)}
                style={{
                  background: calcPoints === val ? '#5B21B6' : '#F4F3F8',
                  color: calcPoints === val ? '#FFFFFF' : '#5B21B6',
                  border: '1px solid #EDE9FE',
                  padding: '8px 18px',
                  borderRadius: '20px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {val.toLocaleString()} Pts
              </button>
            ))}
          </div>

          {/* Range Slider */}
          <div style={{ marginBottom: '36px', padding: '0 10px' }}>
            <input
              type="range"
              min="500"
              max="20000"
              step="500"
              value={calcPoints}
              onChange={(e) => setCalcPoints(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: '#22C55E', height: '10px', borderRadius: '5px', cursor: 'pointer' }}
            />
          </div>

          {/* Value Display Box */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            
            <div style={{ background: '#F8F7FC', padding: '20px 36px', borderRadius: '20px', border: '1px solid #E5E7EB', textAlign: 'center', flex: 1, minWidth: '220px' }}>
              <span style={{ color: '#6B7280', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.5px' }}>YOUR ACCUMULATED POINTS</span>
              <div style={{ color: '#5B21B6', fontSize: '2.4rem', fontWeight: 800, marginTop: '4px' }}>{calcPoints.toLocaleString()} Pts</div>
            </div>

            <div style={{ fontSize: '2rem', color: '#22C55E', fontWeight: 800 }}>=</div>

            <div style={{ background: '#DCFCE7', padding: '20px 36px', borderRadius: '20px', border: '2px solid #22C55E', textAlign: 'center', flex: 1, minWidth: '220px' }}>
              <span style={{ color: '#15803D', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.5px' }}>REAL MONEY VALUE</span>
              <div style={{ color: '#16A34A', fontSize: '2.4rem', fontWeight: 800, marginTop: '4px' }}>₹{rupeeVal}</div>
            </div>

          </div>

          {/* Eligible Vouchers Preview */}
          <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #F3F4F6', textAlign: 'center' }}>
            <span style={{ color: '#6B7280', fontSize: '0.85rem', fontWeight: 700 }}>Eligible for Redemption: </span>
            <span style={{ background: '#F3E8FF', color: '#5B21B6', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 800, marginLeft: '8px' }}>PhonePe Vouchers</span>
            <span style={{ background: '#DCFCE7', color: '#15803D', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 800, marginLeft: '6px' }}>Amazon Pay Gift Cards</span>
            <span style={{ background: '#FEF3C7', color: '#D97706', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 800, marginLeft: '6px' }}>Flipkart Code</span>
          </div>

        </div>
      </section>

      {/* 3. 4-STEP REWARD ENGINE */}
      <section style={{ padding: '60px 24px', maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#1E1B4B' }}>How You Earn Daily Rewards</h2>
          <p style={{ color: '#6B7280', fontSize: '1.1rem', marginTop: '8px', fontWeight: 500 }}>Four effortless daily activities designed for maximum payout.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
          
          <div className="card-white" style={{ padding: '32px 24px', textAlign: 'center', position: 'relative' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: '#DCFCE7', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <Zap color="#16A34A" size={30} />
            </div>
            <div style={{ color: '#22C55E', fontWeight: 800, fontSize: '0.8rem', marginBottom: '6px' }}>STEP 01</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1E1B4B', marginBottom: '10px' }}>Daily Attendance</h3>
            <p style={{ color: '#6B7280', fontSize: '0.9rem', lineHeight: 1.6 }}>1-click daily check-in. Earn +10 points instantly every single day.</p>
          </div>

          <div className="card-white" style={{ padding: '32px 24px', textAlign: 'center', position: 'relative' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: '#FFEDD5', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <Play color="#EA580C" size={30} />
            </div>
            <div style={{ color: '#EA580C', fontWeight: 800, fontSize: '0.8rem', marginBottom: '6px' }}>STEP 02</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1E1B4B', marginBottom: '10px' }}>Watch Video Ads</h3>
            <p style={{ color: '#6B7280', fontSize: '0.9rem', lineHeight: 1.6 }}>Watch up to 10 short video ads daily and earn 10 points per completed ad.</p>
          </div>

          <div className="card-white" style={{ padding: '32px 24px', textAlign: 'center', position: 'relative' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: '#FCE7F3', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <Sparkles color="#DB2777" size={30} />
            </div>
            <div style={{ color: '#DB2777', fontWeight: 800, fontSize: '0.8rem', marginBottom: '6px' }}>STEP 03</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1E1B4B', marginBottom: '10px' }}>Lucky Spin Wheel</h3>
            <p style={{ color: '#6B7280', fontSize: '0.9rem', lineHeight: 1.6 }}>Spin our daily wheel of fortune and win up to 1,000 reward points in one spin!</p>
          </div>

          <div className="card-white" style={{ padding: '32px 24px', textAlign: 'center', position: 'relative' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: '#F3E8FF', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <Gift color="#5B21B6" size={30} />
            </div>
            <div style={{ color: '#5B21B6', fontWeight: 800, fontSize: '0.8rem', marginBottom: '6px' }}>STEP 04</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1E1B4B', marginBottom: '10px' }}>Instant Vouchers</h3>
            <p style={{ color: '#6B7280', fontSize: '0.9rem', lineHeight: 1.6 }}>Redeem eligible balance for PhonePe, Flipkart & Amazon gift voucher codes.</p>
          </div>

        </div>
      </section>

      {/* 4. FINAL HIGH-CONVERTING HERO CTA BANNER */}
      <section style={{ padding: '60px 24px 90px 24px' }}>
        <div className="card-violet-banner" style={{
          maxWidth: '1050px',
          margin: '0 auto',
          padding: '56px 40px',
          textAlign: 'center',
          position: 'relative'
        }}>
          <h2 style={{ fontSize: '2.8rem', fontWeight: 800, marginBottom: '16px' }}>
            Join 50,000+ Happy Earners Today!
          </h2>
          <p style={{ fontSize: '1.2rem', opacity: 0.95, maxWidth: '640px', margin: '0 auto 32px auto', lineHeight: 1.6 }}>
            Create your account in under 30 seconds and receive your instant 100 Welcome Points right into your wallet.
          </p>
          
          <button onClick={() => navigate('/signup')} className="btn-green" style={{
            padding: '18px 48px',
            fontSize: '1.15rem',
            borderRadius: '30px',
            boxShadow: '0 8px 30px rgba(34, 197, 94, 0.4)'
          }}>
            Claim My +100 Bonus Points <ArrowRight size={22} />
          </button>
        </div>
      </section>

    </div>
  );
}
