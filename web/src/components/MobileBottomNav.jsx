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
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      width: '100%',
      background: '#FFFFFF',
      borderTop: '1px solid #E5E7EB',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: '8px 0 12px 0',
      zIndex: 100,
      boxShadow: '0 -4px 20px rgba(0,0,0,0.06)'
    }}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <NavLink
            key={tab.path}
            to={tab.path}
            style={({ isActive }) => ({
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: isActive ? '#5B21B6' : '#9CA3AF',
              gap: '3px'
            })}
          >
            {({ isActive }) => (
              <>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  background: isActive ? 'rgba(91, 33, 182, 0.1)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'center'
                }}>
                  <Icon size={20} color={isActive ? '#5B21B6' : '#9CA3AF'} />
                </div>
                <span>{tab.label}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </div>
  );
}
