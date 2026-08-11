import React from 'react';
import { Gift, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ background: '#0E0B1F', color: '#C4B5FD', borderTop: '1px solid #3B2F6B', padding: '40px 24px 20px 24px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '32px', marginBottom: '32px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #7C3AED 0%, #22C55E 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Gift color="#FFF" size={20} />
            </div>
            <h2 style={{ color: '#FFF', fontSize: '1.25rem', fontWeight: 800 }}>CashBack<span style={{ color: '#4ADE80' }}>Hub</span></h2>
          </div>
          <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: '#A78BFA' }}>
            India's premier daily reward platform turning simple check-ins, ad watching & spin games into real monetary value and instant gift vouchers.
          </p>
        </div>

        <div>
          <h3 style={{ color: '#FFF', fontSize: '1rem', fontWeight: 700, marginBottom: '14px' }}>Quick Links</h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem' }}>
            <li><a href="/" style={{ color: '#A78BFA', textDecoration: 'none' }}>Home</a></li>
            <li><a href="/about" style={{ color: '#A78BFA', textDecoration: 'none' }}>About Us</a></li>
            <li><a href="/how-it-works" style={{ color: '#A78BFA', textDecoration: 'none' }}>How It Works</a></li>
            <li><a href="/contact" style={{ color: '#A78BFA', textDecoration: 'none' }}>Contact & Support</a></li>
          </ul>
        </div>

        <div>
          <h3 style={{ color: '#FFF', fontSize: '1rem', fontWeight: 700, marginBottom: '14px' }}>Voucher Partners</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '0.8rem' }}>
            <span style={{ background: '#1E1445', padding: '6px 12px', borderRadius: '8px', color: '#4ADE80' }}>PhonePe</span>
            <span style={{ background: '#1E1445', padding: '6px 12px', borderRadius: '8px', color: '#4ADE80' }}>Flipkart</span>
            <span style={{ background: '#1E1445', padding: '6px 12px', borderRadius: '8px', color: '#4ADE80' }}>Amazon Pay</span>
            <span style={{ background: '#1E1445', padding: '6px 12px', borderRadius: '8px', color: '#4ADE80' }}>Google Play</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', borderTop: '1px solid rgba(124, 58, 237, 0.2)', paddingTop: '20px', textAlign: 'center', fontSize: '0.8rem', color: '#8B5CF6' }}>
        © 2026 CashBack Hub. All rights reserved. Crafted with <Heart size={14} color="#EC4899" style={{ verticalAlign: 'middle' }} /> for daily rewards.
      </div>
    </footer>
  );
}
