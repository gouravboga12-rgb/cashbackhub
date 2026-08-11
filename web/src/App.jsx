import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import api from './api';

// Components
import Navbar from './components/Navbar';
import MobileBottomNav from './components/MobileBottomNav';
import Footer from './components/Footer';
import AttendanceModal from './components/AttendanceModal';

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

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      checkAttendanceStatus(user);
    } else {
      setShowAttendanceModal(false);
    }
  }, [user]);

  const checkAttendanceStatus = async (currentUser) => {
    const todayStr = new Date().toISOString().split('T')[0];
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

      // Vercel deployment / offline client fallback
      const savedUser = localStorage.getItem('cashback_user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          setUser({ id: 'usr_demo_101', name: 'Rahul Sharma', email: 'demo@cashbackhub.com', mobile: '+919876543210', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80' });
        }
      } else {
        setUser({ id: 'usr_demo_101', name: 'Rahul Sharma', email: 'demo@cashbackhub.com', mobile: '+919876543210', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80' });
      }
      setWallet({ available_points: 2520, total_earned: 3320, total_redeemed: 800 });
    }
    setLoading(false);
  };

  const refreshWallet = async () => {
    try {
      const res = await api.get('/wallet/balance');
      if (res.data && res.data.success) {
        setWallet(res.data.wallet);
        return;
      }
    } catch (err) {
      console.warn('Wallet API offline, using client balance fallback.');
    }

    const saved = localStorage.getItem('cashback_wallet');
    if (saved) {
      try {
        setWallet(JSON.parse(saved));
        return;
      } catch (e) {}
    }

    const initialWallet = { available_points: 2520, total_earned: 3320, total_redeemed: 800 };
    localStorage.setItem('cashback_wallet', JSON.stringify(initialWallet));
    setWallet(initialWallet);
  };

  const handleLogout = () => {
    localStorage.removeItem('cashback_token');
    localStorage.removeItem('cashback_user');
    setUser(null);
    setWallet(null);
  };

  const isPortalRoute = location.pathname.startsWith('/portal');
  const isAuthRoute = ['/', '/login', '/signup'].includes(location.pathname);

  if (loading) {
    return (
      <div style={{ background: '#F4F3F8', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5B21B6', fontSize: '1.2rem', fontWeight: 800 }}>
        Loading CashBack Hub...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: isAuthRoute ? '#FFFFFF' : '#F4F3F8' }}>
      
      {/* Top Navbar */}
      <Navbar user={user} wallet={wallet} onLogout={handleLogout} />

      {/* Main Container — Mobile-only container */}
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
          <Route path="/portal/spin" element={user ? <SpinWin refreshWallet={refreshWallet} /> : <Navigate to="/login" />} />
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
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
