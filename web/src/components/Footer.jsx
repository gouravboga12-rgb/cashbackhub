import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ background: '#FFFFFF', color: '#6B7280', borderTop: '1px solid #E5E7EB', padding: '40px 20px 24px 20px' }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
        gap: '28px',
        marginBottom: '32px'
      }}>
        {/* Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <img
              src="/perkfy-logo.png"
              alt="Perkfy"
              style={{ width: '38px', height: '38px', borderRadius: '10px', objectFit: 'cover', boxShadow: '0 2px 8px rgba(91, 33, 182, 0.2)' }}
            />
            <h2 style={{ color: '#1E1B4B', fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Perk<span style={{ color: '#22C55E' }}>fy</span></h2>
          </div>
          <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: '#6B7280', margin: 0 }}>
            Turn your screen time &amp; social circle into real rewards. Watch videos, invite friends, and claim instant digital vouchers from top brands.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 style={{ color: '#1E1B4B', fontSize: '0.95rem', fontWeight: 700, marginBottom: '14px', marginTop: 0 }}>Quick Links</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
            <li><Link to="/about-us" style={{ color: '#6B7280', textDecoration: 'none', fontWeight: 600 }}>About Us</Link></li>
            <li><Link to="/contact-us" style={{ color: '#6B7280', textDecoration: 'none', fontWeight: 600 }}>Contact Us</Link></li>
            <li><Link to="/terms-and-conditions" style={{ color: '#6B7280', textDecoration: 'none', fontWeight: 600 }}>Terms &amp; Conditions</Link></li>
            <li><Link to="/privacy-policy" style={{ color: '#6B7280', textDecoration: 'none', fontWeight: 600 }}>Privacy Policy</Link></li>
          </ul>
        </div>

        {/* Voucher Partners */}
        <div>
          <h3 style={{ color: '#1E1B4B', fontSize: '0.95rem', fontWeight: 700, marginBottom: '14px', marginTop: 0 }}>Voucher Partners</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '0.8rem' }}>
            <span style={{ background: '#F3E8FF', padding: '6px 12px', borderRadius: '8px', color: '#5B21B6', fontWeight: 700 }}>Amazon Pay</span>
            <span style={{ background: '#F3E8FF', padding: '6px 12px', borderRadius: '8px', color: '#5B21B6', fontWeight: 700 }}>Flipkart</span>
            <span style={{ background: '#F3E8FF', padding: '6px 12px', borderRadius: '8px', color: '#5B21B6', fontWeight: 700 }}>Swiggy</span>
            <span style={{ background: '#F3E8FF', padding: '6px 12px', borderRadius: '8px', color: '#5B21B6', fontWeight: 700 }}>Zomato</span>
            <span style={{ background: '#F3E8FF', padding: '6px 12px', borderRadius: '8px', color: '#5B21B6', fontWeight: 700 }}>PhonePe</span>
          </div>
          <div style={{ marginTop: '14px' }}>
            <a href="mailto:perkfy2026@gmail.com" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#5B21B6', textDecoration: 'none', fontWeight: 700 }}>
              <Mail size={14} /> perkfy2026@gmail.com
            </a>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', borderTop: '1px solid #E5E7EB', paddingTop: '20px', textAlign: 'center', fontSize: '0.8rem', color: '#9CA3AF', lineHeight: 1.6 }}>
        © 2026 Perkfy. All rights reserved. Crafted with <Heart size={14} color="#EF4444" style={{ verticalAlign: 'middle', display: 'inline' }} /> for daily rewards.
      </div>
    </footer>
  );
}
