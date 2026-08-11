import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api';
import { Gift, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [emailOrMobile, setEmailOrMobile] = useState('demo@cashbackhub.com');
  const [password, setPassword] = useState('Demo123!');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.post('/auth/login', { emailOrMobile, password });
      if (res.data.success) {
        localStorage.setItem('cashback_token', res.data.token);
        onLoginSuccess(res.data.user);
        navigate('/portal/dashboard');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#F4F3F8', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div className="card-white" style={{ maxWidth: '440px', width: '100%', padding: '40px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #5B21B6 0%, #22C55E 100%)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
            <Gift color="#FFF" size={32} />
          </div>
          <h2 style={{ color: '#1E1B4B', fontSize: '1.8rem', fontWeight: 800 }}>Welcome Back!</h2>
          <p style={{ color: '#6B7280', fontSize: '0.9rem', fontWeight: 500 }}>Sign in to continue earning daily rewards</p>
        </div>

        {errorMsg && (
          <div style={{ background: '#FEE2E2', border: '1px solid #DC2626', color: '#B91C1C', padding: '12px', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} /> {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ color: '#6B7280', fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Email or Mobile Number</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="#5B21B6" style={{ position: 'absolute', left: '14px', top: '14px' }} />
              <input
                type="text"
                required
                value={emailOrMobile}
                onChange={(e) => setEmailOrMobile(e.target.value)}
                placeholder="name@domain.com"
                style={{ width: '100%', padding: '12px 12px 12px 44px', borderRadius: '10px', background: '#F8F7FC', border: '1px solid #E5E7EB', color: '#1E1B4B', fontSize: '0.95rem' }}
              />
            </div>
          </div>

          <div>
            <label style={{ color: '#6B7280', fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="#5B21B6" style={{ position: 'absolute', left: '14px', top: '14px' }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', padding: '12px 12px 12px 44px', borderRadius: '10px', background: '#F8F7FC', border: '1px solid #E5E7EB', color: '#1E1B4B', fontSize: '0.95rem' }}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-green" style={{ width: '100%', padding: '14px', fontSize: '1rem', marginTop: '8px' }}>
            {loading ? 'Signing In...' : 'Sign In'} <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', color: '#6B7280', fontSize: '0.9rem' }}>
          Don't have an account? <Link to="/signup" style={{ color: '#22C55E', fontWeight: 800, textDecoration: 'none' }}>Sign Up</Link>
        </div>

      </div>
    </div>
  );
}
