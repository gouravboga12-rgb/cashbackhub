import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Gift, Wallet, Bell } from 'lucide-react';
import api from '../api';
import NotificationModal from './NotificationModal';

export default function Navbar({ user, wallet, onLogout }) {
  const navigate = useNavigate();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Periodically check for unread notifications
  useEffect(() => {
    if (!user) return;
    let isMounted = true;

    const checkUnread = async () => {
      try {
        const res = await api.get('/notifications');
        if (isMounted && res.data?.success) {
          setUnreadCount(res.data.unread_count || 0);
        }
      } catch (e) {}
    };

    checkUnread();
    const interval = setInterval(checkUnread, 25000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user]);

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
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}>
        
        {/* Brand Logo */}
        <Link to={user ? "/portal/dashboard" : "/"} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <img
            src="/perkfy-logo.png"
            alt="Perkfy"
            style={{ width: '32px', height: '32px', borderRadius: '9px', objectFit: 'cover', boxShadow: '0 2px 8px rgba(91, 33, 182, 0.2)', flexShrink: 0 }}
          />
          <div>
            <h1 style={{ color: '#1E1B4B', fontSize: '1.15rem', fontWeight: 800, margin: 0, lineHeight: 1.1, letterSpacing: '-0.3px' }}>
              Perk<span style={{ color: '#22C55E' }}>fy</span>
            </h1>
          </div>
        </Link>

        {/* AUTHENTICATED PORTAL NAVBAR */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            
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
            <button
              type="button"
              onClick={() => setIsNotifOpen(true)}
              title="Notifications"
              style={{
                position: 'relative',
                background: unreadCount > 0 ? '#EDE9FE' : '#F4F3F8',
                border: unreadCount > 0 ? '1px solid #C4B5FD' : 'none',
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                color: '#5B21B6',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.2s'
              }}
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  background: '#EF4444',
                  color: '#FFFFFF',
                  fontSize: '0.62rem',
                  fontWeight: 900,
                  minWidth: '16px',
                  height: '16px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px',
                  border: '2px solid #FFFFFF',
                  boxShadow: '0 2px 6px rgba(239, 68, 68, 0.45)',
                  lineHeight: 1
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
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

      {/* In-App & Push Notification Modal / Mobile Drawer */}
      <NotificationModal
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        onCountChange={setUnreadCount}
      />
    </header>
  );
}
