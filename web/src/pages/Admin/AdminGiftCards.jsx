import React, { useState, useEffect } from 'react';
import {
  Gift,
  Search,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Send,
  Upload,
  Image as ImageIcon,
  FileText,
  Copy,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Coins,
  Check,
  AlertCircle
} from 'lucide-react';
import { adminApi } from '../../api';

export default function AdminGiftCards() {
  const [giftCards, setGiftCards] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [processing, setProcessing] = useState(false);

  // Fulfillment Modal State
  const [fulfillModal, setFulfillModal] = useState({
    open: false,
    request: null,
    card_number: '',
    pin: '',
    expiry_date: '',
    instructions: '',
    voucher_image_url: '',
    admin_notes: '',
    fileName: ''
  });

  // Rejection Modal State
  const [rejectModal, setRejectModal] = useState({
    open: false,
    request: null,
    reason: ''
  });

  // View Details Modal
  const [viewModal, setViewModal] = useState({
    open: false,
    request: null
  });

  useEffect(() => {
    fetchGiftCards();
  }, [activeTab]);

  const fetchGiftCards = async () => {
    try {
      setLoading(true);
      const params = {};
      if (activeTab !== 'ALL') params.status = activeTab;
      if (searchQuery.trim()) params.q = searchQuery.trim();

      const res = await adminApi.get('/admin/gift-cards', { params });
      if (res.data && res.data.success) {
        setGiftCards(res.data.gift_cards || []);
        setStats(res.data.stats || null);
      }
    } catch (err) {
      console.warn('Error fetching gift card requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleOpenFulfill = (req) => {
    setFulfillModal({
      open: true,
      request: req,
      card_number: req.fulfillment?.card_number || '',
      pin: req.fulfillment?.pin || '',
      expiry_date: req.fulfillment?.expiry_date || '',
      instructions: req.fulfillment?.instructions || `Apply this voucher code in the ${req.voucher_name} app or checkout page.`,
      voucher_image_url: req.fulfillment?.voucher_image_url || '',
      admin_notes: req.admin_notes || '',
      fileName: ''
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit. Please upload a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFulfillModal(prev => ({
        ...prev,
        voucher_image_url: reader.result,
        fileName: file.name
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitFulfillment = async (e) => {
    e.preventDefault();
    if (!fulfillModal.request || !fulfillModal.card_number.trim()) {
      alert('Please provide the Gift Card / Voucher Code.');
      return;
    }

    try {
      setProcessing(true);
      const res = await adminApi.put(`/admin/gift-cards/${fulfillModal.request.id}/fulfill`, {
        card_number: fulfillModal.card_number,
        pin: fulfillModal.pin,
        expiry_date: fulfillModal.expiry_date,
        instructions: fulfillModal.instructions,
        voucher_image_url: fulfillModal.voucher_image_url,
        admin_notes: fulfillModal.admin_notes
      });

      if (res.data?.success) {
        showToast(`🎉 Gift Card fulfilled and delivered for ${fulfillModal.request.user_name}!`);
        setFulfillModal({ open: false, request: null, card_number: '', pin: '', expiry_date: '', instructions: '', voucher_image_url: '', admin_notes: '', fileName: '' });
        fetchGiftCards();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error fulfilling gift card');
    } finally {
      setProcessing(false);
    }
  };

  const handleOpenReject = (req) => {
    setRejectModal({
      open: true,
      request: req,
      reason: 'Request cancelled upon admin audit. Points refunded.'
    });
  };

  const handleSubmitRejection = async (e) => {
    e.preventDefault();
    if (!rejectModal.request) return;

    try {
      setProcessing(true);
      const res = await adminApi.put(`/admin/gift-cards/${rejectModal.request.id}/reject`, {
        reason: rejectModal.reason,
        admin_notes: rejectModal.reason
      });

      if (res.data?.success) {
        showToast(`Request rejected and +${rejectModal.request.points} points refunded to user wallet.`);
        setRejectModal({ open: false, request: null, reason: '' });
        fetchGiftCards();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error rejecting request');
    } finally {
      setProcessing(false);
    }
  };

  const filtered = giftCards.filter(item => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (item.reference_id && item.reference_id.toLowerCase().includes(q)) ||
      (item.user_name && item.user_name.toLowerCase().includes(q)) ||
      (item.user_email && item.user_email.toLowerCase().includes(q)) ||
      (item.voucher_name && item.voucher_name.toLowerCase().includes(q))
    );
  });

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
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div
        className="admin-banner-flex"
        style={{
          background: 'linear-gradient(135deg, #4338CA 0%, #6366F1 100%)',
          borderRadius: '16px',
          padding: '24px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 8px 24px rgba(67, 56, 202, 0.2)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <Gift size={26} color="#FFFFFF" />
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
              Gift Card Withdrawal & Delivery Management
            </h2>
          </div>
          <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.86rem' }}>
            Review customer gift card withdrawal requests, fulfill with voucher codes, PINs, and upload voucher image vouchers.
          </p>
        </div>

        <button
          onClick={fetchGiftCards}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.35)',
            color: '#FFFFFF',
            padding: '10px 18px',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '0.84rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <RefreshCw size={15} /> Refresh List
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div style={{ background: '#FFFFFF', padding: '18px 20px', borderRadius: '14px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={22} color="#D97706" />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700 }}>Pending Fulfillment</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#D97706' }}>
              {stats?.pending_count || giftCards.filter(g => g.status === 'Pending').length}
            </div>
          </div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '18px 20px', borderRadius: '14px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={22} color="#059669" />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700 }}>Delivered to Users</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#059669' }}>
              {stats?.fulfilled_count || giftCards.filter(g => g.status === 'Fulfilled').length}
            </div>
          </div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '18px 20px', borderRadius: '14px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Coins size={22} color="#7C3AED" />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700 }}>Total Value Disbursed</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#7C3AED' }}>
              ₹{(stats?.total_rupees_fulfilled || 0).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div
        className="admin-card-container"
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}
      >
        {/* Controls / Filter Bar */}
        <div className="admin-filter-stack" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
          
          {/* Tabs */}
          <div className="admin-tabs-scroll" style={{ display: 'flex', gap: '6px', background: '#F1F5F9', padding: '4px', borderRadius: '10px' }}>
            {['ALL', 'Pending', 'Fulfilled', 'Rejected'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: activeTab === tab ? '#4338CA' : 'transparent',
                  border: 'none',
                  color: activeTab === tab ? '#FFFFFF' : '#475569',
                  padding: '7px 14px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {tab === 'ALL' ? 'All Requests' : tab}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, user, or brand..."
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '10px',
                padding: '9px 14px 9px 38px',
                fontSize: '0.84rem',
                outline: 'none',
                width: '240px'
              }}
            />
          </div>
        </div>

        {/* Requests Table */}
        <div className="admin-table-container" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left', color: '#64748B' }}>
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>Request ID & Date</th>
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>Customer</th>
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>Gift Card Brand</th>
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>Amount (₹ / Pts)</th>
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>Status</th>
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>Fulfillment Details</th>
                <th style={{ padding: '12px 14px', fontWeight: 700, textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>
                    {loading ? 'Loading gift card requests...' : 'No gift card withdrawal requests found matching criteria.'}
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => {
                  const isPending = item.status === 'Pending' || item.status === 'Approved';
                  const isFulfilled = item.status === 'Fulfilled';
                  const isRejected = item.status === 'Rejected';

                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      
                      {/* ID & Date */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 800, color: '#0F172A', fontFamily: 'monospace' }}>
                          {item.reference_id || item.id}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                          {new Date(item.created_at).toLocaleDateString()} {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* Customer */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 700, color: '#0F172A' }}>{item.user_name}</div>
                        <div style={{ fontSize: '0.74rem', color: '#64748B' }}>{item.user_email}</div>
                        {item.user_mobile && item.user_mobile !== 'N/A' && (
                          <div style={{ fontSize: '0.72rem', color: '#4338CA', fontWeight: 600 }}>📞 {item.user_mobile}</div>
                        )}
                      </td>

                      {/* Gift Card Brand */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '1.2rem' }}>{item.voucher_logo || '🎁'}</span>
                          <span style={{ fontWeight: 700, color: '#1E293B' }}>{item.voucher_name}</span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 800, color: '#059669', fontSize: '0.95rem' }}>
                          ₹{item.rupee_value || (item.points / 10)}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                          -{item.points} Points
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '12px 14px' }}>
                        {isFulfilled && (
                          <span style={{ padding: '4px 10px', borderRadius: '12px', background: '#ECFDF5', color: '#059669', fontSize: '0.76rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle size={13} /> Fulfilled
                          </span>
                        )}
                        {isPending && (
                          <span style={{ padding: '4px 10px', borderRadius: '12px', background: '#FEF3C7', color: '#D97706', fontSize: '0.76rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={13} /> Pending Review
                          </span>
                        )}
                        {isRejected && (
                          <span style={{ padding: '4px 10px', borderRadius: '12px', background: '#FEF2F2', color: '#DC2626', fontSize: '0.76rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <XCircle size={13} /> Rejected (Refunded)
                          </span>
                        )}
                      </td>

                      {/* Fulfillment Details */}
                      <td style={{ padding: '12px 14px' }}>
                        {item.fulfillment?.card_number ? (
                          <div>
                            <div style={{ fontFamily: 'monospace', fontWeight: 700, color: '#4338CA', fontSize: '0.82rem' }}>
                              Code: {item.fulfillment.card_number}
                            </div>
                            {item.fulfillment.pin && (
                              <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                                PIN: {item.fulfillment.pin}
                              </div>
                            )}
                            {item.fulfillment.voucher_image_url && (
                              <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700 }}>
                                📎 Attachment Attached
                              </span>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: '#94A3B8', fontSize: '0.78rem' }}>Awaiting fulfillment</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                          {isPending ? (
                            <>
                              <button
                                onClick={() => handleOpenFulfill(item)}
                                style={{
                                  background: 'linear-gradient(135deg, #4338CA 0%, #6366F1 100%)',
                                  border: 'none',
                                  color: '#FFFFFF',
                                  padding: '7px 14px',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  fontSize: '0.8rem',
                                  fontWeight: 700,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <Send size={13} /> Fulfill
                              </button>
                              <button
                                onClick={() => handleOpenReject(item)}
                                style={{
                                  background: '#FEF2F2',
                                  border: '1px solid #FECACA',
                                  color: '#DC2626',
                                  padding: '7px 10px',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  fontSize: '0.8rem',
                                  fontWeight: 700
                                }}
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setViewModal({ open: true, request: item })}
                              style={{
                                background: '#F8FAFC',
                                border: '1px solid #CBD5E1',
                                color: '#1E293B',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <Eye size={13} /> View
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FULFILLMENT MODAL */}
      {fulfillModal.open && fulfillModal.request && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            maxWidth: '560px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Gift size={22} color="#4338CA" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                    Fulfill Gift Card Request
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                    {fulfillModal.request.reference_id} • {fulfillModal.request.voucher_name}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setFulfillModal({ open: false, request: null, card_number: '', pin: '', expiry_date: '', instructions: '', voucher_image_url: '', admin_notes: '', fileName: '' })}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                ✕
              </button>
            </div>

            {/* Request Summary Box */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '14px 16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <div style={{ fontSize: '0.76rem', color: '#64748B', fontWeight: 600 }}>Customer Name & Email</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A' }}>{fulfillModal.request.user_name}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{fulfillModal.request.user_email}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.76rem', color: '#64748B', fontWeight: 600 }}>Voucher Face Value</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#059669' }}>
                  ₹{fulfillModal.request.rupee_value || (fulfillModal.request.points / 10)}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748B' }}>{fulfillModal.request.points} Points</div>
              </div>
            </div>

            <form onSubmit={handleSubmitFulfillment} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Gift Card Number / Code */}
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#1E293B', marginBottom: '6px' }}>
                  Gift Card / Voucher Code <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PHNP-8923-1102-4412 or AMZN-VOUCH-789"
                  value={fulfillModal.card_number}
                  onChange={(e) => setFulfillModal({ ...fulfillModal, card_number: e.target.value })}
                  style={{
                    width: '100%',
                    background: '#F8FAFC',
                    border: '1.5px solid #CBD5E1',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    fontFamily: 'monospace',
                    color: '#0F172A',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* PIN and Expiry Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#1E293B', marginBottom: '6px' }}>
                    Card PIN / Secret (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 4819"
                    value={fulfillModal.pin}
                    onChange={(e) => setFulfillModal({ ...fulfillModal, pin: e.target.value })}
                    style={{
                      width: '100%',
                      background: '#F8FAFC',
                      border: '1.5px solid #CBD5E1',
                      borderRadius: '10px',
                      padding: '10px 14px',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#1E293B', marginBottom: '6px' }}>
                    Expiry Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={fulfillModal.expiry_date}
                    onChange={(e) => setFulfillModal({ ...fulfillModal, expiry_date: e.target.value })}
                    style={{
                      width: '100%',
                      background: '#F8FAFC',
                      border: '1.5px solid #CBD5E1',
                      borderRadius: '10px',
                      padding: '10px 14px',
                      fontSize: '0.88rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Redemption Instructions */}
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#1E293B', marginBottom: '6px' }}>
                  Redemption Steps / How to Use
                </label>
                <textarea
                  rows={2}
                  value={fulfillModal.instructions}
                  onChange={(e) => setFulfillModal({ ...fulfillModal, instructions: e.target.value })}
                  placeholder="Instructions for the user on where and how to redeem this voucher."
                  style={{
                    width: '100%',
                    background: '#F8FAFC',
                    border: '1.5px solid #CBD5E1',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    fontSize: '0.84rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Upload Voucher Image / File */}
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#1E293B', marginBottom: '6px' }}>
                  Upload Voucher Image / Barcode (Optional)
                </label>
                <div style={{
                  border: '2px dashed #CBD5E1',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center',
                  background: '#F8FAFC',
                  position: 'relative'
                }}>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      opacity: 0,
                      cursor: 'pointer',
                      width: '100%',
                      height: '100%'
                    }}
                  />
                  {fulfillModal.voucher_image_url ? (
                    <div>
                      <img
                        src={fulfillModal.voucher_image_url}
                        alt="Voucher Preview"
                        style={{ maxHeight: '120px', borderRadius: '8px', marginBottom: '8px' }}
                      />
                      <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 700 }}>
                        ✓ Voucher image uploaded ({fulfillModal.fileName || 'Image File'}) - Click to change
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Upload size={24} color="#6366F1" style={{ margin: '0 auto 6px auto' }} />
                      <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1E293B' }}>
                        Click to upload Gift Card image or barcode
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                        Supports PNG, JPG, JPEG (Max 5MB)
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setFulfillModal({ open: false, request: null, card_number: '', pin: '', expiry_date: '', instructions: '', voucher_image_url: '', admin_notes: '', fileName: '' })}
                  style={{
                    flex: 1,
                    background: '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    color: '#475569',
                    padding: '12px',
                    borderRadius: '10px',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={processing}
                  style={{
                    flex: 2,
                    background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                    border: 'none',
                    color: '#FFFFFF',
                    padding: '12px',
                    borderRadius: '10px',
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    cursor: processing ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(5, 150, 105, 0.3)'
                  }}
                >
                  <Send size={16} />
                  <span>{processing ? 'Fulfilling...' : 'Fulfill & Send to Customer'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* REJECTION MODAL */}
      {rejectModal.open && rejectModal.request && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            maxWidth: '460px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertCircle size={22} color="#DC2626" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                  Reject & Refund Request
                </h3>
                <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                  {rejectModal.request.reference_id}
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.84rem', color: '#475569', marginBottom: '16px' }}>
              Rejecting this request will automatically refund <strong>+{rejectModal.request.points} Points</strong> back to <strong>{rejectModal.request.user_name}</strong>'s wallet immediately.
            </p>

            <form onSubmit={handleSubmitRejection}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#1E293B', marginBottom: '6px' }}>
                Reason for Rejection
              </label>
              <textarea
                rows={3}
                required
                value={rejectModal.reason}
                onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
                style={{
                  width: '100%',
                  background: '#F8FAFC',
                  border: '1.5px solid #CBD5E1',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  fontSize: '0.84rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  marginBottom: '18px'
                }}
              />

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setRejectModal({ open: false, request: null, reason: '' })}
                  style={{
                    flex: 1,
                    background: '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    color: '#475569',
                    padding: '10px',
                    borderRadius: '10px',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  style={{
                    flex: 1,
                    background: '#DC2626',
                    border: 'none',
                    color: '#FFFFFF',
                    padding: '10px',
                    borderRadius: '10px',
                    fontSize: '0.84rem',
                    fontWeight: 800,
                    cursor: processing ? 'not-allowed' : 'pointer'
                  }}
                >
                  {processing ? 'Processing...' : 'Confirm Rejection & Refund'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {viewModal.open && viewModal.request && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            maxWidth: '520px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle size={22} color="#059669" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                    Delivered Gift Card Details
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                    {viewModal.request.reference_id} • {viewModal.request.voucher_name}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setViewModal({ open: false, request: null })}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.76rem', color: '#64748B', fontWeight: 700 }}>VOUCHER CODE</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#4338CA', fontFamily: 'monospace', margin: '4px 0' }}>
                  {viewModal.request.fulfillment?.card_number || 'N/A'}
                </div>
                {viewModal.request.fulfillment?.pin && (
                  <div style={{ fontSize: '0.84rem', color: '#1E293B', fontWeight: 700 }}>
                    PIN / Secret: <span style={{ fontFamily: 'monospace' }}>{viewModal.request.fulfillment.pin}</span>
                  </div>
                )}
                {viewModal.request.fulfillment?.expiry_date && (
                  <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '4px' }}>
                    Expires: {viewModal.request.fulfillment.expiry_date}
                  </div>
                )}
              </div>

              {viewModal.request.fulfillment?.instructions && (
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700, marginBottom: '4px' }}>REDEMPTION INSTRUCTIONS</div>
                  <div style={{ fontSize: '0.84rem', color: '#1E293B', background: '#F1F5F9', padding: '10px 12px', borderRadius: '8px' }}>
                    {viewModal.request.fulfillment.instructions}
                  </div>
                </div>
              )}

              {viewModal.request.fulfillment?.voucher_image_url && (
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700, marginBottom: '6px' }}>VOUCHER ATTACHMENT</div>
                  <img
                    src={viewModal.request.fulfillment.voucher_image_url}
                    alt="Delivered Voucher"
                    style={{ width: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC' }}
                  />
                  <div style={{ marginTop: '8px' }}>
                    <a
                      href={viewModal.request.fulfillment.voucher_image_url}
                      download={`voucher_${viewModal.request.reference_id}.png`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: '#4338CA',
                        color: '#FFFFFF',
                        padding: '8px 14px',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        textDecoration: 'none'
                      }}
                    >
                      Download Voucher Image
                    </a>
                  </div>
                </div>
              )}

              <button
                onClick={() => setViewModal({ open: false, request: null })}
                style={{
                  background: '#0F172A',
                  border: 'none',
                  color: '#FFFFFF',
                  padding: '12px',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  marginTop: '10px'
                }}
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
