import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Film, CheckCircle, Play, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { mergeWallet } from '../../utils/walletUtils';

const DEFAULT_SLOTS = [
  { id: 'rewarded_slot_1', title: 'Daily Rewarded Video #1', reward_points: 10 },
  { id: 'rewarded_slot_2', title: 'Daily Rewarded Video #2', reward_points: 10 },
  { id: 'rewarded_slot_3', title: 'Daily Rewarded Video #3', reward_points: 10 },
  { id: 'rewarded_slot_4', title: 'Daily Rewarded Video #4', reward_points: 10 },
  { id: 'rewarded_slot_5', title: 'Daily Rewarded Video #5', reward_points: 10 },
  { id: 'rewarded_slot_6', title: 'Daily Rewarded Video #6', reward_points: 10 },
  { id: 'rewarded_slot_7', title: 'Daily Rewarded Video #7', reward_points: 10 },
  { id: 'rewarded_slot_8', title: 'Daily Rewarded Video #8', reward_points: 10 },
  { id: 'rewarded_slot_9', title: 'Daily Rewarded Video #9', reward_points: 10 },
  { id: 'rewarded_slot_10', title: 'Daily Rewarded Video #10', reward_points: 10 },
];

export default function WatchAds({ refreshWallet }) {
  const [ads, setAds] = useState(DEFAULT_SLOTS);
  const [completedAdIds, setCompletedAdIds] = useState([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [dailyLimit, setDailyLimit] = useState(10);
  const [adRewardPoints, setAdRewardPoints] = useState(10);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const res = await api.get('/ads');
      if (res.data && res.data.success) {
        setCompletedAdIds(res.data.completed_ad_ids || []);
        setCompletedCount(res.data.completed_count || 0);
        setDailyLimit(res.data.daily_limit || 10);
        setAdRewardPoints(res.data.ad_reward_points || 10);
      }
    } catch (err) {
      console.warn('Using client ads configuration fallback.');
    }
  };

  const handleOpenPrompt = (slot) => {
    if (completedAdIds.includes(slot.id)) return;
    setSelectedSlot(slot);
    setMsg('');
    setErrorMsg('');
  };

  // Google AdMob Rewarded Video completion handler
  const handleCompleteRewardedAd = async () => {
    if (!selectedSlot || isClaiming) return;
    setIsClaiming(true);
    setMsg('');
    setErrorMsg('');

    try {
      const res = await api.post('/ads/verify', { ad_id: selectedSlot.id });
      if (res.data && res.data.success) {
        const awardedPoints = res.data.reward_points || adRewardPoints;
        setMsg(`🎉 Rewarded video completed! +${awardedPoints} Points credited to your wallet.`);
        const updatedIds = [...completedAdIds, selectedSlot.id];
        setCompletedAdIds(updatedIds);
        setCompletedCount(updatedIds.length);
        if (typeof refreshWallet === 'function') {
          refreshWallet();
        }
        window.dispatchEvent(new Event('wallet_updated'));
        window.dispatchEvent(new Event('attendance_claimed'));
        setTimeout(() => {
          setSelectedSlot(null);
          setMsg('');
          setIsClaiming(false);
        }, 1800);
        return;
      }
      setErrorMsg(res.data?.message || 'Reward could not be verified. Please try again.');
    } catch (err) {
      setErrorMsg('Ad service is currently unavailable. Please check your network and retry.');
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '1100px', margin: '0 auto', width: '100%', paddingBottom: '90px', boxSizing: 'border-box' }}>
      
      {/* Header Banner */}
      <div className="card-violet-banner" style={{ padding: '20px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ color: '#FFF', fontSize: '1.35rem', fontWeight: 800, margin: '0 0 4px 0' }}>🎬 Rewarded Videos Hub</h2>
          <p style={{ color: '#E9D5FF', fontSize: '0.825rem', margin: 0 }}>Watch short rewarded videos to earn +{adRewardPoints} Points each (Daily limit: {dailyLimit})</p>
        </div>
        <div style={{ background: '#22C55E', color: '#FFF', fontWeight: 800, padding: '6px 14px', borderRadius: '14px', fontSize: '0.9rem', boxShadow: '0 4px 12px rgba(34,197,94,0.3)', flexShrink: 0 }}>
          {completedCount} / {dailyLimit} Completed
        </div>
      </div>

      {/* POLICY-COMPLIANT OPT-IN MODAL */}
      {selectedSlot && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(14, 11, 31, 0.85)', backdropFilter: 'blur(10px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="card-white" style={{ maxWidth: '440px', width: '100%', padding: '28px 24px', textAlign: 'center', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.35)' }}>
            
            <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px auto' }}>
              <Film color="#7C3AED" size={28} />
            </div>

            <h3 style={{ color: '#1E1B4B', fontSize: '1.25rem', fontWeight: 800, marginBottom: '6px' }}>
              Watch Rewarded Video
            </h3>

            <p style={{ color: '#6B7280', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '18px' }}>
              Watch a short video ad to the end to earn <strong style={{ color: '#16A34A' }}>+{adRewardPoints} Points</strong> directly credited to your wallet balance.
            </p>

            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '12px', marginBottom: '20px', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '0.8rem', fontWeight: 600 }}>
                <Sparkles size={16} color="#7C3AED" />
                <span>Reward: +{adRewardPoints} Points credited upon completion</span>
              </div>
            </div>

            {msg && (
              <div style={{ color: '#16A34A', fontWeight: 800, marginBottom: '14px', fontSize: '0.9rem' }}>
                {msg}
              </div>
            )}

            {errorMsg && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', color: '#DC2626', fontWeight: 700, marginBottom: '14px', fontSize: '0.85rem' }}>
                <AlertCircle size={15} />
                <span>{errorMsg}</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setSelectedSlot(null)}
                disabled={isClaiming}
                style={{
                  flex: 1,
                  background: '#F4F3F8',
                  border: '1px solid #E5E7EB',
                  color: '#6B7280',
                  padding: '12px',
                  borderRadius: '14px',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: isClaiming ? 'not-allowed' : 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteRewardedAd}
                disabled={isClaiming}
                className="btn-green"
                style={{
                  flex: 2,
                  borderRadius: '14px',
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  fontSize: '0.95rem',
                  boxShadow: '0 4px 14px rgba(34, 197, 94, 0.35)',
                  cursor: isClaiming ? 'not-allowed' : 'pointer'
                }}
              >
                {isClaiming ? (
                  <>
                    <RefreshCw size={16} className="spin-icon" /> Completing...
                  </>
                ) : (
                  <>
                    <Play size={16} fill="#FFF" /> Watch Video (+{adRewardPoints} Pts)
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REWARDED VIDEO SLOTS LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
        {ads.map((slot) => {
          const isDone = completedAdIds.includes(slot.id);

          return (
            <div key={slot.id} className="card-white" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', width: '100%', boxSizing: 'border-box', opacity: isDone ? 0.75 : 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '160px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '14px',
                  background: isDone ? '#F3F4F6' : '#F3E8FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {isDone ? (
                    <CheckCircle size={20} color="#16A34A" />
                  ) : (
                    <Film size={20} color="#7C3AED" />
                  )}
                </div>
                <div>
                  <h4 style={{ color: '#1E1B4B', fontSize: '0.9rem', fontWeight: 800, marginBottom: '2px', lineHeight: 1.3 }}>
                    {slot.title}
                  </h4>
                  <span style={{ color: '#16A34A', fontSize: '0.775rem', fontWeight: 800 }}>+{adRewardPoints} Points</span>
                </div>
              </div>

              <button
                onClick={() => handleOpenPrompt(slot)}
                disabled={isDone}
                style={{
                  background: isDone ? '#F3F4F6' : 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
                  color: isDone ? '#6B7280' : '#FFFFFF',
                  border: isDone ? '1px solid #E5E7EB' : 'none',
                  padding: '8px 16px',
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
                {isDone ? <><CheckCircle size={14} color="#16A34A" /> Claimed</> : <><Play size={14} fill="#FFF" /> Watch Video</>}
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
}
