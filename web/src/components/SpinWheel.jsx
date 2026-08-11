import React, { useState } from 'react';
import { Award, Sparkles } from 'lucide-react';

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

export default function SpinWheel({ slices = [], onSpin, spinsAvailable = 1 }) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [resultModal, setResultModal] = useState(null);

  const wheelSlices = slices.length > 0 ? slices : [
    { id: '1', label: '1000 Points', reward_points: 1000, color: '#5B21B6' },
    { id: '2', label: '500 Points',  reward_points: 500,  color: '#22C55E' },
    { id: '3', label: '200 Points',  reward_points: 200,  color: '#7C3AED' },
    { id: '4', label: '50 Points',   reward_points: 50,   color: '#4ADE80' },
    { id: '5', label: '50 Points',   reward_points: 50,   color: '#6D28D9' },
    { id: '6', label: 'Better Luck Next Time', reward_points: 0, color: '#EC4899' },
  ];

  const N = wheelSlices.length;
  const sliceAngle = 360 / N;
  const CX = 150;
  const CY = 150;
  const R = 132;          // outer radius
  const TEXT_R = 76;      // radius at which text center is placed

  const handleSpin = async () => {
    if (spinsAvailable <= 0 || spinning) return;
    setSpinning(true);

    const result = await onSpin();
    const targetIndex = result && typeof result.targetIndex === 'number' ? result.targetIndex : 0;

    const currentFullRotations = Math.ceil(rotation / 360) + 5;
    const stopAngle = (360 - (targetIndex + 0.5) * sliceAngle) % 360;
    const finalRotation = currentFullRotations * 360 + stopAngle;

    setRotation(finalRotation);

    setTimeout(() => {
      setSpinning(false);
      if (result) setResultModal(result);
    }, 4200);
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
            const endAngle   = startAngle + sliceAngle;
            const midAngle   = startAngle + sliceAngle / 2;

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

      {/* Spin Button */}
      <button
        onClick={handleSpin}
        disabled={spinsAvailable <= 0 || spinning}
        style={{
          marginTop: '20px',
          padding: '12px 40px',
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
        {spinning ? 'Spinning...' : spinsAvailable > 0 ? 'Spin Now!' : 'No Spins Left Today'}
      </button>

      <p style={{ color: '#6B7280', fontSize: '0.8rem', marginTop: '8px', fontWeight: 600, textAlign: 'center' }}>
        {spinsAvailable > 0 ? `🎉 You have ${spinsAvailable} spin today!` : '⏰ Next spin unlocks tomorrow'}
      </p>

      {/* Result Modal */}
      {resultModal && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)',
          zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="card-white" style={{ maxWidth: '340px', width: '100%', textAlign: 'center', padding: '28px 24px' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: resultModal.reward_points > 0
                ? 'linear-gradient(135deg, #22C55E 0%, #4ADE80 100%)'
                : '#F3E8FF',
              margin: '0 auto 14px auto',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Award color={resultModal.reward_points > 0 ? '#FFF' : '#5B21B6'} size={32} />
            </div>
            <h3 style={{ color: '#1E1B4B', fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>
              {resultModal.reward_points > 0 ? '🎉 Congratulations!' : 'Better Luck Next Time!'}
            </h3>
            <p style={{ color: '#6B7280', fontSize: '0.95rem', marginBottom: '20px', lineHeight: 1.5 }}>
              {resultModal.message ||
                (resultModal.reward_points > 0
                  ? `You won +${resultModal.reward_points} Points!`
                  : 'Spin again tomorrow for more points.')}
            </p>
            <button
              onClick={() => setResultModal(null)}
              className="btn-green"
              style={{ width: '100%', borderRadius: '14px', padding: '12px' }}
            >
              Awesome! 🙌
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
