import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, CheckCircle2, ChevronRight, Lock, Trash2, Mail } from 'lucide-react';

const SECTIONS = [
  {
    number: '01',
    title: 'Information We Collect',
    intro: 'We collect information you provide directly to us or generate through platform usage:',
    items: [
      { label: 'Personal Identifiers', text: 'Full name, verified email address, and mobile number provided during account registration.' },
      { label: 'Profile Details', text: 'Optional profile pictures, avatars, and display preferences you choose to configure.' },
      { label: 'Promotional Activity Data', text: 'Reward points earned, sponsored videos watched, dice rolls, wheel spins, and attendance check-in streaks.' },
      { label: 'Device & Security Diagnostics', text: 'IP address, device identifiers, and browser user-agent collected solely for fraud mitigation and security auditing.' },
      { label: 'Referral Attribution', text: 'Unique invite codes and referral linkage records when inviting friends to Perkfy.' },
    ],
  },
  {
    number: '02',
    title: 'How We Use Your Information',
    intro: 'Your information is used strictly to deliver our loyalty rewards and maintain platform fairness:',
    items: [
      { label: 'Account Authentication', text: 'Authenticate your identity, maintain persistent login sessions, and protect account credentials.' },
      { label: 'Reward Fulfillment', text: 'Process earned points and fulfill electronic merchant gift cards (Amazon, Flipkart, Google Play, Swiggy).' },
      { label: 'Transactional Notifications', text: 'Deliver push alerts and in-app notifications regarding wallet credits, attendance streaks, and voucher delivery.' },
      { label: 'Anti-Fraud & Fair Play', text: 'Detect and prevent automated bots, multi-accounting, emulator exploitation, and fraudulent activities.' },
      { label: 'Legal & Tax Compliance', text: 'Adhere to applicable statutory obligations and regulatory reporting requirements.' },
    ],
  },
  {
    number: '03',
    title: 'Nature of the Platform (100% Free / Not Gambling)',
    intro: 'Perkfy is a free promotional loyalty portal designed for consumer entertainment and rewards:',
    items: [
      { label: '100% Free to Use', text: 'No purchase, financial deposit, entry fee, or real-money wager is ever required or permitted.' },
      { label: 'Promotional Loyalty Tokens', text: 'Points accumulated from dice rolls, wheel spins, and mystery chests are strictly promotional loyalty tokens.' },
      { label: 'No Real-Money Loss', text: 'Users cannot lose real money under any circumstances on the platform.' },
      { label: 'Merchant Voucher Redemption', text: 'Points can only be redeemed for verified retail gift cards and promotional cashback subject to platform terms.' },
    ],
  },
  {
    number: '04',
    title: 'Information Sharing & Third Parties',
    intro: 'We respect your privacy and never sell, rent, or trade your personal data to advertisers or third parties:',
    items: [
      { label: 'Voucher Distributors', text: 'Shared strictly with authorized merchant gift card distributors solely to fulfill requested voucher codes.' },
      { label: 'Cloud Infrastructure', text: 'Encrypted database and storage hosted on secure AWS EC2 infrastructure bound by confidentiality.' },
      { label: 'Legal Authorities', text: 'Disclosed only when formally mandated by applicable law enforcement or statutory court orders.' },
    ],
  },
  {
    number: '05',
    title: 'Data Security Standards',
    intro: 'We implement modern technical safeguards to keep your personal data and wallet balances secure:',
    items: [
      { label: '256-Bit SSL/TLS Encryption', text: 'All data transmitted between your browser and our servers is encrypted using bank-grade protocols.' },
      { label: 'Access Control', text: 'Database access is restricted to verified administrative personnel via strict key-based authentication.' },
      { label: 'Continuous Monitoring', text: 'Regular vulnerability audits and automated log monitoring are conducted to prevent unauthorized access.' },
    ],
  },
  {
    number: '06',
    title: 'User Account Deletion & Right to Erasure',
    intro: 'In full compliance with Google Play Developer policies, you have the absolute right to delete your account at any time:',
    items: [
      { label: 'In-App Self-Service Deletion', text: 'Open Profile > Delete Account. Type DELETE in capital letters to confirm. Deletion is instantaneous and permanent.' },
      { label: 'Web Portal Self-Service Deletion', text: 'Navigate to Profile > Delete Account, type DELETE, and confirm. All records are purged immediately.' },
      { label: 'Email Deletion Request', text: 'Email perkfy2026@gmail.com with the subject "Account Deletion Request" from your registered email address. Processed within 48 hours.' },
      { label: 'Data Permanently Erased', text: 'Your name, email, mobile number, password hashes, available points, attendance streaks, and roll history are permanently purged.' },
      { label: 'Statutory Retention', text: 'Only anonymized transaction IDs required for statutory tax and financial reporting are archived as required by law.' },
    ],
  },
  {
    number: '07',
    title: 'Cookies & Local Storage',
    intro: 'We use cookies and HTML5 local storage strictly for essential platform functionality:',
    items: [
      { label: 'Session Management', text: 'Preserve your active login tokens and security state so you do not have to sign in repeatedly.' },
      { label: 'Preference Caching', text: 'Store user interface preferences and cached dashboard stats for faster page load times.' },
      { label: 'User Control', text: 'You can disable cookies or clear local storage through your browser settings at any time.' },
    ],
  },
  {
    number: '08',
    title: "Children's Privacy Protection",
    intro: 'We take the protection of minors seriously across our digital applications:',
    items: [
      { label: 'Minimum Age Requirement', text: 'Perkfy is designed and intended strictly for users aged 13 and above.' },
      { label: 'Immediate Data Purge', text: 'If we discover that a user under 13 has registered, their account and all associated records are permanently erased immediately.' },
    ],
  },
  {
    number: '09',
    title: 'Changes to This Privacy Policy',
    intro: 'We may revise this Privacy Policy periodically to reflect operational, legal, or regulatory updates:',
    items: [
      { label: 'Effective Date', text: 'All policy revisions will be published on this page with an updated revision date.' },
      { label: 'Continued Acceptance', text: 'Continued usage of Perkfy after updates signifies your consent to the updated Privacy Policy.' },
    ],
  },
  {
    number: '10',
    title: 'Data Protection Officer & Contact',
    intro: 'For any privacy inquiries, data deletion requests, or rights assistance, contact our dedicated team:',
    items: [
      { label: 'Support Email', text: 'perkfy2026@gmail.com' },
      { label: 'Response Window', text: 'All formal requests receive a written response within 2 business days.' },
    ],
  },
];

export default function PrivacyPolicy() {
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
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.3px' }}>Privacy Policy</span>
          </div>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: '#DCFCE7',
          padding: '6px 12px',
          borderRadius: '20px',
          border: '1px solid #86EFAC',
        }}>
          <Shield size={14} color="#16A34A" />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534' }}>Google Play Compliant</span>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '860px', margin: '0 auto', padding: '32px 20px 60px 20px' }}>
        
        {/* Hero Card */}
        <div style={{
          background: 'linear-gradient(135deg, #064E3B 0%, #047857 50%, #10B981 100%)',
          borderRadius: '24px',
          padding: '36px 28px',
          color: '#FFFFFF',
          marginBottom: '28px',
          boxShadow: '0 12px 32px rgba(6, 78, 59, 0.2)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(8px)', padding: '6px 14px', borderRadius: '30px', marginBottom: '14px' }}>
            <Shield size={16} color="#A7F3D0" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ECFDF5', letterSpacing: '0.5px' }}>TRANSPARENT & SECURE</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 10px 0', letterSpacing: '-0.5px' }}>Perkfy Privacy Policy</h1>
          <p style={{ color: '#D1FAE5', fontSize: '0.95rem', margin: '0 0 16px 0', lineHeight: 1.6, maxWidth: '640px' }}>
            Your privacy and trust are our highest priority. This policy outlines in clear, transparent detail how we collect, safeguard, and allow you to permanently delete your personal information.
          </p>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '0.825rem', color: '#A7F3D0' }}>
            <span>• Last Updated: October 2026</span>
            <span>• Applicable to Web & Mobile App</span>
          </div>
        </div>

        {/* Highlight Callout */}
        <div style={{
          background: '#F0FDF4',
          border: '1px solid #BBF7D0',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '28px',
          display: 'flex',
          gap: '14px',
          alignItems: 'flex-start',
        }}>
          <CheckCircle2 size={22} color="#16A34A" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', fontWeight: 800, color: '#166534' }}>
              Your Core Privacy Guarantee
            </h4>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#15803D', lineHeight: 1.6 }}>
              We never sell your personal information. You can delete your account and all associated data permanently at any time directly inside the app with zero hurdles.
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
                  background: '#ECFDF5',
                  color: '#059669',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  padding: '4px 10px',
                  borderRadius: '8px',
                  border: '1px solid #A7F3D0',
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
                      background: '#10B981',
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
          <Mail size={24} color="#059669" style={{ marginBottom: '8px' }} />
          <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>Have questions about your data?</h4>
          <p style={{ color: '#64748B', fontSize: '0.875rem', margin: '0 0 12px 0' }}>
            Our Data Protection Officer is ready to assist you.
          </p>
          <a
            href="mailto:perkfy2026@gmail.com"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#059669',
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
