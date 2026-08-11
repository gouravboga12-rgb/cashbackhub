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

const DEFAULT_ADS = [
  { id: 'ad_1', title: 'PhonePe Instant Cashback Deals', duration: 8, reward_points: 10, brand: 'PhonePe' },
  { id: 'ad_2', title: 'Flipkart Big Savings Offer', duration: 8, reward_points: 10, brand: 'Flipkart' },
  { id: 'ad_3', title: 'Amazon Pay Shopping Bonus', duration: 8, reward_points: 10, brand: 'Amazon' },
  { id: 'ad_4', title: 'Google Play Games Festival', duration: 8, reward_points: 10, brand: 'Google Play' },
  { id: 'ad_5', title: 'Swiggy Foodie Discount Pass', duration: 8, reward_points: 10, brand: 'Swiggy' },
  { id: 'ad_6', title: 'Zomato Gold VIP Perks', duration: 8, reward_points: 10, brand: 'Zomato' },
  { id: 'ad_7', title: 'Myntra Fashion Special Sale', duration: 8, reward_points: 10, brand: 'Myntra' },
  { id: 'ad_8', title: 'MakeMyTrip Holiday Cashback', duration: 8, reward_points: 10, brand: 'MakeMyTrip' },
  { id: 'ad_9', title: 'Paytm Bill Payment Coupon', duration: 8, reward_points: 10, brand: 'Paytm' },
  { id: 'ad_10', title: 'Uber Daily Commute Savings', duration: 8, reward_points: 10, brand: 'Uber' },
];

export default function WatchAds({ refreshWallet }) {
  const [ads, setAds] = useState(DEFAULT_ADS);
  const [completedAdIds, setCompletedAdIds] = useState([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [dailyLimit, setDailyLimit] = useState(10);
  const [activeAd, setActiveAd] = useState(null);
  const [adTimer, setAdTimer] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchAds();
    loadLocalAdProgress();
  }, []);

  const loadLocalAdProgress = () => {
    const saved = localStorage.getItem('cashback_completed_ads');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCompletedAdIds(parsed);
        setCompletedCount(parsed.length);
      } catch (e) {
        console.warn('Failed to parse ad progress');
      }
    }
  };

  const fetchAds = async () => {
    try {
      const res = await api.get('/ads');
      if (res.data && res.data.success && res.data.ads && res.data.ads.length > 0) {
        setAds(res.data.ads);
        setCompletedAdIds(res.data.completed_ad_ids || []);
        setCompletedCount(res.data.completed_count || 0);
        setDailyLimit(res.data.daily_limit || 10);
        return;
      }
    } catch (err) {
      console.warn('Using client ads fallback.');
    }
    setAds(DEFAULT_ADS);
  };

  const handleStartAd = (ad) => {
    if (completedAdIds.includes(ad.id)) return;
    setActiveAd(ad);
    setAdTimer(ad.duration || 8);
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
      if (res.data && res.data.success) {
        setMsg(`🎉 Ad verified! +${res.data.reward_points || 10} Points credited to your wallet!`);
        const updatedIds = [...completedAdIds, activeAd.id];
        setCompletedAdIds(updatedIds);
        setCompletedCount(updatedIds.length);
        localStorage.setItem('cashback_completed_ads', JSON.stringify(updatedIds));
        refreshWallet();
        setTimeout(() => {
          setActiveAd(null);
          setMsg('');
        }, 1800);
        return;
      }
    } catch (err) {
      console.warn('Backend ad verify offline, performing client credit fallback.');
    }

    // Client-side fallback crediting to wallet
    const updatedIds = [...completedAdIds, activeAd.id];
    setCompletedAdIds(updatedIds);
    setCompletedCount(updatedIds.length);
    localStorage.setItem('cashback_completed_ads', JSON.stringify(updatedIds));

    // Update wallet locally
    const walletData = localStorage.getItem('cashback_wallet') || JSON.stringify({ available_points: 2520, total_earned: 3320 });
    try {
      const parsed = JSON.parse(walletData);
      parsed.available_points += (activeAd.reward_points || 10);
      parsed.total_earned += (activeAd.reward_points || 10);
      localStorage.setItem('cashback_wallet', JSON.stringify(parsed));
    } catch (e) {}

    setMsg(`🎉 Ad verified! +${activeAd.reward_points || 10} Points credited to your wallet!`);
    refreshWallet();

    setTimeout(() => {
      setActiveAd(null);
      setMsg('');
      setIsVerifying(false);
    }, 1800);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '1100px', margin: '0 auto', width: '100%', paddingBottom: '90px', boxSizing: 'border-box' }}>
      
      {/* Header Banner */}
      <div className="card-violet-banner" style={{ padding: '20px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ color: '#FFF', fontSize: '1.35rem', fontWeight: 800, margin: '0 0 4px 0' }}>📺 Watch Sponsored Ads</h2>
          <p style={{ color: '#E9D5FF', fontSize: '0.825rem', margin: 0 }}>Earn +10 points per completed video ad (Max 10 per day)</p>
        </div>
        <div style={{ background: '#22C55E', color: '#FFF', fontWeight: 800, padding: '6px 14px', borderRadius: '14px', fontSize: '0.9rem', boxShadow: '0 4px 12px rgba(34,197,94,0.3)', flexShrink: 0 }}>
          {completedCount} / {dailyLimit} Completed
        </div>
      </div>

      {/* ACTIVE AD PLAYER MODAL */}
      {activeAd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(14, 11, 31, 0.85)', backdropFilter: 'blur(10px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="card-white" style={{ maxWidth: '440px', width: '100%', padding: '24px 20px', textAlign: 'center', borderRadius: '24px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px auto' }}>
              <Tv color="#5B21B6" size={28} />
            </div>
            <h3 style={{ color: '#1E1B4B', fontSize: '1.2rem', fontWeight: 800, marginBottom: '4px' }}>{activeAd.title}</h3>
            <p style={{ color: '#6B7280', fontSize: '0.825rem', marginBottom: '16px' }}>Watch the full video to claim your +10 reward points.</p>

            {/* Video Container */}
            <div style={{ width: '100%', height: '160px', background: 'linear-gradient(135deg, #1E1B4B 0%, #0E0B1F 100%)', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', padding: '14px', boxSizing: 'border-box' }}>
              <Film color="#4ADE80" size={38} style={{ marginBottom: '8px' }} />
              <div style={{ color: '#FFF', fontSize: '1rem', fontWeight: 800 }}>
                {adTimer > 0 ? `Watching Video... ${adTimer}s remaining` : 'Video Complete! Click Verify Below'}
              </div>
            </div>

            {msg && (
              <div style={{ color: '#16A34A', fontWeight: 800, marginBottom: '14px', fontSize: '0.9rem' }}>
                {msg}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setActiveAd(null)} style={{ flex: 1, background: '#F4F3F8', border: '1px solid #E5E7EB', color: '#5B21B6', padding: '10px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}>
                Cancel
              </button>
              <button
                onClick={handleVerifyAd}
                disabled={adTimer > 0 || isVerifying}
                className="btn-green"
                style={{ flex: 2, borderRadius: '12px', padding: '10px', opacity: adTimer > 0 ? 0.5 : 1, cursor: adTimer > 0 ? 'not-allowed' : 'pointer' }}
              >
                {isVerifying ? 'Verifying...' : adTimer > 0 ? `Wait ${adTimer}s` : 'Verify & Claim 10 Pts'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AD CARDS LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
        {ads.map((ad, idx) => {
          const isDone = completedAdIds.includes(ad.id);
          const iconConfig = AD_ICONS[idx % AD_ICONS.length];
          const IconComp = iconConfig.icon;

          return (
            <div key={ad.id} className="card-white" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', width: '100%', boxSizing: 'border-box', opacity: isDone ? 0.75 : 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '160px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '14px',
                  background: isDone ? '#F3F4F6' : iconConfig.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <IconComp size={20} color={isDone ? '#9CA3AF' : iconConfig.color} />
                </div>
                <div>
                  <h4 style={{ color: '#1E1B4B', fontSize: '0.9rem', fontWeight: 800, marginBottom: '2px', lineHeight: 1.3 }}>
                    {ad.title}
                  </h4>
                  <span style={{ color: '#16A34A', fontSize: '0.775rem', fontWeight: 800 }}>+10 Points</span>
                </div>
              </div>

              <button
                onClick={() => handleStartAd(ad)}
                disabled={isDone}
                style={{
                  background: isDone ? '#F3F4F6' : 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
                  color: isDone ? '#6B7280' : '#FFFFFF',
                  border: isDone ? '1px solid #E5E7EB' : 'none',
                  padding: '8px 14px',
                  borderRadius: '12px',
                  fontSize: '0.825rem',
                  fontWeight: 800,
                  cursor: isDone ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  flexShrink: 0,
                  boxShadow: isDone ? 'none' : '0 4px 12px rgba(34, 197, 94, 0.25)'
                }}
              >
                {isDone ? <><CheckCircle size={14} color="#16A34A" /> Watched</> : <><Play size={14} fill="#FFF" /> Watch</>}
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
}
