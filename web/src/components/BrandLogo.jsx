import React from 'react';

export default function BrandLogo({ brandName, size = 44 }) {
  const nameLower = (brandName || '').toLowerCase();

  if (nameLower.includes('phonepe')) {
    return (
      <div style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '12px',
        background: '#5F259F',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 4px 12px rgba(95, 37, 159, 0.25)',
        padding: '6px'
      }}>
        <img
          src="https://img.icons8.com/color/96/phone-pe.png"
          alt="PhonePe"
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.style.display = 'none';
            e.target.parentNode.innerHTML = '<span style="color:#FFF;font-weight:900;font-size:0.9rem">पे</span>';
          }}
        />
      </div>
    );
  }

  if (nameLower.includes('flipkart')) {
    return (
      <div style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '12px',
        background: '#2874F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 4px 12px rgba(40, 116, 240, 0.25)',
        padding: '6px'
      }}>
        <img
          src="https://img.icons8.com/color/96/flipkart.png"
          alt="Flipkart"
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.style.display = 'none';
            e.target.parentNode.innerHTML = '<span style="color:#FFE11B;font-weight:900;font-size:1.1rem">f</span>';
          }}
        />
      </div>
    );
  }

  if (nameLower.includes('amazon')) {
    return (
      <div style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '12px',
        background: '#131921',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
        padding: '6px'
      }}>
        <img
          src="https://img.icons8.com/color/96/amazon.png"
          alt="Amazon"
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.style.display = 'none';
            e.target.parentNode.innerHTML = '<span style="color:#FF9900;font-weight:900;font-size:1.1rem">a</span>';
          }}
        />
      </div>
    );
  }

  if (nameLower.includes('google')) {
    return (
      <div style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '12px',
        background: '#EA4335',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 4px 12px rgba(234, 67, 53, 0.25)',
        padding: '6px'
      }}>
        <img
          src="https://img.icons8.com/color/96/google-play.png"
          alt="Google Play"
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.style.display = 'none';
            e.target.parentNode.innerHTML = '<span style="color:#FFF;font-weight:900;font-size:1rem">▶</span>';
          }}
        />
      </div>
    );
  }

  // Fallback
  return (
    <div style={{
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '12px',
      background: '#5B21B6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#FFFFFF',
      fontWeight: 800,
      fontSize: '0.9rem',
      flexShrink: 0
    }}>
      🎁
    </div>
  );
}
