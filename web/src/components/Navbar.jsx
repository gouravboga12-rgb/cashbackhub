import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Gift, Wallet, Bell } from 'lucide-react';

export default function Navbar({ user, wallet, onLogout }) {
  const navigate = useNavigate();

  if (!user) return null;

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
      boxSizing: 'border-box'
    }}>
      <div style={{
        width: '100%',
        padding: '8px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}>
        
        {/* Brand Logo */}
        <Link to={user ? "/portal/dashboard" : "/"} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, #5B21B6 0%, #22C55E 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(91, 33, 182, 0.25)', flexShrink: 0 }}>
            <Gift color="#FFF" size={16} />
          </div>
          <div>
            <h1 style={{ color: '#1E1B4B', fontSize: '1rem', fontWeight: 800, margin: 0, lineHeight: 1.1, letterSpacing: '-0.3px' }}>
              CashBack<span style={{ color: '#22C55E' }}>Hub</span>
            </h1>
          </div>
        </Link>

        {/* AUTHENTICATED PORTAL NAVBAR (Only rendered when user is logged in) */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            
            {/* Quick Wallet Summary Pill */}
            <div style={{
              background: '#F3E8FF',
              border: '1px solid #EDE9FE',
              padding: '4px 8px',
              borderRadius: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              flexShrink: 0
            }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Wallet color="#FFF" size={11} />
              </div>
              <div style={{ color: '#5B21B6', fontSize: '0.75rem', fontWeight: 800, whiteSpace: 'nowrap' }}>
                {wallet?.available_points?.toLocaleString() || 0} Pts
              </div>
            </div>

            {/* Notification Bell Icon */}
            <button style={{ background: '#F4F3F8', border: 'none', width: '32px', height: '32px', borderRadius: '50%', color: '#5B21B6', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Bell size={15} />
            </button>

            {/* User Profile Avatar */}
            <img
              onClick={() => navigate('/portal/profile')}
              src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
              alt="Profile"
              style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid #22C55E', objectFit: 'cover', cursor: 'pointer', flexShrink: 0 }}
            />
          </div>
        )}

      </div>

    </header>
  );
}
