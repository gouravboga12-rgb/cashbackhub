import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarCheck2,
  Wallet,
  Gift,
  Disc,
  Activity,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  Database,
  Sparkles
} from 'lucide-react';

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const saved = localStorage.getItem('cashback_admin_user');
    if (saved) {
      try {
        setAdminUser(JSON.parse(saved));
      } catch (e) {
        setAdminUser({ name: 'Super Admin', email: 'admin@cashbackhub.com' });
      }
    } else {
      setAdminUser({ name: 'Super Admin', email: 'admin@cashbackhub.com' });
    }
  }, []);

  // Close sidebar on route change for mobile/tablet
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('cashback_admin_token');
    localStorage.removeItem('cashback_admin_user');
    navigate('/admin/login');
  };

  const navItems = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/gift-cards', label: 'Gift Card Management', icon: Gift },
    { to: '/admin/users', label: 'Customer Accounts', icon: Users },
    { to: '/admin/attendance', label: 'Daily Attendance', icon: CalendarCheck2 },
    { to: '/admin/wallets', label: 'Wallets & Vouchers', icon: Wallet },
    { to: '/admin/spin-wheel', label: 'Spin Wheel Engine', icon: Disc },
    { to: '/admin/activities', label: 'User Activities', icon: Activity },
    { to: '/admin/audit-logs', label: 'Security & Audit', icon: ShieldCheck },
  ];

  const currentRouteName = () => {
    const p = location.pathname;
    if (p.includes('gift-cards')) return 'Gift Card Withdrawal & Delivery Management';
    if (p.includes('users')) return 'Customer Accounts & Profiles';
    if (p.includes('attendance')) return 'Daily Attendance';
    if (p.includes('wallets')) return 'Wallet & Voucher Inventory';
    if (p.includes('spin-wheel')) return 'Spin Wheel Probabilities & Daily Budgets';
    if (p.includes('activities')) return 'User Activities Ledger';
    if (p.includes('audit-logs')) return 'Admin Audit Logs & Security';
    return 'Dashboard Overview';
  };


  return (
    <div className="admin-viewport" style={{
      display: 'flex',
      minHeight: '100vh',
      width: '100vw',
      maxWidth: '100%',
      background: '#F8FAFC',
      color: '#0F172A',
      position: 'relative'
    }}>
      {/* Mobile/Tablet Backdrop Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.5)',
            zIndex: 998,
            backdropFilter: 'blur(3px)',
            transition: 'opacity 0.2s ease'
          }}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`admin-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}
        style={{
          width: '260px',
          background: '#FFFFFF',
          borderRight: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 999,
          boxShadow: '2px 0 12px rgba(0, 0, 0, 0.03)'
        }}
      >
        {/* Brand Header */}
        <div style={{
          padding: '22px 20px',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#FFFFFF'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #7C3AED, #5B21B6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)',
              flexShrink: 0
            }}>
              <Sparkles size={20} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em', color: '#0F172A' }}>
                CashBack <span style={{ color: '#7C3AED' }}>Admin</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>
                Control Center v2.4
              </div>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="mobile-close-btn"
            style={{
              background: '#F1F5F9',
              border: 'none',
              color: '#64748B',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Links */}
        <div style={{ flex: 1, padding: '18px 12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{
            fontSize: '0.68rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#94A3B8',
            fontWeight: 700,
            padding: '4px 12px',
            marginBottom: '4px'
          }}>
            Platform Management
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to || (item.to === '/admin/dashboard' && location.pathname === '/admin');

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '11px 14px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontSize: '0.88rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#5B21B6' : '#475569',
                  background: isActive ? 'linear-gradient(90deg, rgba(124, 58, 237, 0.1), rgba(91, 33, 182, 0.05))' : 'transparent',
                  borderLeft: isActive ? '3px solid #7C3AED' : '3px solid transparent',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={18} color={isActive ? '#7C3AED' : '#64748B'} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          <div style={{
            fontSize: '0.68rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#94A3B8',
            fontWeight: 700,
            padding: '16px 12px 4px 12px',
            marginTop: '12px'
          }}>
            Infrastructure & Links
          </div>

          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: '10px',
              color: '#475569',
              textDecoration: 'none',
              fontSize: '0.84rem',
              fontWeight: 500
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ExternalLink size={16} color="#64748B" />
              <span>User Web App</span>
            </div>
            <ChevronRight size={14} color="#94A3B8" />
          </a>

          {/* Supabase Status Pill */}
          <div style={{
            margin: '12px 4px',
            padding: '10px 12px',
            background: '#F8FAFC',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            fontSize: '0.74rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Database size={14} color="#059669" />
              <span style={{ fontWeight: 700, color: '#0F172A' }}>Supabase Cloud DB</span>
            </div>
            <div style={{ color: '#059669', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
              Connected & Synced
            </div>
          </div>
        </div>

        {/* Admin User Footer */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid #E2E8F0',
          background: '#F8FAFC',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: '#5B21B6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.85rem',
              color: '#FFFFFF',
              flexShrink: 0
            }}>
              {adminUser?.name ? adminUser.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                {adminUser?.name || 'Super Admin'}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748B', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                {adminUser?.email || 'admin@cashbackhub.com'}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Sign out of Admin Portal"
            style={{
              background: '#FEE2E2',
              border: '1px solid #FECACA',
              color: '#DC2626',
              padding: '7px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
          >
            <LogOut size={15} />
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div
        className="admin-main-wrapper"
        style={{
          flex: 1,
          marginLeft: '260px',
          width: 'calc(100% - 260px)',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          boxSizing: 'border-box'
        }}
      >
        {/* Top Header */}
        <header
          className="admin-header"
          style={{
            height: '68px',
            background: '#FFFFFF',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 28px',
            position: 'sticky',
            top: 0,
            zIndex: 40,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              onClick={() => setSidebarOpen(true)}
              className="mobile-hamburger"
              style={{
                background: '#F1F5F9',
                border: '1px solid #E2E8F0',
                color: '#334155',
                cursor: 'pointer',
                display: 'none',
                padding: '8px',
                borderRadius: '8px',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Menu size={20} />
            </button>

            <div>
              <h1 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                {currentRouteName()}
              </h1>
              <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '2px' }}>
                CashBack Hub Central Management Panel
              </div>
            </div>
          </div>

          {/* Header Right Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#ECFDF5',
              border: '1px solid #A7F3D0',
              borderRadius: '20px',
              padding: '5px 12px',
              fontSize: '0.74rem',
              color: '#065F46',
              fontWeight: 700
            }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10B981' }} />
              <span className="hide-on-tiny">Live Server Active</span>
            </div>
          </div>
        </header>

        {/* Page Content Body */}
        <main
          className="admin-main-content"
          style={{
            flex: 1,
            padding: '28px',
            overflowY: 'auto',
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box'
          }}
        >
          {children}
        </main>
      </div>

      <style>{`
        @media (max-width: 480px) {
          .hide-on-tiny {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
