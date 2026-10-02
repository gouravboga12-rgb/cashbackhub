import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import Dice3D from '../../components/Dice3D';
import {
  Sparkles,
  Trophy,
  Tv,
  Film,
  CheckCircle,
  Play,
  RotateCcw,
  Zap,
  Info,
  Clock,
  ArrowRight,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { mergeWallet } from '../../utils/walletUtils';

const DEFAULT_FACES = [
  { face: 1, points: 0, label: 'Better Luck Next Time' },
  { face: 2, points: 0, label: 'Better Luck Next Time' },
  { face: 3, points: 5, label: '+5 Points' },
  { face: 4, points: 5, label: '+5 Points' },
  { face: 5, points: 8, label: '+8 Points' },
  { face: 6, points: 10, label: '+10 Points' }
];

const SPONSOR_ADS = [
  {
    id: 'ad_phonepe',
    title: 'PhonePe Instant Cashback Deals',
    brand: 'PhonePe',
    tagline: 'Flat ₹100 Cashback on UPI Bills',
    description: 'Pay electric, mobile & water bills on PhonePe to unlock instant scratch cards daily!',
    icon: '💳',
    gradient: 'linear-gradient(135deg, #4C1D95 0%, #6D28D9 100%)'
  },
  {
    id: 'ad_flipkart',
    title: 'Flipkart Mega Savings Offer',
    brand: 'Flipkart',
    tagline: 'Up to 80% Off + Instant ₹500 Voucher',
    description: 'Discover trending smartphones, smartwatches and lifestyle products at lowest prices.',
    icon: '🛍️',
    gradient: 'linear-gradient(135deg, #1E40AF 0%, #2563EB 100%)'
  },
  {
    id: 'ad_amazon',
    title: 'Amazon Pay Shopping Bonus',
    brand: 'Amazon Pay',
    tagline: 'Earn Flat 5% Cashback on All Orders',
    description: 'Shop over 10 million products and earn unlimited rewards credited directly to your balance.',
    icon: '📦',
    gradient: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)'
  },
  {
    id: 'ad_swiggy',
    title: 'Swiggy Instamart 10-Min Delivery',
    brand: 'Swiggy',
    tagline: 'Groceries Delivered to Door in 10 Mins',
    description: 'Fresh fruits, snacks, dairy and household essentials delivered instantly. Code: INSTA50.',
    icon: '🍔',
    gradient: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)'
  },
  {
    id: 'ad_gplay',
    title: 'Google Play Games Festival',
    brand: 'Google Play',
    tagline: 'Unlock Exclusive In-Game Vouchers',
    description: 'Claim exclusive skins, power-ups and premium games on the Google Play Store today.',
    icon: '🎮',
    gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)'
  }
];

export default function PlayDice({ refreshWallet }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    daily_limit: 10,
    ad_duration_seconds: 6,
    faces: DEFAULT_FACES
  });
  const [completedCount, setCompletedCount] = useState(0);
  const [dailyLimit, setDailyLimit] = useState(10);
  const [recentRolls, setRecentRolls] = useState([]);

  // Ad Watching & Dice Rolling Flow states
  const [activeAd, setActiveAd] = useState(null);
  const [adTimer, setAdTimer] = useState(0);
  const [adDuration, setAdDuration] = useState(6);
  const [isAdFinished, setIsAdFinished] = useState(false);

  const [currentFace, setCurrentFace] = useState(1);
  const [isRolling, setIsRolling] = useState(false);
  const [rollResult, setRollResult] = useState(null);
  const [lastWonPoints, setLastWonPoints] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    fetchDiceData();
  }, []);

  const fetchDiceData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dice');
      if (res.data && res.data.success) {
        if (res.data.settings) {
          setSettings(res.data.settings);
          setAdDuration(res.data.settings.ad_duration_seconds || 6);
        }
        setCompletedCount(res.data.rolls_completed_today || 0);
        setDailyLimit(res.data.daily_limit || 10);
        setRecentRolls(res.data.recent_rolls || []);
      }
    } catch (err) {
      console.warn('Backend dice API offline or loading fallback:', err);
      // Fallback local read
      const savedCount = parseInt(localStorage.getItem('cashback_dice_completed_today') || '0', 10);
      setCompletedCount(savedCount);
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Click "Play Dice" -> Starts Sponsor Ad
  const handleInitiateRoll = () => {
    if (completedCount >= dailyLimit || isRolling || activeAd) return;

    // Pick random sponsor ad
    const randomAd = SPONSOR_ADS[Math.floor(Math.random() * SPONSOR_ADS.length)];
    setActiveAd(randomAd);
    setIsAdFinished(false);
    setRollResult(null);
    setStatusMessage('');

    const dur = settings.ad_duration_seconds || 6;
    setAdTimer(dur);

    const interval = setInterval(() => {
      setAdTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsAdFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Step 2: Once Ad finishes -> Close Ad Modal & trigger 3D Dice Roll
  const handleAdDoneAndRoll = async () => {
    const chosenAd = activeAd;
    setActiveAd(null);
    setIsAdFinished(false);
    setIsRolling(true);
    setRollResult(null);
    setStatusMessage('Rolling the lucky 3D die...');

    try {
      const res = await api.post('/dice/roll', {
        ad_id: chosenAd ? chosenAd.id : 'ad_phonepe',
        ad_title: chosenAd ? chosenAd.title : 'Sponsored Ad'
      });

      if (res.data && res.data.success) {
        const winningFace = res.data.face;
        const awardedPoints = res.data.reward_points;

        // Set target face for 3D animation
        setCurrentFace(winningFace);

        // Animation finishes in 1.9s
        setTimeout(() => {
          setIsRolling(false);
          setRollResult({
            face: winningFace,
            points: awardedPoints,
            label: res.data.label
          });
          setLastWonPoints(awardedPoints);
          setCompletedCount(res.data.rolls_completed_today);

          // Update wallet if points awarded
          if (res.data.wallet) {
            mergeWallet(res.data.wallet, awardedPoints);
          }
          if (typeof refreshWallet === 'function') {
            refreshWallet();
          }
          window.dispatchEvent(new Event('wallet_updated'));
          window.dispatchEvent(new Event('attendance_claimed'));

          // Add to recent rolls table
          setRecentRolls((prev) => [
            {
              id: `dice_${Date.now()}`,
              face: winningFace,
              reward_points: awardedPoints,
              label: res.data.label,
              created_at: new Date().toISOString()
            },
            ...prev
          ]);
        }, 1900);
        return;
      }
    } catch (err) {
      console.warn('Backend roll failed, performing client roll fallback:', err);
    }

    // Client-side fallback if server offline
    const faces = settings.faces || DEFAULT_FACES;
    const randomFace = faces[Math.floor(Math.random() * faces.length)] || { face: 6, points: 10 };
    setCurrentFace(randomFace.face);

    setTimeout(() => {
      setIsRolling(false);
      setRollResult({
        face: randomFace.face,
        points: randomFace.points,
        label: randomFace.label
      });
      setLastWonPoints(randomFace.points);
      const newCount = completedCount + 1;
      setCompletedCount(newCount);
      localStorage.setItem('cashback_dice_completed_today', newCount.toString());

      // Update wallet locally
      if (randomFace.points > 0) {
        try {
          const walletData = localStorage.getItem('cashback_wallet') || JSON.stringify({ available_points: 0, total_earned: 0 });
          const parsed = JSON.parse(walletData);
          parsed.available_points = (parsed.available_points || 0) + randomFace.points;
          parsed.total_earned = (parsed.total_earned || 0) + randomFace.points;
          localStorage.setItem('cashback_wallet', JSON.stringify(parsed));
        } catch (e) {}
      }

      if (typeof refreshWallet === 'function') {
        refreshWallet();
      }
      window.dispatchEvent(new Event('wallet_updated'));
    }, 1900);
  };

  const isLimitReached = completedCount >= dailyLimit;
  const remainingRolls = Math.max(0, dailyLimit - completedCount);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '1000px', margin: '0 auto', width: '100%', paddingBottom: '90px', boxSizing: 'border-box' }}>
      
      {/* HEADER BANNER */}
      <div
        className="card-violet-banner"
        style={{
          padding: '22px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          background: 'linear-gradient(135deg, #4C1D95 0%, #5B21B6 50%, #2563EB 100%)',
          borderRadius: '24px',
          boxShadow: '0 8px 24px rgba(91, 33, 182, 0.25)'
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.18)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, color: '#FFF', marginBottom: '8px' }}>
            <Sparkles size={14} /> SPONSOR AD REWARD GAME
          </div>
          <h2 style={{ color: '#FFF', fontSize: '1.45rem', fontWeight: 900, margin: '0 0 6px 0', letterSpacing: '-0.3px' }}>
            🎲 Play Lucky 3D Dice
          </h2>
          <p style={{ color: '#E9D5FF', fontSize: '0.875rem', margin: 0 }}>
            Watch a quick sponsor ad & roll the lucky die. Win up to +10 instant wallet points per roll!
          </p>
        </div>

        <div style={{
          background: isLimitReached ? '#6B7280' : '#22C55E',
          color: '#FFF',
          fontWeight: 800,
          padding: '8px 16px',
          borderRadius: '16px',
          fontSize: '0.95rem',
          boxShadow: isLimitReached ? 'none' : '0 4px 14px rgba(34, 197, 94, 0.35)',
          flexShrink: 0
        }}>
          {completedCount} / {dailyLimit} Rolls Today
        </div>
      </div>

      {/* SPONSOR AD MODAL (Plays before rolling) */}
      {activeAd && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(14, 11, 31, 0.88)',
          backdropFilter: 'blur(12px)',
          zIndex: 300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div className="card-white" style={{ maxWidth: '440px', width: '100%', padding: '26px 22px', textAlign: 'center', borderRadius: '26px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
            
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#F3E8FF', color: '#5B21B6', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, marginBottom: '12px' }}>
              <Tv size={14} /> SPONSORED ADVERTISEMENT
            </div>

            <h3 style={{ color: '#1E1B4B', fontSize: '1.25rem', fontWeight: 800, marginBottom: '4px' }}>
              {activeAd.title}
            </h3>
            <p style={{ color: '#6B7280', fontSize: '0.825rem', marginBottom: '16px' }}>
              Watch the full sponsor message below to unlock your lucky 3D dice roll!
            </p>

            {/* AD VISUAL PLAYER CONTAINER */}
            <div style={{
              width: '100%',
              minHeight: '170px',
              background: activeAd.gradient,
              borderRadius: '20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '18px',
              padding: '20px',
              boxSizing: 'border-box',
              color: '#FFF',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <span style={{ fontSize: '2.5rem', marginBottom: '8px' }}>{activeAd.icon}</span>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 900, margin: '0 0 6px 0', textAlign: 'center' }}>
                {activeAd.tagline}
              </h4>
              <p style={{ fontSize: '0.8rem', opacity: 0.9, margin: 0, textAlign: 'center', lineHeight: 1.4 }}>
                {activeAd.description}
              </p>

              {/* Live Timer Badge */}
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'rgba(0, 0, 0, 0.65)',
                color: '#4ADE80',
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '0.775rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Clock size={12} /> {adTimer > 0 ? `${adTimer}s remaining` : 'Ready to Roll!'}
              </div>
            </div>

            {/* Progress Bar */}
            <div style={{ width: '100%', height: '8px', background: '#F3F4F6', borderRadius: '4px', overflow: 'hidden', marginBottom: '18px' }}>
              <div
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #7C3AED, #22C55E)',
                  width: `${((adDuration - adTimer) / adDuration) * 100}%`,
                  transition: 'width 1s linear'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  setActiveAd(null);
                  setIsAdFinished(false);
                }}
                style={{
                  flex: 1,
                  background: '#F4F3F8',
                  border: '1px solid #E5E7EB',
                  color: '#6B7280',
                  padding: '12px',
                  borderRadius: '14px',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAdDoneAndRoll}
                disabled={adTimer > 0}
                className="btn-green"
                style={{
                  flex: 2,
                  borderRadius: '14px',
                  padding: '12px',
                  opacity: adTimer > 0 ? 0.5 : 1,
                  cursor: adTimer > 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                {adTimer > 0 ? `Wait ${adTimer}s...` : <><Play size={16} fill="#FFF" /> Roll 3D Dice Now!</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN 3D DICE GAMEPLAY CARD */}
      <div
        className="card-white"
        style={{
          padding: '28px 20px',
          borderRadius: '26px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          boxShadow: '0 8px 30px rgba(91, 33, 182, 0.08)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Subtle Background Glow Accent */}
        <div
          style={{
            position: 'absolute',
            top: '-50px',
            width: '260px',
            height: '260px',
            background: 'radial-gradient(circle, rgba(124, 58, 237, 0.12) 0%, transparent 70%)',
            pointerEvents: 'none'
          }}
        />

        {/* 3D Dice Component */}
        <Dice3D
          targetFace={currentFace}
          isRolling={isRolling}
          size={110}
        />

        {/* RESULT ANNOUNCEMENT */}
        {rollResult && !isRolling && (
          <div
            style={{
              marginTop: '12px',
              marginBottom: '16px',
              padding: '14px 22px',
              borderRadius: '18px',
              background: rollResult.points > 0
                ? 'linear-gradient(135deg, #DCFCE7 0%, #BBF7D0 100%)'
                : 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)',
              border: rollResult.points > 0 ? '2px solid #86EFAC' : '2px solid #D1D5DB',
              maxWidth: '380px',
              width: '100%',
              boxSizing: 'border-box',
              animation: 'bounceIn 0.5s ease-out'
            }}
          >
            {rollResult.points > 0 ? (
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#16A34A', fontWeight: 900, fontSize: '1.25rem', marginBottom: '2px' }}>
                  <Sparkles size={20} /> Won +{rollResult.points} Points!
                </div>
                <p style={{ color: '#15803D', fontSize: '0.85rem', margin: 0, fontWeight: 700 }}>
                  Rolled Face {rollResult.face} &bull; Credited to your wallet balance!
                </p>
              </div>
            ) : (
              <div>
                <div style={{ color: '#4B5563', fontWeight: 800, fontSize: '1.05rem', marginBottom: '2px' }}>
                  Better Luck Next Time!
                </div>
                <p style={{ color: '#6B7280', fontSize: '0.825rem', margin: 0 }}>
                  Rolled Face {rollResult.face}. No reward this turn &bull; Roll again to win!
                </p>
              </div>
            )}
          </div>
        )}

        {/* ACTION BUTTON */}
        <div style={{ width: '100%', maxWidth: '380px', marginTop: rollResult ? '4px' : '10px' }}>
          {isLimitReached ? (
            <div style={{ background: '#F3F4F6', color: '#6B7280', padding: '14px', borderRadius: '18px', fontWeight: 800, fontSize: '0.95rem', border: '1px solid #E5E7EB' }}>
              🎯 All {dailyLimit} daily rolls completed! Check back tomorrow.
            </div>
          ) : (
            <button
              onClick={handleInitiateRoll}
              disabled={isRolling}
              className="btn-violet"
              style={{
                width: '100%',
                padding: '14px 20px',
                borderRadius: '18px',
                fontSize: '1.05rem',
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 8px 24px rgba(91, 33, 182, 0.35)',
                cursor: isRolling ? 'not-allowed' : 'pointer'
              }}
            >
              {isRolling ? (
                <>🎲 Rolling Dice...</>
              ) : (
                <>
                  <Play size={18} fill="#FFF" /> Watch Ad & Roll Dice ({remainingRolls} Left)
                </>
              )}
            </button>
          )}

          <p style={{ color: '#9CA3AF', fontSize: '0.775rem', marginTop: '10px', marginBottom: 0 }}>
            ⚡ Each turn displays a quick sponsor ad & awards instant points upon rolling.
          </p>
        </div>

      </div>

      {/* FACE REWARDS REFERENCE MATRIX */}
      <div className="card-white" style={{ padding: '20px 18px', borderRadius: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h4 style={{ color: '#1E1B4B', fontSize: '1rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Trophy size={18} color="#D97706" /> Dice Face Payout Matrix
          </h4>
          <span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 700 }}>
            Configured by Admin
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '10px'
        }}>
          {(settings.faces || DEFAULT_FACES).map((f) => {
            const isSelected = currentFace === f.face && !isRolling;
            const pts = parseInt(f.points, 10) || 0;

            return (
              <div
                key={f.face}
                style={{
                  padding: '12px 10px',
                  borderRadius: '16px',
                  background: isSelected ? '#F3E8FF' : '#F9FAFB',
                  border: isSelected ? '2px solid #7C3AED' : '1px solid #E5E7EB',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  transition: 'all 0.2s ease-in-out',
                  transform: isSelected ? 'scale(1.03)' : 'scale(1)'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: isSelected ? '#7C3AED' : '#1E1B4B',
                  color: '#FFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '1rem',
                  marginBottom: '6px'
                }}>
                  {f.face === 1 && '⚀'}
                  {f.face === 2 && '⚁'}
                  {f.face === 3 && '⚂'}
                  {f.face === 4 && '⚃'}
                  {f.face === 5 && '⚄'}
                  {f.face === 6 && '⚅'}
                </div>

                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1E1B4B', marginBottom: '2px' }}>
                  Face {f.face}
                </div>

                <div style={{
                  fontSize: '0.85rem',
                  fontWeight: 900,
                  color: pts > 0 ? '#16A34A' : '#9CA3AF'
                }}>
                  {pts > 0 ? `+${pts} Pts` : '0 Pts'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* TODAY'S RECENT ROLLS HISTORY */}
      {recentRolls.length > 0 && (
        <div className="card-white" style={{ padding: '20px 18px', borderRadius: '24px' }}>
          <h4 style={{ color: '#1E1B4B', fontSize: '1rem', fontWeight: 800, margin: '0 0 12px 0' }}>
            🕒 Today's Dice Rolls Activity
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentRolls.map((roll, idx) => (
              <div
                key={roll.id || idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: '#F9FAFB',
                  borderRadius: '14px',
                  border: '1px solid #F3F4F6'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#EDE9FE', color: '#5B21B6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem' }}>
                    {roll.face}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1E1B4B' }}>
                      Rolled Face {roll.face} ({roll.label || 'Dice Roll'})
                    </div>
                    <div style={{ fontSize: '0.725rem', color: '#9CA3AF' }}>
                      {roll.created_at ? new Date(roll.created_at).toLocaleTimeString() : 'Today'}
                    </div>
                  </div>
                </div>

                <span style={{ fontWeight: 900, fontSize: '0.85rem', color: (roll.reward_points || 0) > 0 ? '#16A34A' : '#9CA3AF' }}>
                  {(roll.reward_points || 0) > 0 ? `+${roll.reward_points} Pts` : '0 Pts'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
