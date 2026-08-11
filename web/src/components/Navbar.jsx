import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Gift, Wallet, Bell, LogOut, ArrowRight, Menu, X, Home as HomeIcon, Info, HelpCircle, PhoneCall, Sparkles } from 'lucide-react';

export default function Navbar({ user, wallet, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isPortal = location.pathname.startsWith('/portal');

  return (
    <header style={{
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(229, 231, 235, 0.8)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 4px 20px rgba(91, 33, 182, 0.04)',
      width: '100%',
      maxWidth: '100vw',
      overflow: 'hidden',
      boxSizing: 'border-box'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: isMobile ? '8px 12px' : '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justify: 'space-between',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        
        {/* Brand Logo */}
        <Link to={user ? "/portal/dashboard" : "/"} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <div style={{ width: isMobile ? '34px' : '40px', height: isMobile ? '34px' : '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #5B21B6 0%, #22C55E 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(91, 33, 182, 0.25)', flexShrink: 0 }}>
            <Gift color="#FFF" size={isMobile ? 18 : 22} />
          </div>
          <div>
            <h1 style={{ color: '#1E1B4B', fontSize: isMobile ? '1.1rem' : '1.25rem', fontWeight: 800, margin: 0, lineHeight: 1.1, letterSpacing: '-0.3px' }}>
              CashBack<span style={{ color: '#22C55E' }}>Hub</span>
            </h1>
            {!isMobile && <span style={{ color: '#6B7280', fontSize: '0.725rem', fontWeight: 600 }}>Earn. Redeem. Repeat.</span>}
          </div>
        </Link>

        {/* GUEST PUBLIC NAVBAR */}
        {!user ? (
          <>
            {/* Desktop Navigation Links (Visible on >= 768px) */}
            {!isMobile && (
              <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <Link to="/" style={{ color: location.pathname === '/' ? '#5B21B6' : '#4B5563', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem' }}>Home</Link>
                <Link to="/about" style={{ color: location.pathname === '/about' ? '#5B21B6' : '#4B5563', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem' }}>About Us</Link>
                <Link to="/how-it-works" style={{ color: location.pathname === '/how-it-works' ? '#5B21B6' : '#4B5563', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem' }}>How It Works</Link>
                <Link to="/contact" style={{ color: location.pathname === '/contact' ? '#5B21B6' : '#4B5563', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem' }}>Contact</Link>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button onClick={() => navigate('/login')} style={{ background: '#F4F3F8', border: '1px solid #E5E7EB', color: '#5B21B6', padding: '8px 20px', borderRadius: '12px', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}>
                    Sign In
                  </button>
                  <button onClick={() => navigate('/signup')} className="btn-green" style={{ padding: '9px 22px', fontSize: '0.875rem', borderRadius: '12px' }}>
                    Get Started <ArrowRight size={16} />
                  </button>
                </div>
              </nav>
            )}

            {/* Mobile Hamburger Menu Toggle Button (Visible on < 768px) */}
            {isMobile && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                style={{
                  background: '#F4F3F8',
                  border: '1px solid #E5E7EB',
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  color: '#5B21B6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            )}
          </>
        ) : (
          /* AUTHENTICATED PORTAL NAVBAR (Optimized for Mobile) */
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '6px' : '12px', flexShrink: 0 }}>
            
            {/* Quick Wallet Summary Pill */}
            <div style={{
              background: '#F3E8FF',
              border: '1px solid #EDE9FE',
              padding: isMobile ? '4px 8px' : '6px 14px',
              borderRadius: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              flexShrink: 0
            }}>
              <div style={{ width: isMobile ? '22px' : '26px', height: isMobile ? '22px' : '26px', borderRadius: '50%', background: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Wallet color="#FFF" size={isMobile ? 12 : 14} />
              </div>
              <div style={{ color: '#5B21B6', fontSize: isMobile ? '0.75rem' : '0.85rem', fontWeight: 800 }}>
                {wallet?.available_points?.toLocaleString() || 0} Pts {!isMobile && <span style={{ color: '#16A34A', fontSize: '0.8rem' }}>(₹{((wallet?.available_points || 0) / 10).toFixed(0)})</span>}
              </div>
            </div>

            {/* Notification Icon (Desktop only) */}
            {!isMobile && (
              <button style={{ background: '#F4F3F8', border: 'none', width: '36px', height: '36px', borderRadius: '50%', color: '#5B21B6', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bell size={18} />
              </button>
            )}

            {/* User Profile Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
              <img
                onClick={() => navigate('/portal/profile')}
                src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                alt="Profile"
                style={{ width: isMobile ? '32px' : '36px', height: isMobile ? '32px' : '36px', borderRadius: '50%', border: '2px solid #22C55E', objectFit: 'cover', cursor: 'pointer' }}
              />
              {!isMobile && (
                <button onClick={onLogout} title="Logout" style={{ background: '#FEE2E2', border: 'none', color: '#DC2626', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <LogOut size={16} />
                </button>
              )}
            </div>
          </div>
        )}

      </div>

      {/* MOBILE DROPDOWN DRAWER OVERLAY (Visible on < 768px when menu is open) */}
      {!user && isMobile && mobileMenuOpen && (
        <div style={{
          background: '#FFFFFF',
          borderBottom: '1px solid #E5E7EB',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          padding: '16px 20px 24px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          animation: 'fadeIn 0.2s ease-in-out'
        }}>
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '12px',
              background: location.pathname === '/' ? '#F3E8FF' : '#F9FAFB',
              color: location.pathname === '/' ? '#5B21B6' : '#1E1B4B',
              textDecoration: 'none',
              fontWeight: 800,
              fontSize: '0.95rem'
            }}
          >
            <HomeIcon size={18} color={location.pathname === '/' ? '#5B21B6' : '#6B7280'} /> Home
          </Link>

          <Link
            to="/about"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '12px',
              background: location.pathname === '/about' ? '#F3E8FF' : '#F9FAFB',
              color: location.pathname === '/about' ? '#5B21B6' : '#1E1B4B',
              textDecoration: 'none',
              fontWeight: 800,
              fontSize: '0.95rem'
            }}
          >
            <Info size={18} color={location.pathname === '/about' ? '#5B21B6' : '#6B7280'} /> About Us
          </Link>

          <Link
            to="/how-it-works"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '12px',
              background: location.pathname === '/how-it-works' ? '#F3E8FF' : '#F9FAFB',
              color: location.pathname === '/how-it-works' ? '#5B21B6' : '#1E1B4B',
              textDecoration: 'none',
              fontWeight: 800,
              fontSize: '0.95rem'
            }}
          >
            <HelpCircle size={18} color={location.pathname === '/how-it-works' ? '#5B21B6' : '#6B7280'} /> How It Works
          </Link>

          <Link
            to="/contact"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '12px',
              background: location.pathname === '/contact' ? '#F3E8FF' : '#F9FAFB',
              color: location.pathname === '/contact' ? '#5B21B6' : '#1E1B4B',
              textDecoration: 'none',
              fontWeight: 800,
              fontSize: '0.95rem'
            }}
          >
            <PhoneCall size={18} color={location.pathname === '/contact' ? '#5B21B6' : '#6B7280'} /> Contact & Support
          </Link>

          <div style={{ borderTop: '1px solid #F3F4F6', marginTop: '6px', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={() => navigate('/login')}
              style={{
                width: '100%',
                background: '#F4F3F8',
                border: '1px solid #E5E7EB',
                color: '#5B21B6',
                padding: '12px',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: 'pointer'
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="btn-green"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                fontSize: '0.95rem'
              }}
            >
              Get Started (+100 Bonus Pts) <Sparkles size={16} />
            </button>
          </div>

        </div>
      )}

    </header>
  );
}
