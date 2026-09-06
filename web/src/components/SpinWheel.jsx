import React, { useState, useEffect } from 'react';
import { Award, Sparkles, ExternalLink, X, AlertCircle, Tv, ArrowRight, ShieldCheck } from 'lucide-react';

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

// Curated Display Ads Pool for "each spin should have display ad"
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
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [resultModal, setResultModal] = useState(null);

  // Display Ad state for each spin
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [activeDisplayAd, setActiveDisplayAd] = useState(null);
  const [showAdModal, setShowAdModal] = useState(false);
  const [adCountdown, setAdCountdown] = useState(3);
  const [pendingResult, setPendingResult] = useState(null);
  const [insufficientPointsModal, setInsufficientPointsModal] = useState(false);

  const wheelSlices = slices.length > 0 ? slices : [
    { id: '1', label: '1000 Points', reward_points: 1000, color: '#5B21B6' },
    { id: '2', label: '500 Points', reward_points: 500, color: '#22C55E' },
    { id: '3', label: '200 Points', reward_points: 200, color: '#7C3AED' },
    { id: '4', label: '50 Points', reward_points: 50, color: '#4ADE80' },
    { id: '5', label: '100 Points', reward_points: 100, color: '#6D28D9' },
    { id: '6', label: 'Better Luck Next Time', reward_points: 0, color: '#EC4899' },
  ];

  const N = wheelSlices.length;
  const sliceAngle = 360 / N;
  const CX = 150;
  const CY = 150;
  const R = 132;          // outer radius
  const TEXT_R = 76;      // radius at which text center is placed

  // Banner display ad cycles automatically
  const bannerAd = DISPLAY_ADS[currentAdIndex % DISPLAY_ADS.length];

  const handleSpin = async () => {
    if (spinsAvailable <= 0 || spinning) return;

    // Validate if user has at least 10 points
    if (typeof userPoints === 'number' && userPoints < costPerSpin) {
      setInsufficientPointsModal(true);
      return;
    }

    // 1. Select Display Ad for this spin
    const nextIndex = (currentAdIndex + 1) % DISPLAY_ADS.length;
    setCurrentAdIndex(nextIndex);
    const chosenAd = DISPLAY_ADS[nextIndex];
    setActiveDisplayAd(chosenAd);
    setShowAdModal(true);
    setAdCountdown(2);

    // 2. Fetch or prepare spin result & deduct points in background while ad displays
    try {
      const result = await onSpin();
      setPendingResult(result);
    } catch (e) {
      console.error('Spin execution error:', e);
    }
  };

  // Countdown timer for Display Ad
  useEffect(() => {
    let timer = null;
    if (showAdModal && adCountdown > 0) {
      timer = setInterval(() => {
        setAdCountdown((prev) => (prev > 1 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [showAdModal, adCountdown]);

  // Once user clicks "Spin The Wheel Now", close ad modal and visibly spin the wheel on page!
  const triggerWheelSpin = (customResult) => {
    if (spinning) return;
    setShowAdModal(false);
    setSpinning(true);

    const res = customResult || pendingResult;
    const targetIndex = res && typeof res.targetIndex === 'number' ? res.targetIndex : 0;

    // Calculate forward rotation of at least 6 full rounds (2160 degrees) + stop offset
    const currentRot = rotation;
    const currentAngleRemainder = ((currentRot % 360) + 360) % 360;
    const stopAngle = (360 - (targetIndex + 0.5) * sliceAngle) % 360;
    let extraToStop = stopAngle - currentAngleRemainder;
    if (extraToStop <= 0) {
      extraToStop += 360;
    }
    const finalRotation = currentRot + (6 * 360) + extraToStop;

    // Trigger rotation animation after DOM unmounts modal
    setTimeout(() => {
      setRotation(finalRotation);
    }, 60);

    // 4.2 seconds animation finishes -> show result celebration modal
    setTimeout(() => {
      setSpinning(false);
      if (res) {
        setResultModal(res);
      }
    }, 4300);
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
    }}>

      {/* Top Cost & Limit Info Badges */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        flexWrap: 'wrap',
        marginBottom: '16px',
        width: '100%'
      }}>
        <div style={{
          background: '#EDE9FE',
          color: '#5B21B6',
          fontSize: '0.75rem',
          fontWeight: 800,
          padding: '4px 12px',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          border: '1px solid #DDD6FE'
        }}>
          <span>🪙 Cost: <strong>10 Pts</strong> / Spin</span>
        </div>

        <div style={{
          background: spinsAvailable > 0 ? '#DCFCE7' : '#FEE2E2',
          color: spinsAvailable > 0 ? '#16A34A' : '#DC2626',
          fontSize: '0.75rem',
          fontWeight: 800,
          padding: '4px 12px',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          border: `1px solid ${spinsAvailable > 0 ? '#BBF7D0' : '#FECACA'}`
        }}>
          <span>🎯 {spinsAvailable} / {dailyLimit} Spins Today</span>
        </div>
      </div>

      {/* Downward pointer arrow */}
      <div style={{ marginBottom: '-14px', zIndex: 10 }}>
        <svg width="30" height="24" viewBox="0 0 30 24">
          <polygon points="15,24 0,0 30,0" fill="#22C55E" stroke="#FFFFFF" strokeWidth="2" />
        </svg>
      </div>

      {/* SVG Wheel */}
      <svg
        viewBox="0 0 300 300"
        style={{
          width: 'min(270px, 72vw)',
          height: 'min(270px, 72vw)',
          display: 'block',
          flexShrink: 0,
          overflow: 'hidden'
        }}
      >
        <defs>
          {/* Main wheel circular clip */}
          <clipPath id="main-wheel-clip">
            <circle cx={CX} cy={CY} r={R} />
          </clipPath>

          {/* Per-slice clip paths so text NEVER bleeds outside its slice */}
          {wheelSlices.map((_, i) => {
            const startAngle = i * sliceAngle - 90;
            const endAngle = startAngle + sliceAngle;
            return (
              <clipPath id={`slice-clip-${i}`} key={i}>
                <path d={slicePath(CX, CY, R + 2, startAngle - 0.5, endAngle + 0.5)} />
              </clipPath>
            );
          })}
        </defs>

        {/* Rotating Group */}
        <g
          style={{
            transformOrigin: `${CX}px ${CY}px`,
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? 'transform 4s cubic-bezier(0.15, 0.9, 0.2, 1)' : 'none',
          }}
          clipPath="url(#main-wheel-clip)"
        >
          {wheelSlices.map((slice, i) => {
            const startAngle = i * sliceAngle - 90;
            const endAngle = startAngle + sliceAngle;
            const midAngle = startAngle + sliceAngle / 2;

            // Center coords for text
            const tx = CX + TEXT_R * Math.cos(toRad(midAngle));
            const ty = CY + TEXT_R * Math.sin(toRad(midAngle));

            // Radial text rotation (pointing outward along radius)
            let textRotation = midAngle;
            // If text is on left half, flip 180 deg so it reads upright
            if (midAngle > 90 && midAngle < 270) {
              textRotation += 180;
            }

            const lines = getLabelLines(slice.label, slice.reward_points);

            return (
              <g key={slice.id || i}>
                {/* Wedge Background */}
                <path
                  d={slicePath(CX, CY, R, startAngle, endAngle)}
                  fill={slice.color || (i % 2 === 0 ? '#5B21B6' : '#22C55E')}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />

                {/* Text Group clipped strictly to this wedge */}
                <g clipPath={`url(#slice-clip-${i})`}>
                  <text
                    x={tx}
                    y={ty}
                    textAnchor="middle"
                    dominantBaseline="central"
                    transform={`rotate(${textRotation}, ${tx}, ${ty})`}
                    fill="#FFFFFF"
                    fontWeight="800"
                    style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                  >
                    {lines.length === 1 ? (
                      <tspan fontSize="11" fontWeight="800">{lines[0]}</tspan>
                    ) : (
                      <>
                        <tspan x={tx} dy="-6px" fontSize="10" fontWeight="800">{lines[0]}</tspan>
                        <tspan x={tx} dy="13px" fontSize="9" fontWeight="700" opacity="0.95">{lines[1]}</tspan>
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

        {/* Center Hub */}
        <circle cx={CX} cy={CY} r={22} fill="url(#hub-grad)" stroke="#5B21B6" strokeWidth="3" />
        <defs>
          <radialGradient id="hub-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#EDE9FE" />
          </radialGradient>
        </defs>
      </svg>

      {/* Spin Button with 10 Points Cost Display */}
      <button
        onClick={handleSpin}
        disabled={spinsAvailable <= 0 || spinning}
        style={{
          marginTop: '18px',
          padding: '12px 36px',
          fontSize: '1rem',
          fontWeight: 800,
          borderRadius: '30px',
          border: 'none',
          cursor: spinsAvailable <= 0 || spinning ? 'not-allowed' : 'pointer',
          background: spinsAvailable > 0 && !spinning
            ? 'linear-gradient(135deg, #5B21B6 0%, #7C3AED 100%)'
            : '#E5E7EB',
          color: spinsAvailable > 0 && !spinning ? '#FFFFFF' : '#6B7280',
          boxShadow: spinsAvailable > 0 ? '0 6px 20px rgba(91, 33, 182, 0.3)' : 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.2s',
        }}
      >
        <Sparkles size={16} />
        {spinning
          ? 'Spinning...'
          : spinsAvailable > 0
            ? `Spin Now (-${costPerSpin} Pts)`
            : '0 Spins Left Today'}
      </button>

      {/* Spins counter subtext */}
      <p style={{ color: '#6B7280', fontSize: '0.8rem', marginTop: '8px', fontWeight: 600, textAlign: 'center' }}>
        {spinsAvailable > 0
          ? `🎉 You have ${spinsAvailable} of ${dailyLimit} spins remaining today!`
          : '⏰ 10/10 spins completed! Daily limit resets tomorrow.'}
      </p>

      {/* Dedicated Sponsored Display Ad Banner Slot */}
      <div style={{
        marginTop: '16px',
        width: '100%',
        maxWidth: '380px',
        borderRadius: '16px',
        padding: '12px 14px',
        background: bannerAd.gradient,
        color: '#FFFFFF',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{
            fontSize: '0.65rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            background: 'rgba(255,255,255,0.2)',
            padding: '2px 8px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <Tv size={11} /> {bannerAd.badge}
          </span>
          <span style={{ fontSize: '0.7rem', opacity: 0.85, fontWeight: 600 }}>Ad • Spin Sponsor</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            fontSize: '1.6rem',
            width: '40px',
            height: '40px',
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
            <h4 style={{ margin: '0 0 2px 0', fontSize: '0.875rem', fontWeight: 800, color: '#FFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {bannerAd.brand}
            </h4>
            <p style={{ margin: 0, fontSize: '0.725rem', opacity: 0.95, lineHeight: 1.25 }}>
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
              padding: '6px 10px',
              fontSize: '0.725rem',
              fontWeight: 800,
              cursor: 'pointer',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '3px'
            }}
          >
            {bannerAd.cta}
            <ExternalLink size={10} />
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 1. ON-SPIN DISPLAY AD INTERSTITIAL MODAL             */}
      {/* ---------------------------------------------------- */}
      {showAdModal && activeDisplayAd && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(14, 11, 31, 0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div className="card-white" style={{
            maxWidth: '380px',
            width: '100%',
            padding: '24px 20px',
            borderRadius: '24px',
            textAlign: 'center',
            position: 'relative',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            {/* Ad Header with Ad Tag & Timer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{
                background: '#F3E8FF',
                color: '#5B21B6',
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '0.7rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <ShieldCheck size={13} color="#5B21B6" />
                {activeDisplayAd.badge}
              </div>

              <div style={{
                background: adCountdown > 0 ? '#FEF3C7' : '#DCFCE7',
                color: adCountdown > 0 ? '#B45309' : '#15803D',
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '0.725rem',
                fontWeight: 800
              }}>
                {adCountdown > 0 ? `Ad closes in ${adCountdown}s` : '✓ Completed'}
              </div>
            </div>

            {/* Display Ad Visual Creative */}
            <div style={{
              background: activeDisplayAd.gradient,
              borderRadius: '18px',
              padding: '20px 16px',
              color: '#FFFFFF',
              marginBottom: '16px',
              boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
            }}>
              <div style={{
                fontSize: '2.5rem',
                width: '64px',
                height: '64px',
                borderRadius: '18px',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px auto'
              }}>
                {activeDisplayAd.icon}
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 4px 0', color: '#FFF' }}>
                {activeDisplayAd.brand}
              </h3>
              <p style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 8px 0', opacity: 0.95 }}>
                {activeDisplayAd.tagline}
              </p>
              <p style={{ fontSize: '0.775rem', margin: 0, opacity: 0.85, lineHeight: 1.35 }}>
                {activeDisplayAd.description}
              </p>
            </div>

            {/* Deducted Points Indicator during Spin */}
            <div style={{
              background: '#FFF1F2',
              border: '1px dashed #FECDD3',
              borderRadius: '12px',
              padding: '8px 12px',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              color: '#E11D48',
              fontSize: '0.8rem',
              fontWeight: 800
            }}>
              <span>🪙 Spin Entry Fee: <strong>-10 Points Deducted</strong></span>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => alert(`Opening offer for ${activeDisplayAd.brand}`)}
                style={{
                  flex: 1,
                  background: '#F3E8FF',
                  color: '#5B21B6',
                  border: '1px solid #DDD6FE',
                  borderRadius: '14px',
                  padding: '11px',
                  fontWeight: 800,
                  fontSize: '0.825rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                {activeDisplayAd.cta}
                <ExternalLink size={13} />
              </button>

              <button
                onClick={() => triggerWheelSpin()}
                disabled={adCountdown > 0}
                className="btn-green"
                style={{
                  flex: 1.3,
                  borderRadius: '14px',
                  padding: '11px',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  opacity: adCountdown > 0 ? 0.6 : 1,
                  cursor: adCountdown > 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: adCountdown === 0 ? '0 6px 18px rgba(34, 197, 94, 0.4)' : 'none'
                }}
              >
                {adCountdown > 0 ? `Wait (${adCountdown}s)` : '🎡 Spin Wheel Now!'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 2. INSUFFICIENT POINTS MODAL                         */}
      {/* ---------------------------------------------------- */}
      {insufficientPointsModal && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)',
          zIndex: 310,
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
              Each spin costs <strong>10 Points</strong>. Your current balance is <strong>{userPoints !== undefined ? userPoints : 0} Points</strong>. Watch ads or check in to earn free points!
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
      {/* 3. FINAL SPIN RESULT MODAL                           */}
      {/* ---------------------------------------------------- */}
      {resultModal && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)',
          zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="card-white" style={{ maxWidth: '350px', width: '100%', textAlign: 'center', padding: '26px 20px', borderRadius: '24px' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: resultModal.reward_points > 0
                ? 'linear-gradient(135deg, #22C55E 0%, #4ADE80 100%)'
                : '#F3E8FF',
              margin: '0 auto 12px auto',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Award color={resultModal.reward_points > 0 ? '#FFF' : '#5B21B6'} size={32} />
            </div>

            <h3 style={{ color: '#1E1B4B', fontSize: '1.35rem', fontWeight: 800, marginBottom: '6px' }}>
              {resultModal.reward_points > 0 ? '🎉 Congratulations!' : 'Better Luck Next Time!'}
            </h3>

            <p style={{ color: '#6B7280', fontSize: '0.9rem', marginBottom: '14px', lineHeight: 1.4 }}>
              {resultModal.message ||
                (resultModal.reward_points > 0
                  ? `You won +${resultModal.reward_points} Points!`
                  : 'Try your luck again! You have more spins available today.')}
            </p>

            {/* Detailed Point Breakdown */}
            <div style={{
              background: '#F9FAFB',
              border: '1px solid #E5E7EB',
              borderRadius: '14px',
              padding: '10px 14px',
              marginBottom: '16px',
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ color: '#9CA3AF', fontSize: '0.675rem', fontWeight: 700 }}>SPIN COST</div>
                <div style={{ color: '#DC2626', fontSize: '0.95rem', fontWeight: 800 }}>-10 Pts</div>
              </div>
              <div style={{ width: '1px', height: '24px', background: '#E5E7EB' }} />
              <div>
                <div style={{ color: '#9CA3AF', fontSize: '0.675rem', fontWeight: 700 }}>WON</div>
                <div style={{ color: '#16A34A', fontSize: '0.95rem', fontWeight: 800 }}>
                  +{resultModal.reward_points || 0} Pts
                </div>
              </div>
              <div style={{ width: '1px', height: '24px', background: '#E5E7EB' }} />
              <div>
                <div style={{ color: '#9CA3AF', fontSize: '0.675rem', fontWeight: 700 }}>NET</div>
                <div style={{
                  color: (resultModal.reward_points || 0) >= 10 ? '#16A34A' : '#DC2626',
                  fontSize: '0.95rem',
                  fontWeight: 800
                }}>
                  {(resultModal.reward_points || 0) >= 10 ? '+' : ''}{(resultModal.reward_points || 0) - 10} Pts
                </div>
              </div>
            </div>

            {/* Display Ad sponsor note */}
            {activeDisplayAd && (
              <div style={{
                background: activeDisplayAd.gradient,
                color: '#FFF',
                borderRadius: '12px',
                padding: '8px 12px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px'
              }}>
                <div style={{ textAlign: 'left', minWidth: 0 }}>
                  <div style={{ fontSize: '0.65rem', opacity: 0.85, fontWeight: 700 }}>SPIN SPONSOR</div>
                  <div style={{ fontSize: '0.775rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {activeDisplayAd.brand}
                  </div>
                </div>
                <span style={{ fontSize: '0.725rem', background: 'rgba(255,255,255,0.2)', padding: '3px 8px', borderRadius: '8px', fontWeight: 800, flexShrink: 0 }}>
                  Ad Verified ✓
                </span>
              </div>
            )}

            <button
              onClick={() => setResultModal(null)}
              className="btn-green"
              style={{ width: '100%', borderRadius: '14px', padding: '12px', fontWeight: 800 }}
            >
              Awesome! 🙌
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
