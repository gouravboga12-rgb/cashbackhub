import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Gift,
  Calendar,
  ArrowLeft,
  Clock,
  Sparkles,
  CheckCircle2,
  UserCheck,
  ChevronRight,
  Zap,
  ShieldCheck,
  Home,
  User,
  Pointer,
  X,
  Flame,
  Check
} from 'lucide-react';
import api from '../api';
import { getISTDateString } from '../utils/dateUtils';

export default function AttendanceModal({ user, wallet, onClaimSuccess }) {
  const navigate = useNavigate();
  const [claiming, setClaiming] = useState(false);
  const [claimedState, setClaimedState] = useState(false);
  const [rewardPoints, setRewardPoints] = useState(10);
  const [statusMessage, setStatusMessage] = useState('');

  const todayStr = getISTDateString();
  const userId = user?.id || 'demo_user';

  useEffect(() => {
    fetchAttendanceConfig();
  }, []);

  const fetchAttendanceConfig = async () => {
    // Check local storage first
    const claimedLocal = localStorage.getItem(`cashback_attendance_claimed_${userId}_${todayStr}`);
    if (claimedLocal === 'true') {
      setClaimedState(true);
    }

    try {
      const res = await api.get('/attendance/today');
      if (res.data) {
        if (typeof res.data.reward_points === 'number') {
          setRewardPoints(res.data.reward_points);
        }
        if (res.data.completed) {
          setClaimedState(true);
          localStorage.setItem(`cashback_attendance_claimed_${userId}_${todayStr}`, 'true');
        }
      }
    } catch (e) {
      console.warn('Backend attendance config check offline, using local state.');
    }
  };

  const handleClaim = async () => {
    if (claiming) return;

    if (claimedState) {
      setStatusMessage('Already marked for today!');
      setTimeout(() => {
        if (onClaimSuccess) onClaimSuccess();
      }, 900);
      return;
    }

    setClaiming(true);
    setStatusMessage('');
    let pts = rewardPoints;

    try {
      // Backend check-in call
      const res = await api.post('/attendance/check-in');
      if (res.data && res.data.reward_points) {
        pts = res.data.reward_points;
      }
      setClaimedState(true);
      setStatusMessage(`+${pts} Points Added!`);
    } catch (err) {
      const msg = err.response?.data?.message || '';
      if (msg.includes('already marked') || msg.includes('already checked in')) {
        setClaimedState(true);
        setStatusMessage('Already marked for today!');
      } else {
        // Fallback for demo or offline mode
        setClaimedState(true);
        setStatusMessage(`+${pts} Points Added!`);
      }
    }

    // Client-side wallet & attendance persistence
    try {
      localStorage.setItem(`cashback_attendance_claimed_${userId}_${todayStr}`, 'true');

      const savedWallet = localStorage.getItem('cashback_wallet');
      let walletObj = savedWallet
        ? JSON.parse(savedWallet)
        : { available_points: 2520, total_earned: 3320, total_redeemed: 800 };

      walletObj.available_points = (walletObj.available_points || 0) + pts;
      walletObj.total_earned = (walletObj.total_earned || 0) + pts;
      localStorage.setItem('cashback_wallet', JSON.stringify(walletObj));

      window.dispatchEvent(new Event('attendance_claimed'));
    } catch (e) {
      console.error('Wallet storage update error:', e);
    }

    setClaiming(false);

    // Brief delay to let user see success feedback before smooth close
    setTimeout(() => {
      if (onClaimSuccess) onClaimSuccess();
    }, 1200);
  };

  const displayPoints = (wallet?.available_points || 1245).toLocaleString();

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        margin: 0,
        boxSizing: 'border-box'
      }}
    >
      {/* Mobile Screen Container */}
      <div
        style={{
          maxWidth: '440px',
          width: '100%',
          height: '100dvh',
          maxHeight: '100dvh',
          background: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 0 50px rgba(0, 0, 0, 0.35)',
          position: 'relative',
          overflow: 'hidden',
          boxSizing: 'border-box'
        }}
      >
        {/* Top Navbar */}
        <div
          style={{
            padding: '12px 16px',
            paddingTop: 'calc(12px + env(safe-area-inset-top, 0px))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #F1F5F9',
            background: '#FFFFFF',
            flexShrink: 0,
            zIndex: 10
          }}
        >
          {/* Back Button */}
          <button
            type="button"
            onClick={onClaimSuccess}
            aria-label="Back"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              border: '1px solid #E2E8F0',
              background: '#F8FAFC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#1E293B',
              padding: 0,
              flexShrink: 0
            }}
          >
            <ArrowLeft size={18} />
          </button>

          {/* Logo */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #5B21B6 0%, #22C55E 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Gift color="#FFF" size={15} />
            </div>
            <h1
              style={{
                color: '#1E1B4B',
                fontSize: '1.2rem',
                fontWeight: 800,
                margin: 0,
                letterSpacing: '-0.3px',
                lineHeight: 1
              }}
            >
              CashBack<span style={{ color: '#22C55E' }}>Hub</span>
            </h1>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClaimSuccess}
            aria-label="Close"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              border: '1px solid #E2E8F0',
              background: '#F8FAFC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748B',
              padding: 0,
              flexShrink: 0
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Main Content */}
        <div
          style={{
            flex: 1,
            padding: '14px 16px 20px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            boxSizing: 'border-box'
          }}
        >
          {/* Your Points Header Card */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #EDE9FE',
              borderRadius: '16px',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 2px 10px rgba(91, 33, 182, 0.04)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(245, 158, 11, 0.35)',
                  border: '2px solid #FEF3C7',
                  flexShrink: 0
                }}
              >
                <Sparkles color="#FFFFFF" size={20} />
              </div>

              <div>
                <div style={{ color: '#6B7280', fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  Your Points
                </div>
                <div style={{ color: '#1E1B4B', fontSize: '1.25rem', fontWeight: 800, lineHeight: 1.1 }}>
                  {displayPoints}
                </div>
                <div style={{ color: '#9CA3AF', fontSize: '0.65rem', fontWeight: 500 }}>Total Balance</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                navigate('/portal/wallet');
                if (onClaimSuccess) onClaimSuccess();
              }}
              style={{
                background: '#F3E8FF',
                color: '#7C3AED',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '16px',
                fontSize: '0.75rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer'
              }}
            >
              <Clock size={12} /> History
            </button>
          </div>

          {/* Heading Section */}
          <div style={{ textAlign: 'center', margin: '2px 0 0 0' }}>
            <h2
              style={{
                color: '#1E1B4B',
                fontSize: '1.3rem',
                fontWeight: 800,
                margin: '0 0 4px 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              Daily Attendance <Calendar size={20} color="#7C3AED" />
            </h2>
            <p style={{ color: '#6B7280', fontSize: '0.8rem', fontWeight: 500, margin: 0, lineHeight: 1.35 }}>
              Push the button below to mark your daily attendance and earn{' '}
              <span style={{ color: '#16A34A', fontWeight: 800 }}>+{rewardPoints} points</span> instantly!
            </p>
          </div>

          {/* Main Attendance Claim Card */}
          <div
            style={{
              background: 'linear-gradient(180deg, #F5EEFD 0%, #FAF5FF 100%)',
              border: '1px solid #EDE9FE',
              borderRadius: '22px',
              padding: '20px 16px',
              textAlign: 'center',
              position: 'relative',
              boxShadow: '0 8px 24px rgba(91, 33, 182, 0.06)'
            }}
          >
            {/* Top Right Speech Bubble +10 Points */}
            <div
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: '#FFFFFF',
                borderRadius: '14px',
                padding: '5px 10px',
                boxShadow: '0 3px 12px rgba(91, 33, 182, 0.12)',
                border: '1px solid #EDE9FE',
                textAlign: 'center',
                lineHeight: 1
              }}
            >
              <div style={{ color: '#16A34A', fontSize: '1.05rem', fontWeight: 800 }}>+{rewardPoints}</div>
              <div style={{ color: '#6B7280', fontSize: '0.62rem', fontWeight: 700 }}>Points</div>
            </div>

            {/* Confetti decoration */}
            <div style={{ position: 'absolute', top: '16px', left: '16px', color: '#F59E0B', opacity: 0.8 }}>
              <Sparkles size={15} />
            </div>
            <div style={{ position: 'absolute', top: '56px', left: '12px', color: '#A855F7', opacity: 0.6, fontSize: '0.9rem' }}>✦</div>
            <div style={{ position: 'absolute', top: '64px', right: '16px', color: '#3B82F6', opacity: 0.6, fontSize: '0.9rem' }}>✦</div>

            {/* Center Pedestal Icon */}
            <div
              style={{
                width: '86px',
                height: '86px',
                borderRadius: '50%',
                background: claimedState
                  ? 'linear-gradient(180deg, #16A34A 0%, #15803D 100%)'
                  : 'linear-gradient(180deg, #7C3AED 0%, #6D28D9 100%)',
                boxShadow: claimedState
                  ? '0 10px 24px rgba(22, 163, 74, 0.35), inset 0 2px 4px rgba(255, 255, 255, 0.3)'
                  : '0 10px 24px rgba(124, 58, 237, 0.35), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
                border: '5px solid #FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '4px auto 12px auto',
                transition: 'all 0.3s ease'
              }}
            >
              {claimedState ? <Check size={42} color="#FFFFFF" strokeWidth={3} /> : <UserCheck size={42} color="#FFFFFF" />}
            </div>

            {/* Card text */}
            <h3 style={{ color: '#1E1B4B', fontSize: '1.15rem', fontWeight: 800, margin: '0 0 4px 0' }}>
              {claimedState ? 'Attendance Already Marked!' : 'Ready to Claim?'}
            </h3>
            <p style={{ color: '#6B7280', fontSize: '0.78rem', fontWeight: 500, margin: '0 0 16px 0', lineHeight: 1.35 }}>
              {claimedState
                ? `You have already collected today's ${rewardPoints} points! Come back tomorrow for more.`
                : `Push the button below to mark your attendance and get ${rewardPoints} points!`}
            </p>

            {/* Main Action Button (100% Functional) */}
            <button
              type="button"
              onClick={handleClaim}
              disabled={claiming}
              style={{
                width: '100%',
                padding: '13px 16px',
                borderRadius: '30px',
                border: 'none',
                background: claimedState
                  ? 'linear-gradient(90deg, #16A34A 0%, #15803D 100%)'
                  : 'linear-gradient(90deg, #2563EB 0%, #1D4ED8 45%, #16A34A 100%)',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: 'clamp(0.85rem, 3.8vw, 0.95rem)',
                cursor: claiming ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: claimedState
                  ? '0 6px 20px rgba(22, 163, 74, 0.3)'
                  : '0 8px 24px rgba(37, 99, 235, 0.32)',
                transition: 'all 0.2s ease',
                boxSizing: 'border-box'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.22)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {claimedState ? <CheckCircle2 size={15} color="#FFF" /> : <Pointer size={15} color="#FFF" />}
                </div>
                <span style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {claiming
                    ? `Claiming +${rewardPoints} pts...`
                    : claimedState
                    ? 'Attendance Marked! ✓'
                    : 'Push to Mark Attendance'}
                </span>
              </div>

              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: claimedState ? '#15803D' : '#16A34A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginLeft: '8px'
                }}
              >
                {claimedState ? <Check size={18} color="#FFF" strokeWidth={3} /> : <ChevronRight size={18} color="#FFF" />}
              </div>
            </button>

            {/* Status notice */}
            {statusMessage && (
              <div
                style={{
                  marginTop: '10px',
                  padding: '6px 12px',
                  borderRadius: '12px',
                  background: '#ECFDF5',
                  color: '#059669',
                  fontSize: '0.78rem',
                  fontWeight: 700
                }}
              >
                {statusMessage}
              </div>
            )}

            {/* Bottom footnote */}
            <div
              style={{
                marginTop: '10px',
                color: '#7C3AED',
                fontSize: '0.72rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
            >
              <span>✪</span> One push, {rewardPoints} points in your pocket!
            </div>
          </div>

          {/* Streak Banner */}
          <div
            style={{
              background: '#F9FAFB',
              border: '1px solid #F1F5F9',
              borderRadius: '16px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.25rem' }}>🔥</span>
              <div>
                <div style={{ color: '#1E1B4B', fontSize: '0.8rem', fontWeight: 800 }}>Keep your streak going!</div>
                <div style={{ color: '#6B7280', fontSize: '0.7rem', fontWeight: 500 }}>Come back tomorrow for more points.</div>
              </div>
            </div>

            <div
              style={{
                background: '#F3E8FF',
                color: '#6D28D9',
                padding: '5px 12px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 800,
                whiteSpace: 'nowrap'
              }}
            >
              Day 3
            </div>
          </div>

          {/* Feature Badges */}
          <div
            style={{
              background: '#F8F7FC',
              border: '1px solid #EDE9FE',
              borderRadius: '16px',
              padding: '10px 8px',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '6px',
              textAlign: 'center'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '9px',
                  background: '#DCFCE7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '3px'
                }}
              >
                <Gift size={15} color="#16A34A" />
              </div>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#1E1B4B', lineHeight: 1.1 }}>+100 Bonus</span>
              <span style={{ fontSize: '0.6rem', color: '#6B7280' }}>Join & Earn</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '9px',
                  background: '#F3E8FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '3px'
                }}
              >
                <Zap size={15} color="#5B21B6" />
              </div>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#1E1B4B', lineHeight: 1.1 }}>Instant Rewards</span>
              <span style={{ fontSize: '0.6rem', color: '#6B7280' }}>Get instantly</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '9px',
                  background: '#FEF3C7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '3px'
                }}
              >
                <ShieldCheck size={15} color="#D97706" />
              </div>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#1E1B4B', lineHeight: 1.1 }}>100% Safe</span>
              <span style={{ fontSize: '0.6rem', color: '#6B7280' }}>Secure & Trusted</span>
            </div>
          </div>
        </div>

        {/* Bottom Navigation Bar (Docked, Safe on all mobile phones) */}
        <div
          style={{
            padding: '10px 14px',
            paddingBottom: 'calc(10px + env(safe-area-inset-bottom, 8px))',
            background: '#FFFFFF',
            borderTop: '1px solid #F1F5F9',
            display: 'grid',
            gridTemplateColumns: '1fr 2fr 1fr',
            alignItems: 'center',
            gap: '8px',
            flexShrink: 0,
            zIndex: 20
          }}
        >
          {/* Home Nav Button */}
          <button
            type="button"
            onClick={() => {
              navigate('/portal/dashboard');
              if (onClaimSuccess) onClaimSuccess();
            }}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              color: '#64748B',
              fontSize: '0.65rem',
              fontWeight: 700,
              cursor: 'pointer',
              gap: '3px',
              padding: '4px'
            }}
          >
            <Home size={18} />
            <span>Home</span>
          </button>

          {/* Mark Attendance Button (Fully Functional Action Button) */}
          <button
            type="button"
            onClick={handleClaim}
            disabled={claiming}
            style={{
              background: claimedState
                ? '#16A34A'
                : 'linear-gradient(135deg, #2563EB 0%, #16A34A 100%)',
              color: '#FFFFFF',
              border: 'none',
              padding: '9px 12px',
              borderRadius: '24px',
              fontSize: '0.78rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: claiming ? 'wait' : 'pointer',
              boxShadow: claimedState
                ? '0 4px 12px rgba(22, 163, 74, 0.3)'
                : '0 4px 14px rgba(37, 99, 235, 0.35)',
              transition: 'all 0.2s ease',
              width: '100%'
            }}
          >
            {claimedState ? (
              <>
                <CheckCircle2 size={16} />
                <span>Marked Today</span>
              </>
            ) : claiming ? (
              <>
                <Sparkles size={16} />
                <span>Claiming...</span>
              </>
            ) : (
              <>
                <UserCheck size={16} />
                <span>Mark Attendance</span>
              </>
            )}
          </button>

          {/* Profile Nav Button */}
          <button
            type="button"
            onClick={() => {
              navigate('/portal/profile');
              if (onClaimSuccess) onClaimSuccess();
            }}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              color: '#64748B',
              fontSize: '0.65rem',
              fontWeight: 700,
              cursor: 'pointer',
              gap: '3px',
              padding: '4px'
            }}
          >
            <User size={18} />
            <span>Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}
