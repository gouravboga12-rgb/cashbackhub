import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Gift, Wallet, Bell, LogOut } from 'lucide-react';

export default function Navbar({ user, wallet, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isPortal = location.pathname.startsWith('/portal');

  return (
    <header style={{
      background: isPortal ? '#FFFFFF' : '#1E1B4B',
      borderBottom: isPortal ? '1px solid #E5E7EB' : '1px solid rgba(124, 58, 237, 0.2)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: isPortal ? '0 2px 10px rgba(0,0,0,0.03)' : 'none'
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        
        {/* Brand Logo */}
        <Link to={user ? "/portal/dashboard" : "/"} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #5B21B6 0%, #22C55E 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(91, 33, 182, 0.3)', flexShrink: 0 }}>
            <Gift color="#FFF" size={20} />
          </div>
          <div>
            <h1 style={{ color: isPortal ? '#1E1B4B' : '#FFF', fontSize: '1.2rem', fontWeight: 800, margin: 0, lineHeight: 1.1 }}>
              CashBack<span style={{ color: '#22C55E' }}>Hub</span>
            </h1>
            <span style={{ color: isPortal ? '#6B7280' : '#C4B5FD', fontSize: '0.7rem', fontWeight: 600 }}>Earn. Redeem. Repeat.</span>
          </div>
        </Link>

        {/* Guest Public Nav vs Portal Header */}
        {!user ? (
          <nav style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Link to="/" style={{ color: '#FFF', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem' }}>Home</Link>
            <Link to="/about" style={{ color: '#C4B5FD', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem' }}>About</Link>
            <Link to="/how-it-works" style={{ color: '#C4B5FD', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem' }}>How It Works</Link>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => navigate('/login')} style={{ background: 'transparent', border: '1px solid #7C3AED', color: '#FFF', padding: '6px 14px', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
                Sign In
              </button>
              <button onClick={() => navigate('/signup')} className="btn-green" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
                Get Started
              </button>
            </div>
          </nav>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            
            {/* Quick Wallet Summary Pill */}
            <div style={{ background: '#F3E8FF', border: '1px solid #EDE9FE', padding: '4px 10px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Wallet color="#FFF" size={13} />
              </div>
              <div style={{ color: '#5B21B6', fontSize: '0.8rem', fontWeight: 800 }}>
                {wallet?.available_points?.toLocaleString() || 0} Pts <span style={{ color: '#16A34A', fontSize: '0.75rem' }}>(₹{((wallet?.available_points || 0) / 10).toFixed(0)})</span>
              </div>
            </div>

            {/* Notification Icon */}
            <button style={{ background: '#F4F3F8', border: 'none', width: '32px', height: '32px', borderRadius: '50%', color: '#5B21B6', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bell size={16} />
            </button>

            {/* User Profile Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <img src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'} alt="Profile" style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid #22C55E', objectFit: 'cover' }} />
              <button onClick={onLogout} title="Logout" style={{ background: '#FEE2E2', border: 'none', color: '#DC2626', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LogOut size={15} />
              </button>
            </div>
          </div>
        )}

      </div>
    </header>
  );
}
