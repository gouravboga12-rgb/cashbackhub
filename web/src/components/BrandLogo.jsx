import React, { useState } from 'react';

export default function BrandLogo({ brandName, image, logo, size = 44, style = {} }) {
  const [imgError, setImgError] = useState(false);
  const customImg = image || (typeof logo === 'string' && (logo.startsWith('http') || logo.startsWith('data:') || logo.startsWith('/')) ? logo : null);
  const nameLower = (brandName || '').toLowerCase();
  const initial = (brandName || '🎁').trim().charAt(0).toUpperCase();

  // 1. If explicit custom image or logo URL is provided and has not errored
  if (customImg && !imgError) {
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
          onError={() => setImgError(true)}
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
        background: 'linear-gradient(135deg, #5F259F 0%, #4B1A80 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 4px 12px rgba(95, 37, 159, 0.3)',
        padding: '4px',
        boxSizing: 'border-box',
        color: '#FFFFFF',
        fontWeight: 900,
        fontSize: `${size * 0.45}px`,
        ...style
      }}>
        पे
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
        background: 'linear-gradient(135deg, #2874F0 0%, #1A5BB8 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 4px 12px rgba(40, 116, 240, 0.3)',
        padding: '4px',
        boxSizing: 'border-box',
        color: '#FFE500',
        fontWeight: 900,
        fontStyle: 'italic',
        fontSize: `${size * 0.52}px`,
        ...style
      }}>
        f
      </div>
    );
  }

  // 4. Preset Brand: Amazon Pay / Amazon
  if (nameLower.includes('amazon')) {
    return (
      <div style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '12px',
        background: '#131921',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
        padding: '4px',
        boxSizing: 'border-box',
        color: '#FF9900',
        fontWeight: 900,
        fontSize: `${size * 0.48}px`,
        lineHeight: 1,
        ...style
      }}>
        <span>a</span>
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
        background: '#FFFFFF',
        border: '1.5px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 4px 12px rgba(234, 67, 53, 0.2)',
        padding: '4px',
        boxSizing: 'border-box',
        ...style
      }}>
        <svg viewBox="0 0 24 24" width={`${size * 0.6}px`} height={`${size * 0.6}px`}>
          <path fill="#4285F4" d="M3.6 1.8L13.8 12 3.6 22.2c-.4-.4-.6-1-.6-1.7V3.5c0-.7.2-1.3.6-1.7z" />
          <path fill="#FBBC04" d="M17.3 8.5L13.8 12l3.5 3.5 4.1-2.3c1.2-.7 1.2-1.7 0-2.4l-4.1-2.3z" />
          <path fill="#34A853" d="M3.6 22.2l10.2-10.2 3.5 3.5-11.8 6.7c-.6.3-1.3.3-1.9 0z" />
          <path fill="#EA4335" d="M17.3 8.5L13.8 12 3.6 1.8c.6-.3 1.3-.3 1.9 0l11.8 6.7z" />
        </svg>
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
        background: '#002E6E',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 4px 12px rgba(0, 186, 242, 0.25)',
        padding: '2px',
        boxSizing: 'border-box',
        color: '#00BAF2',
        fontWeight: 900,
        fontSize: `${size * 0.3}px`,
        letterSpacing: '-0.5px',
        ...style
      }}>
        Pay<span style={{ color: '#00BAF2' }}>tm</span>
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
        background: 'linear-gradient(135deg, #FF3F6C 0%, #FF905A 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 4px 12px rgba(255, 63, 108, 0.25)',
        padding: '4px',
        boxSizing: 'border-box',
        color: '#FFFFFF',
        fontWeight: 900,
        fontSize: `${size * 0.44}px`,
        ...style
      }}>
        M
      </div>
    );
  }

  // 8. Preset Brand: Swiggy
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
        padding: '4px',
        boxSizing: 'border-box',
        color: '#FFFFFF',
        fontWeight: 900,
        fontSize: `${size * 0.44}px`,
        ...style
      }}>
        S
      </div>
    );
  }

  // 9. Preset Brand: Zomato
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
        padding: '4px',
        boxSizing: 'border-box',
        color: '#FFFFFF',
        fontWeight: 900,
        fontSize: `${size * 0.3}px`,
        fontStyle: 'italic',
        ...style
      }}>
        zomato
      </div>
    );
  }

  // 10. If logo is an emoji or short symbol
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

  // 11. Clean Initial Fallback badge
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
      fontSize: `${size * 0.44}px`,
      flexShrink: 0,
      boxShadow: '0 2px 8px rgba(91, 33, 182, 0.2)',
      boxSizing: 'border-box',
      ...style
    }}>
      {initial}
    </div>
  );
}
