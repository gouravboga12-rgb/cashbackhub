import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, ExternalLink, Gift } from 'lucide-react';
import api from '../api';
import { mergeWallet } from '../utils/walletUtils';

const SOCIAL_TASKS = [
  {
    id: 'instagram',
    name: 'Instagram',
    handle: '@perkfy2026',
    url: 'https://www.instagram.com/perkfy2026?stkn=dG9scHJ3YWppcjNq',
    action: 'Follow',
    color: '#E1306C',
    gradient: 'linear-gradient(135deg, #833AB4 0%, #FD1D1D 50%, #FCAF45 100%)',
    bg: '#FDF2F8',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    )
  },
  {
    id: 'youtube',
    name: 'YouTube',
    handle: '@Perkfy',
    url: 'https://www.youtube.com/@Perkfy',
    action: 'Subscribe',
    color: '#FF0000',
    gradient: 'linear-gradient(135deg, #FF0000 0%, #CC0000 100%)',
    bg: '#FFF5F5',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    )
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    handle: '@Perkfy2026',
    url: 'https://x.com/Perkfy2026',
    action: 'Follow',
    color: '#000000',
    gradient: 'linear-gradient(135deg, #1a1a1a 0%, #333 100%)',
    bg: '#F9FAFB',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    )
  },
  {
    id: 'facebook',
    name: 'Facebook',
    handle: 'Perkfy',
    url: 'https://www.facebook.com/share/1HpXfscxYf/',
    action: 'Follow',
    color: '#1877F2',
    gradient: 'linear-gradient(135deg, #1877F2 0%, #0C5FCD 100%)',
    bg: '#EFF6FF',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    )
  },
];

const getStorageKey = (userId) => {
  return userId ? `perkfy_social_connect_status_${userId}` : 'perkfy_social_connect_status';
};

function getLocalSocialStatus(userId) {
  try {
    const key = getStorageKey(userId);
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
    // Legacy fallback
    const legacy = localStorage.getItem('perkfy_social_connect_status');
    return legacy ? JSON.parse(legacy) : {};
  } catch (e) {
    return {};
  }
}

function saveLocalSocialStatus(userId, status) {
  try {
    const key = getStorageKey(userId);
    localStorage.setItem(key, JSON.stringify(status));
    localStorage.setItem('perkfy_social_connect_status', JSON.stringify(status));
  } catch (e) {}
}

export default function SocialConnect({ user, refreshWallet }) {
  const currentUserId = user?.id || (() => {
    try {
      return JSON.parse(localStorage.getItem('cashback_user') || '{}')?.id;
    } catch (e) {
      return null;
    }
  })();

  const [status, setStatus] = useState(() => getLocalSocialStatus(currentUserId));
  const [showModal, setShowModal] = useState(null); // task id
  const [claimMsg, setClaimMsg] = useState('');
  const [claimError, setClaimError] = useState('');

  // Synchronize status with backend database on mount and whenever user changes
  const fetchPersistentStatus = useCallback(async () => {
    // 1. Seed from current user's local cache
    const cached = getLocalSocialStatus(currentUserId);
    setStatus(cached);

    // 2. Query backend for database truth
    try {
      const res = await api.get('/social-connect/status');
      if (res.data && res.data.success && Array.isArray(res.data.completed)) {
        const merged = { ...cached };
        res.data.completed.forEach((platform) => {
          merged[platform] = 'done';
        });
        setStatus(merged);
        saveLocalSocialStatus(currentUserId, merged);
      }
    } catch (err) {
      console.warn('Backend social status check offline, relying on client cache.');
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchPersistentStatus();
  }, [fetchPersistentStatus]);

  const handleConnect = (task) => {
    if (status[task.id] === 'done') return;
    setShowModal(task.id);
  };

  const handleOpen = (task) => {
    // Mark as pending claim (visited)
    if (status[task.id] === 'done') return;
    const nextStatus = {
      ...status,
      [task.id]: 'claim'
    };
    saveLocalSocialStatus(currentUserId, nextStatus);
    setStatus(nextStatus);
    window.open(task.url, '_blank', 'noopener,noreferrer');
  };

  const handleClaim = async (task) => {
    if (status[task.id] === 'done') {
      setClaimError('You have already claimed this reward! Each social task is completed only once.');
      setTimeout(() => setClaimError(''), 3000);
      return;
    }
    if (status[task.id] !== 'claim') {
      setClaimError('Please visit and follow/subscribe us first, then come back to claim.');
      setTimeout(() => setClaimError(''), 3000);
      return;
    }

    // Try backend API first to persist permanently in database
    try {
      const res = await api.post('/social-connect/claim', { platform: task.id });
      if (res.data && res.data.success) {
        const updatedStatus = { ...status, [task.id]: 'done' };
        if (Array.isArray(res.data.completed)) {
          res.data.completed.forEach((p) => {
            updatedStatus[p] = 'done';
          });
        }
        saveLocalSocialStatus(currentUserId, updatedStatus);
        setStatus(updatedStatus);
        setShowModal(null);
        setClaimMsg(`+10 Points earned for following Perkfy on ${task.name}!`);

        if (res.data.wallet) {
          mergeWallet(res.data.wallet, 10, currentUserId);
        }
        if (typeof refreshWallet === 'function') {
          refreshWallet();
        }
        window.dispatchEvent(new Event('wallet_updated'));
        window.dispatchEvent(new Event('attendance_claimed'));
        setTimeout(() => setClaimMsg(''), 3500);
        return;
      }
    } catch (err) {
      const serverMsg = err.response?.data?.message;
      if (serverMsg && (serverMsg.includes('already') || serverMsg.includes('once'))) {
        // Backend confirms it's already claimed - lock it down permanently
        const updatedStatus = { ...status, [task.id]: 'done' };
        saveLocalSocialStatus(currentUserId, updatedStatus);
        setStatus(updatedStatus);
        setShowModal(null);
        setClaimError('This social task has already been completed and claimed!');
        setTimeout(() => setClaimError(''), 3000);
        return;
      }
      console.warn('Backend claim offline, applying local fallback.');
    }

    // Fallback if backend server is temporarily unreachable
    try {
      const walletRaw = localStorage.getItem('cashback_wallet') || '{}';
      const wallet = JSON.parse(walletRaw);
      wallet.available_points = (wallet.available_points || 0) + 10;
      wallet.total_earned = (wallet.total_earned || 0) + 10;
      localStorage.setItem('cashback_wallet', JSON.stringify(wallet));

      const savedTxs = localStorage.getItem('cashback_transactions');
      let txList = savedTxs ? JSON.parse(savedTxs) : [];
      txList.unshift({
        id: `tx_${Date.now()}_social_${task.id}`,
        type: 'Social Connect',
        description: `+10 Points for following Perkfy on ${task.name}`,
        points: 10,
        created_at: new Date().toISOString()
      });
      localStorage.setItem('cashback_transactions', JSON.stringify(txList));
    } catch (e) {}

    const fallbackStatus = { ...status, [task.id]: 'done' };
    saveLocalSocialStatus(currentUserId, fallbackStatus);
    setStatus(fallbackStatus);
    setShowModal(null);
    setClaimMsg(`+10 Points earned for following Perkfy on ${task.name}!`);
    if (typeof refreshWallet === 'function') {
      refreshWallet();
    }
    window.dispatchEvent(new Event('wallet_updated'));
    window.dispatchEvent(new Event('attendance_claimed'));
    setTimeout(() => setClaimMsg(''), 3500);
  };

  const activeModal = SOCIAL_TASKS.find(t => t.id === showModal);

  return (
    <>
      {/* Success message */}
      {claimMsg && (
        <div style={{
          position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
          background: '#ECFDF5', border: '1px solid #10B981', color: '#065F46',
          padding: '12px 20px', borderRadius: '14px', fontSize: '0.875rem', fontWeight: 700,
          display: 'flex', alignItems: 'center', gap: '8px', zIndex: 9999,
          boxShadow: '0 8px 24px rgba(16,185,129,0.25)', whiteSpace: 'nowrap'
        }}>
          <CheckCircle size={18} color="#10B981" />
          {claimMsg}
        </div>
      )}

      {/* Section */}
      <div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1E1B4B', marginBottom: '14px' }}>
          Social Connect
        </h3>

        <div className="card-white" style={{ padding: '8px 20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {SOCIAL_TASKS.map((task, i) => {
            const taskStatus = status[task.id]; // undefined | 'claim' | 'done'
            const isDone = taskStatus === 'done';
            const canClaim = taskStatus === 'claim';

            return (
              <div
                key={task.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 0',
                  borderBottom: i < SOCIAL_TASKS.length - 1 ? '1px solid #F3F4F6' : 'none',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '160px' }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '16px',
                    background: isDone ? '#DCFCE7' : task.gradient,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, boxShadow: isDone ? 'none' : `0 6px 16px ${task.color}44`,
                    color: isDone ? '#16A34A' : '#FFF',
                    transition: 'all 0.3s ease'
                  }}>
                    {isDone ? <CheckCircle size={24} /> : task.icon}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#1E1B4B', margin: '0 0 2px 0' }}>{task.name}</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: '#6B7280', fontSize: '0.8rem' }}>{task.handle}</span>
                      <span style={{ background: '#F3E8FF', color: '#5B21B6', fontSize: '0.7rem', fontWeight: 800, padding: '1px 7px', borderRadius: '8px' }}>
                        +10 Pts
                      </span>
                    </div>
                  </div>
                </div>

                {isDone ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#DCFCE7', color: '#16A34A', padding: '7px 14px', borderRadius: '20px', fontWeight: 800, fontSize: '0.825rem' }}>
                    <CheckCircle size={15} />
                    Completed
                  </div>
                ) : canClaim ? (
                  <button
                    onClick={() => handleClaim(task)}
                    style={{
                      background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
                      color: '#FFF', border: 'none', padding: '8px 20px',
                      borderRadius: '20px', fontWeight: 800, fontSize: '0.875rem',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                      boxShadow: '0 4px 12px rgba(34,197,94,0.3)'
                    }}
                  >
                    <Gift size={15} />
                    Claim Reward
                  </button>
                ) : (
                  <button
                    onClick={() => handleConnect(task)}
                    style={{
                      background: task.gradient,
                      color: '#FFF', border: 'none', padding: '8px 20px',
                      borderRadius: '20px', fontWeight: 800, fontSize: '0.875rem',
                      cursor: 'pointer',
                      boxShadow: `0 4px 12px ${task.color}44`
                    }}
                  >
                    Connect
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {showModal && activeModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15,23,42,0.65)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          zIndex: 2000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          padding: '0'
        }} onClick={() => setShowModal(null)}>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#FFFFFF',
              borderRadius: '24px 24px 0 0',
              padding: '28px 24px 36px 24px',
              width: '100%',
              maxWidth: '480px',
              boxSizing: 'border-box',
              boxShadow: '0 -8px 32px rgba(0,0,0,0.15)'
            }}
          >
            {/* Drag handle */}
            <div style={{ width: '40px', height: '4px', background: '#E5E7EB', borderRadius: '4px', margin: '0 auto 20px auto' }} />

            {/* Social icon */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '20px',
                background: activeModal.gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#FFF', boxShadow: `0 8px 24px ${activeModal.color}44`
              }}>
                {activeModal.icon}
              </div>
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1E1B4B', textAlign: 'center', margin: '0 0 8px 0' }}>
              {activeModal.action} on {activeModal.name}
            </h3>

            {/* Instruction message */}
            <div style={{ background: '#F8F7FC', border: '1px solid #EDE9FE', borderRadius: '14px', padding: '14px 16px', marginBottom: '20px', textAlign: 'center' }}>
              <p style={{ color: '#4B5563', fontSize: '0.875rem', lineHeight: 1.6, margin: 0, fontWeight: 600 }}>
                Click <strong style={{ color: '#5B21B6' }}>Open</strong> to visit our official {activeModal.name} page,{' '}
                <strong>{activeModal.action.toLowerCase()}/subscribe</strong> to us, then come back to Perkfy to claim your reward.
              </p>
            </div>

            {/* Reward badge */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <div style={{ background: 'linear-gradient(135deg, #5B21B6, #7C3AED)', color: '#FFF', padding: '8px 20px', borderRadius: '14px', fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Gift size={16} />
                Earn +10 Points
              </div>
            </div>

            {claimError && (
              <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#B91C1C', padding: '10px 14px', borderRadius: '10px', fontSize: '0.825rem', fontWeight: 700, marginBottom: '14px', textAlign: 'center' }}>
                {claimError}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowModal(null)}
                style={{ flex: 1, padding: '13px', borderRadius: '14px', border: '1px solid #E5E7EB', background: '#F8F7FC', color: '#6B7280', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleOpen(activeModal)}
                style={{
                  flex: 2, padding: '13px', borderRadius: '14px', border: 'none',
                  background: activeModal.gradient,
                  color: '#FFF', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: `0 6px 20px ${activeModal.color}44`
                }}
              >
                <ExternalLink size={16} />
                Open {activeModal.name}
              </button>
            </div>

            {/* Show claim button if already visited */}
            {status[activeModal.id] === 'claim' && (
              <button
                onClick={() => handleClaim(activeModal)}
                style={{
                  width: '100%', marginTop: '12px', padding: '13px', borderRadius: '14px', border: 'none',
                  background: 'linear-gradient(135deg, #22C55E, #16A34A)',
                  color: '#FFF', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: '0 6px 20px rgba(34,197,94,0.3)'
                }}
              >
                <Gift size={16} />
                I Followed — Claim +10 Points
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
