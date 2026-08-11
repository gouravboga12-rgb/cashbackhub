import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Wallet, Disc, Clock, User } from 'lucide-react';

export default function MobileBottomNav() {
  const tabs = [
    { path: '/portal/dashboard', label: 'Home', icon: Home },
    { path: '/portal/wallet', label: 'Wallet', icon: Wallet },
    { path: '/portal/spin', label: 'Spin', icon: Disc },
    { path: '/portal/my-withdrawals', label: 'Activity', icon: Clock },
    { path: '/portal/profile', label: 'Profile', icon: User }
  ];

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      width: '100%',
      maxWidth: '100vw',
      background: '#FFFFFF',
      borderTop: '1px solid #E5E7EB',
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)',
      alignItems: 'center',
      padding: '6px 0 10px 0',
      zIndex: 1000,
      boxShadow: '0 -4px 20px rgba(91, 33, 182, 0.08)',
      boxSizing: 'border-box'
    }}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <NavLink
            key={tab.path}
            to={tab.path}
            style={({ isActive }) => ({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              fontSize: '0.725rem',
              fontWeight: 700,
              color: isActive ? '#5B21B6' : '#6B7280',
              gap: '2px',
              width: '100%',
              textAlign: 'center',
              boxSizing: 'border-box'
            })}
          >
            {({ isActive }) => (
              <>
                <div style={{
                  width: '36px',
                  height: '32px',
                  borderRadius: '16px',
                  background: isActive ? '#F3E8FF' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease-in-out'
                }}>
                  <Icon size={20} color={isActive ? '#5B21B6' : '#6B7280'} />
                </div>
                <span style={{ lineHeight: 1 }}>{tab.label}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
