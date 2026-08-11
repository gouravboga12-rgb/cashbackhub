import React, { useState } from 'react';
import { Disc, Award, Sparkles } from 'lucide-react';

export default function SpinWheel({ slices = [], onSpin, spinsAvailable = 1, isSpinning = false }) {
  const [rotationDegree, setRotationDegree] = useState(0);
  const [resultModal, setResultModal] = useState(null);

  // Default slices if empty
  const wheelSlices = slices.length > 0 ? slices : [
    { id: '1', label: '1000 Pts', reward_points: 1000, color: '#5B21B6' },
    { id: '2', label: '500 Pts', reward_points: 500, color: '#22C55E' },
    { id: '3', label: '200 Pts', reward_points: 200, color: '#7C3AED' },
    { id: '4', label: '50 Pts', reward_points: 50, color: '#4ADE80' },
    { id: '5', label: '50 Pts', reward_points: 50, color: '#6D28D9' },
    { id: '6', label: 'Bonus', reward_points: 0, color: '#EC4899' }
  ];

  const handleSpinClick = async () => {
    if (spinsAvailable <= 0 || isSpinning) return;
    const extraDegrees = Math.floor(1800 + Math.random() * 360);
    const newTotalDegree = rotationDegree + extraDegrees;
    setRotationDegree(newTotalDegree);
    const result = await onSpin();
    if (result) {
      setTimeout(() => {
        setResultModal(result);
      }, 4000);
    }
  };

  // Clamp wheel to a safe size for any mobile screen
  const WHEEL_SIZE = 'min(260px, calc(100vw - 80px))';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
      maxWidth: '100%',
      overflow: 'hidden',
      boxSizing: 'border-box'
    }}>
      
      {/* Pointer Arrow */}
      <div style={{ position: 'relative', zIndex: 20, marginBottom: '-20px' }}>
        <div style={{ width: 0, height: 0, borderLeft: '16px solid transparent', borderRight: '16px solid transparent', borderTop: '28px solid #22C55E', filter: 'drop-shadow(0 3px 5px rgba(0,0,0,0.25))' }} />
      </div>

      {/* Outer ring */}
      <div style={{
        width: 'min(240px, 60vw)',
        height: 'min(240px, 60vw)',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #5B21B6 0%, #7C3AED 100%)',
        padding: '5px',
        flexShrink: 0,
        overflow: 'hidden'
      }}>
        {/* Wheel Canvas */}
        <div style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          position: 'relative',
          overflow: 'hidden',
          transition: 'transform 4s cubic-bezier(0.15, 0.9, 0.2, 1)',
          transform: `rotate(${rotationDegree}deg)`,
          background: '#1E1445'
        }}>
          {/* Render Color Slices using SVG-style conic approach */}
          {wheelSlices.map((slice, index) => {
            const angle = 360 / wheelSlices.length;
            const rotateAngle = index * angle;
            return (
              <div
                key={slice.id || index}
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '50%',
                  height: '50%',
                  transformOrigin: '0% 100%',
                  transform: `rotate(${rotateAngle}deg) skewY(-30deg)`,
                  background: slice.color || (index % 2 === 0 ? '#5B21B6' : '#22C55E'),
                  border: '1px solid rgba(255,255,255,0.15)'
                }}
              >
                <span style={{
                  position: 'absolute',
                  left: '12px',
                  bottom: '20px',
                  transform: 'skewY(30deg) rotate(45deg)',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '0.7rem',
                  textShadow: '0 2px 4px rgba(0,0,0,0.7)',
                  whiteSpace: 'nowrap'
                }}>
                  {slice.label || `${slice.reward_points} Pts`}
                </span>
              </div>
            );
          })}

          {/* Center Hub */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FFF 0%, #EDE9FE 100%)',
            boxShadow: '0 0 12px rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10
          }}>
            <Disc color="#5B21B6" size={24} />
          </div>
        </div>
      </div>

      {/* Spin Button */}
      <button
        onClick={handleSpinClick}
        disabled={spinsAvailable <= 0 || isSpinning}
        style={{
          marginTop: '24px',
          padding: '12px 36px',
          fontSize: '1rem',
          fontWeight: 800,
          borderRadius: '30px',
          border: 'none',
          cursor: spinsAvailable <= 0 ? 'not-allowed' : 'pointer',
          background: spinsAvailable > 0 ? 'linear-gradient(135deg, #5B21B6 0%, #7C3AED 100%)' : '#E5E7EB',
          color: spinsAvailable > 0 ? '#FFFFFF' : '#6B7280',
          boxShadow: spinsAvailable > 0 ? '0 6px 20px rgba(91, 33, 182, 0.35)' : 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.2s',
          maxWidth: '100%'
        }}
      >
        <Sparkles size={18} />
        {isSpinning ? 'Spinning...' : spinsAvailable > 0 ? 'Spin Now!' : 'No Spins Left Today'}
      </button>

      <p style={{ color: '#6B7280', fontSize: '0.8rem', marginTop: '10px', fontWeight: 600, textAlign: 'center' }}>
        {spinsAvailable > 0 ? `🎉 You have ${spinsAvailable} spin available today!` : '⏰ Next spin unlocks tomorrow'}
      </p>

      {/* Reward Result Modal */}
      {resultModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)',
          zIndex: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="card-white" style={{ maxWidth: '360px', width: '100%', textAlign: 'center', padding: '28px 24px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: resultModal.reward_points > 0 ? 'linear-gradient(135deg, #22C55E 0%, #4ADE80 100%)' : '#F3E8FF', margin: '0 auto 14px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award color={resultModal.reward_points > 0 ? '#FFF' : '#5B21B6'} size={32} />
            </div>
            <h3 style={{ color: '#1E1B4B', fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>
              {resultModal.reward_points > 0 ? '🎉 Congratulations!' : 'Better Luck Next Time!'}
            </h3>
            <p style={{ color: '#6B7280', fontSize: '0.95rem', marginBottom: '20px', lineHeight: 1.5 }}>
              {resultModal.message || (resultModal.reward_points > 0 ? `You won +${resultModal.reward_points} Points!` : 'Spin again tomorrow for more points.')}
            </p>
            <button onClick={() => setResultModal(null)} className="btn-green" style={{ width: '100%', borderRadius: '14px', padding: '12px' }}>
              Awesome! 🙌
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
