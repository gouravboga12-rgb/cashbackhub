import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, LogOut, CheckCircle, ChevronRight, Edit3, Clock, Wallet, HelpCircle } from 'lucide-react';

export default function Profile({ user, onLogout }) {
  const navigate = useNavigate();
  const [passMsg, setPassMsg] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const handlePasswordChange = (e) => {
    e.preventDefault();
    setPassMsg('Password updated successfully!');
    setTimeout(() => {
      setPassMsg('');
      setShowPasswordForm(false);
    }, 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '720px', margin: '0 auto' }}>
      
      {/* User Header Card (Exact UI Reference Layout) */}
      <div className="card-violet-banner" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <img
          src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
          alt="Profile"
          style={{ width: '72px', height: '72px', borderRadius: '50%', border: '3px solid #4ADE80', objectFit: 'cover', background: '#FFF' }}
        />
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '4px' }}>{user?.name || 'User Name'}</h2>
          <p style={{ opacity: 0.9, fontSize: '0.9rem', margin: 0 }}>{user?.email || 'user@email.com'}</p>
          <p style={{ opacity: 0.9, fontSize: '0.85rem', marginTop: '2px' }}>{user?.mobile || '+91 98765 43210'}</p>
        </div>
      </div>

      {/* Menu Item Cards */}
      <div className="card-white" style={{ padding: '8px 20px', display: 'flex', flexDirection: 'column' }}>
        
        {/* Edit Profile */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #F3F4F6', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Edit3 size={20} color="#5B21B6" />
            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#1E1B4B' }}>Edit Profile</span>
          </div>
          <ChevronRight size={20} color="#9CA3AF" />
        </div>

        {/* Change Password */}
        <div
          onClick={() => setShowPasswordForm(!showPasswordForm)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #F3F4F6', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Lock size={20} color="#5B21B6" />
            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#1E1B4B' }}>Change Password</span>
          </div>
          <ChevronRight size={20} color="#9CA3AF" />
        </div>

        {/* Change Password Collapsible Form */}
        {showPasswordForm && (
          <div style={{ padding: '16px 0', borderBottom: '1px solid #F3F4F6', background: '#F8F7FC', borderRadius: '12px', paddingLeft: '16px', paddingRight: '16px', marginBottom: '8px' }}>
            {passMsg && (
              <div style={{ color: '#16A34A', fontSize: '0.85rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={16} /> {passMsg}
              </div>
            )}
            <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input type="password" required placeholder="Current Password" style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '0.9rem' }} />
              <input type="password" required placeholder="New Password" style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '0.9rem' }} />
              <button type="submit" className="btn-green" style={{ alignSelf: 'flex-start' }}>Update</button>
            </form>
          </div>
        )}

        {/* My Withdrawals */}
        <div
          onClick={() => navigate('/portal/my-withdrawals')}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #F3F4F6', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Clock size={20} color="#5B21B6" />
            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#1E1B4B' }}>My Withdrawals</span>
          </div>
          <ChevronRight size={20} color="#9CA3AF" />
        </div>

        {/* Transaction History */}
        <div
          onClick={() => navigate('/portal/wallet')}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #F3F4F6', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Wallet size={20} color="#5B21B6" />
            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#1E1B4B' }}>Transaction History</span>
          </div>
          <ChevronRight size={20} color="#9CA3AF" />
        </div>

        {/* Help & Support */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #F3F4F6', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <HelpCircle size={20} color="#5B21B6" />
            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#1E1B4B' }}>Help & Support</span>
          </div>
          <ChevronRight size={20} color="#9CA3AF" />
        </div>

        {/* Logout */}
        <div
          onClick={onLogout}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <LogOut size={20} color="#DC2626" />
            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#DC2626' }}>Logout</span>
          </div>
          <ChevronRight size={20} color="#9CA3AF" />
        </div>

      </div>

    </div>
  );
}
