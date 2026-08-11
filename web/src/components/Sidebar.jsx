import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Film, Disc, Wallet, Gift, Clock, User } from 'lucide-react';

export default function Sidebar() {
  const menuItems = [
    { path: '/portal/dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { path: '/portal/watch-ads', name: 'Watch Ads (0/10)', icon: Film },
    { path: '/portal/spin', name: 'Spin & Win', icon: Disc },
    { path: '/portal/wallet', name: 'My Wallet', icon: Wallet },
    { path: '/portal/withdraw', name: 'Voucher Catalog', icon: Gift },
    { path: '/portal/my-withdrawals', name: 'My Withdrawals', icon: Clock },
    { path: '/portal/profile', name: 'Profile & Settings', icon: User }
  ];

  return (
    <aside style={{ width: '250px', background: '#FFFFFF', borderRight: '1px solid #E5E7EB', minHeight: 'calc(100vh - 69px)', padding: '24px 16px' }}>
      <div style={{ color: '#9CA3AF', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', paddingLeft: '12px' }}>
        USER PORTAL
      </div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '14px',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '0.9rem',
                color: isActive ? '#5B21B6' : '#6B7280',
                background: isActive ? '#F3E8FF' : 'transparent',
                transition: 'all 0.2s ease-in-out'
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} color={isActive ? '#5B21B6' : '#9CA3AF'} />
                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Daily Banner Card */}
      <div style={{ marginTop: '40px', background: 'linear-gradient(135deg, #5B21B6 0%, #22C55E 100%)', borderRadius: '16px', padding: '16px', color: '#FFF' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '4px' }}>🎁 Earn 100+ Pts Today</h4>
        <p style={{ fontSize: '0.75rem', color: '#E9D5FF', marginBottom: '12px' }}>Complete daily check-in, watch 10 ads & spin the wheel!</p>
        <button style={{ width: '100%', background: '#FFF', color: '#5B21B6', border: 'none', padding: '8px', borderRadius: '8px', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer' }}>
          Daily Checklist
        </button>
      </div>
    </aside>
  );
}
