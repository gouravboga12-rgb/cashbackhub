import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Coins,
  Gift,
  Clock,
  Plus,
  Edit2,
  CheckCircle,
  X,
  Trash2
} from 'lucide-react';
import { adminApi } from '../../api';

export default function AdminWallets() {
  const [activeTab, setActiveTab] = useState('wallets'); // 'wallets', 'withdrawals', 'vouchers'
  const [wallets, setWallets] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [adjustModal, setAdjustModal] = useState({ open: false, user: null, amount: '', type: 'credit', reason: '' });
  const [voucherModal, setVoucherModal] = useState({
    open: false,
    isEdit: false,
    id: null,
    name: '',
    provider: '',
    category: '',
    description: '',
    logo: '🎁',
    minimum_points: 1000,
    inventory_count: 100,
    denominations: '1000, 2000, 5000',
    status: 'active'
  });
  const [statusModal, setStatusModal] = useState({ open: false, withdrawal: null, status: 'Approved', admin_notes: '', voucher_code: '' });
  const [processing, setProcessing] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [wRes, wdRes, vRes] = await Promise.all([
        adminApi.get('/admin/wallets').catch(() => ({ data: { wallets: [] } })),
        adminApi.get('/admin/withdrawals').catch(() => ({ data: { withdrawals: [] } })),
        adminApi.get('/admin/vouchers').catch(() => ({ data: { vouchers: [] } }))
      ]);

      if (wRes.data?.success) {
        setWallets(wRes.data.wallets);
        setSummary(wRes.data.summary);
      }
      if (wdRes.data?.success) {
        setWithdrawals(wdRes.data.withdrawals);
      }
      if (vRes.data?.success) {
        setVouchers(vRes.data.vouchers);
      }
    } catch (err) {
      console.warn('Failed fetching wallet datasets');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Submit point adjustment
  const handlePointAdjustment = async (e) => {
    e.preventDefault();
    if (!adjustModal.user || !adjustModal.amount) return;
    try {
      setProcessing(true);
      const points = parseInt(adjustModal.amount, 10) * (adjustModal.type === 'debit' ? -1 : 1);
      const res = await adminApi.post('/admin/wallets/adjust', {
        user_id: adjustModal.user.user_id,
        amount: points,
        reason: adjustModal.reason
      });
      if (res.data?.success) {
        showToast(`Points adjusted successfully for ${adjustModal.user.name}`);
        setAdjustModal({ open: false, user: null, amount: '', type: 'credit', reason: '' });
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error adjusting points');
    } finally {
      setProcessing(false);
    }
  };

  // Submit withdrawal status update
  const handleWithdrawalStatusUpdate = async (e) => {
    e.preventDefault();
    if (!statusModal.withdrawal) return;
    try {
      setProcessing(true);
      const res = await adminApi.put(`/admin/withdrawals/${statusModal.withdrawal.id}/status`, {
        status: statusModal.status,
        admin_notes: statusModal.admin_notes,
        voucher_code: statusModal.voucher_code
      });
      if (res.data?.success) {
        showToast(`Withdrawal status updated to ${statusModal.status}`);
        setStatusModal({ open: false, withdrawal: null, status: 'Approved', admin_notes: '', voucher_code: '' });
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating status');
    } finally {
      setProcessing(false);
    }
  };

  // Save Voucher (Create or Update)
  const handleSaveVoucher = async (e) => {
    e.preventDefault();
    try {
      setProcessing(true);
      const payload = {
        name: voucherModal.name,
        provider: voucherModal.provider,
        category: voucherModal.category,
        description: voucherModal.description,
        logo: voucherModal.logo,
        minimum_points: parseInt(voucherModal.minimum_points, 10),
        inventory_count: parseInt(voucherModal.inventory_count, 10),
        denominations: voucherModal.denominations.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n)),
        status: voucherModal.status
      };

      if (voucherModal.isEdit) {
        await adminApi.put(`/admin/vouchers/${voucherModal.id}`, payload);
        showToast('Voucher updated successfully');
      } else {
        await adminApi.post('/admin/vouchers', payload);
        showToast('New voucher created successfully');
      }
      setVoucherModal({ open: false, isEdit: false, id: null, name: '', provider: '', category: '', description: '', logo: '🎁', minimum_points: 1000, inventory_count: 100, denominations: '1000, 2000, 5000', status: 'active' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving voucher');
    } finally {
      setProcessing(false);
    }
  };

  // Delete Voucher
  const handleDeleteVoucher = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from voucher catalog?`)) return;
    try {
      await adminApi.delete(`/admin/vouchers/${id}`);
      showToast('Voucher removed');
      fetchData();
    } catch (err) {
      alert('Error deleting voucher');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: '#059669',
          color: '#FFFFFF',
          padding: '12px 20px',
          borderRadius: '10px',
          fontWeight: 700,
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Summary KPI Pills */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px'
      }}>
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wallet size={22} color="#2563EB" />
          </div>
          <div>
            <div style={{ fontSize: '0.76rem', color: '#64748B', fontWeight: 700 }}>Total User Balances</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A' }}>
              {(summary?.total_balance_points || 0).toLocaleString()} pts
            </div>
          </div>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={22} color="#DC2626" />
          </div>
          <div>
            <div style={{ fontSize: '0.76rem', color: '#64748B', fontWeight: 700 }}>Pending Withdrawals</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#DC2626' }}>
              {withdrawals.filter(w => w.status === 'Pending').length} Requests
            </div>
          </div>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Gift size={22} color="#7C3AED" />
          </div>
          <div>
            <div style={{ fontSize: '0.76rem', color: '#64748B', fontWeight: 700 }}>Voucher Brands In Stock</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A' }}>
              {vouchers.length} Catalog Items
            </div>
          </div>
        </div>
      </div>

      {/* Main Container with Tabs */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        
        {/* Navigation Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '8px', background: '#F1F5F9', padding: '4px', borderRadius: '10px' }}>
            <button
              onClick={() => setActiveTab('wallets')}
              style={{
                background: activeTab === 'wallets' ? '#7C3AED' : 'transparent',
                border: 'none',
                color: activeTab === 'wallets' ? '#FFFFFF' : '#475569',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              User Wallets ({wallets.length})
            </button>
            <button
              onClick={() => setActiveTab('withdrawals')}
              style={{
                background: activeTab === 'withdrawals' ? '#7C3AED' : 'transparent',
                border: 'none',
                color: activeTab === 'withdrawals' ? '#FFFFFF' : '#475569',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>Withdrawals</span>
              {withdrawals.filter(w => w.status === 'Pending').length > 0 && (
                <span style={{ background: '#DC2626', color: '#FFFFFF', fontSize: '0.7rem', padding: '1px 6px', borderRadius: '10px', fontWeight: 800 }}>
                  {withdrawals.filter(w => w.status === 'Pending').length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('vouchers')}
              style={{
                background: activeTab === 'vouchers' ? '#7C3AED' : 'transparent',
                border: 'none',
                color: activeTab === 'vouchers' ? '#FFFFFF' : '#475569',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Voucher Inventory ({vouchers.length})
            </button>
          </div>

          {activeTab === 'vouchers' && (
            <button
              onClick={() => setVoucherModal({
                open: true,
                isEdit: false,
                id: null,
                name: '',
                provider: '',
                category: 'Shopping',
                description: '',
                logo: '🎁',
                minimum_points: 1000,
                inventory_count: 100,
                denominations: '1000, 2000, 5000',
                status: 'active'
              })}
              style={{
                background: 'linear-gradient(135deg, #7C3AED, #5B21B6)',
                border: 'none',
                color: '#FFFFFF',
                padding: '9px 16px',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.84rem',
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)'
              }}
            >
              <Plus size={16} />
              <span>Add New Voucher</span>
            </button>
          )}
        </div>

        {/* TAB 1: USER WALLETS */}
        {activeTab === 'wallets' && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left', color: '#64748B' }}>
                  <th style={{ padding: '14px', fontWeight: 700 }}>User Profile</th>
                  <th style={{ padding: '14px', fontWeight: 700 }}>Available Points</th>
                  <th style={{ padding: '14px', fontWeight: 700 }}>Rupee Value</th>
                  <th style={{ padding: '14px', fontWeight: 700 }}>Total Earned</th>
                  <th style={{ padding: '14px', fontWeight: 700 }}>Total Redeemed</th>
                  <th style={{ padding: '14px', fontWeight: 700 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {wallets.map((w, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#FFFFFF' }}>
                          {w.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#0F172A' }}>{w.name}</div>
                          <div style={{ fontSize: '0.74rem', color: '#64748B' }}>{w.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px', fontSize: '1rem', fontWeight: 800, color: '#059669' }}>
                      {w.available_points.toLocaleString()} pts
                    </td>
                    <td style={{ padding: '14px', fontWeight: 700, color: '#334155' }}>
                      ₹{w.rupee_value.toFixed(2)}
                    </td>
                    <td style={{ padding: '14px', color: '#64748B' }}>
                      {w.total_earned.toLocaleString()} pts
                    </td>
                    <td style={{ padding: '14px', color: '#64748B' }}>
                      {w.total_redeemed.toLocaleString()} pts
                    </td>
                    <td style={{ padding: '14px' }}>
                      <button
                        onClick={() => setAdjustModal({ open: true, user: w, amount: '', type: 'credit', reason: '' })}
                        style={{
                          background: '#F5F3FF',
                          border: '1px solid #DDD6FE',
                          color: '#6D28D9',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Edit2 size={13} />
                        <span>Adjust Balance</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: WITHDRAWALS QUEUE */}
        {activeTab === 'withdrawals' && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left', color: '#64748B' }}>
                  <th style={{ padding: '14px', fontWeight: 700 }}>Ref ID</th>
                  <th style={{ padding: '14px', fontWeight: 700 }}>User / Email</th>
                  <th style={{ padding: '14px', fontWeight: 700 }}>Voucher Requested</th>
                  <th style={{ padding: '14px', fontWeight: 700 }}>Points & Value</th>
                  <th style={{ padding: '14px', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '14px', fontWeight: 700 }}>Submitted</th>
                  <th style={{ padding: '14px', fontWeight: 700 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: '30px', textAlign: 'center', color: '#94A3B8' }}>No withdrawal requests found.</td></tr>
                ) : (
                  withdrawals.map((wd, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '14px', fontFamily: 'monospace', color: '#64748B', fontWeight: 600 }}>{wd.reference_id}</td>
                      <td style={{ padding: '14px' }}>
                        <div style={{ fontWeight: 700, color: '#0F172A' }}>{wd.user_name || 'User'}</div>
                        <div style={{ fontSize: '0.74rem', color: '#64748B' }}>{wd.user_details?.email}</div>
                      </td>
                      <td style={{ padding: '14px', color: '#0F172A', fontWeight: 600 }}>{wd.voucher_name}</td>
                      <td style={{ padding: '14px' }}>
                        <div style={{ fontWeight: 800, color: '#D97706' }}>{wd.points} pts</div>
                        <div style={{ fontSize: '0.74rem', color: '#64748B' }}>₹{wd.rupee_value}</div>
                      </td>
                      <td style={{ padding: '14px' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          background: wd.status === 'Fulfilled' ? '#ECFDF5' :
                                      wd.status === 'Approved' ? '#EFF6FF' :
                                      wd.status === 'Rejected' ? '#FEF2F2' : '#FFFBEB',
                          color: wd.status === 'Fulfilled' ? '#059669' :
                                 wd.status === 'Approved' ? '#2563EB' :
                                 wd.status === 'Rejected' ? '#DC2626' : '#D97706'
                        }}>
                          {wd.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px', color: '#64748B', fontSize: '0.78rem' }}>
                        {new Date(wd.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '14px' }}>
                        <button
                          onClick={() => setStatusModal({
                            open: true,
                            withdrawal: wd,
                            status: wd.status,
                            admin_notes: wd.admin_notes || '',
                            voucher_code: wd.voucher_code || ''
                          })}
                          style={{
                            background: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            color: '#0F172A',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '0.78rem',
                            fontWeight: 700
                          }}
                        >
                          Review & Process
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: VOUCHERS INVENTORY */}
        {activeTab === 'vouchers' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
            {vouchers.map((v, idx) => (
              <div
                key={idx}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '14px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ fontSize: '1.8rem' }}>{v.logo || '🎁'}</div>
                    <span style={{
                      padding: '3px 10px',
                      borderRadius: '10px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      background: v.status === 'active' ? '#ECFDF5' : '#FEF2F2',
                      color: v.status === 'active' ? '#059669' : '#DC2626'
                    }}>
                      {v.status}
                    </span>
                  </div>

                  <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>{v.name}</h4>
                  <p style={{ margin: '0 0 12px 0', fontSize: '0.76rem', color: '#64748B', lineHeight: 1.4 }}>{v.description}</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem', color: '#475569', marginBottom: '14px' }}>
                    <div>Category: <strong style={{ color: '#0F172A' }}>{v.category}</strong></div>
                    <div>Stock Inventory: <strong style={{ color: '#059669' }}>{v.inventory_count} Available</strong> (Used: {v.used_count || 0})</div>
                    <div>Min Points: <strong style={{ color: '#D97706' }}>{v.minimum_points} pts</strong></div>
                    <div>Denominations: <strong style={{ color: '#7C3AED' }}>{Array.isArray(v.denominations) ? v.denominations.join(', ') : '1000, 2000'} pts</strong></div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #E2E8F0', paddingTop: '12px' }}>
                  <button
                    onClick={() => setVoucherModal({
                      open: true,
                      isEdit: true,
                      id: v.id,
                      name: v.name,
                      provider: v.provider,
                      category: v.category || 'General',
                      description: v.description,
                      logo: v.logo || '🎁',
                      minimum_points: v.minimum_points,
                      inventory_count: v.inventory_count,
                      denominations: Array.isArray(v.denominations) ? v.denominations.join(', ') : '1000, 2000, 5000',
                      status: v.status
                    })}
                    style={{
                      flex: 1,
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      color: '#0F172A',
                      padding: '8px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <Edit2 size={14} /> Edit
                  </button>

                  <button
                    onClick={() => handleDeleteVoucher(v.id, v.name)}
                    style={{
                      background: '#FEF2F2',
                      border: '1px solid #FECACA',
                      color: '#DC2626',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* MODAL 1: ADJUST POINTS */}
      {adjustModal.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(3px)' }}>
          <div style={{ width: '100%', maxWidth: '440px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0F172A', fontWeight: 800 }}>Adjust User Points</h3>
              <button onClick={() => setAdjustModal({ ...adjustModal, open: false })} style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <p style={{ fontSize: '0.84rem', color: '#475569', marginBottom: '16px' }}>
              Target User: <strong style={{ color: '#7C3AED' }}>{adjustModal.user?.name}</strong> ({adjustModal.user?.email})
            </p>

            <form onSubmit={handlePointAdjustment} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#64748B', fontWeight: 700, marginBottom: '6px' }}>Adjustment Type</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setAdjustModal({ ...adjustModal, type: 'credit' })}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '8px',
                      border: 'none',
                      background: adjustModal.type === 'credit' ? '#059669' : '#F1F5F9',
                      color: adjustModal.type === 'credit' ? '#FFFFFF' : '#475569',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    + Credit Points
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustModal({ ...adjustModal, type: 'debit' })}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '8px',
                      border: 'none',
                      background: adjustModal.type === 'debit' ? '#DC2626' : '#F1F5F9',
                      color: adjustModal.type === 'debit' ? '#FFFFFF' : '#475569',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    - Debit Points
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#64748B', fontWeight: 700, marginBottom: '6px' }}>Points Amount</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustModal.amount}
                  onChange={(e) => setAdjustModal({ ...adjustModal, amount: e.target.value })}
                  placeholder="e.g. 500"
                  style={{ width: '100%', boxSizing: 'border-box', background: '#F8FAFC', border: '1px solid #CBD5E1', padding: '10px 14px', borderRadius: '8px', color: '#0F172A', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#64748B', fontWeight: 700, marginBottom: '6px' }}>Reason / Audit Note</label>
                <input
                  type="text"
                  required
                  value={adjustModal.reason}
                  onChange={(e) => setAdjustModal({ ...adjustModal, reason: e.target.value })}
                  placeholder="e.g. Promotional credit bonus"
                  style={{ width: '100%', boxSizing: 'border-box', background: '#F8FAFC', border: '1px solid #CBD5E1', padding: '10px 14px', borderRadius: '8px', color: '#0F172A', outline: 'none' }}
                />
              </div>

              <button
                type="submit"
                disabled={processing}
                style={{
                  marginTop: '8px',
                  background: '#7C3AED',
                  border: 'none',
                  color: '#FFFFFF',
                  padding: '12px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {processing ? 'Processing Adjustment...' : 'Apply Wallet Adjustment'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: REVIEW WITHDRAWAL */}
      {statusModal.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(3px)' }}>
          <div style={{ width: '100%', maxWidth: '480px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0F172A', fontWeight: 800 }}>Process Withdrawal Request</h3>
              <button onClick={() => setStatusModal({ ...statusModal, open: false })} style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '14px', borderRadius: '10px', fontSize: '0.84rem', color: '#475569', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div>Reference: <strong style={{ color: '#0F172A' }}>{statusModal.withdrawal?.reference_id}</strong></div>
              <div>Voucher: <strong style={{ color: '#059669' }}>{statusModal.withdrawal?.voucher_name} (₹{statusModal.withdrawal?.rupee_value})</strong></div>
              <div>Points: <strong style={{ color: '#D97706' }}>{statusModal.withdrawal?.points} pts</strong></div>
              <div>User Email: <strong style={{ color: '#0F172A' }}>{statusModal.withdrawal?.user_details?.email}</strong></div>
            </div>

            <form onSubmit={handleWithdrawalStatusUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#64748B', fontWeight: 700, marginBottom: '6px' }}>Update Status</label>
                <select
                  value={statusModal.status}
                  onChange={(e) => setStatusModal({ ...statusModal, status: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box', background: '#F8FAFC', border: '1px solid #CBD5E1', padding: '10px 14px', borderRadius: '8px', color: '#0F172A', outline: 'none' }}
                >
                  <option value="Pending">Pending Review</option>
                  <option value="Approved">Approved (In Batch Payout)</option>
                  <option value="Fulfilled">Fulfilled (Code Delivered)</option>
                  <option value="Rejected">Rejected (Refund Points to User)</option>
                </select>
              </div>

              {statusModal.status === 'Fulfilled' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#64748B', fontWeight: 700, marginBottom: '6px' }}>Gift Voucher Claim Code</label>
                  <input
                    type="text"
                    value={statusModal.voucher_code}
                    onChange={(e) => setStatusModal({ ...statusModal, voucher_code: e.target.value })}
                    placeholder="e.g. FLIP-8849-XXXX-2026"
                    style={{ width: '100%', boxSizing: 'border-box', background: '#F8FAFC', border: '1px solid #CBD5E1', padding: '10px 14px', borderRadius: '8px', color: '#0F172A', outline: 'none' }}
                  />
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#64748B', fontWeight: 700, marginBottom: '6px' }}>Admin Notes</label>
                <textarea
                  rows="3"
                  value={statusModal.admin_notes}
                  onChange={(e) => setStatusModal({ ...statusModal, admin_notes: e.target.value })}
                  placeholder="e.g. Voucher code delivered to user email."
                  style={{ width: '100%', boxSizing: 'border-box', background: '#F8FAFC', border: '1px solid #CBD5E1', padding: '10px 14px', borderRadius: '8px', color: '#0F172A', outline: 'none', resize: 'none' }}
                />
              </div>

              <button
                type="submit"
                disabled={processing}
                style={{
                  marginTop: '8px',
                  background: '#7C3AED',
                  border: 'none',
                  color: '#FFFFFF',
                  padding: '12px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {processing ? 'Updating...' : 'Save & Confirm Status'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD/EDIT VOUCHER */}
      {voucherModal.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(3px)' }}>
          <div style={{ width: '100%', maxWidth: '500px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '24px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0F172A', fontWeight: 800 }}>{voucherModal.isEdit ? 'Edit Gift Voucher' : 'Add New Gift Voucher'}</h3>
              <button onClick={() => setVoucherModal({ ...voucherModal, open: false })} style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSaveVoucher} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#64748B', fontWeight: 700, marginBottom: '4px' }}>Voucher Name</label>
                <input
                  type="text"
                  required
                  value={voucherModal.name}
                  onChange={(e) => setVoucherModal({ ...voucherModal, name: e.target.value })}
                  placeholder="e.g. Myntra Shopping Voucher"
                  style={{ width: '100%', boxSizing: 'border-box', background: '#F8FAFC', border: '1px solid #CBD5E1', padding: '10px 14px', borderRadius: '8px', color: '#0F172A', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#64748B', fontWeight: 700, marginBottom: '4px' }}>Provider</label>
                  <input
                    type="text"
                    required
                    value={voucherModal.provider}
                    onChange={(e) => setVoucherModal({ ...voucherModal, provider: e.target.value })}
                    placeholder="e.g. Myntra"
                    style={{ width: '100%', boxSizing: 'border-box', background: '#F8FAFC', border: '1px solid #CBD5E1', padding: '10px 14px', borderRadius: '8px', color: '#0F172A', outline: 'none' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#64748B', fontWeight: 700, marginBottom: '4px' }}>Category</label>
                  <input
                    type="text"
                    value={voucherModal.category}
                    onChange={(e) => setVoucherModal({ ...voucherModal, category: e.target.value })}
                    placeholder="e.g. Fashion & Lifestyle"
                    style={{ width: '100%', boxSizing: 'border-box', background: '#F8FAFC', border: '1px solid #CBD5E1', padding: '10px 14px', borderRadius: '8px', color: '#0F172A', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#64748B', fontWeight: 700, marginBottom: '4px' }}>Description</label>
                <textarea
                  rows="2"
                  value={voucherModal.description}
                  onChange={(e) => setVoucherModal({ ...voucherModal, description: e.target.value })}
                  placeholder="Redeem for trendy apparel on Myntra."
                  style={{ width: '100%', boxSizing: 'border-box', background: '#F8FAFC', border: '1px solid #CBD5E1', padding: '10px 14px', borderRadius: '8px', color: '#0F172A', outline: 'none', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#64748B', fontWeight: 700, marginBottom: '4px' }}>Stock Inventory Count</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={voucherModal.inventory_count}
                    onChange={(e) => setVoucherModal({ ...voucherModal, inventory_count: e.target.value })}
                    style={{ width: '100%', boxSizing: 'border-box', background: '#F8FAFC', border: '1px solid #CBD5E1', padding: '10px 14px', borderRadius: '8px', color: '#0F172A', outline: 'none' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#64748B', fontWeight: 700, marginBottom: '4px' }}>Min Points</label>
                  <input
                    type="number"
                    min="100"
                    required
                    value={voucherModal.minimum_points}
                    onChange={(e) => setVoucherModal({ ...voucherModal, minimum_points: e.target.value })}
                    style={{ width: '100%', boxSizing: 'border-box', background: '#F8FAFC', border: '1px solid #CBD5E1', padding: '10px 14px', borderRadius: '8px', color: '#0F172A', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#64748B', fontWeight: 700, marginBottom: '4px' }}>Denominations (comma-separated)</label>
                  <input
                    type="text"
                    value={voucherModal.denominations}
                    onChange={(e) => setVoucherModal({ ...voucherModal, denominations: e.target.value })}
                    placeholder="1000, 2000, 5000"
                    style={{ width: '100%', boxSizing: 'border-box', background: '#F8FAFC', border: '1px solid #CBD5E1', padding: '10px 14px', borderRadius: '8px', color: '#0F172A', outline: 'none' }}
                  />
                </div>
                <div style={{ width: '110px' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#64748B', fontWeight: 700, marginBottom: '4px' }}>Status</label>
                  <select
                    value={voucherModal.status}
                    onChange={(e) => setVoucherModal({ ...voucherModal, status: e.target.value })}
                    style={{ width: '100%', boxSizing: 'border-box', background: '#F8FAFC', border: '1px solid #CBD5E1', padding: '10px 8px', borderRadius: '8px', color: '#0F172A', outline: 'none' }}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={processing}
                style={{
                  marginTop: '10px',
                  background: '#7C3AED',
                  border: 'none',
                  color: '#FFFFFF',
                  padding: '12px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {processing ? 'Saving...' : (voucherModal.isEdit ? 'Update Voucher' : 'Create Voucher')}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
