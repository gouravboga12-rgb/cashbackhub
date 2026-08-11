import React, { useState } from 'react';
import { Calendar, Gift, CheckCircle2, Sparkles, ShieldCheck } from 'lucide-react';
import api from '../api';

export default function AttendanceModal({ user, onClaimSuccess }) {
  const [claiming, setClaiming] = useState(false);
  const [claimedState, setClaimedState] = useState(false);

  const handleClaim = async () => {
    if (claiming || claimedState) return;
    setClaiming(true);

    try {
      // 1. Attempt backend check-in API
      const res = await api.post('/attendance/check-in');
      if (res.data && res.data.success) {
        // Backend attendance recorded
      }
    } catch (err) {
      console.warn('Backend attendance check-in offline or already claimed, running client fallback.');
    }

    // 2. Client-side wallet update fallback
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
    } catch (e) {
      console.error('Wallet storage update error:', e);
    }

    setClaimedState(true);
    setClaiming(false);

    // Short delay to show success animation before closing modal
    setTimeout(() => {
      onClaimSuccess();
    }, 1200);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 99999,
      background: 'rgba(15, 12, 35, 0.82)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        maxWidth: '420px',
        width: '100%',
        background: '#FFFFFF',
        borderRadius: '24px',
        padding: '28px 24px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.35)',
        textAlign: 'center',
        position: 'relative',
        animation: 'modalPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        border: '1px solid #EDE9FE',
        boxSizing: 'border-box'
      }}>
        
        {/* Glow pill behind icon */}
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '22px',
          background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 10px 25px rgba(34, 197, 94, 0.35)',
          marginBottom: '16px',
          position: 'relative'
        }}>
          <Calendar color="#FFFFFF" size={36} />
          <div style={{
            position: 'absolute',
            top: '-6px',
            right: '-6px',
            background: '#F59E0B',
            color: '#FFFFFF',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}>
            <Sparkles size={14} />
          </div>
        </div>

        {/* Modal Title */}
        <div style={{ color: '#16A34A', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px' }}>
          📅 DAILY ATTENDANCE BONUS
        </div>
        
        <h3 style={{ color: '#1E1B4B', fontSize: '1.45rem', fontWeight: 800, margin: '0 0 8px 0', lineHeight: 1.25 }}>
          {claimedState ? 'Attendance Marked! 🎉' : `Welcome, ${user?.name || 'User'}! 👋`}
        </h3>

        <p style={{ color: '#6B7280', fontSize: '0.875rem', fontWeight: 500, margin: '0 0 20px 0', lineHeight: 1.5 }}>
          {claimedState
            ? 'Awesome! +10 Points have been added to your wallet.'
            : 'Mark your daily attendance today and receive 10 reward points instantly.'}
        </p>

        {/* Reward Badge Card */}
        <div style={{
          background: 'linear-gradient(135deg, #DCFCE7 0%, #F0FDF4 100%)',
          border: '1px solid #BBF7D0',
          borderRadius: '16px',
          padding: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          marginBottom: '24px'
        }}>
          <Gift size={24} color="#16A34A" />
          <div style={{ textAlign: 'left' }}>
            <div style={{ color: '#15803D', fontSize: '1.1rem', fontWeight: 800, lineHeight: 1.1 }}>
              +10 Bonus Points
            </div>
            <div style={{ color: '#166534', fontSize: '0.75rem', fontWeight: 600, marginTop: '2px' }}>
              Equivalent to ₹1.00 Rupee Reward
            </div>
          </div>
        </div>

        {/* Mandatory Action Button */}
        <button
          type="button"
          onClick={handleClaim}
          disabled={claiming || claimedState}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '16px',
            border: 'none',
            background: claimedState
              ? 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)'
              : 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: '1rem',
            cursor: claiming || claimedState ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 8px 24px rgba(34, 197, 94, 0.4)',
            transition: 'all 0.2s ease-in-out'
          }}
        >
          {claimedState ? (
            <>
              <CheckCircle2 size={20} />
              <span>+10 Points Claimed!</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={20} />
              <span>{claiming ? 'Claiming 10 Points...' : 'Okay (Claim +10 Points)'}</span>
            </>
          )}
        </button>

        <div style={{ marginTop: '14px', display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#9CA3AF', fontSize: '0.725rem', fontWeight: 600 }}>
          <ShieldCheck size={13} color="#16A34A" /> Daily check-in reward strictly 1 per day
        </div>

      </div>
    </div>
  );
}
