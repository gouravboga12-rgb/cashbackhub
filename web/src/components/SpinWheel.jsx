import React, { useState } from 'react';
import { Award, Sparkles } from 'lucide-react';

const toRad = (deg) => (deg * Math.PI) / 180;

function slicePath(cx, cy, r, startAngle, endAngle) {
  const x1 = cx + r * Math.cos(toRad(startAngle));
  const y1 = cy + r * Math.sin(toRad(startAngle));
  const x2 = cx + r * Math.cos(toRad(endAngle));
  const y2 = cy + r * Math.sin(toRad(endAngle));
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc},1 ${x2},${y2} Z`;
}

// Reference image colors: yellow, orange, purple/violet, blue, green, pink
const REFERENCE_COLORS = [
  '#FFD700', // yellow   — 1000 Pts
  '#FF6B35', // orange   — 500 Pts
  '#5B21B6', // violet   — 200 Pts
  '#3B82F6', // blue     — 50 Pts
  '#22C55E', // green    — 50 Pts
  '#EC4899', // pink     — Better Luck
];

export default function SpinWheel({ slices = [], onSpin, spinsAvailable = 1 }) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [resultModal, setResultModal] = useState(null);

  const wheelSlices = slices.length > 0
    ? slices.map((s, i) => ({ ...s, color: REFERENCE_COLORS[i % REFERENCE_COLORS.length] }))
    : [
        { id: '1', label: '1000',       sublabel: 'Points', reward_points: 1000, color: REFERENCE_COLORS[0] },
        { id: '2', label: '500',        sublabel: 'Points', reward_points: 500,  color: REFERENCE_COLORS[1] },
        { id: '3', label: '200',        sublabel: 'Points', reward_points: 200,  color: REFERENCE_COLORS[2] },
        { id: '4', label: '50',         sublabel: 'Points', reward_points: 50,   color: REFERENCE_COLORS[3] },
        { id: '5', label: '50',         sublabel: 'Points', reward_points: 50,   color: REFERENCE_COLORS[4] },
        { id: '6', label: 'Better Luck',sublabel: 'Next Time', reward_points: 0, color: REFERENCE_COLORS[5] },
      ];

  const N = wheelSlices.length;
  const sliceAngle = 360 / N;
  const CX = 150;
  const CY = 150;
  const R  = 132;       // outer radius of slices
  const TEXT_R = 90;    // radius for first line of text
  const SUB_R  = 73;    // radius for second line (sublabel)

  const handleSpin = async () => {
    if (spinsAvailable <= 0 || spinning) return;
    setSpinning(true);
    const extra = 1800 + Math.floor(Math.random() * 360);
    setRotation(prev => prev + extra);
    const result = await onSpin();
    setTimeout(() => {
      setSpinning(false);
      if (result) setResultModal(result);
    }, 4400);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
      overflow: 'hidden',
      boxSizing: 'border-box',
    }}>

      {/* Downward pointer */}
      <div style={{ marginBottom: '-10px', zIndex: 2 }}>
        <svg width="26" height="20" viewBox="0 0 26 20">
          <polygon points="13,20 0,0 26,0" fill="#5B21B6" />
        </svg>
      </div>

      {/* SVG Wheel */}
      <svg
        viewBox="0 0 300 300"
        style={{
          width: 'min(280px, 74vw)',
          height: 'min(280px, 74vw)',
          display: 'block',
          flexShrink: 0,
        }}
      >
        <defs>
          <clipPath id="wheel-clip">
            <circle cx={CX} cy={CY} r={R} />
          </clipPath>

          {/* Radial gradient for 3D highlight on each slice */}
          <radialGradient id="slice-shine" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.0)" />
          </radialGradient>

          {/* Hub gradient */}
          <radialGradient id="hub-grad" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#E9D5FF" />
          </radialGradient>
        </defs>

        {/* Dark outer ring (reference has dark purple border) */}
        <circle cx={CX} cy={CY} r={R + 6}  fill="#2D1B6B" />
        <circle cx={CX} cy={CY} r={R + 2}  fill="#3B0FA0" />

        {/* Rotating group — clipped to circle */}
        <g
          style={{
            transformOrigin: `${CX}px ${CY}px`,
            transform: `rotate(${rotation}deg)`,
            transition: spinning
              ? 'transform 4.2s cubic-bezier(0.15, 0.9, 0.2, 1)'
              : 'none',
          }}
          clipPath="url(#wheel-clip)"
        >
          {wheelSlices.map((slice, i) => {
            const startAngle = i * sliceAngle - 90;
            const endAngle   = startAngle + sliceAngle;
            const midAngle   = startAngle + sliceAngle / 2;

            // Text anchor position
            const tx1 = CX + TEXT_R * Math.cos(toRad(midAngle));
            const ty1 = CY + TEXT_R * Math.sin(toRad(midAngle));
            const tx2 = CX + SUB_R  * Math.cos(toRad(midAngle));
            const ty2 = CY + SUB_R  * Math.sin(toRad(midAngle));

            // Flip text if in bottom half to stay readable
            const labelRotation = (midAngle + 90) > 180 ? midAngle - 90 : midAngle + 90;

            // Text color: dark on bright (yellow/orange/green), white on dark (violet/blue/pink)
            const lightSlices = ['#FFD700', '#FF6B35', '#22C55E'];
            const textColor = lightSlices.includes(slice.color) ? '#1E1B4B' : '#FFFFFF';

            return (
              <g key={slice.id || i}>
                {/* Main slice fill */}
                <path
                  d={slicePath(CX, CY, R, startAngle, endAngle)}
                  fill={slice.color}
                />
                {/* Divider line */}
                <path
                  d={slicePath(CX, CY, R, startAngle, endAngle)}
                  fill="none"
                  stroke="rgba(255,255,255,0.5)"
                  strokeWidth="2"
                />
                {/* Shine overlay */}
                <path
                  d={slicePath(CX, CY, R, startAngle, endAngle)}
                  fill="url(#slice-shine)"
                />

                {/* Primary label (number) */}
                <text
                  x={tx1}
                  y={ty1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${labelRotation}, ${tx1}, ${ty1})`}
                  fill={textColor}
                  fontSize="13"
                  fontWeight="800"
                  fontFamily="Plus Jakarta Sans, sans-serif"
                  paintOrder="stroke"
                  stroke={textColor === '#FFFFFF' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)'}
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                >
                  {slice.label || slice.reward_points}
                </text>

                {/* Sub-label (Points / Next Time) */}
                {(slice.sublabel || slice.reward_points > 0 || slice.label?.includes('Better')) && (
                  <text
                    x={tx2}
                    y={ty2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${labelRotation}, ${tx2}, ${ty2})`}
                    fill={textColor}
                    fontSize="10"
                    fontWeight="700"
                    fontFamily="Plus Jakarta Sans, sans-serif"
                    paintOrder="stroke"
                    stroke={textColor === '#FFFFFF' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)'}
                    strokeWidth="2"
                    strokeLinejoin="round"
                  >
                    {slice.sublabel || 'Points'}
                  </text>
                )}
              </g>
            );
          })}
        </g>

        {/* Center white circle hub */}
        <circle cx={CX} cy={CY} r={26} fill="url(#hub-grad)" stroke="#C4B5FD" strokeWidth="3" />
        <circle cx={CX} cy={CY} r={10} fill="#5B21B6" />
      </svg>

      {/* Spin / No Spins Button */}
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
            : '#F3F4F6',
          color: spinsAvailable > 0 && !spinning ? '#FFFFFF' : '#6B7280',
          boxShadow: spinsAvailable > 0 ? '0 6px 20px rgba(91, 33, 182, 0.3)' : 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.2s',
          border: spinsAvailable <= 0 ? '1px solid #E5E7EB' : 'none',
        }}
      >
        <Sparkles size={16} />
        {spinning ? 'Spinning...' : spinsAvailable > 0 ? 'Spin Now!' : 'No Spins Left Today'}
      </button>

      <p style={{ color: '#6B7280', fontSize: '0.8rem', marginTop: '10px', fontWeight: 600, textAlign: 'center' }}>
        {spinsAvailable > 0
          ? `🎉 You have ${spinsAvailable} spin today!`
          : '⏰ Next spin unlocks tomorrow'}
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
              width: '68px', height: '68px', borderRadius: '50%',
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
