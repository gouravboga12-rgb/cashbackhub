import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    content: `By accessing or using the Perkfy mobile application or web portal ("Service"), you agree to be bound by these Terms and Conditions. Perkfy is a free promotional loyalty and rewards service. If you do not agree to these terms, please discontinue using the Service.`
  },
  {
    title: '2. Free Promotional Platform (No Purchase Necessary / Not Gambling)',
    content: `Perkfy operates strictly as a promotional reward and engagement service:
    
• No Real Money Gambling: Perkfy is NOT a gambling, betting, or wagering service. Real money cannot be deposited, wagered, or lost.
• 100% Free to Play: No purchase or payment of any kind is required to participate in games (spin wheel, dice rolls, mystery boxes) or earn points.
• Nature of Points: Points earned are promotional loyalty tokens. They possess no direct real-world currency value and cannot be bought, sold, or transferred. Points are solely redeemable for verified digital gift cards (Amazon, Flipkart, Google Play, Swiggy) or digital cashback according to platform inventory, eligibility, and conversion rates.`
  },
  {
    title: '3. Eligibility & Single Account Policy',
    content: `The Service is available to individuals aged 13 or older. Each user may create, own, and operate only ONE verified account. Registration of multiple accounts, spoofing device IDs, use of temporary disposable emails, emulator environments, or VPN bypasses will trigger immediate permanent termination and cancellation of unredeemed reward tokens.`
  },
  {
    title: '4. Fair Play & Prohibited Activities',
    content: `You strictly agree not to:
• Deploy automated bots, clickers, macros, or scripts to automate game rolls or ad viewing.
• Exploit software glitches, network interception, or manipulation tools.
• Attempt self-referrals or manufacture fraudulent referral circles.
Perkfy employs algorithmic fraud detection to protect fair players. Accounts flagged for automated activity are suspended without notice.`
  },
  {
    title: '5. Voucher Redemption & Processing',
    content: `Reward redemptions are processed following anti-fraud review. Digital vouchers are delivered electronically. Partners (Amazon, Flipkart, Google Play, etc.) are independent third parties with their own terms of use.`
  },
  {
    title: '6. Self-Service Account Deletion',
    content: `You may terminate your account at any time using the self-service "Delete Account" button in your Profile settings on either mobile or web, confirming by typing "DELETE". You may also request deletion by contacting perkfy2026@gmail.com. Upon deletion, personal data is permanently erased and active reward points are surrendered.`
  },
  {
    title: '7. Limitation of Liability',
    content: `Perkfy provides the Service "as is" and "as available". To the fullest extent permitted by applicable Indian laws, Perkfy and its affiliates shall not be liable for any indirect, incidental, or consequential damages.`
  },
  {
    title: '8. Governing Law & Dispute Resolution',
    content: `These terms shall be governed by and construed in accordance with the laws of the Republic of India. Any legal dispute or controversy shall be subject to the exclusive jurisdiction of the competent courts in India.`
  },
  {
    title: '9. Contact Information',
    content: `For any inquiries or questions concerning these Terms, contact us at: perkfy2026@gmail.com.`
  }
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
