import React, { useState, useEffect, useRef } from 'react';
import { Award, Sparkles, ExternalLink, AlertCircle, Tv, ShieldCheck, Flame, Zap } from 'lucide-react';

// Helper: convert degrees to radians
const toRad = (deg) => (deg * Math.PI) / 180;

// Helper: compute arc path for a pie slice
function slicePath(cx, cy, r, startAngle, endAngle) {
  const x1 = cx + r * Math.cos(toRad(startAngle));
  const y1 = cy + r * Math.sin(toRad(startAngle));
  const x2 = cx + r * Math.cos(toRad(endAngle));
  const y2 = cy + r * Math.sin(toRad(endAngle));
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc},1 ${x2},${y2} Z`;
}

// Helper: format label into max 2 clean lines
function getLabelLines(label, rewardPoints) {
  const raw = (label || '').trim() || (rewardPoints > 0 ? `${rewardPoints} Points` : 'Better Luck Next Time');
  const lower = raw.toLowerCase();

  if (lower.includes('better luck')) {
    return ['Better Luck', 'Next Time'];
  }

  const words = raw.split(/\s+/);
  if (words.length >= 2) {
    return [words[0], words.slice(1).join(' ')];
  }
  return [raw];
}

// Sound synthesized via Web Audio API (zero external assets needed)
function playSpinTickAudio() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  } catch (e) {}
}

function playWinAudio() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
      gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.1);
      osc.stop(ctx.currentTime + idx * 0.1 + 0.35);
    });
  } catch (e) {}
}

// Curated Sponsored Display Ads Pool for every spin
const DISPLAY_ADS = [
  {
    id: 'ad_phonepe',
    brand: 'PhonePe Cashback',
    tagline: 'Flat ₹100 Cashback on UPI Bills',
    description: 'Pay electric, mobile & water bills on PhonePe to unlock instant scratch cards daily!',
    cta: 'Claim Cashback',
    icon: '💳',
    badge: 'SPONSORED DISPLAY AD',
    gradient: 'linear-gradient(135deg, #4C1D95 0%, #6D28D9 100%)',
    pillColor: '#EDE9FE',
    pillText: '#5B21B6'
  },
  {
    id: 'ad_flipkart',
    brand: 'Flipkart Mega Savings',
    tagline: 'Up to 80% Off + Instant ₹500 Voucher',
    description: 'Discover trending smartphones, smartwatches and lifestyle products at lowest prices.',
    cta: 'Shop Deals',
    icon: '🛍️',
    badge: 'FEATURED DISPLAY AD',
    gradient: 'linear-gradient(135deg, #1E40AF 0%, #2563EB 100%)',
    pillColor: '#DBEAFE',
    pillText: '#1D4ED8'
  },
  {
    id: 'ad_swiggy',
    brand: 'Swiggy Instamart',
    tagline: 'Groceries Delivered to Door in 10 Mins',
    description: 'Fresh fruits, snacks, dairy and household essentials delivered instantly. Use CASHBACK50.',
    cta: 'Order Groceries',
    icon: '⚡',
    badge: 'EXCLUSIVE SPONSOR',
    gradient: 'linear-gradient(135deg, #C2410C 0%, #EA580C 100%)',
    pillColor: '#FFEDD5',
    pillText: '#C2410C'
  },
  {
    id: 'ad_zomato',
    brand: 'Zomato Gold VIP',
    tagline: 'Unlimited Free Deliveries + 40% Off',
    description: 'Join Zomato Gold today to save on top local eateries and restaurants every order.',
    cta: 'Explore Perks',
    icon: '🍔',
    badge: 'PARTNER DISPLAY AD',
    gradient: 'linear-gradient(135deg, #991B1B 0%, #DC2626 100%)',
    pillColor: '#FEE2E2',
    pillText: '#991B1B'
  },
  {
    id: 'ad_amazon',
    brand: 'Amazon Pay Balance',
    tagline: 'Win ₹1,000 Amazon Pay Gift Cards',
    description: 'Add money or pay QR code at stores to collect scratch cards and cashback rewards.',
    cta: 'Recharge Now',
    icon: '🎁',
    badge: 'OFFICIAL PARTNER',
    gradient: 'linear-gradient(135deg, #0F766E 0%, #0D9488 100%)',
    pillColor: '#CCFBF1',
    pillText: '#0F766E'
  },
  {
    id: 'ad_googleplay',
    brand: 'Google Play Pass',
    tagline: '1,000+ Games Without Ads or In-Apps',
    description: 'Experience hundreds of award-winning Android games and apps with 1 month free pass.',
    cta: 'Start Free Trial',
    icon: '🎮',
    badge: 'GAMING DISPLAY AD',
    gradient: 'linear-gradient(135deg, #15803D 0%, #16A34A 100%)',
    pillColor: '#DCFCE7',
    pillText: '#15803D'
  }
];

export default function SpinWheel({
  slices = [],
  onSpin,
  spinsAvailable = 10,
  dailyLimit = 10,
  costPerSpin = 10,
  userPoints,
  onNavigateToAds
}) {
  // Wheel rotation angle in degrees
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [resultModal, setResultModal] = useState(null);
  const [hasSpunAtLeastOnce, setHasSpunAtLeastOnce] = useState(false);

  // Sponsored Display Ad state
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [activeDisplayAd, setActiveDisplayAd] = useState(DISPLAY_ADS[0]);
  const [insufficientPointsModal, setInsufficientPointsModal] = useState(false);

  // Canvas confetti ref
  const canvasRef = useRef(null);

  const wheelSlices = slices.length > 0 ? slices : [
    { id: '1', label: '1000 Points', reward_points: 1000, color: '#6D28D9' },
    { id: '2', label: '500 Points', reward_points: 500, color: '#059669' },
    { id: '3', label: '200 Points', reward_points: 200, color: '#7C3AED' },
    { id: '4', label: '50 Points', reward_points: 50, color: '#10B981' },
    { id: '5', label: '100 Points', reward_points: 100, color: '#4F46E5' },
    { id: '6', label: 'Better Luck Next Time', reward_points: 0, color: '#E11D48' },
  ];

  const N = wheelSlices.length;
  const sliceAngle = 360 / N;
  const CX = 150;
  const CY = 150;
  const R = 132;          // outer radius
  const TEXT_R = 76;      // radius for text placement

  const bannerAd = DISPLAY_ADS[currentAdIndex % DISPLAY_ADS.length];

  // Confetti particles effect on winning
  useEffect(() => {
    if (resultModal && resultModal.reward_points > 0 && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const particles = [];
      const colors = ['#5B21B6', '#22C55E', '#EC4899', '#F59E0B', '#3B82F6', '#8B5CF6'];
      for (let i = 0; i < 80; i++) {
        particles.push({
          x: canvas.width / 2,
          y: canvas.height / 2,
          vx: (Math.random() - 0.5) * 16,
          vy: (Math.random() - 0.8) * 16,
          size: Math.random() * 8 + 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          rot: Math.random() * 360,
          dRot: (Math.random() - 0.5) * 10
        });
      }

      let animId;
      const render = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.35; // gravity
          p.alpha -= 0.012;
          p.rot += p.dRot;

          if (p.alpha > 0) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, p.alpha);
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rot * Math.PI) / 180);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            ctx.restore();
          }
        });

        if (particles.some(p => p.alpha > 0)) {
          animId = requestAnimationFrame(render);
        }
      };
      render();

      return () => cancelAnimationFrame(animId);
    }
  }, [resultModal]);

  // Direct 1-Click Spin Trigger
  const handleSpinClick = async () => {
    if (spinsAvailable <= 0 || spinning) return;

    // Check balance
    if (typeof userPoints === 'number' && userPoints < costPerSpin) {
      setInsufficientPointsModal(true);
      return;
    }

    // Set active display ad for this spin
    const nextAdIndex = (currentAdIndex + 1) % DISPLAY_ADS.length;
    setCurrentAdIndex(nextAdIndex);
    const chosenAd = DISPLAY_ADS[nextAdIndex];
    setActiveDisplayAd(chosenAd);

    setSpinning(true);
    setHasSpunAtLeastOnce(true);

    // Audio ticking intervals
    const tickInterval = setInterval(() => {
      playSpinTickAudio();
    }, 180);

    let spinResult = null;
    try {
      if (typeof onSpin === 'function') {
        spinResult = await onSpin();
      }
    } catch (err) {
      console.error('Spin API error:', err);
    }

    const targetIndex = (spinResult && typeof spinResult.targetIndex === 'number')
      ? spinResult.targetIndex
      : Math.floor(Math.random() * N);

    // Calculate rotation angle so target slice center lands EXACTLY at 12 o'clock pointer (-90 deg)
    // Slices are laid out from i * sliceAngle - 90 deg.
    // Center of slice i is at (i + 0.5) * sliceAngle - 90 deg.
    // To bring center of targetIndex to -90 deg (pointer):
    // Rotation required mod 360 is: 360 - (targetIndex + 0.5) * sliceAngle
    const currentRot = rotation;
    const currentRemainder = ((currentRot % 360) + 360) % 360;
    const stopAngle = (360 - (targetIndex + 0.5) * sliceAngle) % 360;
    let extraToStop = stopAngle - currentRemainder;
    if (extraToStop <= 0) {
      extraToStop += 360;
    }
    // Perform 6 full rounds (2160 deg) + deceleration to exact slice
    const finalRotation = currentRot + (6 * 360) + extraToStop;

    setRotation(finalRotation);

    // Spin animation duration is 4.0s
    setTimeout(() => {
      clearInterval(tickInterval);
      setSpinning(false);

      const winPts = (spinResult && typeof spinResult.reward_points === 'number')
        ? spinResult.reward_points
        : (wheelSlices[targetIndex]?.reward_points || 0);

      const msg = spinResult?.message || (winPts > 0 ? `🎉 You won +${winPts} Points!` : 'Better Luck Next Time!');

      if (winPts > 0) {
        playWinAudio();
      }

      setResultModal({
        reward_points: winPts,
        cost_points: costPerSpin,
        message: msg,
        targetIndex: targetIndex,
        sliceLabel: wheelSlices[targetIndex]?.label || `${winPts} Points`
      });
    }, 4100);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
      maxWidth: '100%',
      overflow: 'hidden',
      boxSizing: 'border-box',
      position: 'relative'
    }}>

      {/* Canvas for Confetti */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 400
        }}
      />

      {/* Top Cost & Limit Badges */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        flexWrap: 'wrap',
        marginBottom: '14px',
        width: '100%'
      }}>
        <div style={{
          background: '#EDE9FE',
          color: '#5B21B6',
          fontSize: '0.78rem',
          fontWeight: 800,
          padding: '5px 14px',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          border: '1px solid #DDD6FE'
        }}>
          <span>🪙 Spin Cost: <strong>{costPerSpin} Pts</strong></span>
        </div>

        <div style={{
          background: spinsAvailable > 0 ? '#DCFCE7' : '#FEE2E2',
          color: spinsAvailable > 0 ? '#16A34A' : '#DC2626',
          fontSize: '0.78rem',
          fontWeight: 800,
          padding: '5px 14px',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          border: `1px solid ${spinsAvailable > 0 ? '#BBF7D0' : '#FECACA'}`
        }}>
          <span>🎯 <strong>{spinsAvailable} / {dailyLimit}</strong> Spins Left</span>
        </div>
      </div>

      {/* Downward Indicator Pointer Needle */}
      <div style={{
        marginBottom: '-16px',
        zIndex: 20,
        filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.25))',
        transform: spinning ? 'scale(1.1)' : 'scale(1)',
        transition: 'transform 0.2s ease-in-out'
      }}>
        <svg width="34" height="28" viewBox="0 0 34 28">
          <polygon points="17,28 0,0 34,0" fill="#22C55E" stroke="#FFFFFF" strokeWidth="2.5" />
          <circle cx="17" cy="8" r="4" fill="#FFFFFF" />
        </svg>
      </div>

      {/* SVG Wheel Visual with Center Click Hub */}
      <div
        onClick={!spinning && spinsAvailable > 0 ? handleSpinClick : undefined}
        style={{
          position: 'relative',
          cursor: !spinning && spinsAvailable > 0 ? 'pointer' : 'default',
          userSelect: 'none'
        }}
        title={!spinning && spinsAvailable > 0 ? 'Click to Spin!' : ''}
      >
        <svg
          viewBox="0 0 300 300"
          style={{
            width: 'min(280px, 75vw)',
            height: 'min(280px, 75vw)',
            display: 'block',
            flexShrink: 0,
            overflow: 'visible'
          }}
        >
          <defs>
            <clipPath id="main-wheel-clip">
              <circle cx={CX} cy={CY} r={R} />
            </clipPath>

            {wheelSlices.map((_, i) => {
              const startAngle = i * sliceAngle - 90;
              const endAngle = startAngle + sliceAngle;
              return (
                <clipPath id={`slice-clip-${i}`} key={i}>
                  <path d={slicePath(CX, CY, R + 2, startAngle - 0.5, endAngle + 0.5)} />
                </clipPath>
              );
            })}

            <filter id="wheel-shadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#4C1D95" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Rotating Wheel Group */}
          <g
            style={{
              transformOrigin: `${CX}px ${CY}px`,
              transform: `rotate(${rotation}deg)`,
              transition: spinning ? 'transform 4.0s cubic-bezier(0.12, 0.8, 0.2, 1)' : 'none',
            }}
            clipPath="url(#main-wheel-clip)"
          >
            {wheelSlices.map((slice, i) => {
              const startAngle = i * sliceAngle - 90;
              const endAngle = startAngle + sliceAngle;
              const midAngle = startAngle + sliceAngle / 2;

              const tx = CX + TEXT_R * Math.cos(toRad(midAngle));
              const ty = CY + TEXT_R * Math.sin(toRad(midAngle));

              let textRotation = midAngle;
              if (midAngle > 90 && midAngle < 270) {
                textRotation += 180;
              }

              const lines = getLabelLines(slice.label, slice.reward_points);
              const isWinSlice = (slice.reward_points || 0) > 0;

              return (
                <g key={slice.id || i}>
                  {/* Wedge Sector */}
                  <path
                    d={slicePath(CX, CY, R, startAngle, endAngle)}
                    fill={slice.color || (i % 2 === 0 ? '#5B21B6' : '#22C55E')}
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                  />

                  {/* Slice Text Content */}
                  <g clipPath={`url(#slice-clip-${i})`}>
                    <text
                      x={tx}
                      y={ty}
                      textAnchor="middle"
                      dominantBaseline="central"
                      transform={`rotate(${textRotation}, ${tx}, ${ty})`}
                      fill="#FFFFFF"
                      fontWeight="800"
                      style={{
                        fontFamily: 'Plus Jakarta Sans, sans-serif',
                        filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))'
                      }}
                    >
                      {lines.length === 1 ? (
                        <tspan fontSize="11.5" fontWeight="800">{lines[0]}</tspan>
                      ) : (
                        <>
                          <tspan x={tx} dy="-6px" fontSize="10.5" fontWeight="800">{lines[0]}</tspan>
                          <tspan x={tx} dy="13px" fontSize="9.5" fontWeight="700" opacity="0.95">{lines[1]}</tspan>
                        </>
                      )}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>

          {/* Outer Border Ring */}
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="#5B21B6" strokeWidth="6" />

          {/* Center Hub (Clickable SPIN button) */}
          <circle cx={CX} cy={CY} r={28} fill="#FFFFFF" stroke="#5B21B6" strokeWidth="4" />
          <circle cx={CX} cy={CY} r={22} fill={spinning ? '#9333EA' : '#5B21B6'} />
          
          <text
            x={CX}
            y={CY}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#FFFFFF"
            fontSize="10"
            fontWeight="900"
            letterSpacing="0.5"
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            {spinning ? '•••' : 'SPIN'}
          </text>
        </svg>
      </div>

      {/* Main Spin Action Button */}
      <button
        onClick={handleSpinClick}
        disabled={spinsAvailable <= 0 || spinning}
        style={{
          marginTop: '18px',
          padding: '13px 40px',
          fontSize: '1.05rem',
          fontWeight: 800,
          borderRadius: '30px',
          border: 'none',
          cursor: spinsAvailable <= 0 || spinning ? 'not-allowed' : 'pointer',
          background: spinsAvailable > 0 && !spinning
            ? 'linear-gradient(135deg, #5B21B6 0%, #7C3AED 100%)'
            : '#E5E7EB',
          color: spinsAvailable > 0 && !spinning ? '#FFFFFF' : '#6B7280',
          boxShadow: spinsAvailable > 0 && !spinning
            ? '0 6px 20px rgba(91, 33, 182, 0.35)'
            : 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.2s ease-in-out',
          transform: spinning ? 'scale(0.98)' : 'scale(1)'
        }}
      >
        <Sparkles size={18} />
        {spinning
          ? 'Spinning Wheel...'
          : spinsAvailable > 0
            ? `Spin Now (-${costPerSpin} Pts)`
            : '0 Spins Left Today'}
      </button>

      {/* Spins counter subtext */}
      <p style={{ color: '#6B7280', fontSize: '0.825rem', marginTop: '8px', fontWeight: 600, textAlign: 'center' }}>
        {spinning ? (
          <span style={{ color: '#7C3AED', fontWeight: 800 }}>⚡ Good luck! Wheel is spinning...</span>
        ) : spinsAvailable > 0 ? (
          `🎉 You have ${spinsAvailable} of ${dailyLimit} spins remaining today!`
        ) : (
          `⏰ ${dailyLimit}/${dailyLimit} spins completed! Daily limit resets tomorrow.`
        )}
      </p>

      {/* Dedicated Sponsored Display Ad Banner Slot */}
      <div style={{
        marginTop: '16px',
        width: '100%',
        maxWidth: '400px',
        borderRadius: '16px',
        padding: '14px 16px',
        background: bannerAd.gradient,
        color: '#FFFFFF',
        boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{
            fontSize: '0.65rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            background: 'rgba(255,255,255,0.2)',
            padding: '3px 9px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <Tv size={11} /> {bannerAd.badge}
          </span>
          <span style={{ fontSize: '0.7rem', opacity: 0.9, fontWeight: 600 }}>Ad • Spin Sponsor</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            fontSize: '1.6rem',
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {bannerAd.icon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h4 style={{ margin: '0 0 2px 0', fontSize: '0.9rem', fontWeight: 800, color: '#FFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {bannerAd.brand}
            </h4>
            <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.95, lineHeight: 1.3 }}>
              {bannerAd.tagline}
            </p>
          </div>
          <button
            onClick={() => alert(`Visiting sponsor: ${bannerAd.brand}`)}
            style={{
              background: '#FFFFFF',
              color: bannerAd.pillText || '#1E1B4B',
              border: 'none',
              borderRadius: '12px',
              padding: '7px 12px',
              fontSize: '0.75rem',
              fontWeight: 800,
              cursor: 'pointer',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}
          >
            {bannerAd.cta}
            <ExternalLink size={11} />
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 1. INSUFFICIENT POINTS MODAL                         */}
      {/* ---------------------------------------------------- */}
      {insufficientPointsModal && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)',
          zIndex: 350,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="card-white" style={{ maxWidth: '360px', width: '100%', textAlign: 'center', padding: '26px 22px', borderRadius: '22px' }}>
            <div style={{
              width: '60px', height: '60px', borderRadius: '50%',
              background: '#FEE2E2',
              margin: '0 auto 12px auto',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <AlertCircle color="#DC2626" size={32} />
            </div>

            <h3 style={{ color: '#1E1B4B', fontSize: '1.25rem', fontWeight: 800, marginBottom: '6px' }}>
              Insufficient Points!
            </h3>

            <p style={{ color: '#6B7280', fontSize: '0.85rem', marginBottom: '16px', lineHeight: 1.4 }}>
              Each spin costs <strong>{costPerSpin} Points</strong>. Your current balance is <strong>{userPoints !== undefined ? userPoints : 0} Points</strong>. Watch ads or claim daily attendance to earn free points!
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {typeof onNavigateToAds === 'function' && (
                <button
                  onClick={() => {
                    setInsufficientPointsModal(false);
                    onNavigateToAds();
                  }}
                  className="btn-green"
                  style={{ width: '100%', borderRadius: '14px', padding: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Tv size={16} /> Watch Ads to Earn Points
                </button>
              )}

              <button
                onClick={() => setInsufficientPointsModal(false)}
                style={{
                  width: '100%',
                  background: '#F3F4F6',
                  color: '#4B5563',
                  border: 'none',
                  borderRadius: '14px',
                  padding: '10px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 2. FINAL SPIN RESULT CELEBRATION MODAL               */}
      {/* ---------------------------------------------------- */}
      {resultModal && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(14, 11, 31, 0.75)',
          backdropFilter: 'blur(8px)',
          zIndex: 350,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="card-white" style={{
            maxWidth: '360px',
            width: '100%',
            textAlign: 'center',
            padding: '28px 22px',
            borderRadius: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            <div style={{
              width: '68px', height: '68px', borderRadius: '50%',
              background: resultModal.reward_points > 0
                ? 'linear-gradient(135deg, #22C55E 0%, #4ADE80 100%)'
                : '#F3E8FF',
              margin: '0 auto 12px auto',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: resultModal.reward_points > 0 ? '0 8px 20px rgba(34, 197, 94, 0.35)' : 'none'
            }}>
              <Award color={resultModal.reward_points > 0 ? '#FFF' : '#5B21B6'} size={36} />
            </div>

            <h3 style={{ color: '#1E1B4B', fontSize: '1.4rem', fontWeight: 800, marginBottom: '6px' }}>
              {resultModal.reward_points > 0 ? '🎉 You Won!' : 'Better Luck Next Time!'}
            </h3>

            <p style={{ color: '#6B7280', fontSize: '0.9rem', marginBottom: '14px', lineHeight: 1.4 }}>
              {resultModal.message || (resultModal.reward_points > 0
                ? `You landed on ${resultModal.sliceLabel} and won +${resultModal.reward_points} Points!`
                : 'Keep going! Try your luck again with your remaining daily spins.')}
            </p>

            {/* Detailed Points Calculation Breakdown */}
            <div style={{
              background: '#F9FAFB',
              border: '1px solid #E5E7EB',
              borderRadius: '16px',
              padding: '12px 14px',
              marginBottom: '16px',
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ color: '#9CA3AF', fontSize: '0.675rem', fontWeight: 700 }}>SPIN COST</div>
                <div style={{ color: '#DC2626', fontSize: '1rem', fontWeight: 800 }}>-{costPerSpin} Pts</div>
              </div>
              <div style={{ width: '1px', height: '26px', background: '#E5E7EB' }} />
              <div>
                <div style={{ color: '#9CA3AF', fontSize: '0.675rem', fontWeight: 700 }}>REWARD</div>
                <div style={{ color: '#16A34A', fontSize: '1.05rem', fontWeight: 800 }}>
                  +{resultModal.reward_points || 0} Pts
                </div>
              </div>
              <div style={{ width: '1px', height: '26px', background: '#E5E7EB' }} />
              <div>
                <div style={{ color: '#9CA3AF', fontSize: '0.675rem', fontWeight: 700 }}>NET CHANGE</div>
                <div style={{
                  color: (resultModal.reward_points || 0) >= costPerSpin ? '#16A34A' : '#DC2626',
                  fontSize: '1rem',
                  fontWeight: 800
                }}>
                  {(resultModal.reward_points || 0) >= costPerSpin ? '+' : ''}{(resultModal.reward_points || 0) - costPerSpin} Pts
                </div>
              </div>
            </div>

            {/* Display Ad sponsor note */}
            {activeDisplayAd && (
              <div style={{
                background: activeDisplayAd.gradient,
                color: '#FFF',
                borderRadius: '14px',
                padding: '10px 12px',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px'
              }}>
                <div style={{ textAlign: 'left', minWidth: 0 }}>
                  <div style={{ fontSize: '0.65rem', opacity: 0.85, fontWeight: 700 }}>SPONSORED BY</div>
                  <div style={{ fontSize: '0.825rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {activeDisplayAd.brand}
                  </div>
                </div>
                <button
                  onClick={() => alert(`Opening offer: ${activeDisplayAd.brand}`)}
                  style={{
                    background: '#FFFFFF',
                    color: activeDisplayAd.pillText || '#1E1B4B',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '5px 10px',
                    fontSize: '0.725rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}
                >
                  {activeDisplayAd.cta}
                  <ExternalLink size={10} />
                </button>
              </div>
            )}

            <button
              onClick={() => setResultModal(null)}
              className="btn-green"
              style={{
                width: '100%',
                borderRadius: '14px',
                padding: '12px',
                fontWeight: 800,
                fontSize: '0.95rem',
                boxShadow: '0 4px 14px rgba(34, 197, 94, 0.35)'
              }}
            >
              Collect & Continue 🙌
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
