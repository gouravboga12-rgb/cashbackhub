import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Film, CheckCircle, Play, Smartphone, ShoppingBag, Sparkles, CreditCard, Gamepad2, MapPin, Tv, ArrowRight } from 'lucide-react';

const AD_ICONS = [
  { icon: Smartphone, bg: '#F3E8FF', color: '#5B21B6' },
  { icon: ShoppingBag, bg: '#FEF3C7', color: '#D97706' },
  { icon: Sparkles, bg: '#DCFCE7', color: '#16A34A' },
  { icon: CreditCard, bg: '#E0F2FE', color: '#0284C7' },
  { icon: Gamepad2, bg: '#FCE7F3', color: '#DB2777' },
  { icon: MapPin, bg: '#FFEDD5', color: '#EA580C' }
];

export default function WatchAds({ refreshWallet }) {
  const [ads, setAds] = useState([]);
  const [completedAdIds, setCompletedAdIds] = useState([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [dailyLimit, setDailyLimit] = useState(10);
  const [activeAd, setActiveAd] = useState(null);
  const [adTimer, setAdTimer] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const res = await api.get('/ads');
      if (res.data.success) {
        setAds(res.data.ads);
        setCompletedAdIds(res.data.completed_ad_ids || []);
        setCompletedCount(res.data.completed_count || 0);
        setDailyLimit(res.data.daily_limit || 10);
      }
    } catch (err) {
      console.error('Failed to load ads', err);
    }
  };

  const handleStartAd = (ad) => {
    if (completedAdIds.includes(ad.id)) return;
    setActiveAd(ad);
    setAdTimer(ad.duration || 15);
    setMsg('');

    const interval = setInterval(() => {
      setAdTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleVerifyAd = async () => {
    if (!activeAd || adTimer > 0 || isVerifying) return;
    setIsVerifying(true);
    try {
      const res = await api.post('/ads/verify', { ad_id: activeAd.id });
      if (res.data.success) {
        setMsg(`🎉 Ad verified! +${res.data.reward_points} Points credited!`);
        setCompletedAdIds((prev) => [...prev, activeAd.id]);
        setCompletedCount(res.data.completed_count);
        refreshWallet();
        setTimeout(() => {
          setActiveAd(null);
          setMsg('');
        }, 2000);
      }
    } catch (err) {
      setMsg(err.response?.data?.message || 'Ad verification failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1100px', margin: '0 auto', width: '100%', paddingBottom: '90px', boxSizing: 'border-box' }}>
      
      {/* Header Banner */}
      <div className="card-violet-banner" style={{ padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ color: '#FFF', fontSize: '1.5rem', fontWeight: 800 }}>📺 Watch Sponsored Ads</h2>
          <p style={{ color: '#E9D5FF', fontSize: '0.875rem' }}>Earn +10 points per completed video ad (Max 10 per day)</p>
        </div>
        <div style={{ background: '#22C55E', color: '#FFF', fontWeight: 800, padding: '8px 18px', borderRadius: '16px', fontSize: '1rem', boxShadow: '0 4px 12px rgba(34,197,94,0.3)' }}>
          {completedCount} / {dailyLimit} Completed
        </div>
      </div>

      {/* ACTIVE AD PLAYER MODAL */}
      {activeAd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(14, 11, 31, 0.85)', backdropFilter: 'blur(10px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="card-white" style={{ maxWidth: '520px', width: '100%', padding: '32px 24px', textAlign: 'center', borderRadius: '24px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
              <Tv color="#5B21B6" size={32} />
            </div>
            <h3 style={{ color: '#1E1B4B', fontSize: '1.3rem', fontWeight: 800, marginBottom: '6px' }}>{activeAd.title}</h3>
            <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: '20px' }}>Please watch the full video to claim your +10 reward points.</p>

            {/* Video Placeholder Container */}
            <div style={{ width: '100%', height: '180px', background: '#1E1B4B', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', padding: '16px' }}>
              <Film color="#4ADE80" size={42} style={{ marginBottom: '10px' }} />
              <div style={{ color: '#FFF', fontSize: '1.1rem', fontWeight: 800 }}>
                {adTimer > 0 ? `Watching Video... ${adTimer}s remaining` : 'Video Complete! Click Verify Below'}
              </div>
            </div>

            {msg && (
              <div style={{ color: msg.includes('credited') ? '#16A34A' : '#DC2626', fontWeight: 800, marginBottom: '16px', fontSize: '0.95rem' }}>
                {msg}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setActiveAd(null)} style={{ flex: 1, background: '#F4F3F8', border: '1px solid #E5E7EB', color: '#5B21B6', padding: '12px', borderRadius: '14px', fontWeight: 800, cursor: 'pointer' }}>
                Cancel
              </button>
              <button
                onClick={handleVerifyAd}
                disabled={adTimer > 0 || isVerifying}
                className="btn-green"
                style={{ flex: 2, borderRadius: '14px', padding: '12px', opacity: adTimer > 0 ? 0.5 : 1, cursor: adTimer > 0 ? 'not-allowed' : 'pointer' }}
              >
                {isVerifying ? 'Verifying...' : adTimer > 0 ? `Wait ${adTimer}s` : 'Verify & Claim 10 Pts'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AD CARDS GRID (Light Theme with Ultra-Clean Icons & Typography) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', width: '100%' }}>
        {ads.map((ad, idx) => {
          const isDone = completedAdIds.includes(ad.id);
          const iconConfig = AD_ICONS[idx % AD_ICONS.length];
          const IconComp = iconConfig.icon;

          return (
            <div key={ad.id} className="card-white" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', width: '100%', boxSizing: 'border-box', opacity: isDone ? 0.75 : 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '180px' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '14px',
                  background: isDone ? '#F3F4F6' : iconConfig.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <IconComp size={22} color={isDone ? '#9CA3AF' : iconConfig.color} />
                </div>
                <div>
                  <h4 style={{ color: '#1E1B4B', fontSize: '0.95rem', fontWeight: 800, marginBottom: '2px', lineHeight: 1.3 }}>
                    Ad #{idx + 1}: {ad.title}
                  </h4>
                  <span style={{ color: '#16A34A', fontSize: '0.8rem', fontWeight: 800 }}>+10 Points</span>
                </div>
              </div>

              <button
                onClick={() => handleStartAd(ad)}
                disabled={isDone}
                style={{
                  background: isDone ? '#F3F4F6' : 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
                  color: isDone ? '#6B7280' : '#FFFFFF',
                  border: isDone ? '1px solid #E5E7EB' : 'none',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  cursor: isDone ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  flexShrink: 0,
                  boxShadow: isDone ? 'none' : '0 4px 12px rgba(34, 197, 94, 0.25)'
                }}
              >
                {isDone ? <><CheckCircle size={15} color="#16A34A" /> Watched</> : <><Play size={15} fill="#FFF" /> Watch</>}
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
}
