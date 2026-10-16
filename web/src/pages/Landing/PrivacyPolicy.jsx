import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

const SECTIONS = [
  {
    title: '1. Information We Collect',
    content: `We collect information you provide directly to us, including: Full name, email address, and mobile number when you register; Profile information you optionally add; Usage data such as promotional reward points earned, videos watched, and game activities completed; Device identifiers and IP address for anti-fraud and security purposes; Referral information when you invite others.`
  },
  {
    title: '2. How We Use Your Information',
    content: `We use the information we collect to: Authenticate your account and ensure fair play; Process your reward points and gift voucher redemptions; Send you transactional notifications regarding your account and redemptions; Detect, prevent, and mitigate fraud, automated bots, and unauthorized activity; Comply with legal obligations; Communicate updates and platform improvements.`
  },
  {
    title: '3. Nature of the App (Not Gambling / Free Promotional Rewards)',
    content: `Perkfy is a 100% free-to-use loyalty and reward platform. No purchase, deposit, or wager of real money is required or allowed. Game mechanics (lucky dice, spin wheel, mystery boxes) are promotional engagement activities where points earned can be exchanged for retail merchant gift cards (e.g., Amazon, Flipkart, Google Play, Swiggy) or digital cashback subject to platform inventory and terms.`
  },
  {
    title: '4. Sharing of Information',
    content: `We never sell, rent, or trade your personal data. We may share necessary information only with: Partner voucher distributors solely to fulfill requested gift card redemptions; Cloud infrastructure and security providers bound by strict confidentiality; Law enforcement authorities only when formally mandated by applicable law.`
  },
  {
    title: '5. Data Security',
    content: `We employ industry-standard 256-bit SSL/TLS encryption for all data in transit and robust access controls for stored records. Regular vulnerability assessments are performed to ensure your credentials and reward records remain safe.`
  },
  {
    title: '6. User Account Deletion & Right to Erasure (Google Play Compliant)',
    content: `You have the absolute right to delete your account and associated personal data at any time:
    
• In-App Self-Service Deletion: Navigate to Profile > Delete Account. You will be prompted to type "DELETE" in capital letters to confirm. Once confirmed, your account is immediately deleted, your session is revoked, and your data is permanently erased.
• Web Portal Deletion: Navigate to Profile > Delete Account and confirm by typing "DELETE".
• Web/Email Deletion Request: You may also email perkfy2026@gmail.com with the subject "Account Deletion Request" from your registered email address. Requests are processed within 48 business hours.

Data Permanently Deleted: Your name, email, phone number, password hashes, available reward points, active vouchers, daily attendance streaks, and game roll history are completely purged.
Data Retained: Only anonymized payout transaction logs required for tax or statutory compliance are retained for the legally mandated period.`
  },
  {
    title: '7. Cookies & Tracking',
    content: `We use cookies and local storage to remember your login session, preferences, and security tokens. You can control cookie preferences in your browser settings.`
  },
  {
    title: '8. Children\'s Privacy',
    content: `Perkfy is designed for users aged 13 and older. We do not knowingly collect personal information from individuals under 13. If discovered, any such accounts and data are purged immediately.`
  },
  {
    title: '9. Changes to This Policy',
    content: `We may revise this Privacy Policy periodically. Any material modifications will be reflected with an updated revision date. Continued usage of Perkfy signifies your acceptance of the updated terms.`
  },
  {
    title: '10. Contact Us & Data Protection Officer',
    content: `For any privacy inquiries, data deletion questions, or rights requests, contact our team at: perkfy2026@gmail.com. We respond promptly within 2 business days.`
  },
];

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div style={{ background: '#F8F7FC', minHeight: '100vh', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      
      <header style={{
        background: 'rgba(255,255,255,0.98)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid #EDE9FE',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 12px rgba(91,33,182,0.07)'
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: '#F3E8FF', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
        >
          <ArrowLeft size={18} color="#5B21B6" />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/perkfy-logo.png" alt="Perkfy Logo" style={{ width: '36px', height: '36px', borderRadius: '10px', objectFit: 'cover' }} />
          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E1B4B' }}>Privacy Policy</span>
        </div>
      </header>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '24px 16px 40px 16px' }}>
        
        {/* Hero */}
        <div style={{
          background: 'linear-gradient(135deg, #065F46 0%, #10B981 100%)',
          borderRadius: '20px',
          padding: '24px',
          color: '#FFF',
          textAlign: 'center',
          marginBottom: '24px',
          boxShadow: '0 8px 24px rgba(16,185,129,0.2)'
        }}>
          <Shield size={36} color="#FFF" style={{ marginBottom: '10px', opacity: 0.9 }} />
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 6px 0' }}>Privacy Policy</h1>
          <p style={{ color: '#D1FAE5', fontSize: '0.825rem', margin: 0 }}>Last updated: October 2026 | Your privacy is our priority</p>
        </div>

        {/* Introduction */}
        <div style={{ background: '#ECFDF5', borderRadius: '14px', padding: '16px', marginBottom: '18px', border: '1px solid #A7F3D0' }}>
          <p style={{ color: '#065F46', fontSize: '0.875rem', fontWeight: 600, margin: 0, lineHeight: 1.6 }}>
            At Perkfy, we are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, and safeguard your data when you use our platform.
          </p>
        </div>

        {/* Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {SECTIONS.map((section, i) => (
            <div key={i} style={{ background: '#FFFFFF', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(91,33,182,0.06)', border: '1px solid #EDE9FE' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1E1B4B', margin: '0 0 10px 0' }}>{section.title}</h3>
              <p style={{ color: '#4B5563', fontSize: '0.875rem', lineHeight: 1.7, margin: 0 }}>{section.content}</p>
            </div>
          ))}
        </div>

        {/* Contact Footer */}
        <div style={{ textAlign: 'center', marginTop: '24px', padding: '16px', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #EDE9FE' }}>
          <p style={{ color: '#6B7280', fontSize: '0.825rem', margin: 0 }}>
            Privacy questions? Email us at{' '}
            <a href="mailto:perkfy2026@gmail.com" style={{ color: '#5B21B6', fontWeight: 700 }}>perkfy2026@gmail.com</a>
          </p>
        </div>

      </div>
    </div>
  );
}
