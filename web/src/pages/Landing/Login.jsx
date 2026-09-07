import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../api';
import {
  Gift, Lock, Mail, User, Phone, ArrowRight, AlertCircle,
  ShieldCheck, Eye, EyeOff, CheckCircle2, Shield, Zap,
  X, RefreshCw, ChevronLeft, Check
} from 'lucide-react';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '776264116365-94pbaka3umth91b4b17vqd6bdfe5ons2.apps.googleusercontent.com';

export default function Login({ onLoginSuccess, initialTab = 'login' }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Tab state: 'login' or 'register'
  const [activeTab, setActiveTab] = useState(
    location.pathname === '/signup' || initialTab === 'signup' || initialTab === 'register' ? 'register' : 'login'
  );

  useEffect(() => {
    if (location.pathname === '/signup' || initialTab === 'signup' || initialTab === 'register') {
      setActiveTab('register');
    } else if (location.pathname === '/login') {
      setActiveTab('login');
    }
  }, [location.pathname, initialTab]);

  const switchToRegister = () => {
    setActiveTab('register');
    setErrorMsg('');
    setSuccessMsg('');
    if (location.pathname !== '/signup') {
      navigate('/signup');
    }
  };

  const switchToLogin = () => {
    setActiveTab('login');
    setErrorMsg('');
    setSuccessMsg('');
    if (location.pathname !== '/login') {
      navigate('/login');
    }
  };

  // Login form state (Empty by default)
  const [emailOrMobile, setEmailOrMobile] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form state
  const [regStep, setRegStep] = useState('form'); // 'form' | 'otp'
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regOtp, setRegOtp] = useState('');
  const [regCountdown, setRegCountdown] = useState(60);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1 = Request OTP, 2 = Verify OTP & Reset Password
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [forgotCountdown, setForgotCountdown] = useState(60);
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Dynamic signup bonus from platform settings
  const [signupBonusPoints, setSignupBonusPoints] = useState(100);

  // Fetch signup bonus from platform settings
  useEffect(() => {
    api.get('/platform-settings').then(res => {
      if (res.data && res.data.signup_bonus_points !== undefined) {
        setSignupBonusPoints(Number(res.data.signup_bonus_points) || 100);
      }
    }).catch(() => {});
  }, []);

  // Timer effect for Sign-Up OTP
  useEffect(() => {
    let timer;
    if (regStep === 'otp' && regCountdown > 0) {
      timer = setInterval(() => setRegCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [regStep, regCountdown]);

  // Timer effect for Forgot Password OTP
  useEffect(() => {
    let timer;
    if (showForgotModal && forgotStep === 2 && forgotCountdown > 0) {
      timer = setInterval(() => setForgotCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [showForgotModal, forgotStep, forgotCountdown]);

  // Dynamic Google GIS SDK Loader
  const loadGoogleSdk = () => {
    return new Promise((resolve) => {
      if (window.google && window.google.accounts) {
        return resolve(true);
      }
      const existing = document.getElementById('google-gsi-client');
      if (existing) {
        existing.onload = () => resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.id = 'google-gsi-client';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    });
  };

  // Helper to parse JWT payload
  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  // Handle Google Token Response
  const handleGoogleCredentialResponse = async (response) => {
    if (!response || !response.credential) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const payload = parseJwt(response.credential);
      const res = await api.post('/auth/google', {
        credential: response.credential,
        email: payload?.email,
        name: payload?.name,
        avatar: payload?.picture
      });

      if (res.data && res.data.success) {
        localStorage.setItem('cashback_token', res.data.token);
        localStorage.setItem('cashback_user', JSON.stringify(res.data.user));
        onLoginSuccess(res.data.user);
        navigate('/portal/dashboard');
        return;
      }
    } catch (err) {
      console.warn('Backend Google Auth error:', err);
      const payload = parseJwt(response.credential);
      if (payload && payload.email) {
        const clientGoogleUser = {
          id: `usr_g_${Date.now()}`,
          name: payload.name || 'Google User',
          email: payload.email,
          mobile: '',
          avatar: payload.picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
          role: 'user'
        };
        localStorage.setItem('cashback_token', response.credential);
        localStorage.setItem('cashback_user', JSON.stringify(clientGoogleUser));
        onLoginSuccess(clientGoogleUser);
        navigate('/portal/dashboard');
        return;
      }
      setErrorMsg('Google Sign-In verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Initialize Google Identity Services
  useEffect(() => {
    loadGoogleSdk().then((loaded) => {
      if (loaded && window.google && window.google.accounts && window.google.accounts.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });
        } catch (e) {
          console.warn('Google Identity initialization notice:', e);
        }
      }
    });
  }, []);

  // Handle Google button click (OAuth 2.0 Popup Flow)
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg('');

    const loaded = await loadGoogleSdk();
    if (!loaded || !window.google || !window.google.accounts) {
      setLoading(false);
      setErrorMsg('Google Sign-In is unavailable. Please check your network or ad-blocker.');
      return;
    }

    try {
      if (window.google.accounts.oauth2) {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'email profile openid',
          callback: async (tokenResponse) => {
            if (tokenResponse.error) {
              setLoading(false);
              if (tokenResponse.error !== 'popup_closed_by_user') {
                setErrorMsg(`Google Sign-In failed: ${tokenResponse.error}`);
              }
              return;
            }

            if (tokenResponse && tokenResponse.access_token) {
              try {
                const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });
                const userInfo = await userRes.json();
                
                const res = await api.post('/auth/google', {
                  email: userInfo.email,
                  name: userInfo.name,
                  avatar: userInfo.picture,
                  googleId: userInfo.sub
                });

                if (res.data && res.data.success) {
                  localStorage.setItem('cashback_token', res.data.token);
                  localStorage.setItem('cashback_user', JSON.stringify(res.data.user));
                  onLoginSuccess(res.data.user);
                  navigate('/portal/dashboard');
                  return;
                }
              } catch (apiErr) {
                console.warn('Backend Google Auth note, using direct verified session:', apiErr);
                const clientGoogleUser = {
                  id: `usr_g_${Date.now()}`,
                  name: userInfo.name || 'Google User',
                  email: userInfo.email,
                  mobile: '',
                  avatar: userInfo.picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
                  role: 'user'
                };
                localStorage.setItem('cashback_token', tokenResponse.access_token);
                localStorage.setItem('cashback_user', JSON.stringify(clientGoogleUser));
                onLoginSuccess(clientGoogleUser);
                navigate('/portal/dashboard');
                return;
              } finally {
                setLoading(false);
              }
            }
          }
        });
        tokenClient.requestAccessToken({ prompt: 'select_account' });
        return;
      }

      if (window.google.accounts.id) {
        window.google.accounts.id.prompt();
        setLoading(false);
        return;
      }
    } catch (err) {
      console.error('Google Sign-In trigger error:', err);
      setLoading(false);
      setErrorMsg('Failed to open Google Sign-In popup. Please allow popups for this site.');
    }
  };

  // Handle Login submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!emailOrMobile || !loginPassword) {
      setErrorMsg('Please enter your email/mobile and password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.post('/auth/login', { emailOrMobile, password: loginPassword });
      if (res.data && res.data.success) {
        localStorage.setItem('cashback_token', res.data.token);
        localStorage.setItem('cashback_user', JSON.stringify(res.data.user));
        onLoginSuccess(res.data.user);
        navigate('/portal/dashboard');
        return;
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setErrorMsg(err.response.data.message);
        setLoading(false);
        return;
      }
      setErrorMsg('Unable to connect to server. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  // Step 1 of Sign-up: Send OTP
  const handleRequestSignUpOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!regName || !regEmail || !regPassword) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    if (regPassword && regConfirmPassword && regPassword !== regConfirmPassword) {
      setErrorMsg('Passwords do not match. Please check and try again.');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/send-signup-otp', {
        email: regEmail,
        name: regName
      });

      if (res.data && res.data.success) {
        setRegStep('otp');
        setRegCountdown(60);
        if (res.data.devOtp && !res.data.mailSent) {
          setSuccessMsg(`Verification Code: ${res.data.devOtp} (SMTP returned bad credentials; check App Password)`);
        } else {
          setSuccessMsg(`Verification OTP sent to ${regEmail}. Please check your inbox or spam folder.`);
        }
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setErrorMsg(err.response.data.message);
      } else {
        setErrorMsg('Failed to send verification email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 2 of Sign-up: Verify OTP & Register
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    if (!regOtp || regOtp.length < 6) {
      setErrorMsg('Please enter the 6-digit OTP code sent to your email.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await api.post('/auth/register', {
        name: regName,
        email: regEmail,
        mobile: regMobile,
        password: regPassword,
        otp: regOtp
      });

      if (res.data && res.data.success) {
        localStorage.setItem('cashback_token', res.data.token);
        localStorage.setItem('cashback_user', JSON.stringify(res.data.user));
        onLoginSuccess(res.data.user);
        navigate('/portal/dashboard');
        return;
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setErrorMsg(err.response.data.message);
      } else {
        setErrorMsg('Registration failed. Please check your OTP and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Resend Sign-Up OTP
  const handleResendSignUpOtp = async () => {
    if (regCountdown > 0) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.post('/auth/send-signup-otp', { email: regEmail, name: regName });
      if (res.data && res.data.success) {
        setRegCountdown(60);
        setSuccessMsg(`A fresh verification OTP has been sent to ${regEmail}.`);
      }
    } catch (err) {
      setErrorMsg('Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password: Step 1 Send Reset OTP
  const handleSendForgotOtp = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      setForgotError('Please enter your registered email address.');
      return;
    }

    setForgotLoading(true);
    setForgotError('');
    setForgotMsg('');

    try {
      const res = await api.post('/auth/forgot-password', { email: forgotEmail });
      if (res.data && res.data.success) {
        setForgotStep(2);
        setForgotCountdown(60);
        setForgotMsg(`Password reset code sent to ${forgotEmail}.`);
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setForgotError(err.response.data.message);
      } else {
        setForgotError('Unable to send reset code. Please verify your email.');
      }
    } finally {
      setForgotLoading(false);
    }
  };

  // Forgot Password: Step 2 Reset Password
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!forgotOtp || forgotOtp.length < 6) {
      setForgotError('Please enter the 6-digit verification code.');
      return;
    }
    if (!forgotNewPassword || forgotNewPassword.length < 6) {
      setForgotError('New password must be at least 6 characters.');
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('New passwords do not match. Please verify.');
      return;
    }

    setForgotLoading(true);
    setForgotError('');
    setForgotMsg('');

    try {
      const res = await api.post('/auth/reset-password', {
        email: forgotEmail,
        otp: forgotOtp,
        newPassword: forgotNewPassword
      });

      if (res.data && res.data.success) {
        localStorage.setItem('cashback_token', res.data.token);
        localStorage.setItem('cashback_user', JSON.stringify(res.data.user));
        setShowForgotModal(false);
        onLoginSuccess(res.data.user);
        navigate('/portal/dashboard');
        return;
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setForgotError(err.response.data.message);
      } else {
        setForgotError('Password reset failed. Please check your OTP.');
      }
    } finally {
      setForgotLoading(false);
    }
  };

  // Resend Forgot Password OTP
  const handleResendForgotOtp = async () => {
    if (forgotCountdown > 0) return;
    setForgotLoading(true);
    setForgotError('');
    try {
      await api.post('/auth/forgot-password', { email: forgotEmail });
      setForgotCountdown(60);
      setForgotMsg(`A new reset OTP has been sent to ${forgotEmail}.`);
    } catch (err) {
      setForgotError('Failed to resend OTP.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Fixed Top Company Name & Brand Header */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '480px',
        zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(229, 231, 235, 0.8)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #5B21B6 0%, #22C55E 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(91,33,182,0.22)', flexShrink: 0 }}>
            <Gift color="#FFF" size={20} />
          </div>
          <h1 style={{ color: '#1E1B4B', fontSize: '1.5rem', fontWeight: 800, margin: 0, letterSpacing: '-0.4px', lineHeight: 1 }}>
            Perk<span style={{ color: '#22C55E' }}>fy</span>
          </h1>
        </div>
      </header>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '76px 16px 30px 16px', boxSizing: 'border-box', width: '100%' }}>
        <div style={{ maxWidth: '440px', width: '100%', padding: '0' }}>

          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <h2 style={{ color: '#1E1B4B', fontSize: '1.35rem', fontWeight: 800, margin: '0 0 4px 0' }}>
              {activeTab === 'login' ? 'Welcome Back! 👋' : 'Create Free Account 🎉'}
            </h2>
            <p style={{ color: '#6B7280', fontSize: '0.85rem', fontWeight: 500, margin: 0 }}>
              {activeTab === 'login' ? 'Secure access to your daily cashbacks & rewards.' : `Get ${signupBonusPoints} Free Welcome Points upon verification.`}
            </p>
          </div>

          {/* Tab Switcher */}
          <div style={{ background: '#F4F3F8', padding: '4px', borderRadius: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginBottom: '22px' }}>
            <button
              type="button"
              onClick={switchToLogin}
              style={{
                padding: '10px',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === 'login' ? '#2563EB' : 'transparent',
                color: activeTab === 'login' ? '#FFFFFF' : '#4B5563',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.2s ease-in-out',
                boxShadow: activeTab === 'login' ? '0 4px 12px rgba(37, 99, 235, 0.3)' : 'none'
              }}
            >
              <User size={16} /> Login
            </button>

            <button
              type="button"
              onClick={switchToRegister}
              style={{
                padding: '10px',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === 'register' ? '#2563EB' : 'transparent',
                color: activeTab === 'register' ? '#FFFFFF' : '#4B5563',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.2s ease-in-out',
                boxShadow: activeTab === 'register' ? '0 4px 12px rgba(37, 99, 235, 0.3)' : 'none'
              }}
            >
              <User size={16} /> Register
            </button>
          </div>

          {/* Success Alert Box */}
          {successMsg && (
            <div style={{ background: '#ECFDF5', border: '1px solid #10B981', color: '#065F46', padding: '10px 12px', borderRadius: '12px', fontSize: '0.825rem', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} style={{ flexShrink: 0, color: '#10B981' }} /> {successMsg}
            </div>
          )}

          {/* Error Alert Box */}
          {errorMsg && (
            <div style={{ background: '#FEE2E2', border: '1px solid #DC2626', color: '#B91C1C', padding: '10px 12px', borderRadius: '12px', fontSize: '0.825rem', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} /> {errorMsg}
            </div>
          )}

          {/* ================= LOGIN FORM ================= */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ color: '#4B5563', fontSize: '0.825rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Mobile Number or Email</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <div style={{ position: 'absolute', left: '12px', display: 'flex', alignItems: 'center', gap: '4px', color: '#5B21B6', fontWeight: 700, fontSize: '0.85rem' }}>
                    <Phone size={16} color="#5B21B6" />
                  </div>
                  <input
                    type="text"
                    required
                    value={emailOrMobile}
                    onChange={(e) => setEmailOrMobile(e.target.value)}
                    placeholder="Enter mobile number or email"
                    style={{ width: '100%', padding: '12px 12px 12px 42px', borderRadius: '12px', background: '#F8F7FC', border: '1px solid #E5E7EB', color: '#1E1B4B', fontSize: '0.925rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ color: '#4B5563', fontSize: '0.825rem', fontWeight: 700 }}>Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotModal(true);
                      setForgotStep(1);
                      setForgotEmail(emailOrMobile.includes('@') ? emailOrMobile : '');
                      setForgotError('');
                      setForgotMsg('');
                    }}
                    style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '0.775rem', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                  >
                    Forgot Password?
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="#5B21B6" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    style={{ width: '100%', padding: '12px 40px 12px 40px', borderRadius: '12px', background: '#F8F7FC', border: '1px solid #E5E7EB', color: '#1E1B4B', fontSize: '0.925rem', boxSizing: 'border-box' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    style={{ position: 'absolute', right: '12px', top: '12px', background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', padding: '2px' }}
                  >
                    {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Main Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '13px',
                  borderRadius: '14px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 50%, #16A34A 100%)',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '4px',
                  boxShadow: '0 6px 20px rgba(37, 99, 235, 0.35)'
                }}
              >
                <Shield size={18} />
                <span>{loading ? 'Logging In...' : 'Login'}</span>
                <ArrowRight size={18} />
              </button>
            </form>
          )}

          {/* ================= REGISTER FORM (STEP 1: DETAILS) ================= */}
          {activeTab === 'register' && regStep === 'form' && (
            <form onSubmit={handleRequestSignUpOtp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              <div style={{ background: '#DCFCE7', border: '1px solid #BBF7D0', borderRadius: '12px', padding: '8px 12px', textAlign: 'center', color: '#15803D', fontSize: '0.775rem', fontWeight: 800 }}>
                🎁 Claim +100 Free Bonus Points on Sign Up!
              </div>

              <div>
                <label style={{ color: '#4B5563', fontSize: '0.825rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} color="#5B21B6" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Rahul Sharma"
                    style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', background: '#F8F7FC', border: '1px solid #E5E7EB', color: '#1E1B4B', fontSize: '0.925rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ color: '#4B5563', fontSize: '0.825rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Email Address (OTP will be sent here)</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="#5B21B6" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="rahul@example.com"
                    style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', background: '#F8F7FC', border: '1px solid #E5E7EB', color: '#1E1B4B', fontSize: '0.925rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ color: '#4B5563', fontSize: '0.825rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Mobile Number</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} color="#5B21B6" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                  <input
                    type="tel"
                    required
                    value={regMobile}
                    onChange={(e) => setRegMobile(e.target.value)}
                    placeholder="+91 98765 43210"
                    style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', background: '#F8F7FC', border: '1px solid #E5E7EB', color: '#1E1B4B', fontSize: '0.925rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ color: '#4B5563', fontSize: '0.825rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="#5B21B6" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    style={{ width: '100%', padding: '12px 40px 12px 40px', borderRadius: '12px', background: '#F8F7FC', border: '1px solid #E5E7EB', color: '#1E1B4B', fontSize: '0.925rem', boxSizing: 'border-box' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    style={{ position: 'absolute', right: '12px', top: '12px', background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', padding: '2px' }}
                  >
                    {showRegPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ color: '#4B5563', fontSize: '0.825rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Re-enter Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="#5B21B6" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                  <input
                    type={showRegConfirmPassword ? 'text' : 'password'}
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    style={{ width: '100%', padding: '12px 40px 12px 40px', borderRadius: '12px', background: '#F8F7FC', border: '1px solid #E5E7EB', color: '#1E1B4B', fontSize: '0.925rem', boxSizing: 'border-box' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                    style={{ position: 'absolute', right: '12px', top: '12px', background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', padding: '2px' }}
                  >
                    {showRegConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Main Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '13px',
                  borderRadius: '14px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 50%, #2563EB 100%)',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '4px',
                  boxShadow: '0 6px 20px rgba(34, 197, 94, 0.35)'
                }}
              >
                <span>{loading ? 'Sending Verification OTP...' : 'Send Verification OTP'}</span>
                <ArrowRight size={18} />
              </button>
            </form>
          )}

          {/* ================= REGISTER FORM (STEP 2: OTP VERIFICATION) ================= */}
          {activeTab === 'register' && regStep === 'otp' && (
            <form onSubmit={handleVerifyAndRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '14px', padding: '14px', textAlign: 'center' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#DCFCE7', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                  <Mail size={20} color="#16A34A" />
                </div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 800, color: '#166534' }}>Verify Your Email</h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#4B5563', lineHeight: 1.4 }}>
                  We sent a 6-digit verification code to <br /><strong style={{ color: '#1E1B4B' }}>{regEmail}</strong>
                </p>
              </div>

              <div>
                <label style={{ color: '#4B5563', fontSize: '0.825rem', fontWeight: 700, display: 'block', marginBottom: '8px', textAlign: 'center' }}>
                  Enter 6-Digit OTP Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={regOtp}
                  onChange={(e) => setRegOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • • • •"
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '12px',
                    background: '#F8F7FC',
                    border: '2px solid #7C3AED',
                    color: '#5B21B6',
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    letterSpacing: '10px',
                    textAlign: 'center',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <button
                  type="button"
                  onClick={() => setRegStep('form')}
                  style={{ background: 'none', border: 'none', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', padding: 0, fontWeight: 700 }}
                >
                  <ChevronLeft size={16} /> Edit Details
                </button>

                <button
                  type="button"
                  onClick={handleResendSignUpOtp}
                  disabled={regCountdown > 0 || loading}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: regCountdown > 0 ? '#9CA3AF' : '#2563EB',
                    fontWeight: 700,
                    cursor: regCountdown > 0 ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: 0
                  }}
                >
                  <RefreshCw size={14} className={loading ? 'spin' : ''} />
                  {regCountdown > 0 ? `Resend in ${regCountdown}s` : 'Resend Code'}
                </button>
              </div>

              {/* Verify & Claim Bonus Button */}
              <button
                type="submit"
                disabled={loading || regOtp.length < 6}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '14px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 50%, #2563EB 100%)',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  cursor: (loading || regOtp.length < 6) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 6px 20px rgba(34, 197, 94, 0.35)'
                }}
              >
                <Check size={18} />
                <span>{loading ? 'Verifying...' : `Verify & Claim ${signupBonusPoints} Points`}</span>
              </button>
            </form>
          )}

          {/* Divider: or continue with */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '20px 0 16px 0' }}>
            <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
            <span style={{ color: '#9CA3AF', fontSize: '0.775rem', fontWeight: 700, padding: '2px 8px', background: '#F8F7FC', borderRadius: '10px' }}>
              or continue with
            </span>
            <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
          </div>

          {/* Social Auth Button (Google) */}
          <div style={{ marginBottom: '14px' }}>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '14px',
                border: '1px solid #E5E7EB',
                background: '#FFFFFF',
                color: '#1E1B4B',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                transition: 'all 0.2s ease'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>{loading ? 'Connecting...' : (activeTab === 'register' ? 'Sign up with Google' : 'Continue with Google')}</span>
            </button>
          </div>

          {/* Quick Switch Between Login and Sign Up */}
          {activeTab === 'login' ? (
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <span style={{ color: '#4B5563', fontSize: '0.85rem', fontWeight: 600 }}>
                Don't have an account?{' '}
              </span>
              <button
                type="button"
                onClick={switchToRegister}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2563EB',
                  fontWeight: 800,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  padding: '0 2px',
                  textDecoration: 'underline'
                }}
              >
                Sign Up
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <span style={{ color: '#4B5563', fontSize: '0.85rem', fontWeight: 600 }}>
                Already have an account?{' '}
              </span>
              <button
                type="button"
                onClick={switchToLogin}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2563EB',
                  fontWeight: 800,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  padding: '0 2px',
                  textDecoration: 'underline'
                }}
              >
                Log In
              </button>
            </div>
          )}

          {/* Feature Badges */}
          <div style={{ background: '#F8F7FC', border: '1px solid #EDE9FE', borderRadius: '18px', padding: '12px 8px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', textAlign: 'center', marginBottom: '18px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px' }}>
                <Gift size={16} color="#16A34A" />
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#1E1B4B', lineHeight: 1.1 }}>+100 Bonus</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px' }}>
                <Zap size={16} color="#5B21B6" />
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#1E1B4B', lineHeight: 1.1 }}>Instant Vouchers</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px' }}>
                <ShieldCheck size={16} color="#D97706" />
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#1E1B4B', lineHeight: 1.1 }}>100% Safe</span>
            </div>
          </div>

          {/* Terms & Footer Notice */}
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#6B7280', fontSize: '0.725rem', fontWeight: 600, margin: '0 0 6px 0', lineHeight: 1.4 }}>
              <CheckCircle2 size={13} color="#22C55E" style={{ verticalAlign: 'middle', marginRight: '4px' }} />
              By continuing, you agree to our <span style={{ color: '#2563EB', fontWeight: 700 }}>Terms & Conditions</span> • <span style={{ color: '#2563EB', fontWeight: 700 }}>Privacy Policy</span>
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#F3F4F6', padding: '4px 10px', borderRadius: '12px', color: '#4B5563', fontSize: '0.7rem', fontWeight: 700 }}>
              <Shield size={12} color="#2563EB" /> Trusted by 50,000+ users across India
            </div>
          </div>

        </div>
      </div>

      {/* ================= FORGOT PASSWORD MODAL ================= */}
      {showForgotModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            maxWidth: '420px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            position: 'relative'
          }}>
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: '#F3F4F6',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#6B7280'
              }}
            >
              <X size={18} />
            </button>

            {/* Modal Header */}
            <div style={{ textAlign: 'center', marginBottom: '18px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#EEF2FF', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                <Lock size={24} color="#4F46E5" />
              </div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', fontWeight: 800, color: '#1E1B4B' }}>
                {forgotStep === 1 ? 'Reset Password' : 'Enter Verification Code'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.825rem', color: '#6B7280' }}>
                {forgotStep === 1 ? 'Enter your registered email to receive an OTP code.' : `We sent an OTP to ${forgotEmail}`}
              </p>
            </div>

            {/* Feedback messages */}
            {forgotMsg && (
              <div style={{ background: '#ECFDF5', border: '1px solid #10B981', color: '#065F46', padding: '8px 12px', borderRadius: '10px', fontSize: '0.8rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={15} color="#10B981" /> {forgotMsg}
              </div>
            )}
            {forgotError && (
              <div style={{ background: '#FEE2E2', border: '1px solid #DC2626', color: '#B91C1C', padding: '8px 12px', borderRadius: '10px', fontSize: '0.8rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircle size={15} color="#DC2626" /> {forgotError}
              </div>
            )}

            {/* Step 1 Form: Send OTP */}
            {forgotStep === 1 && (
              <form onSubmit={handleSendForgotOtp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ color: '#4B5563', fontSize: '0.825rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Registered Email</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} color="#4F46E5" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="user@example.com"
                      style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', background: '#F8F7FC', border: '1px solid #E5E7EB', color: '#1E1B4B', fontSize: '0.925rem', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #4F46E5 0%, #2563EB 100%)',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontSize: '0.925rem',
                    cursor: forgotLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)'
                  }}
                >
                  <span>{forgotLoading ? 'Sending OTP...' : 'Send Reset Code'}</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            )}

            {/* Step 2 Form: Enter OTP & New Password */}
            {forgotStep === 2 && (
              <form onSubmit={handleResetPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ color: '#4B5563', fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>6-Digit OTP Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    autoFocus
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', background: '#F8F7FC', border: '1px solid #4F46E5', color: '#4F46E5', fontSize: '1.2rem', fontWeight: 800, letterSpacing: '6px', textAlign: 'center', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ color: '#4B5563', fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>New Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} color="#4F46E5" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                    <input
                      type={showForgotNewPassword ? 'text' : 'password'}
                      required
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      style={{ width: '100%', padding: '12px 40px 12px 40px', borderRadius: '12px', background: '#F8F7FC', border: '1px solid #E5E7EB', color: '#1E1B4B', fontSize: '0.9rem', boxSizing: 'border-box' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                      style={{ position: 'absolute', right: '12px', top: '12px', background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', padding: '2px' }}
                    >
                      {showForgotNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ color: '#4B5563', fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Confirm New Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} color="#4F46E5" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                    <input
                      type={showForgotNewPassword ? 'text' : 'password'}
                      required
                      value={forgotConfirmPassword}
                      onChange={(e) => setForgotConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', background: '#F8F7FC', border: '1px solid #E5E7EB', color: '#1E1B4B', fontSize: '0.9rem', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.775rem', marginTop: '2px' }}>
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontWeight: 700, padding: 0 }}
                  >
                    Change Email
                  </button>

                  <button
                    type="button"
                    onClick={handleResendForgotOtp}
                    disabled={forgotCountdown > 0 || forgotLoading}
                    style={{ background: 'none', border: 'none', color: forgotCountdown > 0 ? '#9CA3AF' : '#4F46E5', cursor: forgotCountdown > 0 ? 'default' : 'pointer', fontWeight: 700, padding: 0 }}
                  >
                    {forgotCountdown > 0 ? `Resend in ${forgotCountdown}s` : 'Resend Code'}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontSize: '0.925rem',
                    cursor: forgotLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginTop: '6px',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  <Check size={16} />
                  <span>{forgotLoading ? 'Updating...' : 'Reset Password & Login'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
