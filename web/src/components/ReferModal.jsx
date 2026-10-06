import React, { useState, useEffect } from 'react';
import { X, Copy, Share2, Users, CheckCircle2, Gift } from 'lucide-react';
import api from '../api';

export default function ReferModal({ user, onClose }) {
  const [copied, setCopied] = useState(false);
  const [rewardPoints, setRewardPoints] = useState(100);

  const referralCode = user?.referral_code || 'PKF-XXXXX';

  // Load dynamic referral reward from platform settings
  useEffect(() => {
    api.get('/platform-settings').then(res => {
      const pts = res.data?.referral_reward_points ?? res.data?.platform_settings?.referral_reward_points;
      if (pts !== undefined && pts !== null) {
        setRewardPoints(Number(pts) || 100);
      }
    }).catch(() => {});
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }).catch(() => {
      // Fallback for older browsers
      const el = document.createElement('textarea');
      el.value = referralCode;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleWhatsAppShare = () => {
    const signupUrl = `${window.location.origin}/signup`;
    const text = encodeURIComponent(
      `🎉 Join Perkfy and earn instant reward points!\n\nUse my referral code: *${referralCode}* when signing up at ${signupUrl} to get bonus points!\n\nSign up here: ${signupUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
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
        padding: '28px 22px',
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
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
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
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1E1B4B', margin: '0 0 6px 0' }}>
            Refer &amp; Earn
          </h2>
          <p style={{ color: '#6B7280', fontSize: '0.85rem', margin: 0, fontWeight: 500, lineHeight: 1.5 }}>
            Share your code with friends. When they register with your code,<br/>
            you earn <strong style={{ color: '#16A34A' }}>{rewardPoints} Points</strong> instantly!
          </p>
        </div>

        {/* How It Works */}
        <div style={{
          background: '#F0FDF4',
          border: '1px solid #BBF7D0',
          borderRadius: '14px',
          padding: '14px 16px',
          marginBottom: '18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#15803D', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '2px' }}>How it works</div>
          {[
            '1. Share your unique referral code below',
            '2. Friend signs up using your code',
            `3. You receive +${rewardPoints} Points in your wallet`
          ].map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontSize: '0.82rem', fontWeight: 600 }}>
              <Gift size={14} color="#16A34A" style={{ flexShrink: 0 }} />
              {step}
            </div>
          ))}
        </div>

        {/* Referral Code Box */}
        <div style={{
          background: 'linear-gradient(135deg, #F8F7FC 0%, #EDE9FE 100%)',
          border: '2px dashed #7C3AED',
          borderRadius: '16px',
          padding: '18px',
          textAlign: 'center',
          marginBottom: '16px'
        }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>YOUR REFERRAL CODE</div>
          <div style={{
            fontSize: '2rem',
            fontWeight: 900,
            color: '#5B21B6',
            letterSpacing: '3px',
            fontFamily: 'monospace',
            marginBottom: '6px'
          }}>
            {referralCode}
          </div>
          <div style={{ fontSize: '0.77rem', color: '#16A34A', fontWeight: 700 }}>
            ✨ Earn {rewardPoints} Points per successful referral
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={handleCopyCode}
            style={{
              flex: 1,
              padding: '13px',
              borderRadius: '14px',
              border: copied ? '1.5px solid #10B981' : '1.5px solid #E5E7EB',
              background: copied ? '#DCFCE7' : '#F8F7FC',
              color: copied ? '#065F46' : '#1E1B4B',
              fontWeight: 800,
              fontSize: '0.87rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '7px',
              transition: 'all 0.2s'
            }}
          >
            {copied ? <CheckCircle2 size={17} /> : <Copy size={17} />}
            {copied ? 'Code Copied!' : 'Copy Code'}
          </button>

          <button
            type="button"
            onClick={handleWhatsAppShare}
            style={{
              flex: 1,
              padding: '13px',
              borderRadius: '14px',
              border: 'none',
              background: 'linear-gradient(135deg, #25D366, #128C7E)',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '0.87rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '7px',
              boxShadow: '0 4px 14px rgba(37, 211, 102, 0.35)'
            }}
          >
            <Share2 size={17} /> Share
          </button>
        </div>

        <p style={{ margin: '14px 0 0 0', textAlign: 'center', fontSize: '0.75rem', color: '#9CA3AF', lineHeight: 1.5 }}>
          Your friend must enter the code during registration to activate the reward.
        </p>
      </div>
    </div>
  );
}
