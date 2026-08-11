import React, { useState } from 'react';
import { X, Copy, Share2, Users, CheckCircle2, Gift, Sparkles } from 'lucide-react';

export default function ReferModal({ user, onClose, refreshWallet }) {
  const [copied, setCopied] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [claiming, setClaiming] = useState(false);

  const refCode = user?.referral_code || 'CASHBACK100';
  const refLink = `${window.location.origin}/signup?ref=${refCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(refLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`🎉 Join CashBackHub and get instant reward points! Use my referral code ${refCode} or signup here: ${refLink}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleSimulateClaim = () => {
    if (claiming || claimed) return;
    setClaiming(true);

    try {
      // 1. Credit 100 points to wallet
      const savedWallet = localStorage.getItem('cashback_wallet');
      let walletObj = savedWallet
        ? JSON.parse(savedWallet)
        : { available_points: 2520, total_earned: 3320, total_redeemed: 800 };

      walletObj.available_points += 100;
      walletObj.total_earned += 100;
      localStorage.setItem('cashback_wallet', JSON.stringify(walletObj));

      // 2. Add transaction log
      const savedTxs = localStorage.getItem('cashback_transactions');
      let txList = savedTxs ? JSON.parse(savedTxs) : [];
      txList.unshift({
        id: `tx_${Date.now()}`,
        type: 'Referral Bonus',
        description: 'Friend registered using your referral link (+100 Pts)',
        points: 100,
        created_at: new Date().toISOString()
      });
      localStorage.setItem('cashback_transactions', JSON.stringify(txList));

      // 3. Trigger wallet update
      if (typeof refreshWallet === 'function') {
        refreshWallet();
      }
      window.dispatchEvent(new Event('attendance_claimed'));
      setClaimed(true);
    } catch (e) {
      console.error('Referral claim error:', e);
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 12, 35, 0.78)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        maxWidth: '440px',
        width: '100%',
        background: '#FFFFFF',
        borderRadius: '24px',
        padding: '26px 20px',
        boxShadow: '0 20px 50px rgba(91, 33, 182, 0.25)',
        border: '1px solid #EDE9FE',
        position: 'relative',
        boxSizing: 'border-box'
      }}>
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#F4F3F8',
            border: 'none',
            color: '#4B5563',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>

        {/* Header Icon & Title */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
            color: '#FFFFFF',
            margin: '0 auto 12px auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(34, 197, 94, 0.35)'
          }}>
            <Users size={32} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1E1B4B', margin: '0 0 4px 0' }}>
            Refer & Earn
          </h2>
          <p style={{ color: '#6B7280', fontSize: '0.85rem', margin: 0, fontWeight: 500 }}>
            Invite friends to CashBackHub and get <strong style={{ color: '#16A34A' }}>100 Points</strong> per referral!
          </p>
        </div>

        {/* Referral Code Box */}
        <div style={{
          background: '#F8F7FC',
          border: '2px dashed #7C3AED',
          borderRadius: '16px',
          padding: '14px',
          textAlign: 'center',
          marginBottom: '16px'
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>YOUR REFERRAL CODE</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#5B21B6', margin: '4px 0', letterSpacing: '1px' }}>
            {refCode}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: 700 }}>
            ✨ Reward: 100 Points per successful referral
          </div>
        </div>

        {/* Action Buttons: Copy Link & WhatsApp Share */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
          <button
            type="button"
            onClick={handleCopy}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '14px',
              border: '1px solid #E5E7EB',
              background: copied ? '#DCFCE7' : '#F8F7FC',
              color: copied ? '#16A34A' : '#1E1B4B',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>

          <button
            type="button"
            onClick={handleWhatsAppShare}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '14px',
              border: 'none',
              background: '#25D366',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(37, 211, 102, 0.35)'
            }}
          >
            <Share2 size={16} /> Share WhatsApp
          </button>
        </div>

        {/* Test / Instant Demo Referral Claim Button */}
        <button
          type="button"
          onClick={handleSimulateClaim}
          disabled={claiming}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '16px',
            border: 'none',
            background: claimed
              ? '#E5E7EB'
              : 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
            color: claimed ? '#6B7280' : '#FFFFFF',
            fontWeight: 800,
            fontSize: '0.95rem',
            cursor: claimed ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: claimed ? 'none' : '0 6px 20px rgba(34, 197, 94, 0.35)'
          }}
        >
          {claimed ? (
            <>
              <CheckCircle2 size={18} color="#16A34A" />
              <span>Referral Claimed (+100 Pts Added)</span>
            </>
          ) : (
            <>
              <Sparkles size={18} />
              <span>Simulate Referral (+100 Pts)</span>
            </>
          )}
        </button>

      </div>
    </div>
  );
}
