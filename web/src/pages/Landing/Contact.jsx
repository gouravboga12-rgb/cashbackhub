import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div style={{ background: '#F4F3F8', color: '#1E1B4B', minHeight: '100vh', padding: '60px 24px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '16px', color: '#1E1B4B' }}>Contact & Support</h1>
          <p style={{ color: '#6B7280', fontSize: '1.2rem', fontWeight: 500 }}>Have questions about points or vouchers? We're here to help!</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
          <div className="card-white" style={{ padding: '36px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E1B4B', marginBottom: '24px' }}>Get In Touch</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Mail color="#5B21B6" size={22} />
                </div>
                <div>
                  <div style={{ color: '#6B7280', fontSize: '0.8rem', fontWeight: 700 }}>EMAIL SUPPORT</div>
                  <div style={{ color: '#1E1B4B', fontWeight: 700 }}>support@cashbackhub.com</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Phone color="#16A34A" size={22} />
                </div>
                <div>
                  <div style={{ color: '#6B7280', fontSize: '0.8rem', fontWeight: 700 }}>WHATSAPP / PHONE</div>
                  <div style={{ color: '#1E1B4B', fontWeight: 700 }}>+91 98765 43210</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#FCE7F3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MapPin color="#DB2777" size={22} />
                </div>
                <div>
                  <div style={{ color: '#6B7280', fontSize: '0.8rem', fontWeight: 700 }}>HEADQUARTERS</div>
                  <div style={{ color: '#1E1B4B', fontWeight: 700 }}>Bengaluru, Karnataka, India</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card-white" style={{ padding: '36px' }}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <CheckCircle color="#16A34A" size={48} style={{ marginBottom: '16px' }} />
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1E1B4B' }}>Message Sent!</h3>
                <p style={{ color: '#6B7280', marginTop: '8px' }}>Our support team will respond within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E1B4B', marginBottom: '8px' }}>Send Us a Message</h2>
                
                <div>
                  <label style={{ color: '#6B7280', fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Your Name</label>
                  <input type="text" required placeholder="Enter full name" style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#F8F7FC', border: '1px solid #E5E7EB', color: '#1E1B4B' }} />
                </div>

                <div>
                  <label style={{ color: '#6B7280', fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Email Address</label>
                  <input type="email" required placeholder="name@domain.com" style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#F8F7FC', border: '1px solid #E5E7EB', color: '#1E1B4B' }} />
                </div>

                <div>
                  <label style={{ color: '#6B7280', fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Message</label>
                  <textarea rows="4" required placeholder="How can we help you?" style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#F8F7FC', border: '1px solid #E5E7EB', color: '#1E1B4B' }}></textarea>
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
