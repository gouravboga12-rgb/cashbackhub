import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Film, CheckCircle, Play, AlertCircle, Sparkles } from 'lucide-react';

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

    // Timer countdown
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #311042 50%, #5B21B6 100%)', borderRadius: '20px', padding: '24px 32px', border: '1px solid rgba(124, 58, 237, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ color: '#FFF', fontSize: '1.6rem', fontWeight: 800 }}>📺 Watch Sponsored Ads</h2>
          <p style={{ color: '#C4B5FD', fontSize: '0.9rem' }}>Earn +10 points per completed video ad (Max 10 per day)</p>
        </div>
        <div style={{ background: '#22C55E', color: '#FFF', fontWeight: 800, padding: '10px 20px', borderRadius: '14px', fontSize: '1.1rem' }}>
          {completedCount} / {dailyLimit} Completed
        </div>
      </div>

      {/* ACTIVE AD PLAYER MODAL */}
      {activeAd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(14, 11, 31, 0.9)', backdropFilter: 'blur(10px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-card-dark" style={{ maxWidth: '560px', width: '100%', padding: '32px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>{activeAd.thumbnail || '🎬'}</div>
            <h3 style={{ color: '#FFF', fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>{activeAd.title}</h3>
            <p style={{ color: '#C4B5FD', fontSize: '0.9rem', marginBottom: '24px' }}>Please watch the full video to claim your +10 reward points.</p>

            {/* Video Placeholder Container */}
            <div style={{ width: '100%', height: '200px', background: '#000', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid #7C3AED', marginBottom: '24px' }}>
              <Film color="#4ADE80" size={48} style={{ marginBottom: '12px' }} />
              <div style={{ color: '#FFF', fontSize: '1.2rem', fontWeight: 800 }}>
                {adTimer > 0 ? `Watching Video... ${adTimer}s remaining` : 'Video Complete! Click Verify Below'}
              </div>
            </div>

            {msg && (
              <div style={{ color: msg.includes('credited') ? '#4ADE80' : '#EF4444', fontWeight: 800, marginBottom: '16px' }}>
                {msg}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setActiveAd(null)} style={{ flex: 1, background: 'transparent', border: '1px solid #3B2F6B', color: '#C4B5FD', padding: '12px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>
                Cancel
              </button>
              <button
                onClick={handleVerifyAd}
                disabled={adTimer > 0 || isVerifying}
                className="btn-green"
                style={{ flex: 2, opacity: adTimer > 0 ? 0.5 : 1, cursor: adTimer > 0 ? 'not-allowed' : 'pointer' }}
              >
                {isVerifying ? 'Verifying...' : adTimer > 0 ? `Wait ${adTimer}s` : 'Verify & Claim 10 Pts'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AD CARDS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {ads.map((ad, idx) => {
          const isDone = completedAdIds.includes(ad.id);
          return (
            <div key={ad.id} className="glass-card-dark" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: isDone ? 0.6 : 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#1E1445', border: '1px solid #3B2F6B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                  {ad.thumbnail || '🎬'}
                </div>
                <div>
                  <h4 style={{ color: '#FFF', fontSize: '0.95rem', fontWeight: 700, marginBottom: '2px' }}>Ad #{idx + 1}: {ad.title}</h4>
                  <span style={{ color: '#4ADE80', fontSize: '0.8rem', fontWeight: 800 }}>+10 Points</span>
                </div>
              </div>

              <button
                onClick={() => handleStartAd(ad)}
                disabled={isDone}
                className={isDone ? "btn-primary" : "btn-green"}
                style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '0.85rem' }}
              >
                {isDone ? <><CheckCircle size={16} /> Watched</> : <><Play size={16} /> Watch</>}
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
}
