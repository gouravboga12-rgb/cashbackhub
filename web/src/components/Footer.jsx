import React from 'react';
import { Gift, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ background: '#FFFFFF', color: '#6B7280', borderTop: '1px solid #E5E7EB', padding: '40px 20px 20px 20px' }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
        gap: '28px',
        marginBottom: '32px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #5B21B6 0%, #22C55E 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Gift color="#FFF" size={20} />
            </div>
            <h2 style={{ color: '#1E1B4B', fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>CashBack<span style={{ color: '#22C55E' }}>Hub</span></h2>
          </div>
          <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: '#6B7280', margin: 0 }}>
            India's premier daily reward platform turning simple check-ins, ad watching &amp; spin games into real monetary value and instant gift vouchers.
          </p>
        </div>

        <div>
          <h3 style={{ color: '#1E1B4B', fontSize: '1rem', fontWeight: 700, marginBottom: '14px', marginTop: 0 }}>Quick Links</h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem', margin: 0, padding: 0 }}>
            <li><a href="/" style={{ color: '#6B7280', textDecoration: 'none' }}>Home</a></li>
            <li><a href="/about" style={{ color: '#6B7280', textDecoration: 'none' }}>About Us</a></li>
            <li><a href="/how-it-works" style={{ color: '#6B7280', textDecoration: 'none' }}>How It Works</a></li>
            <li><a href="/contact" style={{ color: '#6B7280', textDecoration: 'none' }}>Contact &amp; Support</a></li>
          </ul>
        </div>

        <div>
          <h3 style={{ color: '#1E1B4B', fontSize: '1rem', fontWeight: 700, marginBottom: '14px', marginTop: 0 }}>Voucher Partners</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '0.8rem' }}>
            <span style={{ background: '#F3E8FF', padding: '6px 12px', borderRadius: '8px', color: '#5B21B6', fontWeight: 700 }}>PhonePe</span>
            <span style={{ background: '#F3E8FF', padding: '6px 12px', borderRadius: '8px', color: '#5B21B6', fontWeight: 700 }}>Flipkart</span>
            <span style={{ background: '#F3E8FF', padding: '6px 12px', borderRadius: '8px', color: '#5B21B6', fontWeight: 700 }}>Amazon Pay</span>
            <span style={{ background: '#F3E8FF', padding: '6px 12px', borderRadius: '8px', color: '#5B21B6', fontWeight: 700 }}>Google Play</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', borderTop: '1px solid #E5E7EB', paddingTop: '20px', textAlign: 'center', fontSize: '0.8rem', color: '#9CA3AF', lineHeight: 1.6 }}>
        © 2026 CashBack Hub. All rights reserved. Crafted with <Heart size={14} color="#EF4444" style={{ verticalAlign: 'middle', display: 'inline' }} /> for daily rewards.
      </div>
    </footer>
  );
}
