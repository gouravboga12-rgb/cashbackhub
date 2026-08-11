import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div style={{ background: '#0E0B1F', color: '#FFF', minHeight: '100vh', padding: '60px 24px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '16px' }}>Contact & Support</h1>
          <p style={{ color: '#C4B5FD', fontSize: '1.2rem' }}>Have questions about points or vouchers? We're here to help!</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px' }}>
          <div className="glass-card-dark" style={{ padding: '36px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFF', marginBottom: '24px' }}>Get In Touch</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(124, 58, 237, 0.2)', border: '1px solid #7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Mail color="#A78BFA" size={22} />
                </div>
                <div>
                  <div style={{ color: '#C4B5FD', fontSize: '0.8rem' }}>EMAIL SUPPORT</div>
                  <div style={{ color: '#FFF', fontWeight: 700 }}>support@cashbackhub.com</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(34, 197, 94, 0.2)', border: '1px solid #22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Phone color="#4ADE80" size={22} />
                </div>
                <div>
                  <div style={{ color: '#C4B5FD', fontSize: '0.8rem' }}>WHATSAPP / PHONE</div>
                  <div style={{ color: '#FFF', fontWeight: 700 }}>+91 98765 43210</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(236, 72, 153, 0.2)', border: '1px solid #EC4899', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MapPin color="#F472B6" size={22} />
                </div>
                <div>
                  <div style={{ color: '#C4B5FD', fontSize: '0.8rem' }}>HEADQUARTERS</div>
                  <div style={{ color: '#FFF', fontWeight: 700 }}>Bengaluru, Karnataka, India</div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card-dark" style={{ padding: '36px' }}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <CheckCircle color="#4ADE80" size={48} style={{ marginBottom: '16px' }} />
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFF' }}>Message Sent!</h3>
                <p style={{ color: '#C4B5FD', marginTop: '8px' }}>Our support team will respond within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFF', marginBottom: '8px' }}>Send Us a Message</h2>
                
                <div>
                  <label style={{ color: '#C4B5FD', fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Your Name</label>
                  <input type="text" required placeholder="Enter full name" style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#1E1445', border: '1px solid #3B2F6B', color: '#FFF' }} />
                </div>

                <div>
                  <label style={{ color: '#C4B5FD', fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Email Address</label>
                  <input type="email" required placeholder="name@domain.com" style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#1E1445', border: '1px solid #3B2F6B', color: '#FFF' }} />
                </div>

                <div>
                  <label style={{ color: '#C4B5FD', fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Message</label>
                  <textarea rows="4" required placeholder="How can we help you?" style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#1E1445', border: '1px solid #3B2F6B', color: '#FFF' }}></textarea>
                </div>

                <button type="submit" className="btn-green" style={{ width: '100%', marginTop: '8px' }}>
                  <Send size={18} /> Send Message
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
