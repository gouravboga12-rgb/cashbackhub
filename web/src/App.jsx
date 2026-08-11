import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import api from './api';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import MobileBottomNav from './components/MobileBottomNav';
import Footer from './components/Footer';

// Public Landing Pages
import Home from './pages/Landing/Home';
import About from './pages/Landing/About';
import HowItWorks from './pages/Landing/HowItWorks';
import Contact from './pages/Landing/Contact';
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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const location = useLocation();

  useEffect(() => {
    checkAuth();
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    setWallet({ available_points: 2520, total_earned: 3320, total_redeemed: 800 });
  };

  const handleLogout = () => {
    localStorage.removeItem('cashback_token');
    localStorage.removeItem('cashback_user');
    setUser(null);
    setWallet(null);
  };

  const isPortalRoute = location.pathname.startsWith('/portal');

  if (loading) {
    return (
      <div style={{ background: '#F4F3F8', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5B21B6', fontSize: '1.2rem', fontWeight: 800 }}>
        Loading CashBack Hub...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: isPortalRoute ? '#F4F3F8' : '#0E0B1F' }}>
      
      {/* Top Navbar */}
      <Navbar user={user} wallet={wallet} onLogout={handleLogout} />

      {/* Main Container */}
      <div style={{ display: 'flex', flex: 1 }}>
        
        {/* Desktop Sidebar (Only for logged-in portal routes on desktop) */}
        {user && isPortalRoute && !isMobile && <Sidebar />}

        {/* Dynamic Page Content */}
        <main style={{ flex: 1, padding: isPortalRoute ? (isMobile ? '12px 12px 95px 12px' : '24px 32px') : '0' }}>
          <Routes>
            {/* PUBLIC LANDING ROUTES */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={!user ? <Login onLoginSuccess={(u) => { setUser(u); refreshWallet(); }} /> : <Navigate to="/portal/dashboard" />} />
            <Route path="/signup" element={!user ? <Signup onLoginSuccess={(u) => { setUser(u); refreshWallet(); }} /> : <Navigate to="/portal/dashboard" />} />

            {/* AUTHENTICATED PORTAL ROUTES */}
            <Route path="/portal/dashboard" element={user ? <Dashboard user={user} wallet={wallet} refreshWallet={refreshWallet} /> : <Navigate to="/login" />} />
            <Route path="/portal/watch-ads" element={user ? <WatchAds refreshWallet={refreshWallet} /> : <Navigate to="/login" />} />
            <Route path="/portal/spin" element={user ? <SpinWin refreshWallet={refreshWallet} /> : <Navigate to="/login" />} />
            <Route path="/portal/wallet" element={user ? <Wallet wallet={wallet} refreshWallet={refreshWallet} /> : <Navigate to="/login" />} />
            <Route path="/portal/withdraw" element={user ? <Withdraw wallet={wallet} refreshWallet={refreshWallet} /> : <Navigate to="/login" />} />
            <Route path="/portal/my-withdrawals" element={user ? <MyWithdrawals /> : <Navigate to="/login" />} />
            <Route path="/portal/profile" element={user ? <Profile user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />

            {/* Catch All */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>

      {/* Mobile Bottom Tab Bar (Visible on mobile/tablet for logged-in portal users) */}
      {user && isPortalRoute && isMobile && <MobileBottomNav />}

      {/* Footer (Only on Guest pages) */}
      {!isPortalRoute && <Footer />}

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
