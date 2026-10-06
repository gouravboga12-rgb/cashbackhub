import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

const SECTIONS = [
  {
    title: '1. Information We Collect',
    content: `We collect information you provide directly to us, including: Full name, email address, and mobile number when you register; Profile information you optionally add; Usage data such as points earned, videos watched, and activities completed; Device information and IP address for security purposes; Referral information when you invite others.`
  },
  {
    title: '2. How We Use Your Information',
    content: `We use the information we collect to: Provide, maintain, and improve our services; Process your reward points and voucher redemptions; Send you notifications about your account and rewards; Detect and prevent fraudulent activity; Comply with legal obligations; Communicate with you about updates, promotions, and new features.`
  },
  {
    title: '3. Sharing of Information',
    content: `We do not sell your personal data to third parties. We may share your information with: Partner brands (only what is necessary to fulfill voucher redemptions); Payment processors for transaction verification; Law enforcement when required by applicable law; Service providers who assist us in operating the platform under strict confidentiality agreements.`
  },
  {
    title: '4. Data Security',
    content: `We implement industry-standard security measures to protect your personal information, including SSL encryption, secure database storage, and regular security audits. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.`
  },
  {
    title: '5. Cookies & Tracking',
    content: `We use cookies and similar technologies to enhance your experience, remember your preferences, analyze usage patterns, and serve relevant content. You can control cookie settings through your browser, but disabling cookies may affect certain features of the platform.`
  },
  {
    title: '6. Data Retention',
    content: `We retain your personal data for as long as your account is active or as needed to provide services. You may request deletion of your account and associated data by contacting us. Certain data may be retained for legal compliance purposes for up to 7 years.`
  },
  {
    title: '7. Your Rights',
    content: `You have the right to: Access the personal data we hold about you; Request correction of inaccurate data; Request deletion of your account and data; Object to processing of your data for marketing purposes; Download a copy of your data (data portability). To exercise these rights, contact us at perkfy2026@gmail.com.`
  },
  {
    title: '8. Children\'s Privacy',
    content: `Perkfy is not directed to children under the age of 13. We do not knowingly collect personal information from children under 13. If we discover that we have collected data from a child under 13 without parental consent, we will delete that information promptly.`
  },
  {
    title: '9. Third-Party Links',
    content: `Our platform may contain links to third-party websites (such as Amazon, Flipkart, Swiggy, Zomato, PhonePe). We are not responsible for the privacy practices or content of these external sites. We encourage you to review their privacy policies.`
  },
  {
    title: '10. Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. We will notify you of significant changes via email or through a prominent notice on the platform. Your continued use of Perkfy after changes become effective constitutes acceptance of the revised policy.`
  },
  {
    title: '11. Contact Us',
    content: `If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at: perkfy2026@gmail.com. We will respond to your inquiry within 30 business days.`
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
