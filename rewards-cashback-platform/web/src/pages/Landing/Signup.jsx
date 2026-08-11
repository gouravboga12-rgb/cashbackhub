import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api';
import { Gift, Lock, Mail, User, Phone, ArrowRight, AlertCircle } from 'lucide-react';

export default function Signup({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.post('/auth/register', { name, email, mobile, password });
      if (res.data.success) {
        localStorage.setItem('cashback_token', res.data.token);
        onLoginSuccess(res.data.user);
        navigate('/portal/dashboard');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#0E0B1F', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div className="glass-card-dark" style={{ maxWidth: '460px', width: '100%', padding: '40px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #7C3AED 0%, #22C55E 100%)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
            <Gift color="#FFF" size={32} />
          </div>
          <h2 style={{ color: '#FFF', fontSize: '1.8rem', fontWeight: 800 }}>Create Account</h2>
          <p style={{ color: '#4ADE80', fontSize: '0.9rem', fontWeight: 700 }}>🎁 Claim 100 Instant Bonus Points on Sign Up!</p>
        </div>

        {errorMsg && (
          <div style={{ background: 'rgba(220, 38, 38, 0.2)', border: '1px solid #DC2626', color: '#FCA5A5', padding: '12px', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} /> {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ color: '#C4B5FD', fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={18} color="#A78BFA" style={{ position: 'absolute', left: '14px', top: '14px' }} />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rahul Sharma"
                style={{ width: '100%', padding: '12px 12px 12px 44px', borderRadius: '10px', background: '#1E1445', border: '1px solid #3B2F6B', color: '#FFF', fontSize: '0.95rem' }}
              />
            </div>
          </div>

          <div>
            <label style={{ color: '#C4B5FD', fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="#A78BFA" style={{ position: 'absolute', left: '14px', top: '14px' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rahul@domain.com"
                style={{ width: '100%', padding: '12px 12px 12px 44px', borderRadius: '10px', background: '#1E1445', border: '1px solid #3B2F6B', color: '#FFF', fontSize: '0.95rem' }}
              />
            </div>
          </div>

          <div>
            <label style={{ color: '#C4B5FD', fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Mobile Number</label>
            <div style={{ position: 'relative' }}>
              <Phone size={18} color="#A78BFA" style={{ position: 'absolute', left: '14px', top: '14px' }} />
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="+91 9876543210"
                style={{ width: '100%', padding: '12px 12px 12px 44px', borderRadius: '10px', background: '#1E1445', border: '1px solid #3B2F6B', color: '#FFF', fontSize: '0.95rem' }}
              />
            </div>
          </div>

          <div>
            <label style={{ color: '#C4B5FD', fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="#A78BFA" style={{ position: 'absolute', left: '14px', top: '14px' }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                style={{ width: '100%', padding: '12px 12px 12px 44px', borderRadius: '10px', background: '#1E1445', border: '1px solid #3B2F6B', color: '#FFF', fontSize: '0.95rem' }}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-green" style={{ width: '100%', padding: '14px', fontSize: '1rem', marginTop: '8px' }}>
            {loading ? 'Creating Account...' : 'Get 100 Bonus Points'} <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', color: '#C4B5FD', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login" style={{ color: '#4ADE80', fontWeight: 700, textDecoration: 'none' }}>Sign In</Link>
        </div>

      </div>
    </div>
  );
}
