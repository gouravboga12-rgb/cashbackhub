import React, { useState } from 'react';
import { Gift, Calendar, ArrowLeft, Clock, Sparkles, CheckCircle2, UserCheck, ChevronRight, Zap, ShieldCheck, Home, User, Pointer } from 'lucide-react';
import api from '../api';

export default function AttendanceModal({ user, wallet, onClaimSuccess }) {
  const [claiming, setClaiming] = useState(false);
  const [claimedState, setClaimedState] = useState(false);

  const handleClaim = async () => {
    if (claiming || claimedState) return;
    setClaiming(true);

    try {
      // Backend check-in call
      await api.post('/attendance/check-in');
    } catch (err) {
      console.warn('Backend attendance check-in offline, executing client fallback.');
    }

    // Client-side wallet update
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const userId = user?.id || 'demo_user';
      localStorage.setItem(`cashback_attendance_claimed_${userId}_${todayStr}`, 'true');

      const savedWallet = localStorage.getItem('cashback_wallet');
      let walletObj = savedWallet
        ? JSON.parse(savedWallet)
        : { available_points: 2520, total_earned: 3320, total_redeemed: 800 };

      walletObj.available_points += 10;
      walletObj.total_earned += 10;
      localStorage.setItem('cashback_wallet', JSON.stringify(walletObj));
      window.dispatchEvent(new Event('attendance_claimed'));
    } catch (e) {
      console.error('Wallet storage update error:', e);
    }

    setClaimedState(true);
    setClaiming(false);

    // Brief delay so user sees claimed status before closing
    setTimeout(() => {
      onClaimSuccess();
    }, 1000);
  };

  const displayPoints = (wallet?.available_points || 1245).toLocaleString();

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 99999,
      background: 'rgba(11, 8, 25, 0.75)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0',
      boxSizing: 'border-box'
    }}>
      {/* Mobile Screen Container */}
      <div style={{
        maxWidth: '440px',
        width: '100%',
        height: '100vh',
        maxHeight: '100vh',
        background: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 0 50px rgba(0, 0, 0, 0.4)',
        position: 'relative',
        overflowY: 'auto',
        boxSizing: 'border-box'
      }}>

        {/* Top Navbar */}
        <div style={{
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #F3F4F6',
          background: '#FFFFFF',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <button
            type="button"
            onClick={claimedState ? onClaimSuccess : undefined}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '12px',
              border: '1px solid #E5E7EB',
              background: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#1E1B4B'
            }}
          >
            <ArrowLeft size={18} />
          </button>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, #5B21B6 0%, #22C55E 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Gift color="#FFF" size={16} />
            </div>
            <h1 style={{ color: '#1E1B4B', fontSize: '1.25rem', fontWeight: 800, margin: 0, letterSpacing: '-0.3px', lineHeight: 1 }}>
              CashBack<span style={{ color: '#22C55E' }}>Hub</span>
            </h1>
          </div>

          <div style={{ width: '36px' }} />
        </div>

        {/* Scrollable Main Content */}
        <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Your Points Header Card */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #EDE9FE',
            borderRadius: '18px',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 16px rgba(91, 33, 182, 0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* 3D Gold Star Coin Icon */}
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)',
                border: '2px solid #FEF3C7',
                flexShrink: 0
              }}>
                <Sparkles color="#FFFFFF" size={22} />
              </div>

              <div>
                <div style={{ color: '#6B7280', fontSize: '0.725rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Your Points</div>
                <div style={{ color: '#1E1B4B', fontSize: '1.35rem', fontWeight: 800, lineHeight: 1.1 }}>{displayPoints}</div>
                <div style={{ color: '#9CA3AF', fontSize: '0.675rem', fontWeight: 500 }}>Total Balance</div>
              </div>
            </div>

            <div style={{
              background: '#F3E8FF',
              color: '#7C3AED',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.775rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Clock size={13} /> History
            </div>
          </div>

          {/* Heading Section */}
          <div style={{ textAlign: 'center', marginTop: '4px' }}>
            <h2 style={{ color: '#1E1B4B', fontSize: '1.45rem', fontWeight: 800, margin: '0 0 6px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              Mark Attendance <Calendar size={22} color="#7C3AED" />
            </h2>
            <p style={{ color: '#6B7280', fontSize: '0.825rem', fontWeight: 500, margin: 0, lineHeight: 1.4 }}>
              Push the button below to mark your daily attendance and earn <span style={{ color: '#22C55E', fontWeight: 800 }}>10 points</span> instantly!
            </p>
          </div>

          {/* Main Attendance Claim Card (Lavender/Soft Violet Styled like reference) */}
          <div style={{
            background: 'linear-gradient(180deg, #F3E8FF 0%, #FAF5FF 100%)',
            border: '1px solid #EDE9FE',
            borderRadius: '24px',
            padding: '24px 18px',
            textAlign: 'center',
            position: 'relative',
            boxShadow: '0 8px 24px rgba(91, 33, 182, 0.06)'
          }}>

            {/* Top Right Speech Bubble +10 Points */}
            <div style={{
              position: 'absolute',
              top: '14px',
              right: '14px',
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '6px 12px',
              boxShadow: '0 4px 14px rgba(91, 33, 182, 0.12)',
              border: '1px solid #EDE9FE',
              textAlign: 'center',
              lineHeight: 1
            }}>
              <div style={{ color: '#22C55E', fontSize: '1.15rem', fontWeight: 800 }}>+10</div>
              <div style={{ color: '#6B7280', fontSize: '0.65rem', fontWeight: 700 }}>Points</div>
            </div>

            {/* Floating Confetti Shapes Decoration */}
            <div style={{ position: 'absolute', top: '20px', left: '20px', color: '#F59E0B', opacity: 0.8 }}><Sparkles size={16} /></div>
            <div style={{ position: 'absolute', top: '70px', left: '14px', color: '#A855F7', opacity: 0.6 }}>✦</div>
            <div style={{ position: 'absolute', top: '80px', right: '20px', color: '#3B82F6', opacity: 0.6 }}>✦</div>

            {/* Center 3D Pedestal Button Icon */}
            <div style={{
              width: '110px',
              height: '110px',
              borderRadius: '50%',
              background: 'linear-gradient(180deg, #7C3AED 0%, #6D28D9 100%)',
              boxShadow: '0 12px 30px rgba(124, 58, 237, 0.38), inset 0 3px 6px rgba(255, 255, 255, 0.3)',
              border: '6px solid #FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '8px auto 16px auto'
            }}>
              <UserCheck size={50} color="#FFFFFF" />
            </div>

            {/* Content text */}
            <h3 style={{ color: '#1E1B4B', fontSize: '1.2rem', fontWeight: 800, margin: '0 0 4px 0' }}>
              Ready to Claim?
            </h3>
            <p style={{ color: '#6B7280', fontSize: '0.8rem', fontWeight: 500, margin: '0 0 18px 0' }}>
              Push the button to mark your attendance and get <span style={{ color: '#22C55E', fontWeight: 700 }}>10 points</span>!
            </p>

            {/* Main Gradient Push Button */}
            <button
              type="button"
              onClick={handleClaim}
              disabled={claiming || claimedState}
              style={{
                width: '100%',
                padding: '14px 18px',
                borderRadius: '30px',
                border: 'none',
                background: claimedState
                  ? 'linear-gradient(90deg, #16A34A 0%, #15803D 100%)'
                  : 'linear-gradient(90deg, #2563EB 0%, #1D4ED8 40%, #16A34A 100%)',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '1rem',
                cursor: claiming || claimedState ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 8px 24px rgba(37, 99, 235, 0.35)',
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Pointer size={16} color="#FFF" />
                </div>
                <span>{claimedState ? 'Attendance Marked!' : (claiming ? 'Claiming 10 Points...' : 'Push to Mark Attend')}</span>
              </div>

              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: claimedState ? '#15803D' : '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {claimedState ? <CheckCircle2 size={20} color="#FFF" /> : <ChevronRight size={20} color="#FFF" />}
              </div>
            </button>

            {/* Bottom footnote */}
            <div style={{ marginTop: '12px', color: '#7C3AED', fontSize: '0.725rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <span>✪</span> One push, 10 points in your pocket!
            </div>

          </div>

          {/* Streak Banner */}
          <div style={{
            background: '#F9FAFB',
            border: '1px solid #F3F4F6',
            borderRadius: '16px',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.3rem' }}>🔥</span>
              <div>
                <div style={{ color: '#1E1B4B', fontSize: '0.825rem', fontWeight: 800 }}>Keep your streak going!</div>
                <div style={{ color: '#6B7280', fontSize: '0.725rem', fontWeight: 500 }}>Come back tomorrow for more points.</div>
              </div>
            </div>

            <div style={{
              background: '#F3E8FF',
              color: '#6D28D9',
              padding: '6px 14px',
              borderRadius: '14px',
              fontSize: '0.775rem',
              fontWeight: 800,
              whiteSpace: 'nowrap'
            }}>
              Day 3
            </div>
          </div>

          {/* Feature Badges */}
          <div style={{
            background: '#F8F7FC',
            border: '1px solid #EDE9FE',
            borderRadius: '18px',
            padding: '12px 8px',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '6px',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px' }}>
                <Gift size={16} color="#16A34A" />
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#1E1B4B', lineHeight: 1.1 }}>+100 Bonus</span>
              <span style={{ fontSize: '0.625rem', color: '#6B7280' }}>Join & Earn</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px' }}>
                <Zap size={16} color="#5B21B6" />
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#1E1B4B', lineHeight: 1.1 }}>Instant Rewards</span>
              <span style={{ fontSize: '0.625rem', color: '#6B7280' }}>Get instantly</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px' }}>
                <ShieldCheck size={16} color="#D97706" />
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#1E1B4B', lineHeight: 1.1 }}>100% Safe</span>
              <span style={{ fontSize: '0.625rem', color: '#6B7280' }}>Secure & Trusted</span>
            </div>
          </div>

        </div>

        {/* Bottom Navigation Bar */}
        <div style={{
          padding: '10px 16px 14px 16px',
          background: '#FFFFFF',
          borderTop: '1px solid #F3F4F6',
          display: 'grid',
          gridTemplateColumns: '1fr 2fr 1fr',
          alignItems: 'center',
          gap: '10px',
          position: 'sticky',
          bottom: 0,
          zIndex: 10
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#6B7280', fontSize: '0.65rem', fontWeight: 700 }}>
            <Home size={18} />
            <span>Home</span>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #2563EB 0%, #16A34A 100%)',
            color: '#FFFFFF',
            padding: '8px 12px',
            borderRadius: '24px',
            fontSize: '0.775rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
          }}>
            <UserCheck size={16} />
            <span>Mark Attendance</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#6B7280', fontSize: '0.65rem', fontWeight: 700 }}>
            <User size={18} />
            <span>Profile</span>
          </div>
        </div>

      </div>
    </div>
  );
}
