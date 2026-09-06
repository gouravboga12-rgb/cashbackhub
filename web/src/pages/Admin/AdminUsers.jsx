import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api';
import { formatISTDate, formatISTDateTime } from '../../utils/dateUtils';
import {
  Users,
  Search,
  Trash2,
  AlertTriangle,
  Phone,
  Mail,
  Wallet,
  Calendar,
  ShieldAlert,
  CheckCircle,
  Copy,
  Check,
  RefreshCw,
  X,
  UserCheck
} from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [authFilter, setAuthFilter] = useState('all'); // all | google | email | has_phone
  const [copiedId, setCopiedId] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Sticky Confirmation Modal State
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    user: null,
    deleting: false
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.get('/admin/users');
      if (res.data?.success) {
        setUsers(res.data.users || []);
      }
    } catch (err) {
      console.warn('Error fetching admin users dataset');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  const handleCopy = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(''), 2000);
  };

  // Open Sticky Confirmation Modal
  const openDeleteConfirmation = (user) => {
    if (!user.is_deletable) {
      alert('Super Administrator accounts cannot be deleted.');
      return;
    }
    setDeleteModal({
      open: true,
      user,
      deleting: false
    });
  };

  // Execute User Account Deletion
  const confirmDeleteUser = async () => {
    if (!deleteModal.user) return;
    setDeleteModal(prev => ({ ...prev, deleting: true }));

    try {
      const res = await adminApi.delete(`/admin/users/${deleteModal.user.id}`);
      if (res.data?.success) {
        showToast(`Customer account for ${deleteModal.user.name} (${deleteModal.user.email}) was permanently deleted.`);
        setDeleteModal({ open: false, user: null, deleting: false });
        fetchUsers();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete customer account. Please try again.');
      setDeleteModal(prev => ({ ...prev, deleting: false }));
    }
  };

  // Filtered users
  const filteredUsers = users.filter(user => {
    // Exclude Super Admin from normal customer list view, but allow searching if needed
    const matchesSearch =
      (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.mobile && user.mobile.includes(searchQuery));

    if (!matchesSearch) return false;

    if (authFilter === 'google') return user.auth_provider === 'google';
    if (authFilter === 'email') return user.auth_provider !== 'google';
    if (authFilter === 'has_phone') return Boolean(user.mobile);

    return true;
  });

  const totalCustomers = users.filter(u => u.role !== 'admin');
  const phoneVerifiedCount = users.filter(u => Boolean(u.mobile) && u.role !== 'admin').length;
  const googleAccountsCount = users.filter(u => u.auth_provider === 'google').length;
  const totalBalancePoints = users.reduce((sum, u) => sum + (u.available_points || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          background: '#065F46',
          color: '#FFFFFF',
          padding: '14px 20px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          zIndex: 1100,
          fontWeight: 600,
          fontSize: '0.88rem'
        }}>
          <CheckCircle size={18} color="#34D399" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Customer Accounts</h2>
          <p style={{ fontSize: '0.84rem', color: '#64748B', margin: '4px 0 0 0' }}>
            Manage registered customers, view email & phone details, and remove inactive or spam accounts.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            padding: '9px 16px',
            borderRadius: '10px',
            color: '#475569',
            fontSize: '0.84rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div
        className="admin-kpi-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px'
        }}
      >
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={22} color="#7C3AED" />
          </div>
          <div>
            <div style={{ fontSize: '0.76rem', color: '#64748B', fontWeight: 700 }}>Total Customers</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A' }}>
              {totalCustomers.length} Users
            </div>
          </div>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Phone size={22} color="#2563EB" />
          </div>
          <div>
            <div style={{ fontSize: '0.76rem', color: '#64748B', fontWeight: 700 }}>Phone Numbers Linked</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A' }}>
              {phoneVerifiedCount} Verified
            </div>
          </div>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserCheck size={22} color="#D97706" />
          </div>
          <div>
            <div style={{ fontSize: '0.76rem', color: '#64748B', fontWeight: 700 }}>Google Sign-In Accounts</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A' }}>
              {googleAccountsCount} Profiles
            </div>
          </div>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wallet size={22} color="#059669" />
          </div>
          <div>
            <div style={{ fontSize: '0.76rem', color: '#64748B', fontWeight: 700 }}>Total User Balances</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A' }}>
              {totalBalancePoints.toLocaleString()} pts
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div
        className="admin-card-container"
        style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
      >
        
        {/* Search & Filter Controls */}
        <div
          className="admin-filter-stack"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}
        >
          
          {/* Search Bar */}
          <div style={{ position: 'relative', flex: 1, minWidth: '260px', maxWidth: '420px' }}>
            <Search size={17} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by name, email, or phone number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '10px 14px 10px 38px',
                borderRadius: '10px',
                border: '1px solid #CBD5E1',
                fontSize: '0.84rem',
                outline: 'none',
                background: '#F8FAFC',
                color: '#0F172A'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="admin-tabs-scroll" style={{ display: 'flex', gap: '8px', background: '#F1F5F9', padding: '4px', borderRadius: '10px' }}>
            <button
              onClick={() => setAuthFilter('all')}
              style={{
                background: authFilter === 'all' ? '#7C3AED' : 'transparent',
                border: 'none',
                color: authFilter === 'all' ? '#FFFFFF' : '#475569',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              All Users ({users.length})
            </button>
            <button
              onClick={() => setAuthFilter('has_phone')}
              style={{
                background: authFilter === 'has_phone' ? '#7C3AED' : 'transparent',
                border: 'none',
                color: authFilter === 'has_phone' ? '#FFFFFF' : '#475569',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              With Phone
            </button>
            <button
              onClick={() => setAuthFilter('google')}
              style={{
                background: authFilter === 'google' ? '#7C3AED' : 'transparent',
                border: 'none',
                color: authFilter === 'google' ? '#FFFFFF' : '#475569',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              Google OAuth
            </button>
          </div>
        </div>

        {/* Customer Table */}
        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: '#64748B' }}>
            <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 12px auto', color: '#7C3AED' }} />
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Loading customer accounts...</div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ padding: '50px 0', textAlign: 'center', color: '#94A3B8' }}>
            <Users size={36} style={{ margin: '0 auto 10px auto', opacity: 0.5 }} />
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#475569' }}>No customer accounts match your search</div>
            <p style={{ fontSize: '0.8rem', margin: '4px 0 0 0' }}>Try searching with a different name, email, or phone number.</p>
          </div>
        ) : (
          <div className="admin-table-container" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '760px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #F1F5F9', color: '#64748B', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '12px 16px' }}>Customer Profile</th>
                  <th style={{ padding: '12px 16px' }}>Email Address</th>
                  <th style={{ padding: '12px 16px' }}>Phone Number</th>
                  <th style={{ padding: '12px 16px' }}>Auth Method</th>
                  <th style={{ padding: '12px 16px' }}>Wallet Balance</th>
                  <th style={{ padding: '12px 16px' }}>Registered Date</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const isSuperAdmin = !user.is_deletable;
                  const dateStr = formatISTDate(user.created_at);
                  const fullDateTooltip = formatISTDateTime(user.created_at, true);

                  return (
                    <tr
                      key={user.id}
                      style={{
                        borderBottom: '1px solid #F1F5F9',
                        transition: 'background 0.15s ease',
                        background: isSuperAdmin ? '#F8FAFC' : 'transparent'
                      }}
                    >
                      {/* Name & Avatar */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img
                            src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                            alt={user.name}
                            style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #E2E8F0', flexShrink: 0 }}
                          />
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>{user.name || 'User'}</span>
                              {isSuperAdmin && (
                                <span style={{ fontSize: '0.65rem', background: '#F5F3FF', color: '#7C3AED', padding: '2px 6px', borderRadius: '6px', fontWeight: 800 }}>ADMIN</span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                              ID: {user.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Mail size={14} color="#64748B" />
                          <span style={{ fontSize: '0.84rem', color: '#334155', fontWeight: 600 }}>{user.email}</span>
                          <button
                            onClick={() => handleCopy(user.email, `email_${user.id}`)}
                            title="Copy Email"
                            style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '2px', display: 'flex' }}
                          >
                            {copiedId === `email_${user.id}` ? <Check size={13} color="#10B981" /> : <Copy size={13} />}
                          </button>
                        </div>
                      </td>

                      {/* Phone Number */}
                      <td style={{ padding: '14px 16px' }}>
                        {user.mobile ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Phone size={14} color="#059669" />
                            <span style={{ fontSize: '0.84rem', color: '#0F172A', fontWeight: 700 }}>{user.mobile}</span>
                            <button
                              onClick={() => handleCopy(user.mobile, `phone_${user.id}`)}
                              title="Copy Phone"
                              style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '2px', display: 'flex' }}
                            >
                              {copiedId === `phone_${user.id}` ? <Check size={13} color="#10B981" /> : <Copy size={13} />}
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.74rem', color: '#94A3B8', fontStyle: 'italic', background: '#F1F5F9', padding: '3px 8px', borderRadius: '6px' }}>
                            Not Provided
                          </span>
                        )}
                      </td>

                      {/* Auth Provider */}
                      <td style={{ padding: '14px 16px' }}>
                        {user.auth_provider === 'google' ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.74rem', fontWeight: 700, color: '#2563EB', background: '#EFF6FF', padding: '3px 8px', borderRadius: '6px' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24">
                              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                            </svg>
                            Google
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#475569', background: '#F1F5F9', padding: '3px 8px', borderRadius: '6px' }}>
                            Email & Password
                          </span>
                        )}
                      </td>

                      {/* Points / Balance */}
                      <td style={{ padding: '14px 16px' }}>
                        <div>
                          <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0F172A' }}>
                            {(user.available_points || 0).toLocaleString()} pts
                          </span>
                          <span style={{ fontSize: '0.74rem', color: '#059669', marginLeft: '6px', fontWeight: 600 }}>
                            (₹{user.rupee_value})
                          </span>
                        </div>
                      </td>

                      {/* Date */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', color: '#64748B' }} title={fullDateTooltip}>
                          <Calendar size={13} />
                          <span>{dateStr}</span>
                        </div>
                      </td>

                      {/* Action (Delete User) */}
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        {isSuperAdmin ? (
                          <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600 }}>Protected</span>
                        ) : (
                          <button
                            onClick={() => openDeleteConfirmation(user)}
                            title={`Delete customer account for ${user.name}`}
                            style={{
                              background: '#FEE2E2',
                              border: '1px solid #FECACA',
                              color: '#DC2626',
                              padding: '7px 12px',
                              borderRadius: '8px',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <Trash2 size={14} />
                            <span>Delete User</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* STICKY SCREEN CONFIRMATION MODAL (Stick to Screen) */}
      {/* ========================================================================= */}
      {deleteModal.open && deleteModal.user && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          zIndex: 1200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div
            className="admin-modal-box"
            style={{
              width: '100%',
              maxWidth: '460px',
              background: '#FFFFFF',
              borderRadius: '20px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
              overflow: 'hidden',
              border: '1px solid #E2E8F0',
              animation: 'modalSlideIn 0.2s ease-out'
            }}
          >
            
            {/* Modal Header Icon */}
            <div style={{ background: '#FEF2F2', padding: '24px 24px 16px 24px', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <AlertTriangle size={26} color="#DC2626" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#991B1B' }}>
                  Delete Customer Account?
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#7F1D1D' }}>
                  This action is permanent and cannot be undone.
                </p>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px 24px' }}>
              <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.5, margin: 0 }}>
                Are you sure you want to permanently delete the following customer account?
              </p>

              {/* User Summary Box */}
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '14px', marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span style={{ color: '#64748B', fontWeight: 600 }}>Customer Name:</span>
                  <strong style={{ color: '#0F172A' }}>{deleteModal.user.name || 'User'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span style={{ color: '#64748B', fontWeight: 600 }}>Email Address:</span>
                  <strong style={{ color: '#0F172A' }}>{deleteModal.user.email}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span style={{ color: '#64748B', fontWeight: 600 }}>Phone Number:</span>
                  <strong style={{ color: '#0F172A' }}>{deleteModal.user.mobile || 'Not provided'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span style={{ color: '#64748B', fontWeight: 600 }}>Wallet Balance:</span>
                  <strong style={{ color: '#DC2626' }}>{(deleteModal.user.available_points || 0).toLocaleString()} pts (₹{deleteModal.user.rupee_value})</strong>
                </div>
              </div>

              <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '10px', padding: '10px 12px', marginTop: '14px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <ShieldAlert size={18} color="#D97706" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '0.76rem', color: '#92400E', lineHeight: 1.4 }}>
                  All associated reward points, wallet transactions, daily attendance, and spin history for this user will also be erased.
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ background: '#F8FAFC', padding: '16px 24px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setDeleteModal({ open: false, user: null, deleting: false })}
                disabled={deleteModal.deleting}
                style={{
                  padding: '10px 18px',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  background: '#FFFFFF',
                  color: '#475569',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDeleteUser}
                disabled={deleteModal.deleting}
                style={{
                  padding: '10px 20px',
                  borderRadius: '10px',
                  border: 'none',
                  background: deleteModal.deleting ? '#94A3B8' : '#DC2626',
                  color: '#FFFFFF',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: deleteModal.deleting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.25)',
                  transition: 'all 0.15s ease'
                }}
              >
                {deleteModal.deleting ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    <span>Deleting User...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={15} />
                    <span>Yes, Delete Account</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
