import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, CheckCircle2, ShieldCheck, Mail, AlertTriangle } from 'lucide-react';

const SECTIONS = [
  {
    number: '01',
    title: 'Acceptance of Terms',
    intro: 'By accessing or using the Perkfy mobile application or web portal ("Service"), you agree to the following terms:',
    items: [
      { label: 'Binding Agreement', text: 'Creating an account or utilizing our services constitutes a legally binding agreement under these Terms.' },
      { label: 'Free Loyalty Platform', text: 'Perkfy is operated exclusively as a free consumer loyalty, engagement, and promotional rewards platform.' },
      { label: 'Discontinuation', text: 'If you do not agree with any provision of these terms, you must immediately cease using the platform.' },
    ],
  },
  {
    number: '02',
    title: 'Free Promotional Service (Not Gambling / No Purchase Necessary)',
    intro: 'Perkfy is strictly an engagement rewards application governed by promotional entertainment standards:',
    items: [
      { label: 'No Gambling or Betting', text: 'Perkfy is NOT a real-money gambling, lottery, betting, or wagering platform. Real money cannot be deposited or wagered.' },
      { label: 'Zero Financial Risk', text: 'Users cannot lose real money under any circumstances on the platform.' },
      { label: '100% Free Participation', text: 'No purchase, deposit, or payment of any kind is required to participate in games (spin wheel, dice rolls, mystery boxes) or earn points.' },
      { label: 'Promotional Reward Points', text: 'Points accumulated are promotional loyalty tokens. They possess no direct currency value and cannot be traded, sold, or transferred between accounts.' },
      { label: 'Gift Card Redemptions', text: 'Points are redeemable exclusively for verified retail merchant vouchers (Amazon, Flipkart, Google Play, Swiggy) or digital cashback subject to platform inventory.' },
    ],
  },
  {
    number: '03',
    title: 'Eligibility & Single Account Rule',
    intro: 'To protect platform integrity and ensure equal opportunities for all members:',
    items: [
      { label: 'Minimum Age', text: 'Users must be at least 13 years of age to register and use the Service.' },
      { label: 'One Account Per Person', text: 'Each individual is strictly permitted to create, own, and operate only ONE verified account.' },
      { label: 'Zero Tolerance for Multi-Accounting', text: 'Operating duplicate accounts, disposable emails, device spoofers, or emulator bypasses results in permanent suspension and forfeiture of unredeemed points.' },
    ],
  },
  {
    number: '04',
    title: 'Fair Play & Prohibited Activities',
    intro: 'Users agree to engage honestly and strictly refrain from the following prohibited practices:',
    items: [
      { label: 'Automated Bots & Macros', text: 'Deploying auto-clickers, macros, automated scripts, or headless browsers to simulate activity is strictly prohibited.' },
      { label: 'System Exploitation', text: 'Exploiting software vulnerabilities, reverse engineering, or network tampering will lead to immediate account termination.' },
      { label: 'Fraudulent Referrals', text: 'Creating dummy accounts or coordinated referral rings to manipulate the referral reward system is monitored algorithmically and banned.' },
      { label: 'Automated Fraud Detection', text: 'Perkfy utilizes real-time anti-fraud algorithms to detect and permanently freeze accounts violating fair play.' },
    ],
  },
  {
    number: '05',
    title: 'Voucher Redemption & Fulfillment',
    intro: 'Reward voucher redemptions are subject to standard verification protocols:',
    items: [
      { label: 'Security Review', text: 'Redemption requests undergo automated fraud screening before processing.' },
      { label: '24-Hour Update Commitment', text: 'Users receive updates on their digital gift card vouchers within 24 business hours.' },
      { label: 'Third-Party Merchant Terms', text: 'Retail brands (Amazon, Flipkart, Google Play, Swiggy) are independent third parties with their own redemption terms.' },
    ],
  },
  {
    number: '06',
    title: 'Self-Service Account Deletion',
    intro: 'In accordance with Google Play Developer Policies and global privacy standards:',
    items: [
      { label: 'In-App Self-Service', text: 'You can delete your account at any time via Profile > Delete Account by confirming with the word DELETE in capital letters.' },
      { label: 'Immediate Data Erasure', text: 'Upon confirmation, your login session is revoked and all personal details, points, and history are permanently erased.' },
      { label: 'Email Requests', text: 'You may also submit a deletion request to perkfy2026@gmail.com, which will be processed within 48 business hours.' },
    ],
  },
  {
    number: '07',
    title: 'Limitation of Liability',
    intro: 'Please review the following liability limitations governing platform operations:',
    items: [
      { label: '"As-Is" Provision', text: 'Perkfy provides the Service on an "as-is" and "as-available" basis without express or implied warranties.' },
      { label: 'Indirect Damages', text: 'To the fullest extent permitted by law, Perkfy and its affiliates shall not be liable for any indirect, incidental, or consequential damages.' },
    ],
  },
  {
    number: '08',
    title: 'Governing Law & Dispute Resolution',
    intro: 'Legal jurisdiction governing this agreement:',
    items: [
      { label: 'Applicable Laws', text: 'These Terms shall be governed by and interpreted in accordance with the laws of the Republic of India.' },
      { label: 'Exclusive Jurisdiction', text: 'Any controversy or legal claim shall be subject to the exclusive jurisdiction of the competent courts in India.' },
    ],
  },
  {
    number: '09',
    title: 'Legal Contact Information',
    intro: 'For any formal inquiries or clarifications concerning these Terms:',
    items: [
      { label: 'Contact Email', text: 'perkfy2026@gmail.com' },
      { label: 'Response Timeline', text: 'All written inquiries receive an official response within 2 business days.' },
    ],
  },
];

export default function TermsAndConditions() {
  const navigate = useNavigate();

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', fontFamily: 'Plus Jakarta Sans, sans-serif', color: '#1E293B' }}>
      
      {/* Top Sticky Navigation */}
      <header style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #E2E8F0',
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: '#F1F5F9',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            <ArrowLeft size={18} color="#0F172A" />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/perkfy-logo.png" alt="Perkfy Logo" style={{ width: '34px', height: '34px', borderRadius: '10px', objectFit: 'cover' }} />
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.3px' }}>Terms & Conditions</span>
          </div>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: '#EDE9FE',
          padding: '6px 12px',
          borderRadius: '20px',
          border: '1px solid #DDD6FE',
        }}>
          <ShieldCheck size={14} color="#7C3AED" />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#5B21B6' }}>Official Rules</span>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '860px', margin: '0 auto', padding: '32px 20px 60px 20px' }}>
        
        {/* Hero Card */}
        <div style={{
          background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4C1D95 100%)',
          borderRadius: '24px',
          padding: '36px 28px',
          color: '#FFFFFF',
          marginBottom: '28px',
          boxShadow: '0 12px 32px rgba(30, 27, 75, 0.25)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(8px)', padding: '6px 14px', borderRadius: '30px', marginBottom: '14px' }}>
            <FileText size={16} color="#DDD6FE" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#F5F3FF', letterSpacing: '0.5px' }}>TERMS OF SERVICE</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 10px 0', letterSpacing: '-0.5px' }}>Terms & Conditions</h1>
          <p style={{ color: '#E0E7FF', fontSize: '0.95rem', margin: '0 0 16px 0', lineHeight: 1.6, maxWidth: '640px' }}>
            Please review these terms governing the Perkfy rewards platform. By accessing our services or creating an account, you agree to comply with all platform rules and fair-play standards.
          </p>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '0.825rem', color: '#C7D2FE' }}>
            <span>• Effective Date: October 2026</span>
            <span>• Applicable to Web & Mobile App</span>
          </div>
        </div>

        {/* Highlight Callout */}
        <div style={{
          background: '#EEF2FF',
          border: '1px solid #C7D2FE',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '28px',
          display: 'flex',
          gap: '14px',
          alignItems: 'flex-start',
        }}>
          <CheckCircle2 size={22} color="#4F46E5" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', fontWeight: 800, color: '#3730A3' }}>
              100% Free Promotional Loyalty Service
            </h4>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#4338CA', lineHeight: 1.6 }}>
              No purchase or real-money deposit is ever required to play or earn points. Perkfy is NOT a gambling platform. Points are redeemable solely for merchant vouchers and digital cashback.
            </p>
          </div>
        </div>

        {/* Structured Policy Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {SECTIONS.map((section, idx) => (
            <section
              key={idx}
              style={{
                background: '#FFFFFF',
                borderRadius: '20px',
                padding: '28px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
                transition: 'box-shadow 0.2s',
              }}
            >
              {/* Section Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <span style={{
                  background: '#EDE9FE',
                  color: '#6D28D9',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  padding: '4px 10px',
                  borderRadius: '8px',
                  border: '1px solid #DDD6FE',
                }}>
                  {section.number}
                </span>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  {section.title}
                </h2>
              </div>

              {/* Intro Line */}
              {section.intro && (
                <p style={{ fontSize: '0.9rem', color: '#64748B', lineHeight: 1.6, margin: '0 0 16px 0' }}>
                  {section.intro}
                </p>
              )}

              {/* Every Point on a Fresh New Line */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {section.items.map((item, itemIdx) => (
                  <div
                    key={itemIdx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      background: '#F8FAFC',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid #F1F5F9',
                    }}
                  >
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#6366F1',
                      marginTop: '7px',
                      flexShrink: 0,
                    }} />
                    <div style={{ flex: 1, fontSize: '0.875rem', lineHeight: 1.6, color: '#334155' }}>
                      <strong style={{ color: '#0F172A', fontWeight: 700 }}>{item.label}:</strong>{' '}
                      {item.text}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Footer Support Card */}
        <footer style={{
          textAlign: 'center',
          marginTop: '36px',
          padding: '24px',
          background: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
        }}>
          <Mail size={24} color="#6366F1" style={{ marginBottom: '8px' }} />
          <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>Questions about our Terms?</h4>
          <p style={{ color: '#64748B', fontSize: '0.875rem', margin: '0 0 12px 0' }}>
            Our support and compliance team is available to assist you.
          </p>
          <a
            href="mailto:perkfy2026@gmail.com"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#4F46E5',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.875rem',
              padding: '10px 20px',
              borderRadius: '12px',
              textDecoration: 'none',
              transition: 'background 0.2s',
            }}
          >
            Email perkfy2026@gmail.com
          </a>
        </footer>

      </main>
    </div>
  );
}
