import React, { useEffect, useState, useRef } from 'react';

// Web Audio API synthesized sound effects
function playDiceRollSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const clackTimes = [0.05, 0.18, 0.32, 0.5, 0.72, 0.98, 1.25, 1.55];
    clackTimes.forEach((t) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180 + Math.random() * 220, ctx.currentTime + t);
      osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + t + 0.04);
      gain.gain.setValueAtTime(0.2, ctx.currentTime + t);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + t + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + t);
      osc.stop(ctx.currentTime + t + 0.04);
    });
  } catch (e) {}
}

function playDiceWinChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [587.33, 739.99, 880.0, 1174.66]; // D5, F#5, A5, D6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
      gain.gain.setValueAtTime(0.22, ctx.currentTime + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.1);
      osc.stop(ctx.currentTime + idx * 0.1 + 0.4);
    });
  } catch (e) {}
}

// 3D Rotations needed to show target face in front
// Face 1: Front
// Face 2: Bottom
// Face 3: Left
// Face 4: Right
// Face 5: Top
// Face 6: Back
const FACE_ROTATIONS = {
  1: { x: 0, y: 0, z: 0 },
  2: { x: -90, y: 0, z: 0 },
  3: { x: 0, y: 90, z: 0 },
  4: { x: 0, y: -90, z: 0 },
  5: { x: 90, y: 0, z: 0 },
  6: { x: 180, y: 0, z: 0 }
};

export default function Dice3D({
  targetFace = 1,
  isRolling = false,
  onRollComplete,
  size = 110,
  enableSound = true
}) {
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const [isAnimating, setIsAnimating] = useState(false);
  const rollsCountRef = useRef(0);

  const half = size / 2;

  useEffect(() => {
    if (isRolling) {
      setIsAnimating(true);
      rollsCountRef.current += 1;
      if (enableSound) playDiceRollSound();

      // Generate dramatic multi-spin angles
      const extraSpins = 4 + Math.floor(Math.random() * 3); // 4-6 full spins
      const baseRot = FACE_ROTATIONS[targetFace] || FACE_ROTATIONS[1];

      // Add full 360-degree rotations in random directions to create tumble
      const targetX = baseRot.x + 360 * extraSpins * (Math.random() > 0.5 ? 1 : -1);
      const targetY = baseRot.y + 360 * extraSpins * (Math.random() > 0.5 ? 1 : -1);
      const targetZ = baseRot.z + (Math.floor(Math.random() * 4) * 90);

      setRotation({ x: targetX, y: targetY, z: targetZ });

      const timer = setTimeout(() => {
        setIsAnimating(false);
        if (enableSound && targetFace >= 3) {
          playDiceWinChime();
        }
        if (typeof onRollComplete === 'function') {
          onRollComplete(targetFace);
        }
      }, 1900);

      return () => clearTimeout(timer);
    } else {
      // Settle on current target face
      const baseRot = FACE_ROTATIONS[targetFace] || FACE_ROTATIONS[1];
      setRotation(baseRot);
    }
  }, [isRolling, targetFace]);

  // Dot / Pip rendering helper
  const renderPips = (faceNum) => {
    const dotColor = (faceNum === 1 || faceNum === 6) ? '#DC2626' : '#1E1B4B'; // Crimson for 1 & 6, Indigo for others
    const dotSize = Math.max(12, Math.round(size * 0.16));

    const pipStyle = {
      width: `${dotSize}px`,
      height: `${dotSize}px`,
      borderRadius: '50%',
      background: `radial-gradient(circle at 35% 35%, #FFF 0%, ${dotColor} 45%, #0F0A2A 100%)`,
      boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.7), 0 2px 4px rgba(0,0,0,0.3)',
      display: 'inline-block'
    };

    switch (faceNum) {
      case 1:
        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <span style={{ ...pipStyle, width: `${dotSize * 1.35}px`, height: `${dotSize * 1.35}px`, background: 'radial-gradient(circle at 35% 35%, #FCA5A5 0%, #DC2626 55%, #7F1D1D 100%)' }} />
          </div>
        );
      case 2:
        return (
          <div style={{ display: 'flex', justifyContent: 'space-between', height: '100%', padding: '14px', boxSizing: 'border-box' }}>
            <span style={pipStyle} />
            <span style={{ ...pipStyle, alignSelf: 'flex-end' }} />
          </div>
        );
      case 3:
        return (
          <div style={{ display: 'flex', justifyContent: 'space-between', height: '100%', padding: '12px', boxSizing: 'border-box' }}>
            <span style={pipStyle} />
            <span style={{ ...pipStyle, alignSelf: 'center' }} />
            <span style={{ ...pipStyle, alignSelf: 'flex-end' }} />
          </div>
        );
      case 4:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', padding: '14px', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={pipStyle} />
              <span style={pipStyle} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={pipStyle} />
              <span style={pipStyle} />
            </div>
          </div>
        );
      case 5:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', padding: '12px', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={pipStyle} />
              <span style={pipStyle} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <span style={pipStyle} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={pipStyle} />
              <span style={pipStyle} />
            </div>
          </div>
        );
      case 6:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', padding: '12px', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={pipStyle} />
              <span style={pipStyle} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={pipStyle} />
              <span style={pipStyle} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={pipStyle} />
              <span style={pipStyle} />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const faceBaseStyle = {
    position: 'absolute',
    width: `${size}px`,
    height: `${size}px`,
    background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 60%, #E2E8F0 100%)',
    border: '2px solid rgba(226, 232, 240, 0.9)',
    borderRadius: `${Math.round(size * 0.18)}px`,
    boxShadow: 'inset 0 0 16px rgba(0, 0, 0, 0.06), inset 0 2px 4px rgba(255, 255, 255, 0.95), 0 4px 10px rgba(0, 0, 0, 0.1)',
    backfaceVisibility: 'hidden',
    userSelect: 'none'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 0 24px 0' }}>
      {/* 3D Stage with Perspective */}
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          perspective: '900px',
          margin: '0 auto',
          position: 'relative'
        }}
      >
        {/* Rolling Cube */}
        <div
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            transformStyle: 'preserve-3d',
            transition: isAnimating
              ? 'transform 1.9s cubic-bezier(0.18, 0.89, 0.32, 1.25)'
              : 'transform 0.4s ease-out',
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)`
          }}
        >
          {/* Face 1: Front */}
          <div style={{ ...faceBaseStyle, transform: `rotateY(0deg) translateZ(${half}px)` }}>
            {renderPips(1)}
          </div>
          {/* Face 2: Bottom */}
          <div style={{ ...faceBaseStyle, transform: `rotateX(90deg) translateZ(${half}px)` }}>
            {renderPips(2)}
          </div>
          {/* Face 3: Left */}
          <div style={{ ...faceBaseStyle, transform: `rotateY(-90deg) translateZ(${half}px)` }}>
            {renderPips(3)}
          </div>
          {/* Face 4: Right */}
          <div style={{ ...faceBaseStyle, transform: `rotateY(90deg) translateZ(${half}px)` }}>
            {renderPips(4)}
          </div>
          {/* Face 5: Top */}
          <div style={{ ...faceBaseStyle, transform: `rotateX(-90deg) translateZ(${half}px)` }}>
            {renderPips(5)}
          </div>
          {/* Face 6: Back */}
          <div style={{ ...faceBaseStyle, transform: `rotateX(180deg) translateZ(${half}px)` }}>
            {renderPips(6)}
          </div>
        </div>
      </div>

      {/* Dynamic 3D Ground Shadow */}
      <div
        style={{
          width: isAnimating ? `${size * 0.7}px` : `${size * 0.92}px`,
          height: `${size * 0.22}px`,
          background: 'radial-gradient(ellipse at center, rgba(30, 27, 75, 0.38) 0%, rgba(30, 27, 75, 0.08) 60%, transparent 80%)',
          borderRadius: '50%',
          marginTop: '22px',
          filter: isAnimating ? 'blur(6px)' : 'blur(3px)',
          transform: isAnimating ? 'scale(0.85)' : 'scale(1)',
          transition: 'all 0.3s ease-out'
        }}
      />
    </div>
  );
}
