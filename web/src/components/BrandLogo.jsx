import React from 'react';

export default function BrandLogo({ brandName, image, logo, size = 44, style = {} }) {
  const customImg = image || (typeof logo === 'string' && (logo.startsWith('http') || logo.startsWith('data:') || logo.startsWith('/')) ? logo : null);
  const nameLower = (brandName || '').toLowerCase();

  // 1. If explicit custom image or logo URL is provided, display it
  if (customImg) {
    return (
      <div style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '12px',
        background: '#FFFFFF',
        border: '1px solid #E5E7EB',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        padding: '4px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        ...style
      }}>
        <img
          src={customImg}
          alt={brandName || 'Brand'}
          style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.style.display = 'none';
            e.target.parentNode.innerHTML = `<span style="font-weight:900;font-size:0.85rem;color:#5B21B6">${(brandName || '🎁').charAt(0)}</span>`;
          }}
        />
      </div>
    );
  }

  // 2. Preset Brand: PhonePe
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
        padding: '6px',
        boxSizing: 'border-box',
        ...style
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

  // 3. Preset Brand: Flipkart
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
        padding: '6px',
        boxSizing: 'border-box',
        ...style
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

  // 4. Preset Brand: Amazon Pay
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
        padding: '6px',
        boxSizing: 'border-box',
        ...style
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

  // 5. Preset Brand: Google Play / Google Pay
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
        padding: '6px',
        boxSizing: 'border-box',
        ...style
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

  // 6. Preset Brand: Paytm
  if (nameLower.includes('paytm')) {
    return (
      <div style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '12px',
        background: '#00BAF2',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 4px 12px rgba(0, 186, 242, 0.25)',
        padding: '6px',
        boxSizing: 'border-box',
        ...style
      }}>
        <img
          src="https://img.icons8.com/color/96/paytm.png"
          alt="Paytm"
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.style.display = 'none';
            e.target.parentNode.innerHTML = '<span style="color:#FFF;font-weight:900;font-size:0.9rem">Paytm</span>';
          }}
        />
      </div>
    );
  }

  // 7. Preset Brand: Myntra
  if (nameLower.includes('myntra')) {
    return (
      <div style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '12px',
        background: '#FF3F6C',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 4px 12px rgba(255, 63, 108, 0.25)',
        padding: '6px',
        boxSizing: 'border-box',
        ...style
      }}>
        <span style={{ color: '#FFFFFF', fontWeight: 900, fontSize: `${size * 0.4}px`, letterSpacing: '-1px' }}>M</span>
      </div>
    );
  }

  // 8. Preset Brand: Swiggy / Zomato
  if (nameLower.includes('swiggy')) {
    return (
      <div style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '12px',
        background: '#FC8019',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 4px 12px rgba(252, 128, 25, 0.25)',
        padding: '6px',
        boxSizing: 'border-box',
        ...style
      }}>
        <span style={{ color: '#FFFFFF', fontWeight: 900, fontSize: `${size * 0.4}px` }}>S</span>
      </div>
    );
  }

  if (nameLower.includes('zomato')) {
    return (
      <div style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '12px',
        background: '#CB202D',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 4px 12px rgba(203, 32, 45, 0.25)',
        padding: '6px',
        boxSizing: 'border-box',
        ...style
      }}>
        <span style={{ color: '#FFFFFF', fontWeight: 900, fontSize: `${size * 0.35}px`, fontStyle: 'italic' }}>zomato</span>
      </div>
    );
  }

  // 9. If logo is an emoji or short symbol
  if (logo && typeof logo === 'string' && logo.length <= 4) {
    return (
      <div style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '12px',
        background: '#EDE9FE',
        border: '1px solid #DDD6FE',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: `${size * 0.5}px`,
        flexShrink: 0,
        boxSizing: 'border-box',
        ...style
      }}>
        {logo}
      </div>
    );
  }

  // 10. Fallback with initial letter
  const initial = (brandName || 'G').trim().charAt(0).toUpperCase();
  return (
    <div style={{
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '12px',
      background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#FFFFFF',
      fontWeight: 800,
      fontSize: `${size * 0.45}px`,
      flexShrink: 0,
      boxShadow: '0 2px 8px rgba(91, 33, 182, 0.2)',
      boxSizing: 'border-box',
      ...style
    }}>
      {initial}
    </div>
  );
}
