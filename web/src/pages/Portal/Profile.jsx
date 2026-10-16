import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import ReferModal from '../../components/ReferModal';
import {
  User,
  Mail,
  Phone,
  Lock,
  LogOut,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Edit3,
  Clock,
  Wallet,
  HelpCircle,
  Users,
  Eye,
  EyeOff,
  RefreshCw,
  Save,
  X,
  Info,
  MessageSquare,
  FileText,
  Shield,
  Trash2
} from 'lucide-react';

export default function Profile({ user, refreshWallet, onLogout }) {
  const navigate = useNavigate();
  
  // Modals & Collapsible states
  const [showReferModal, setShowReferModal] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [passMsg, setPassMsg] = useState('');
  const [passError, setPassError] = useState('');

  // Edit Profile State
  const [editName, setEditName] = useState(user?.name || '');
  const [editMobile, setEditMobile] = useState(user?.mobile || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');

  // Delete Account State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Handle Password Change API Call
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassMsg('');

    if (!currentPassword || !newPassword) {
      setPassError('Please fill in both current and new password.');
      return;
    }

    if (newPassword.length < 6) {
      setPassError('New password must be at least 6 characters long.');
      return;
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      setPassError('New passwords do not match. Please verify.');
      return;
    }

    setPassLoading(true);

    try {
      const res = await api.post('/auth/change-password', {
        currentPassword,
        newPassword
      });

      if (res.data && res.data.success) {
        setPassMsg(res.data.message || 'Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          setPassMsg('');
          setShowPasswordForm(false);
        }, 2500);
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setPassError(err.response.data.message);
      } else {
        setPassError('Failed to change password. Please check your current password.');
      }
    } finally {
      setPassLoading(false);
    }
  };

  // Handle Edit Profile Update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileMsg('');

    if (!editName.trim()) {
      setProfileError('Name cannot be empty.');
      return;
    }

    setProfileLoading(true);

    try {
      const res = await api.put('/auth/profile', {
        name: editName.trim(),
        mobile: editMobile.trim()
      });

      if (res.data && res.data.success) {
        setProfileMsg('Profile updated successfully!');
        const updatedUser = {
          ...user,
          ...res.data.user
        };
        localStorage.setItem('cashback_user', JSON.stringify(updatedUser));
        setTimeout(() => {
          setProfileMsg('');
          setShowEditProfile(false);
          window.location.reload();
        }, 1200);
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setProfileError(err.response.data.message);
      } else {
        setProfileError('Failed to update profile. Please try again.');
      }
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle Self Account Deletion
  const handleDeleteAccount = async () => {
    if (deleteConfirmText.trim() !== 'DELETE') {
      setDeleteError('Please type DELETE in capital letters to confirm.');
      return;
    }
    setDeleteLoading(true);
    setDeleteError('');
    try {
      const res = await api.delete('/users/self');
      if (res.data && res.data.success) {
        setShowDeleteModal(false);
        alert('Your account and all associated personal data have been permanently deleted.');
        if (onLogout) {
          onLogout();
        } else {
          localStorage.clear();
          window.location.href = '/login';
        }
      } else {
        setDeleteError(res.data?.message || 'Failed to delete account.');
      }
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete account. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '720px', margin: '0 auto' }}>
      
      {/* User Header Card */}
      <div className="card-violet-banner" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <img
          src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
          alt="Profile"
          style={{ width: '72px', height: '72px', borderRadius: '50%', border: '3px solid #4ADE80', objectFit: 'cover', background: '#FFF', flexShrink: 0 }}
        />
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '4px', color: '#FFFFFF' }}>{user?.name || 'User Name'}</h2>
          <p style={{ opacity: 0.9, fontSize: '0.9rem', margin: 0, color: '#E0E7FF' }}>{user?.email || 'user@email.com'}</p>
          <p style={{ opacity: 0.9, fontSize: '0.85rem', marginTop: '3px', color: '#C7D2FE' }}>
            {user?.mobile ? user.mobile : 'No phone number linked'}
          </p>
        </div>
      </div>

      {/* Menu Item Cards */}
      <div className="card-white" style={{ padding: '8px 20px', display: 'flex', flexDirection: 'column' }}>
        
        {/* Refer & Earn (+100 Pts) */}
        <div
          onClick={() => setShowReferModal(true)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #F3F4F6', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Users size={20} color="#16A34A" />
            <div>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: '#1E1B4B' }}>Refer & Earn</span>
              <span style={{ marginLeft: '8px', background: '#DCFCE7', color: '#16A34A', fontSize: '0.725rem', fontWeight: 800, padding: '2px 8px', borderRadius: '10px' }}>+100 Pts</span>
            </div>
          </div>
          <ChevronRight size={20} color="#9CA3AF" />
        </div>

        {/* Edit Profile Accordion */}
        <div
          onClick={() => setShowEditProfile(!showEditProfile)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #F3F4F6', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Edit3 size={20} color="#5B21B6" />
            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#1E1B4B' }}>Edit Profile</span>
          </div>
          <ChevronRight size={20} color="#9CA3AF" style={{ transform: showEditProfile ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s ease' }} />
        </div>

        {/* Edit Profile Form */}
        {showEditProfile && (
          <div style={{ padding: '16px', background: '#F8F7FC', borderRadius: '12px', marginBottom: '12px', border: '1px solid #EDE9FE' }}>
            {profileMsg && (
              <div style={{ color: '#065F46', background: '#D1FAE5', border: '1px solid #A7F3D0', padding: '10px 14px', borderRadius: '8px', fontSize: '0.84rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={16} color="#059669" /> {profileMsg}
              </div>
            )}
            {profileError && (
              <div style={{ color: '#991B1B', background: '#FEE2E2', border: '1px solid #FECACA', padding: '10px 14px', borderRadius: '8px', fontSize: '0.84rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} color="#DC2626" /> {profileError}
              </div>
            )}
            <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#6B7280', fontWeight: 700, marginBottom: '4px' }}>Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Your Full Name"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#6B7280', fontWeight: 700, marginBottom: '4px' }}>Mobile / Phone Number</label>
                <input
                  type="tel"
                  value={editMobile}
                  onChange={(e) => setEditMobile(e.target.value)}
                  placeholder="e.g. 7337401590"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <button
                type="submit"
                disabled={profileLoading}
                className="btn-green"
                style={{
                  alignSelf: 'flex-start',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: 700,
                  cursor: profileLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {profileLoading ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                <span>{profileLoading ? 'Saving...' : 'Save Profile'}</span>
              </button>
            </form>
          </div>
        )}

        {/* Change Password Accordion Header */}
        <div
          onClick={() => setShowPasswordForm(!showPasswordForm)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #F3F4F6', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Lock size={20} color="#5B21B6" />
            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#1E1B4B' }}>Change Password</span>
          </div>
          <ChevronRight size={20} color="#9CA3AF" style={{ transform: showPasswordForm ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s ease' }} />
        </div>

        {/* Change Password Collapsible Form */}
        {showPasswordForm && (
          <div style={{ padding: '16px', background: '#F8F7FC', borderRadius: '12px', marginBottom: '12px', border: '1px solid #EDE9FE' }}>
            
            {passMsg && (
              <div style={{ color: '#065F46', background: '#D1FAE5', border: '1px solid #A7F3D0', padding: '10px 14px', borderRadius: '8px', fontSize: '0.84rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={16} color="#059669" /> {passMsg}
              </div>
            )}

            {passError && (
              <div style={{ color: '#991B1B', background: '#FEE2E2', border: '1px solid #FECACA', padding: '10px 14px', borderRadius: '8px', fontSize: '0.84rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} color="#DC2626" /> {passError}
              </div>
            )}

            <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              {/* Current Password Field */}
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#6B7280', fontWeight: 700, marginBottom: '4px' }}>Current Password</label>
                <input
                  type={showCurrentPass ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px 38px 10px 14px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '0.9rem', outline: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  style={{ position: 'absolute', right: '12px', top: '28px', background: 'transparent', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}
                >
                  {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* New Password Field */}
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#6B7280', fontWeight: 700, marginBottom: '4px' }}>New Password (min 6 characters)</label>
                <input
                  type={showNewPass ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px 38px 10px 14px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '0.9rem', outline: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  style={{ position: 'absolute', right: '12px', top: '28px', background: 'transparent', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}
                >
                  {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Confirm New Password Field */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#6B7280', fontWeight: 700, marginBottom: '4px' }}>Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <button
                type="submit"
                disabled={passLoading}
                className="btn-green"
                style={{
                  alignSelf: 'flex-start',
                  padding: '10px 22px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: 700,
                  cursor: passLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {passLoading ? <RefreshCw size={16} className="animate-spin" /> : <Lock size={16} />}
                <span>{passLoading ? 'Updating Password...' : 'Update Password'}</span>
              </button>
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

        {/* Help & Support / Contact Us */}
        <div
          onClick={() => navigate('/contact-us')}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #F3F4F6', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <HelpCircle size={20} color="#5B21B6" />
            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#1E1B4B' }}>Help & Support</span>
          </div>
          <ChevronRight size={20} color="#9CA3AF" />
        </div>

        {/* About Us */}
        <div
          onClick={() => navigate('/about-us')}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #F3F4F6', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Info size={20} color="#5B21B6" />
            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#1E1B4B' }}>About Us</span>
          </div>
          <ChevronRight size={20} color="#9CA3AF" />
        </div>

        {/* Contact Us */}
        <div
          onClick={() => navigate('/contact-us')}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #F3F4F6', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <MessageSquare size={20} color="#5B21B6" />
            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#1E1B4B' }}>Contact Us</span>
          </div>
          <ChevronRight size={20} color="#9CA3AF" />
        </div>

        {/* Terms & Conditions */}
        <div
          onClick={() => navigate('/terms-and-conditions')}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #F3F4F6', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <FileText size={20} color="#5B21B6" />
            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#1E1B4B' }}>Terms & Conditions</span>
          </div>
          <ChevronRight size={20} color="#9CA3AF" />
        </div>

        {/* Privacy Policy */}
        <div
          onClick={() => navigate('/privacy-policy')}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #F3F4F6', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Shield size={20} color="#5B21B6" />
            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#1E1B4B' }}>Privacy Policy</span>
          </div>
          <ChevronRight size={20} color="#9CA3AF" />
        </div>

        {/* Logout */}
        <div
          onClick={onLogout}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #F3F4F6', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <LogOut size={20} color="#64748B" />
            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#64748B' }}>Logout</span>
          </div>
          <ChevronRight size={20} color="#9CA3AF" />
        </div>

        {/* Delete Account */}
        <div
          onClick={() => {
            setDeleteConfirmText('');
            setDeleteError('');
            setShowDeleteModal(true);
          }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Trash2 size={20} color="#DC2626" />
            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#DC2626' }}>Delete Account</span>
          </div>
          <ChevronRight size={20} color="#9CA3AF" />
        </div>

      </div>

      {/* REFER & EARN MODAL POPUP */}
      {showReferModal && (
        <ReferModal
          user={user}
          onClose={() => setShowReferModal(false)}
          refreshWallet={refreshWallet}
        />
      )}

      {/* DELETE ACCOUNT CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '24px',
            maxWidth: '440px',
            width: '100%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={22} color="#DC2626" />
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#DC2626' }}>Delete Account</h3>
              </div>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ color: '#4B5563', fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 14px 0' }}>
              This action is permanent and cannot be undone. All your earned points, rewards, vouchers, and game history will be permanently deleted.
            </p>

            <p style={{ color: '#1E1B4B', fontSize: '0.9rem', fontWeight: 700, margin: '0 0 8px 0' }}>
              To confirm deletion, please type <span style={{ color: '#DC2626', fontWeight: 900 }}>DELETE</span> in capital letters below:
            </p>

            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value.toUpperCase())}
              placeholder="Type DELETE"
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '12px',
                border: '1.5px solid #FCA5A5',
                backgroundColor: '#FEF2F2',
                color: '#DC2626',
                fontWeight: 700,
                fontSize: '1rem',
                letterSpacing: '2px',
                marginBottom: '10px',
                boxSizing: 'border-box'
              }}
            />

            {deleteError && (
              <p style={{ color: '#DC2626', fontSize: '0.85rem', fontWeight: 600, margin: '0 0 12px 0' }}>
                {deleteError}
              </p>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  background: '#F1F5F9',
                  color: '#475569',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText.trim() !== 'DELETE' || deleteLoading}
                style={{
                  flex: 1.4,
                  padding: '12px',
                  borderRadius: '12px',
                  background: deleteConfirmText.trim() === 'DELETE' ? '#DC2626' : '#CBD5E1',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  border: 'none',
                  cursor: deleteConfirmText.trim() === 'DELETE' ? 'pointer' : 'not-allowed',
                  transition: 'background 0.2s ease'
                }}
              >
                {deleteLoading ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
