import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import api from './api';
import { getCachedWallet, persistWallet, mergeWallet, clearAllUserLocalCache } from './utils/walletUtils';

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
import AdminDiceGame from './pages/Admin/AdminDiceGame';
import AdminMysteryBox from './pages/Admin/AdminMysteryBox';
import AdminActivities from './pages/Admin/AdminActivities';
import AdminAuditLogs from './pages/Admin/AdminAuditLogs';


// Public Landing Pages
import Home from './pages/Landing/Home';
import Login from './pages/Landing/Login';
import Signup from './pages/Landing/Signup';
import AboutUs from './pages/Landing/AboutUs';
import ContactUs from './pages/Landing/ContactUs';
import TermsAndConditions from './pages/Landing/TermsAndConditions';
import PrivacyPolicy from './pages/Landing/PrivacyPolicy';

// Authenticated Portal Pages
import Dashboard from './pages/Portal/Dashboard';
import WatchAds from './pages/Portal/WatchAds';
import PlayDice from './pages/Portal/PlayDice';
import SpinWin from './pages/Portal/SpinWin';
import MysteryBox from './pages/Portal/MysteryBox';
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
    // ── Google Authentication Bridge for Mobile App ──────────────────────
    const hash = window.location.hash || '';
    if (hash.includes('access_token')) {
      const hashParams = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);
      const token = hashParams.get('access_token');
      const state = hashParams.get('state');

      if (token && state === 'app_mobile_oauth') {
        window.history.replaceState(null, '', window.location.pathname);
        console.log('[GoogleBridge] Mobile OAuth token detected. Redirecting to perkfy://');

        // Immediately launch deep link to mobile app
        window.location.href = `perkfy://oauth#access_token=${token}`;
        setTimeout(() => {
          window.location.href = `com.perkfy.app://oauth#access_token=${token}`;
        }, 300);

        // Fallback UI in case Chrome stays open
        const overlay = document.createElement('div');
        overlay.id = 'perkfy-bridge-overlay';
        overlay.innerHTML = `
          <div style="position:fixed;inset:0;background:#ffffff;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:999999;font-family:system-ui,-apple-system,sans-serif;text-align:center;padding:24px;">
            <div style="width:48px;height:48px;border:4px solid #7C3AED;border-top-color:transparent;border-radius:50%;animation:perkfy-spin 1s linear infinite;margin-bottom:16px;"></div>
            <h2 style="color:#1E1B4B;font-size:22px;margin:0 0 8px 0;font-weight:700;">Signing into Perkfy...</h2>
            <p style="color:#6B7280;font-size:15px;margin:0 0 24px 0;">Please wait while we redirect you back to the mobile app.</p>
            <a href="perkfy://oauth#access_token=${token}" style="background:#7C3AED;color:#ffffff;padding:12px 28px;border-radius:12px;text-decoration:none;font-weight:700;font-size:16px;box-shadow:0 4px 12px rgba(124,58,237,0.3);">Open Perkfy App</a>
          </div>
          <style>@keyframes perkfy-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
        `;
        document.body.appendChild(overlay);
        return;
      }
    }

    checkAuth();
    syncGlobalPlatformSettings();

    const handleWalletSync = () => {
      refreshWallet();
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
          localStorage.setItem('cashback_user', JSON.stringify(res.data.user));
          await refreshWallet();
          setLoading(false);
          return;
        }
      } catch (err) {
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          console.warn('Session token expired or invalid, clearing local session.');
          localStorage.removeItem('cashback_token');
          localStorage.removeItem('cashback_user');
          setUser(null);
          setLoading(false);
          return;
        }
        console.warn('Backend server offline during checkAuth, loading client session fallback.');
      }

      // Saved user session (backend offline)
      const savedUser = localStorage.getItem('cashback_user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          await refreshWallet();
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
    const getUserId = () => {
      try { return JSON.parse(localStorage.getItem('cashback_user') || '{}')?.id || null; } catch(e) { return null; }
    };
    const userId = getUserId();

    try {
      const res = await api.get('/wallet/balance');
      if (res.data && res.data.success && res.data.wallet) {
        const liveWallet = res.data.wallet;
        persistWallet(liveWallet, userId);
        setWallet(liveWallet);
        if (liveWallet?.points_to_rupee_ratio || liveWallet?.min_withdrawal_rupees !== undefined) {
          try {
            const cur = JSON.parse(localStorage.getItem('cashback_platform_settings') || '{}');
            localStorage.setItem('cashback_platform_settings', JSON.stringify({
              ...cur,
              ...(liveWallet.points_to_rupee_ratio ? { points_to_rupee_ratio: liveWallet.points_to_rupee_ratio } : {}),
              ...(liveWallet.min_withdrawal_rupees !== undefined ? { min_withdrawal_rupees: liveWallet.min_withdrawal_rupees } : {})
            }));
            window.dispatchEvent(new Event('platform_settings_updated'));
          } catch (e) {}
        }
        return;
      }
    } catch (err) {
      console.warn('Wallet API offline, using session balance fallback.');
    }

    const cached = getCachedWallet(userId);
    if (cached) {
      setWallet(cached);
      return;
    }

    setWallet({ available_points: 0, total_earned: 0, total_redeemed: 0 });
  };

  const handleLogout = () => {
    clearAllUserLocalCache();
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
          path="/admin/dice"
          element={
            <AdminAuthGuard>
              <AdminLayout>
                <AdminDiceGame />
              </AdminLayout>
            </AdminAuthGuard>
          }
        />
        <Route
          path="/admin/mystery-box"
          element={
            <AdminAuthGuard>
              <AdminLayout>
                <AdminMysteryBox />
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

  // Public Full-Width Legal & Information Pages (Google Play compliant & direct external URL access)
  const isPublicInfoRoute = ['/terms', '/terms-and-conditions', '/privacy', '/privacy-policy', '/about', '/about-us', '/contact', '/contact-us'].includes(location.pathname);
  if (isPublicInfoRoute) {
    return (
      <div style={{ minHeight: '100vh', width: '100%', background: '#F8F7FC' }}>
        <Routes>
          <Route path="/about" element={<AboutUs />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        </Routes>
      </div>
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
            {/* ROOT REDIRECT TO ADMIN AS PER CLIENT STRATEGY */}
            <Route path="/" element={<Navigate to="/admin" replace />} />
            <Route path="/login" element={!user ? <Login onLoginSuccess={(u) => { clearAllUserLocalCache(true); setUser(u); refreshWallet(); }} /> : <Navigate to="/portal/dashboard" />} />
            <Route path="/signup" element={!user ? <Signup onLoginSuccess={(u) => { clearAllUserLocalCache(true); setUser(u); refreshWallet(); }} /> : <Navigate to="/portal/dashboard" />} />

            {/* AUTHENTICATED PORTAL ROUTES */}
            <Route path="/portal/dashboard" element={user ? <Dashboard user={user} wallet={wallet} refreshWallet={refreshWallet} /> : <Navigate to="/login" />} />
            <Route path="/portal/play-dice" element={user ? <PlayDice refreshWallet={refreshWallet} /> : <Navigate to="/login" />} />
            <Route path="/portal/watch-ads" element={user ? <WatchAds refreshWallet={refreshWallet} /> : <Navigate to="/login" />} />
            <Route path="/portal/spin" element={user ? <SpinWin user={user} wallet={wallet} refreshWallet={refreshWallet} /> : <Navigate to="/login" />} />
            <Route path="/portal/mystery-box" element={user ? <MysteryBox user={user} refreshWallet={refreshWallet} /> : <Navigate to="/login" />} />
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
