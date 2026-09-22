import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import api from './api';
import { getCachedWallet, persistWallet, mergeWallet } from './utils/walletUtils';

// Components
import Navbar from './components/Navbar';
import MobileBottomNav from './components/MobileBottomNav';
import Footer from './components/Footer';
import AttendanceModal from './components/AttendanceModal';
import { getISTDateString } from './utils/dateUtils';

// Admin Architecture Components
import AdminAuthGuard from './components/Admin/AdminAuthGuard';
import AdminLayout from './components/Admin/AdminLayout';

// Admin Pages
import AdminLogin from './pages/Admin/AdminLogin';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminGiftCards from './pages/Admin/AdminGiftCards';
import AdminUsers from './pages/Admin/AdminUsers';
import AdminAttendance from './pages/Admin/AdminAttendance';
import AdminWallets from './pages/Admin/AdminWallets';
import AdminSpinWheel from './pages/Admin/AdminSpinWheel';
import AdminActivities from './pages/Admin/AdminActivities';
import AdminAuditLogs from './pages/Admin/AdminAuditLogs';


// Public Landing Pages
import Home from './pages/Landing/Home';
import Login from './pages/Landing/Login';
import Signup from './pages/Landing/Signup';

// Authenticated Portal Pages
import Dashboard from './pages/Portal/Dashboard';
import WatchAds from './pages/Portal/WatchAds';
import SpinWin from './pages/Portal/SpinWin';
import Wallet from './pages/Portal/Wallet';
import Withdraw from './pages/Portal/Withdraw';
import MyWithdrawals from './pages/Portal/MyWithdrawals';
import Profile from './pages/Portal/Profile';

function AppContent() {
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isPortalRoute = location.pathname.startsWith('/portal');
  const isAuthRoute = ['/', '/login', '/signup'].includes(location.pathname);

  useEffect(() => {
    checkAuth();
    syncGlobalPlatformSettings();

    const handleWalletSync = () => {
      // Read from user-keyed or generic cache (walletUtils handles priority)
      const userId = (() => { try { return JSON.parse(localStorage.getItem('cashback_user') || '{}')?.id; } catch(e) { return null; } })();
      const cached = getCachedWallet(userId);
      if (cached) {
        setWallet(cached);
      }
    };

    window.addEventListener('wallet_updated', handleWalletSync);
    window.addEventListener('attendance_claimed', handleWalletSync);
    window.addEventListener('storage', handleWalletSync);

    return () => {
      window.removeEventListener('wallet_updated', handleWalletSync);
      window.removeEventListener('attendance_claimed', handleWalletSync);
      window.removeEventListener('storage', handleWalletSync);
    };
  }, []);

  const syncGlobalPlatformSettings = async () => {
    try {
      const res = await api.get('/platform-settings');
      if (res.data && res.data.platform_settings) {
        localStorage.setItem('cashback_platform_settings', JSON.stringify(res.data.platform_settings));
        window.dispatchEvent(new Event('platform_settings_updated'));
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (user && !isAdminRoute) {
      checkAttendanceStatus(user);
    } else {
      setShowAttendanceModal(false);
    }
  }, [user, location.pathname]);

  const checkAttendanceStatus = async (currentUser) => {
    const todayStr = getISTDateString();
    const userId = currentUser?.id || 'demo_user';
    const claimedLocal = localStorage.getItem(`cashback_attendance_claimed_${userId}_${todayStr}`);
    
    if (claimedLocal === 'true') {
      setShowAttendanceModal(false);
      return;
    }

    try {
      const res = await api.get('/attendance/today');
      if (res.data && res.data.completed) {
        localStorage.setItem(`cashback_attendance_claimed_${userId}_${todayStr}`, 'true');
        setShowAttendanceModal(false);
        return;
      }
    } catch (err) {
      console.warn('Backend attendance check API offline, using client attendance status check.');
    }

    setShowAttendanceModal(true);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    const rootEl = document.getElementById('root');
    if (rootEl) {
      rootEl.scrollTop = 0;
    }
  }, [location.pathname]);

  const checkAuth = async () => {
    const token = localStorage.getItem('cashback_token');
    if (token) {
      try {
        const res = await api.get('/auth/me');
        if (res.data && res.data.success) {
          setUser(res.data.user);
          await refreshWallet();
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Backend server offline during checkAuth, loading client session fallback.');
      }

      // Saved user session
      const savedUser = localStorage.getItem('cashback_user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  const refreshWallet = async () => {
    // Determine user id for keyed storage
    const getUserId = () => {
      try { return JSON.parse(localStorage.getItem('cashback_user') || '{}')?.id || null; } catch(e) { return null; }
    };

    try {
      const res = await api.get('/wallet/balance');
      if (res.data && res.data.success && res.data.wallet) {
        const userId = getUserId();
        // mergeWallet guards against cold-start overwriting a higher cached balance
        const finalWallet = mergeWallet(res.data.wallet, 0, userId);
        setWallet(finalWallet);
        if (finalWallet?.points_to_rupee_ratio) {
          try {
            const cur = JSON.parse(localStorage.getItem('cashback_platform_settings') || '{}');
            localStorage.setItem('cashback_platform_settings', JSON.stringify({
              ...cur,
              points_to_rupee_ratio: finalWallet.points_to_rupee_ratio
            }));
            window.dispatchEvent(new Event('platform_settings_updated'));
          } catch (e) {}
        }
        return;
      }
    } catch (err) {
      console.warn('Wallet API offline, using client balance fallback.');
    }

    // API unavailable – use best available cached value
    const userId = getUserId();
    const cached = getCachedWallet(userId);
    if (cached) {
      setWallet(cached);
      return;
    }

    setWallet({ available_points: 0, total_earned: 0, total_redeemed: 0 });
  };

  const handleLogout = () => {
    localStorage.removeItem('cashback_token');
    localStorage.removeItem('cashback_user');
    setUser(null);
    setWallet(null);
  };

  if (loading) {
    return (
      <div style={{ background: '#0F172A', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A78BFA', fontSize: '1.2rem', fontWeight: 800 }}>
        Loading Perkfy...
      </div>
    );
  }

  // Admin Routes Rendering Branch (Full Width Desktop / Tablet / Mobile Viewport)
  if (isAdminRoute) {
    return (
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <AdminAuthGuard>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </AdminAuthGuard>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <AdminAuthGuard>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </AdminAuthGuard>
          }
        />
        <Route
          path="/admin/gift-cards"
          element={
            <AdminAuthGuard>
              <AdminLayout>
                <AdminGiftCards />
              </AdminLayout>
            </AdminAuthGuard>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminAuthGuard>
              <AdminLayout>
                <AdminUsers />
              </AdminLayout>
            </AdminAuthGuard>
          }
        />
        <Route
          path="/admin/attendance"
          element={
            <AdminAuthGuard>
              <AdminLayout>
                <AdminAttendance />
              </AdminLayout>
            </AdminAuthGuard>
          }
        />

        <Route
          path="/admin/wallets"
          element={
            <AdminAuthGuard>
              <AdminLayout>
                <AdminWallets />
              </AdminLayout>
            </AdminAuthGuard>
          }
        />
        <Route
          path="/admin/spin-wheel"
          element={
            <AdminAuthGuard>
              <AdminLayout>
                <AdminSpinWheel />
              </AdminLayout>
            </AdminAuthGuard>
          }
        />
        <Route
          path="/admin/activities"
          element={
            <AdminAuthGuard>
              <AdminLayout>
                <AdminActivities />
              </AdminLayout>
            </AdminAuthGuard>
          }
        />
        <Route
          path="/admin/audit-logs"
          element={
            <AdminAuthGuard>
              <AdminLayout>
                <AdminAuditLogs />
              </AdminLayout>
            </AdminAuthGuard>
          }
        />
        <Route path="*" element={<Navigate to="/admin/dashboard" />} />
      </Routes>
    );
  }

  // User App Branch (Smartphone Mobile Shell)
  return (
    <div className="user-portal-shell">
      <div className="user-portal-container" style={{ background: isAuthRoute ? '#FFFFFF' : '#F4F3F8' }}>
        
        {/* Top Navbar */}
        <Navbar user={user} wallet={wallet} onLogout={handleLogout} />

        {/* Main Container */}
        <main style={{
          flex: 1,
          padding: isPortalRoute ? '12px 12px 95px 12px' : '0',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <Routes>
            {/* PUBLIC AUTH ENTRY ROUTES */}
            <Route path="/" element={!user ? <Login onLoginSuccess={(u) => { setUser(u); refreshWallet(); }} /> : <Navigate to="/portal/dashboard" />} />
            <Route path="/login" element={!user ? <Login onLoginSuccess={(u) => { setUser(u); refreshWallet(); }} /> : <Navigate to="/portal/dashboard" />} />
            <Route path="/signup" element={!user ? <Signup onLoginSuccess={(u) => { setUser(u); refreshWallet(); }} /> : <Navigate to="/portal/dashboard" />} />

            {/* AUTHENTICATED PORTAL ROUTES */}
            <Route path="/portal/dashboard" element={user ? <Dashboard user={user} wallet={wallet} refreshWallet={refreshWallet} /> : <Navigate to="/login" />} />
            <Route path="/portal/watch-ads" element={user ? <WatchAds refreshWallet={refreshWallet} /> : <Navigate to="/login" />} />
            <Route path="/portal/spin" element={user ? <SpinWin user={user} wallet={wallet} refreshWallet={refreshWallet} /> : <Navigate to="/login" />} />
            <Route path="/portal/wallet" element={user ? <Wallet wallet={wallet} refreshWallet={refreshWallet} /> : <Navigate to="/login" />} />
            <Route path="/portal/withdraw" element={user ? <Withdraw wallet={wallet} refreshWallet={refreshWallet} /> : <Navigate to="/login" />} />
            <Route path="/portal/my-withdrawals" element={user ? <MyWithdrawals /> : <Navigate to="/login" />} />
            <Route path="/portal/profile" element={user ? <Profile user={user} refreshWallet={refreshWallet} onLogout={handleLogout} /> : <Navigate to="/login" />} />

            {/* Catch All */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        {/* Mandatory Daily Attendance Modal Popup after Login */}
        {user && isPortalRoute && showAttendanceModal && (
          <AttendanceModal
            user={user}
            wallet={wallet}
            refreshWallet={refreshWallet}
            onClaimSuccess={() => {
              setShowAttendanceModal(false);
              refreshWallet();
            }}
          />
        )}

        {/* Mobile Bottom Tab Bar (Always visible for logged-in portal users) */}
        {user && isPortalRoute && <MobileBottomNav />}

        {/* Footer (Only on Guest pages excluding auth pages) */}
        {!isPortalRoute && !isAuthRoute && <Footer />}

      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
