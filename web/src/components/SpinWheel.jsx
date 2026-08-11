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
    { id: '6', label: 'Better Luck', reward_points: 0, color: '#EC4899' }
  ];

  const handleSpinClick = async () => {
    if (spinsAvailable <= 0 || isSpinning) return;
    
    // Calculate random spin rotation (e.g. 5 full rotations + random angle)
    const extraDegrees = Math.floor(1800 + Math.random() * 360);
    const newTotalDegree = rotationDegree + extraDegrees;
    setRotationDegree(newTotalDegree);

    // Call parent handler to get server result
    const result = await onSpin();
    if (result) {
      setTimeout(() => {
        setResultModal(result);
      }, 4000);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      
      {/* Pointer Icon */}
      <div style={{ position: 'relative', zIndex: 20, marginBottom: '-24px' }}>
        <div style={{ width: 0, height: 0, borderLeft: '18px solid transparent', borderRight: '18px solid transparent', borderTop: '32px solid #22C55E', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }} />
      </div>

      {/* Wheel Canvas Container */}
      <div 
        style={{
          width: 'min(280px, 70vw)',
          height: 'min(280px, 70vw)',
          borderRadius: '50%',
          border: '8px solid #5B21B6',
          boxShadow: '0 0 35px rgba(124, 58, 237, 0.4), inset 0 0 15px rgba(0,0,0,0.5)',
          position: 'relative',
          overflow: 'hidden',
          transition: 'transform 4s cubic-bezier(0.15, 0.9, 0.2, 1)',
          transform: `rotate(${rotationDegree}deg)`,
          background: '#1E1445'
        }}
      >
        {/* Render 6 Color Slices */}
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
                border: '1px solid rgba(255,255,255,0.2)'
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  left: '20px',
                  bottom: '25px',
                  transform: 'skewY(30deg) rotate(45deg)',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  textShadow: '0 2px 4px rgba(0,0,0,0.6)',
                  whiteSpace: 'nowrap'
                }}
              >
                {slice.label || `${slice.reward_points} Pts`}
              </span>
            </div>
          );
        })}

        {/* Center Hub */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #FFF 0%, #E9D5FF 100%)', boxShadow: '0 0 15px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
          <Disc color="#5B21B6" size={28} />
        </div>
      </div>

      {/* Spin Button */}
      <button
        onClick={handleSpinClick}
        disabled={spinsAvailable <= 0 || isSpinning}
        className="btn-primary"
        style={{
          marginTop: '28px',
          padding: '14px 42px',
          fontSize: '1.1rem',
          borderRadius: '30px',
          opacity: spinsAvailable <= 0 ? 0.6 : 1,
          cursor: spinsAvailable <= 0 ? 'not-allowed' : 'pointer'
        }}
      >
        <Sparkles size={20} />
        {isSpinning ? 'Spinning...' : spinsAvailable > 0 ? 'Spin Now!' : 'No Spins Left Today'}
      </button>

      <p style={{ color: '#C4B5FD', fontSize: '0.85rem', marginTop: '10px', fontWeight: 600 }}>
        {spinsAvailable > 0 ? `🎉 You have ${spinsAvailable} spin available today!` : '⏰ Next spin unlocks tomorrow'}
      </p>

      {/* Reward Result Modal */}
      {resultModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-card-dark" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', padding: '32px' }}>
            <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: resultModal.reward_points > 0 ? 'linear-gradient(135deg, #22C55E 0%, #4ADE80 100%)' : '#EC4899', margin: '0 auto 16px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award color="#FFF" size={36} />
            </div>
            <h3 style={{ color: '#FFF', fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>
              {resultModal.reward_points > 0 ? '🎉 Congratulations!' : ' Better Luck Next Time!'}
            </h3>
            <p style={{ color: '#C4B5FD', fontSize: '1rem', marginBottom: '24px' }}>
              {resultModal.message || (resultModal.reward_points > 0 ? `You won +${resultModal.reward_points} Points!` : 'Spin again tomorrow for more points.')}
            </p>
            <button onClick={() => setResultModal(null)} className="btn-green" style={{ width: '100%' }}>
              Awesome!
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
