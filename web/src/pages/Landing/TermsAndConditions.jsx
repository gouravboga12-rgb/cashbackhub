import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    content: `By accessing or using the Perkfy platform ("Service"), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our Service. We reserve the right to update these terms at any time, and continued use of the Service constitutes acceptance of the revised terms.`
  },
  {
    title: '2. Eligibility',
    content: `The Service is available to users who are 13 years of age or older. By using Perkfy, you represent that you are at least 13 years old. Users under 18 must have parental consent to use the platform.`
  },
  {
    title: '3. Account Registration',
    content: `To use Perkfy, you must create an account with accurate and complete information. You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account. Perkfy is not liable for any losses due to unauthorized access resulting from your failure to secure your credentials.`
  },
  {
    title: '4. Points & Rewards System',
    content: `Points are earned by completing tasks such as watching videos, daily check-ins, playing dice, spinning the wheel, and referring friends. Points have no monetary value until redeemed for eligible vouchers. Perkfy reserves the right to adjust, modify, or revoke points at any time due to suspected fraud, system errors, or policy violations. Points expire after 12 months of account inactivity.`
  },
  {
    title: '5. Referral Program',
    content: `Referral bonuses are credited when the referred user successfully registers and completes their first qualifying activity. Fraudulent referral activity (e.g., self-referrals, fake accounts) will result in immediate account suspension and forfeiture of all earned points.`
  },
  {
    title: '6. Voucher Redemption',
    content: `Vouchers are digital codes provided by third-party partners (Amazon, Flipkart, Swiggy, Zomato, PhonePe, etc.). Perkfy is not responsible for issues related to voucher validity, expiry, or usage terms set by partner brands. Redeemed vouchers cannot be cancelled, exchanged, or refunded.`
  },
  {
    title: '7. Prohibited Activities',
    content: `You agree not to: use automated bots or scripts to earn points; create multiple accounts; engage in fraudulent activity; misuse the referral system; reverse-engineer or scrape the platform; violate any applicable laws or regulations. Violation of these prohibitions will result in permanent account ban.`
  },
  {
    title: '8. Intellectual Property',
    content: `All content, trademarks, logos, and intellectual property on Perkfy are owned by or licensed to Perkfy and may not be used without express written consent.`
  },
  {
    title: '9. Limitation of Liability',
    content: `Perkfy is provided "as is" without warranties of any kind. To the maximum extent permitted by law, Perkfy shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service.`
  },
  {
    title: '10. Termination',
    content: `Perkfy reserves the right to suspend or terminate your account at any time for violations of these terms or for any other reason at our discretion. Upon termination, all earned points and pending rewards will be forfeited.`
  },
  {
    title: '11. Governing Law',
    content: `These Terms and Conditions are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in India.`
  },
  {
    title: '12. Contact',
    content: `For any questions about these Terms and Conditions, please contact us at perkfy2026@gmail.com.`
  },
];

export default function TermsAndConditions() {
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
          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E1B4B' }}>Terms & Conditions</span>
        </div>
      </header>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '24px 16px 40px 16px' }}>
        
        {/* Hero */}
        <div style={{
          background: 'linear-gradient(135deg, #1E1B4B 0%, #4C1D95 100%)',
          borderRadius: '20px',
          padding: '24px',
          color: '#FFF',
          textAlign: 'center',
          marginBottom: '24px',
          boxShadow: '0 8px 24px rgba(30,27,75,0.2)'
        }}>
          <FileText size={36} color="#A78BFA" style={{ marginBottom: '10px' }} />
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 6px 0' }}>Terms & Conditions</h1>
          <p style={{ color: '#C7D2FE', fontSize: '0.825rem', margin: 0 }}>Last updated: October 2026 | Effective immediately upon account creation</p>
        </div>

        {/* Introduction */}
        <div style={{ background: '#EDE9FE', borderRadius: '14px', padding: '16px', marginBottom: '18px', border: '1px solid #DDD6FE' }}>
          <p style={{ color: '#4C1D95', fontSize: '0.875rem', fontWeight: 600, margin: 0, lineHeight: 1.6 }}>
            Please read these Terms and Conditions carefully before using the Perkfy platform. By creating an account or using our services, you agree to be bound by these terms.
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
            Questions? Email us at{' '}
            <a href="mailto:perkfy2026@gmail.com" style={{ color: '#5B21B6', fontWeight: 700 }}>perkfy2026@gmail.com</a>
          </p>
        </div>

      </div>
    </div>
  );
}
