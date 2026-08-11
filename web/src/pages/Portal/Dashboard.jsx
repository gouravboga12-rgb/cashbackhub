import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import SpinWheel from '../../components/SpinWheel';
import ReferModal from '../../components/ReferModal';
import { Wallet, CheckCircle, Film, Disc, ArrowUpRight, Gift, Bell, Calendar, Tv, Sparkles, RefreshCw, Users } from 'lucide-react';

export default function Dashboard({ user, wallet, refreshWallet }) {
  const navigate = useNavigate();
  const [attendanceToday, setAttendanceToday] = useState(false);
  const [adProgress, setAdProgress] = useState({ completed_count: 0, daily_limit: 10 });
  const [spinConfig, setSpinConfig] = useState({ slices: [], spins_available_today: 1 });
  const [attLoading, setAttLoading] = useState(false);
  const [showConvertedRupee, setShowConvertedRupee] = useState(false);
  const [showReferModal, setShowReferModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();

    const handleAttendanceClaimedEvent = () => {
      fetchDashboardData();
    };

    window.addEventListener('attendance_claimed', handleAttendanceClaimedEvent);
    return () => {
      window.removeEventListener('attendance_claimed', handleAttendanceClaimedEvent);
    };
  }, [wallet]);

  const fetchDashboardData = async () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const userId = user?.id || 'demo_user';
    const claimedLocal = localStorage.getItem(`cashback_attendance_claimed_${userId}_${todayStr}`);
    if (claimedLocal === 'true') {
      setAttendanceToday(true);
    }

    try {
      const [attRes, adRes, spinRes] = await Promise.all([
        api.get('/attendance/today'),
        api.get('/ads'),
        api.get('/spin/config')
      ]);

      if (attRes.data && attRes.data.completed) {
        setAttendanceToday(true);
      }
      setAdProgress({ completed_count: adRes.data.completed_count, daily_limit: adRes.data.daily_limit });
      setSpinConfig({ slices: spinRes.data.slices, spins_available_today: spinRes.data.spins_available_today });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  };

  const handleMarkAttendance = async () => {
    if (attendanceToday || attLoading) return;
    setAttLoading(true);
    try {
      const res = await api.post('/attendance/check-in');
      if (res.data.success) {
        setAttendanceToday(true);
        refreshWallet();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Attendance error');
    } finally {
      setAttLoading(false);
    }
  };

  const handleSpinPlay = async () => {
    try {
      const res = await api.post('/spin/play');
      if (res.data && res.data.success) {
        setSpinConfig(prev => ({ ...prev, spins_available_today: 0 }));
        refreshWallet();
        return res.data;
      }
    } catch (err) {
      console.warn('Backend spin API offline, executing dashboard spin reward fallback.');
    }

    const winningSlices = [
      { reward_points: 500, message: '🎉 Congratulations! You won 500 Points!' },
      { reward_points: 200, message: '🎉 Awesome! You won 200 Points!' },
      { reward_points: 100, message: '🎉 Great Spin! You won 100 Points!' },
      { reward_points: 50, message: '🎉 Good Spin! You won 50 Points!' },
    ];

    const winner = winningSlices[Math.floor(Math.random() * winningSlices.length)];
    setSpinConfig(prev => ({ ...prev, spins_available_today: 0 }));

    // Add winning reward points directly to local wallet
    try {
      const walletData = localStorage.getItem('cashback_wallet') || JSON.stringify({ available_points: 2520, total_earned: 3320 });
      const parsed = JSON.parse(walletData);
      parsed.available_points += winner.reward_points;
      parsed.total_earned += winner.reward_points;
      localStorage.setItem('cashback_wallet', JSON.stringify(parsed));
    } catch (e) {}

    refreshWallet();

    return {
      success: true,
      reward_points: winner.reward_points,
      message: winner.message
    };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
      
      {/* 3D Visual Hero Banner */}
      <div className="card-white" style={{
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 8px 24px rgba(91, 33, 182, 0.12)',
        border: '1px solid #EDE9FE',
        background: '#FFFFFF'
      }}>
        <img
          src="/hero_banner.png"
          alt="CashBack Rewards"
          style={{ width: '100%', height: '170px', objectFit: 'cover', display: 'block' }}
        />
        <div style={{ padding: '12px 16px', background: 'linear-gradient(135deg, #5B21B6 0%, #1E1B4B 100%)', color: '#FFF' }}>
          <div style={{ color: '#4ADE80', fontSize: '0.725rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>
            ⚡ DAILY REWARDS HUB
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 4px 0', lineHeight: 1.2 }}>
            Earn Real Cash & Instant Gift Vouchers!
          </h3>
          <p style={{ color: '#E9D5FF', fontSize: '0.775rem', margin: 0, fontWeight: 500, lineHeight: 1.35 }}>
            Check in daily, watch video ads, and spin the lucky wheel to claim your points.
          </p>
        </div>
      </div>

      {/* Header Greeting */}
      <div style={{ padding: '0 4px' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1E1B4B', margin: '0 0 2px 0' }}>
          Hello, {user?.name || 'User'}! 👋
        </h2>
        <p style={{ color: '#6B7280', fontSize: '0.85rem', fontWeight: 500, margin: 0 }}>Keep earning, keep winning!</p>
      </div>

      {/* Premium Credit Card Style Wallet Card */}
      <div style={{
        background: 'linear-gradient(135deg, #4C1D95 0%, #5B21B6 50%, #6D28D9 100%)',
        borderRadius: '22px',
        padding: '22px 20px',
        color: '#FFFFFF',
        boxShadow: '0 10px 28px rgba(91, 33, 182, 0.28)',
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {/* Ambient Glow Pill Background Effect */}
        <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '130px', height: '130px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.2)', filter: 'blur(30px)', pointerEvents: 'none' }} />

        {/* Top Header Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wallet color="#4ADE80" size={16} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.9 }}>MY WALLET</span>
          </div>

          <button
            onClick={() => navigate('/portal/wallet')}
            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#FFF', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            Manage <ArrowUpRight size={12} />
          </button>
        </div>
        
        {/* Main Balance Values Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontSize: 'clamp(2rem, 6vw, 2.6rem)', fontWeight: 800, lineHeight: 1 }}>
              {wallet?.available_points?.toLocaleString() || 0} <span style={{ fontSize: '1rem', fontWeight: 600, opacity: 0.9 }}>Pts</span>
            </div>
          </div>

          {/* Convert to Rupees Action / Converted Rupee Pill */}
          {!showConvertedRupee ? (
            <button
              type="button"
              onClick={() => setShowConvertedRupee(true)}
              style={{
                background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
                color: '#FFFFFF',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '14px',
                fontWeight: 800,
                fontSize: '0.825rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 14px rgba(34, 197, 94, 0.35)',
                position: 'relative',
                zIndex: 10,
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <RefreshCw size={15} /> Convert to ₹
            </button>
          ) : (
            <div
              onClick={() => setShowConvertedRupee(false)}
              style={{
                background: 'rgba(255, 255, 255, 0.16)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                padding: '6px 14px',
                borderRadius: '14px',
                textAlign: 'right',
                cursor: 'pointer',
                position: 'relative',
                zIndex: 10
              }}
            >
              <div style={{ fontSize: '0.65rem', fontWeight: 800, opacity: 0.85, textTransform: 'uppercase' }}>CONVERTED RUPEES</div>
              <div style={{ color: '#4ADE80', fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', fontWeight: 800, marginTop: '1px' }}>
                ₹{((wallet?.available_points || 0) / 10).toFixed(2)}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Formula Ticker Bar */}
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.18)',
          marginTop: '16px',
          paddingTop: '10px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.775rem',
          color: '#E9D5FF',
          fontWeight: 700
        }}>
          <span>✨ 10 Points = ₹1.00 Value</span>
        </div>
      </div>

      {/* Today's Activity Section */}
      <div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1E1B4B', marginBottom: '14px' }}>
          Today's Activity
        </h3>

        <div className="card-white" style={{ padding: '8px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Daily Attendance Item */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F3F4F6', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '200px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 6px 16px rgba(34, 197, 94, 0.35)' }}>
                <Calendar color="#FFF" size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#1E1B4B' }}>Daily Attendance</h4>
                <p style={{ color: '#6B7280', fontSize: '0.825rem' }}>Mark attendance and earn 10 points</p>
              </div>
            </div>

            <button
              onClick={handleMarkAttendance}
              disabled={attendanceToday || attLoading}
              style={{
                background: attendanceToday ? '#DCFCE7' : 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
                color: attendanceToday ? '#16A34A' : '#FFFFFF',
                border: 'none',
                padding: '8px 20px',
                borderRadius: '20px',
                fontWeight: 800,
                fontSize: '0.875rem',
                cursor: attendanceToday ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {attendanceToday ? <><CheckCircle size={18} /> +10</> : (attLoading ? '...' : '+10 Check In')}
            </button>
          </div>

          {/* Watch Ads Item */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F3F4F6', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '200px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'linear-gradient(135deg, #FF6B00 0%, #EA580C 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 6px 16px rgba(234, 88, 12, 0.35)' }}>
                <Tv color="#FFF" size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#1E1B4B' }}>Watch Ads ({adProgress.completed_count}/10)</h4>
                <p style={{ color: '#6B7280', fontSize: '0.825rem' }}>Watch 10 ads and earn 10 points per ad</p>
              </div>
            </div>

            <button onClick={() => navigate('/portal/watch-ads')} className="btn-violet" style={{ borderRadius: '20px', padding: '8px 24px' }}>
              Start
            </button>
          </div>

          {/* Spin & Win Item */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F3F4F6', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '200px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 6px 16px rgba(124, 58, 237, 0.35)' }}>
                <Disc color="#FFF" size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#1E1B4B' }}>Spin & Win</h4>
                <p style={{ color: '#6B7280', fontSize: '0.825rem' }}>Spin the wheel and win exciting points</p>
              </div>
            </div>

            <button onClick={() => navigate('/portal/spin')} className="btn-violet" style={{ borderRadius: '20px', padding: '8px 24px' }}>
              Spin
            </button>
          </div>

          {/* Refer & Earn Item */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '200px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 6px 16px rgba(16, 185, 129, 0.35)' }}>
                <Users color="#FFF" size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#1E1B4B' }}>Refer & Earn (+100 Pts)</h4>
                <p style={{ color: '#6B7280', fontSize: '0.825rem' }}>Invite friends and earn 100 points per refer</p>
              </div>
            </div>

            <button onClick={() => setShowReferModal(true)} className="btn-green" style={{ borderRadius: '20px', padding: '8px 24px' }}>
              Invite
            </button>
          </div>

        </div>
      </div>

      {/* Watch Ads Promo Banner Card */}
      <div className="card-violet-banner" style={{ padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '6px' }}>Watch Ads. Earn Points.</h3>
          <p style={{ opacity: 0.9, fontSize: '0.9rem' }}>Complete 10 ads daily and earn 100 points!</p>
        </div>

        <button onClick={() => navigate('/portal/watch-ads')} className="btn-green" style={{ borderRadius: '20px', padding: '10px 24px' }}>
          Watch Ads Now
        </button>
      </div>

      {/* Interactive Spin Wheel Widget Section */}
      <div className="card-white" style={{ padding: '20px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', overflow: 'hidden', width: '100%', boxSizing: 'border-box' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1E1B4B', marginBottom: '4px' }}>🎡 Lucky Spin Wheel</h3>
        <p style={{ color: '#6B7280', fontSize: '0.85rem', marginBottom: '16px' }}>Spin daily for bonus rewards!</p>

        <SpinWheel
          slices={spinConfig.slices}
          spinsAvailable={spinConfig.spins_available_today}
          onSpin={handleSpinPlay}
        />
      </div>

      {/* REFER & EARN MODAL POPUP */}
      {showReferModal && (
        <ReferModal
          user={user}
          onClose={() => setShowReferModal(false)}
          refreshWallet={refreshWallet}
        />
      )}

    </div>
  );
}
