import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { adminApi } from '../../api';

export default function AdminAuthGuard({ children }) {
  const [checking, setChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    verifyAdminSession();
  }, [location.pathname]);

  const verifyAdminSession = async () => {
    const token = localStorage.getItem('cashback_admin_token');
    if (!token) {
      setIsAuthenticated(false);
      setChecking(false);
      return;
    }

    try {
      const res = await adminApi.get('/admin/auth/me');
      if (res.data && res.data.success && res.data.admin?.role === 'admin') {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (err) {
      // Fallback verification against local admin user if offline
      const localAdmin = localStorage.getItem('cashback_admin_user');
      if (localAdmin) {
        try {
          const parsed = JSON.parse(localAdmin);
          if (parsed.role === 'admin') {
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
          }
        } catch (e) {
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    }
    setChecking(false);
  };

  if (checking) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0F172A',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#E2E8F0',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{
          width: '44px',
          height: '44px',
          border: '4px solid #334155',
          borderTopColor: '#8B5CF6',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          marginBottom: '16px'
        }} />
        <p style={{ fontWeight: 600, letterSpacing: '0.05em' }}>Authenticating Admin Portal...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}
