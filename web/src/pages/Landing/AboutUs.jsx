import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Gift, Star, Users, Target, Heart, Mail } from 'lucide-react';

export default function AboutUs() {
  const navigate = useNavigate();

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
          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E1B4B' }}>About Us</span>
        </div>
      </header>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '24px 16px 40px 16px' }}>

        {/* Hero Card */}
        <div style={{
          background: 'linear-gradient(135deg, #4C1D95 0%, #5B21B6 50%, #7C3AED 100%)',
          borderRadius: '24px',
          padding: '32px 24px',
          color: '#FFF',
          textAlign: 'center',
          marginBottom: '24px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 10px 32px rgba(91,33,182,0.28)'
        }}>
          <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(34,197,94,0.15)', filter: 'blur(40px)' }} />
          <div style={{ position: 'absolute', bottom: '-30px', left: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(168,85,247,0.2)', filter: 'blur(30px)' }} />
          
          <img src="/perkfy-logo.png" alt="Perkfy" style={{ width: '80px', height: '80px', borderRadius: '20px', objectFit: 'cover', marginBottom: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.25)', border: '3px solid rgba(255,255,255,0.3)' }} />
          
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
            Perk<span style={{ color: '#4ADE80' }}>fy</span>
          </h1>
          <p style={{ color: '#E9D5FF', fontSize: '0.95rem', fontWeight: 600, margin: 0, lineHeight: 1.5 }}>
            Turn Your Play Time into Real Rewards
          </p>
        </div>

        {/* Welcome Section */}
        <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '24px', marginBottom: '18px', boxShadow: '0 4px 16px rgba(91,33,182,0.07)', border: '1px solid #EDE9FE' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1E1B4B', margin: '0 0 14px 0' }}>Welcome to Perkfy 👋</h2>
          <p style={{ color: '#4B5563', fontSize: '0.9rem', lineHeight: 1.75, margin: 0 }}>
            Perkfy is the easiest way to earn verified digital vouchers simply by playing daily games and completing fun activities.
          </p>
          <p style={{ color: '#4B5563', fontSize: '0.9rem', lineHeight: 1.75, margin: '12px 0 0 0' }}>
            We believe your everyday playtime carries real value. Whether you are rolling lucky 3D dice, spinning the wheel, or completing engaging daily challenges, Perkfy turns those everyday actions into tangible savings. No complicated investments, no entry fees—just pure gameplay, fun, and instant perks for every player.
          </p>
        </div>

        {/* Play & Earn Section */}
        <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '24px', marginBottom: '18px', boxShadow: '0 4px 16px rgba(91,33,182,0.07)', border: '1px solid #EDE9FE' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1E1B4B', margin: '0 0 16px 0' }}>⚡ Play & Earn</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'linear-gradient(135deg, #4C1D95, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Star size={20} color="#FFF" />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1E1B4B', margin: '0 0 4px 0' }}>Play & Earn</h3>
                <p style={{ color: '#6B7280', fontSize: '0.875rem', margin: 0, lineHeight: 1.6 }}>Play exciting games, roll lucky 3D dice, and spin the wheel. Every completed game round automatically credits points to your player wallet.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Redeem Vouchers */}
        <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '24px', marginBottom: '18px', boxShadow: '0 4px 16px rgba(91,33,182,0.07)', border: '1px solid #EDE9FE' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1E1B4B', margin: '0 0 16px 0' }}>🎁 Redeem Vouchers From Top Brands</h2>
          <p style={{ color: '#4B5563', fontSize: '0.875rem', lineHeight: 1.6, margin: '0 0 14px 0' }}>Swap your points for instant digital gift cards across everyday lifestyle and shopping essentials:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { label: 'Online Shopping', brands: 'Amazon Pay gift cards & Flipkart vouchers', color: '#F97316', bg: '#FFF7ED' },
              { label: 'Food Delivery', brands: 'Swiggy & Zomato discount vouchers', color: '#EF4444', bg: '#FEF2F2' },
              { label: 'Payments & Recharge', brands: 'PhonePe-compatible balance and merchant vouchers', color: '#8B5CF6', bg: '#F5F3FF' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px', background: item.bg, borderRadius: '12px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                <div>
                  <span style={{ fontWeight: 800, color: '#1E1B4B', fontSize: '0.875rem' }}>{item.label}: </span>
                  <span style={{ color: '#4B5563', fontSize: '0.875rem' }}>{item.brands}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Why Users Love */}
        <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '24px', marginBottom: '18px', boxShadow: '0 4px 16px rgba(91,33,182,0.07)', border: '1px solid #EDE9FE' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1E1B4B', margin: '0 0 16px 0' }}>❤️ Why Players Love Perkfy</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { icon: '🆓', title: '100% Free Forever', desc: 'Zero registration fees, zero hidden charges.' },
              { icon: '🎮', title: 'Daily Player Rewards', desc: 'Continuous player bonuses—build a steady stream of points just by playing games every day.' },
              { icon: '⚡', title: 'Instant Voucher Claiming', desc: 'Digital codes delivered straight to your account the moment you hit your threshold.' },
              { icon: '📊', title: 'Transparent Tracking', desc: 'Real-time dashboards to track your game points, player activities, and redemption history.' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', padding: '12px', background: '#F8F7FC', borderRadius: '12px' }}>
                <span style={{ fontSize: '1.4rem' }}>{item.icon}</span>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1E1B4B', margin: '0 0 3px 0' }}>{item.title}</h4>
                  <p style={{ color: '#6B7280', fontSize: '0.825rem', margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Our Mission */}
        <div style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%)',
          borderRadius: '20px',
          padding: '24px',
          marginBottom: '18px',
          color: '#FFF',
          boxShadow: '0 8px 24px rgba(15,23,42,0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <Target size={22} color="#4ADE80" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#FFF' }}>Our Mission</h2>
          </div>
          <p style={{ color: '#C7D2FE', fontSize: '0.9rem', lineHeight: 1.75, margin: 0 }}>
            Our mission is to build a rewarding ecosystem where everyday players directly benefit from their gaming time and engagement. By connecting brands with engaged players, we pass real reward value back to the player community that makes it possible.
          </p>
        </div>

        {/* Founders */}
        <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '24px', marginBottom: '18px', boxShadow: '0 4px 16px rgba(91,33,182,0.07)', border: '1px solid #EDE9FE' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1E1B4B', margin: '0 0 16px 0' }}>👥 Our Leadership</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { name: 'Vidya Sagar', role: 'Founder', gradient: 'linear-gradient(135deg, #4C1D95, #7C3AED)', initials: 'VS' },
              { name: 'D. Sreenivasulu', role: 'Co-Founder', gradient: 'linear-gradient(135deg, #065F46, #10B981)', initials: 'DS' },
              { name: 'Kavali Nageswar', role: 'Co-Founder', gradient: 'linear-gradient(135deg, #92400E, #F59E0B)', initials: 'KN' },
            ].map((founder, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px', background: '#F8F7FC', borderRadius: '14px', border: '1px solid #EDE9FE' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: founder.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  <span style={{ color: '#FFF', fontWeight: 800, fontSize: '1rem' }}>{founder.initials}</span>
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1E1B4B', margin: '0 0 2px 0' }}>{founder.name}</h3>
                  <span style={{ background: '#EDE9FE', color: '#5B21B6', fontSize: '0.75rem', fontWeight: 700, padding: '2px 10px', borderRadius: '10px' }}>{founder.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <div style={{
          background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
          borderRadius: '20px',
          padding: '24px',
          textAlign: 'center',
          color: '#FFF',
          boxShadow: '0 8px 24px rgba(34,197,94,0.28)'
        }}>
          <Heart size={28} color="#FFF" style={{ marginBottom: '10px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 8px 0' }}>Get in Touch</h3>
          <p style={{ color: '#D1FAE5', fontSize: '0.875rem', margin: '0 0 14px 0' }}>Have questions or partnership inquiries?</p>
          <a
            href="mailto:perkfy2026@gmail.com"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#FFF', color: '#16A34A', padding: '10px 20px', borderRadius: '14px', fontWeight: 800, fontSize: '0.875rem', textDecoration: 'none', boxShadow: '0 4px 14px rgba(0,0,0,0.1)' }}
          >
            <Mail size={16} />
            perkfy2026@gmail.com
          </a>
        </div>

      </div>
    </div>
  );
}
