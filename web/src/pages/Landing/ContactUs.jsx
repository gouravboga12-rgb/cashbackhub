import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, MessageCircle, Instagram, Youtube, Twitter, Facebook, CheckCircle2, Send } from 'lucide-react';

export default function ContactUs() {
  const navigate = useNavigate();
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Open mailto with pre-filled content
    const subject = encodeURIComponent(`Contact from ${form.name} - Perkfy`);
    const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\nMessage:\n${form.message}`);
    window.location.href = `mailto:perkfy2026@gmail.com?subject=${subject}&body=${body}`;
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div style={{ background: '#F8F7FC', minHeight: '100vh', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      
      {/* Header */}
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
          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E1B4B' }}>Contact Us</span>
        </div>
      </header>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '24px 16px 40px 16px' }}>

        {/* Hero Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #4C1D95 0%, #5B21B6 50%, #7C3AED 100%)',
          borderRadius: '24px',
          padding: '28px 24px',
          color: '#FFF',
          textAlign: 'center',
          marginBottom: '24px',
          boxShadow: '0 10px 32px rgba(91,33,182,0.28)'
        }}>
          <MessageCircle size={40} color="#4ADE80" style={{ marginBottom: '12px' }} />
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 8px 0' }}>We'd Love to Hear From You!</h1>
          <p style={{ color: '#E9D5FF', fontSize: '0.9rem', margin: 0, lineHeight: 1.5 }}>
            Have a question, feedback, or partnership idea? Reach out to our team.
          </p>
        </div>

        {/* Email Contact Card */}
        <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '24px', marginBottom: '18px', boxShadow: '0 4px 16px rgba(91,33,182,0.07)', border: '1px solid #EDE9FE' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E1B4B', margin: '0 0 16px 0' }}>📧 Direct Contact</h2>
          <a
            href="mailto:perkfy2026@gmail.com"
            style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', background: 'linear-gradient(135deg, #EDE9FE, #F3E8FF)', borderRadius: '14px', textDecoration: 'none', border: '1px solid #DDD6FE' }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #5B21B6, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Mail size={22} color="#FFF" />
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 700, marginBottom: '2px' }}>Email us at</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#5B21B6' }}>perkfy2026@gmail.com</div>
              <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '2px' }}>We typically reply within 24 hours</div>
            </div>
          </a>
        </div>

        {/* Contact Form */}
        <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '24px', marginBottom: '18px', boxShadow: '0 4px 16px rgba(91,33,182,0.07)', border: '1px solid #EDE9FE' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E1B4B', margin: '0 0 16px 0' }}>💬 Send a Message</h2>

          {sent && (
            <div style={{ background: '#ECFDF5', border: '1px solid #10B981', color: '#065F46', padding: '10px 14px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} color="#10B981" />
              Your email app has been opened with your message. Thank you!
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#6B7280', fontWeight: 700, marginBottom: '6px' }}>Full Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
                style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '0.9rem', boxSizing: 'border-box', outline: 'none', background: '#F8F7FC' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#6B7280', fontWeight: 700, marginBottom: '6px' }}>Email Address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="your@email.com"
                style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '0.9rem', boxSizing: 'border-box', outline: 'none', background: '#F8F7FC' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#6B7280', fontWeight: 700, marginBottom: '6px' }}>Message</label>
              <textarea
                required
                rows={4}
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                placeholder="Write your message here..."
                style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '0.9rem', boxSizing: 'border-box', outline: 'none', background: '#F8F7FC', resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>
            <button
              type="submit"
              style={{
                padding: '13px',
                borderRadius: '14px',
                border: 'none',
                background: 'linear-gradient(135deg, #5B21B6 0%, #7C3AED 100%)',
                color: '#FFF',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 6px 20px rgba(91,33,182,0.3)'
              }}
            >
              <Send size={16} />
              Send Message
            </button>
          </form>
        </div>

        {/* Social Links */}
        <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 16px rgba(91,33,182,0.07)', border: '1px solid #EDE9FE' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E1B4B', margin: '0 0 16px 0' }}>🌐 Follow Us on Social Media</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { label: 'Instagram', handle: '@perkfy2026', url: 'https://www.instagram.com/perkfy2026?stkn=dG9scHJ3YWppcjNq', color: '#E1306C', bg: '#FDF2F8' },
              { label: 'YouTube', handle: '@Perkfy', url: 'https://www.youtube.com/@Perkfy', color: '#FF0000', bg: '#FFF5F5' },
              { label: 'X (Twitter)', handle: '@Perkfy2026', url: 'https://x.com/Perkfy2026', color: '#1DA1F2', bg: '#F0F9FF' },
              { label: 'Facebook', handle: 'Perkfy', url: 'https://www.facebook.com/share/1DfNSijrFY/', color: '#1877F2', bg: '#EFF6FF' },
            ].map((s, i) => (
              <a
                key={i}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: s.bg, borderRadius: '12px', textDecoration: 'none' }}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: '#FFF', fontSize: '1rem', fontWeight: 800 }}>{s.label[0]}</span>
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#1E1B4B' }}>{s.label}</div>
                  <div style={{ fontSize: '0.775rem', color: '#6B7280' }}>{s.handle}</div>
                </div>
              </a>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
