import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { Package, Sparkles, Clock, CheckCircle, ArrowLeft, AlertCircle, RefreshCw, Gift, Trophy } from 'lucide-react';

export default function MysteryBox({ user, refreshWallet }) {
  const navigate = useNavigate();

  const [boxState, setBoxState] = useState('loading'); // 'loading', 'ready', 'shaking', 'opened', 'cooldown'
  const [eligible, setEligible] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [nextAvailableAt, setNextAvailableAt] = useState(null);
  const [pointsWon, setPointsWon] = useState(0);
  const [winMessage, setWinMessage] = useState('');
  const [tierLabel, setTierLabel] = useState('');
  const [settings, setSettings] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchMysteryBoxStatus();
  }, []);

  // Cooldown ticker
  useEffect(() => {
    let interval = null;
    if (secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            setEligible(true);
            setBoxState('ready');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [secondsRemaining]);

  const fetchMysteryBoxStatus = async () => {
    try {
      setBoxState('loading');
      const res = await api.get('/mystery-box');
      if (res.data?.success) {
        setEligible(res.data.eligible);
        setSecondsRemaining(res.data.seconds_remaining || 0);
        setNextAvailableAt(res.data.next_available_at);
        setSettings(res.data.settings);

        if (res.data.eligible) {
          setBoxState('ready');
        } else {
          setBoxState('cooldown');
        }
      }
    } catch (e) {
      console.warn('Failed to fetch Mystery Box status:', e);
      setBoxState('ready'); // Fallback
    }
  };

  const handleOpenBox = async () => {
    if (!eligible || boxState === 'shaking' || boxState === 'opened') return;
    setErrorMsg('');
    setBoxState('shaking');

    try {
      const res = await api.post('/mystery-box/open');
      if (res.data?.success) {
        const pts = res.data.points_won || 0;
        setPointsWon(pts);
        setWinMessage(res.data.message || `+${pts} Points won!`);
        setTierLabel(res.data.tier_label || (pts >= 50 ? 'Mega Jackpot!' : 'Lucky Reward!'));
        setNextAvailableAt(res.data.next_available_at);
        setSecondsRemaining(24 * 3600);
        setEligible(false);

        // Shake for 1.8 seconds, then open!
        setTimeout(() => {
          setBoxState('opened');
          if (typeof refreshWallet === 'function') refreshWallet();
          window.dispatchEvent(new Event('wallet_updated'));
        }, 1800);
      } else {
        setErrorMsg(res.data?.message || 'Could not open Mystery Box.');
        setBoxState('ready');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Network error opening box.';
      setErrorMsg(msg);
      if (err.response?.status === 429) {
        setBoxState('cooldown');
        setSecondsRemaining(err.response.data?.seconds_remaining || 3600);
      } else {
        setBoxState('ready');
      }
    }
  };

  const formatCountdown = (totalSec) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%', paddingBottom: '90px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
        <button
          onClick={() => navigate('/portal/dashboard')}
          style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '8px 14px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700, color: '#1E1B4B', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}
        >
          <ArrowLeft size={16} /> Dashboard
        </button>
        <div style={{ background: '#F3E8FF', color: '#7C3AED', padding: '6px 14px', borderRadius: '14px', fontSize: '0.85rem', fontWeight: 800 }}>
          🎁 Daily Reward
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="card-white" style={{
        borderRadius: '28px',
        padding: '36px 24px',
        textAlign: 'center',
        background: 'linear-gradient(180deg, #FFFFFF 0%, #FAF5FF 100%)',
        border: '1px solid #EDE9FE',
        boxShadow: '0 16px 36px rgba(124, 58, 237, 0.1)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow orb */}
        <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: '260px', height: '260px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(168, 85, 247, 0.25) 0%, rgba(255,255,255,0) 70%)', filter: 'blur(35px)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 2 }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1E1B4B', margin: '0 0 6px 0' }}>
            Daily Mystery Box
          </h2>
          <p style={{ color: '#6B7280', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 24px auto', lineHeight: 1.4 }}>
            Open your daily mystery box to unbox random cash points. Available once every 24 hours!
          </p>

          {/* 3D Mystery Box Visual */}
          <div style={{ margin: '30px auto', width: '220px', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            
            {boxState === 'ready' && (
              <div
                onClick={handleOpenBox}
                className="pulse-box"
                style={{
                  width: '160px',
                  height: '160px',
                  borderRadius: '30px',
                  background: 'linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)',
                  boxShadow: '0 20px 40px rgba(124, 58, 237, 0.4), inset 0 2px 6px rgba(255,255,255,0.4)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  border: '4px solid #DDD6FE',
                  position: 'relative',
                  transform: 'translateY(0)',
                  transition: 'transform 0.2s ease'
                }}
              >
                {/* Golden Ribbon */}
                <div style={{ position: 'absolute', width: '24px', height: '100%', background: '#F59E0B', boxShadow: '0 0 10px rgba(245, 158, 11, 0.6)' }} />
                <div style={{ position: 'absolute', height: '24px', width: '100%', background: '#F59E0B', boxShadow: '0 0 10px rgba(245, 158, 11, 0.6)' }} />
                <div style={{ position: 'relative', zIndex: 5, width: '44px', height: '44px', borderRadius: '50%', background: '#FCD34D', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                  <Sparkles size={24} color="#7C3AED" />
                </div>
              </div>
            )}

            {boxState === 'shaking' && (
              <div
                className="shake-animation"
                style={{
                  width: '160px',
                  height: '160px',
                  borderRadius: '30px',
                  background: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)',
                  boxShadow: '0 20px 45px rgba(234, 88, 12, 0.5), inset 0 2px 6px rgba(255,255,255,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '4px solid #FED7AA'
                }}
              >
                <Sparkles size={48} color="#FFFFFF" className="spin-icon" />
              </div>
            )}

            {boxState === 'opened' && (
              <div
                className="pop-open-animation"
                style={{
                  width: '180px',
                  height: '180px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, #22C55E 0%, #15803D 100%)',
                  boxShadow: '0 20px 50px rgba(34, 197, 94, 0.45)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFF',
                  border: '6px solid #BBF7D0'
                }}
              >
                <Trophy size={42} color="#FEF08A" />
                <div style={{ fontSize: '1.8rem', fontWeight: 900, marginTop: '4px' }}>+{pointsWon}</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>POINTS!</div>
              </div>
            )}

            {boxState === 'cooldown' && (
              <div
                style={{
                  width: '150px',
                  height: '150px',
                  borderRadius: '26px',
                  background: '#E2E8F0',
                  border: '3px dashed #CBD5E1',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94A3B8'
                }}
              >
                <Clock size={42} color="#94A3B8" />
                <div style={{ fontSize: '0.75rem', fontWeight: 800, marginTop: '8px', color: '#64748B' }}>LOCKED</div>
              </div>
            )}

            {boxState === 'loading' && (
              <RefreshCw size={36} color="#7C3AED" className="spin-icon" />
            )}
          </div>

          {/* Action & Feedback Area */}
          {boxState === 'ready' && (
            <div>
              <button
                onClick={handleOpenBox}
                style={{
                  background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '14px 44px',
                  borderRadius: '30px',
                  fontSize: '1.05rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(124, 58, 237, 0.35)',
                  letterSpacing: '0.5px'
                }}
              >
                ✨ TAP TO OPEN BOX
              </button>
            </div>
          )}

          {boxState === 'shaking' && (
            <div style={{ color: '#D97706', fontWeight: 800, fontSize: '1.05rem' }}>
              Unlocking your daily reward...
            </div>
          )}

          {boxState === 'opened' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#16A34A' }}>
                {winMessage}
              </div>
              <span style={{ background: '#DCFCE7', color: '#15803D', fontWeight: 800, padding: '4px 14px', borderRadius: '12px', fontSize: '0.8rem' }}>
                {tierLabel}
              </span>
              <p style={{ color: '#6B7280', fontSize: '0.825rem', margin: '8px 0 0 0' }}>
                Next box will unlock in 24 hours. Check back tomorrow!
              </p>
            </div>
          )}

          {boxState === 'cooldown' && (
            <div>
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '14px 20px', borderRadius: '16px', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.775rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Next Mystery Box Available In:</span>
                <span style={{ fontSize: '1.35rem', fontWeight: 900, color: '#1E1B4B', fontFamily: 'monospace' }}>
                  {formatCountdown(secondsRemaining)}
                </span>
              </div>
            </div>
          )}

          {errorMsg && (
            <div style={{ color: '#DC2626', fontWeight: 700, fontSize: '0.85rem', marginTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <AlertCircle size={15} /> {errorMsg}
            </div>
          )}

        </div>
      </div>

      {/* Probability Transparency Card */}
      <div className="card-white" style={{ padding: '20px 22px', borderRadius: '20px' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1E1B4B', margin: '0 0 10px 0' }}>
          🎁 Fair Play Odds & Drop Rates
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '12px' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>
              TIER 1 ({settings?.tier1_probability !== undefined ? settings.tier1_probability : 60}% CHANCE)
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
              {settings?.tier1_min_points !== undefined ? settings.tier1_min_points : 0} to {settings?.tier1_max_points !== undefined ? settings.tier1_max_points : 10} Points
            </div>
            <div style={{ fontSize: '0.7rem', color: '#16A34A', marginTop: '2px' }}>Standard daily drop</div>
          </div>

          <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '14px', padding: '12px' }}>
            <div style={{ fontSize: '0.75rem', color: '#B45309', fontWeight: 700 }}>
              TIER 2 ({settings?.tier2_probability !== undefined ? settings.tier2_probability : 40}% CHANCE)
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#92400E', marginTop: '2px' }}>
              {settings?.tier2_rewards && settings.tier2_rewards.length > 0
                ? settings.tier2_rewards.map(r => `${r.points}`).join(' or ') + ' Points'
                : '50 or 100 Points'}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#B45309', marginTop: '2px' }}>Admin mega jackpot</div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse-gentle {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-8px) scale(1.03); }
        }
        .pulse-box {
          animation: pulse-gentle 2.5s infinite ease-in-out;
        }
        @keyframes shake-wild {
          0%, 100% { transform: rotate(0deg) scale(1); }
          20% { transform: rotate(-8deg) scale(1.05); }
          40% { transform: rotate(8deg) scale(1.05); }
          60% { transform: rotate(-6deg) scale(1.08); }
          80% { transform: rotate(6deg) scale(1.08); }
        }
        .shake-animation {
          animation: shake-wild 0.3s infinite ease-in-out;
        }
        @keyframes pop-open {
          0% { transform: scale(0.6); opacity: 0; }
          60% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); }
        }
        .pop-open-animation {
          animation: pop-open 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
      `}</style>

    </div>
  );
}
