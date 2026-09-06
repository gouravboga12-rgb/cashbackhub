import React, { useState, useEffect } from 'react';
import api from '../../api';
import BrandLogo from '../../components/BrandLogo';
import { Clock, RefreshCw, Copy, Check, Eye, Download, AlertCircle, CheckCircle2, Gift, X, ExternalLink } from 'lucide-react';

export default function MyWithdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const res = await api.get('/withdraw/history');
      if (res.data && res.data.success && Array.isArray(res.data.withdrawals)) {
        setWithdrawals(res.data.withdrawals);
        setLoading(false);
        return;
      }
    } catch (err) {
      console.warn('Backend withdrawal history API offline, loading local storage history.');
    }

    const saved = localStorage.getItem('cashback_withdrawals');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setWithdrawals(parsed);
          setLoading(false);
          return;
        }
      } catch (e) {}
    }

    setWithdrawals([]);
    setLoading(false);
  };

  const copyToClipboard = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const filtered = withdrawals.filter((w) => {
    if (activeTab === 'Pending') return w.status === 'Pending';
    if (activeTab === 'Fulfilled') return w.status === 'Fulfilled';
    if (activeTab === 'Rejected') return w.status === 'Rejected';
    return true;
  });

  const getStatusBadge = (status) => {
    if (status === 'Fulfilled') {
      return (
        <span style={{ background: '#DCFCE7', color: '#166534', padding: '5px 12px', borderRadius: '12px', fontWeight: 800, fontSize: '0.775rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <CheckCircle2 size={13} /> Ready / Fulfilled
        </span>
      );
    }
    if (status === 'Rejected') {
      return (
        <span style={{ background: '#FEE2E2', color: '#991B1B', padding: '5px 12px', borderRadius: '12px', fontWeight: 800, fontSize: '0.775rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <AlertCircle size={13} /> Rejected (Refunded)
        </span>
      );
    }
    return (
      <span style={{ background: '#FEF3C7', color: '#92400E', padding: '5px 12px', borderRadius: '12px', fontWeight: 800, fontSize: '0.775rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        <Clock size={13} /> Processing by Admin
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '1000px', margin: '0 auto', width: '100%', paddingBottom: '90px', boxSizing: 'border-box' }}>
      
      {/* Header Banner */}
      <div className="card-violet-banner" style={{ padding: '22px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', borderRadius: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Gift size={24} color="#4ADE80" /> My Gift Cards & Withdrawals
          </h2>
          <p style={{ opacity: 0.9, fontSize: '0.825rem', margin: '4px 0 0 0', color: '#E9D5FF' }}>
            Access fulfilled digital voucher codes, PINs, and downloaded cards
          </p>
        </div>
        <button
          onClick={fetchWithdrawals}
          disabled={loading}
          style={{
            background: '#FFFFFF',
            color: '#5B21B6',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '14px',
            cursor: 'pointer',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.85rem'
          }}
        >
          <RefreshCw size={15} className={loading ? 'spin' : ''} /> Refresh
        </button>
      </div>

      {/* FILTER TABS */}
      <div className="no-scrollbar" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '2px', width: '100%' }}>
        {['ALL', 'Pending', 'Fulfilled', 'Rejected'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '7px 16px',
              borderRadius: '18px',
              border: '1px solid #E5E7EB',
              background: activeTab === tab ? '#5B21B6' : '#FFFFFF',
              color: activeTab === tab ? '#FFFFFF' : '#4B5563',
              fontWeight: 800,
              fontSize: '0.825rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* WITHDRAWAL CARDS / LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
        {filtered.length === 0 ? (
          <div className="card-white" style={{ padding: '48px 20px', textAlign: 'center', color: '#6B7280', borderRadius: '18px' }}>
            <Gift size={40} color="#D1D5DB" style={{ margin: '0 auto 12px auto' }} />
            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#1E1B4B' }}>No withdrawal requests found</div>
            <div style={{ fontSize: '0.825rem', marginTop: '4px' }}>Your gift card redemptions will appear here with full card codes once fulfilled.</div>
          </div>
        ) : (
          filtered.map((item) => {
            const isFulfilled = item.status === 'Fulfilled';
            const f = item.fulfillment || {};

            return (
              <div
                key={item.id}
                className="card-white"
                style={{
                  padding: '18px 20px',
                  borderRadius: '18px',
                  border: isFulfilled ? '1.5px solid #86EFAC' : '1px solid #E5E7EB',
                  background: isFulfilled ? '#FAFFFD' : '#FFFFFF',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  boxSizing: 'border-box'
                }}
              >
                {/* Top Request Summary Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <BrandLogo brandName={item.voucher_name} size={44} />
                    <div>
                      <h4 style={{ color: '#1E1B4B', fontSize: '1.05rem', fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
                        {item.voucher_name}
                      </h4>
                      <div style={{ color: '#6B7280', fontSize: '0.75rem', marginTop: '2px' }}>
                        Ref: <span style={{ fontFamily: 'monospace', color: '#5B21B6', fontWeight: 800 }}>{item.reference_id || item.id}</span> • {new Date(item.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#16A34A', fontSize: '1.25rem', fontWeight: 800 }}>
                        ₹{item.rupee_value || (item.points ? item.points / 10 : 0)}
                      </div>
                      <div style={{ color: '#DC2626', fontSize: '0.75rem', fontWeight: 700 }}>
                        -{item.points?.toLocaleString()} Pts
                      </div>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>
                </div>

                {/* FULFILLED VOUCHER DETAILS CARD */}
                {isFulfilled && (
                  <div style={{
                    background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
                    border: '1.5px solid #86EFAC',
                    borderRadius: '16px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ color: '#166534', fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Sparkles size={16} color="#16A34A" /> Ready for Redemption
                      </div>
                      {f.fulfilled_at && (
                        <div style={{ color: '#15803D', fontSize: '0.725rem', fontWeight: 600 }}>
                          Delivered: {new Date(f.fulfilled_at).toLocaleString()}
                        </div>
                      )}
                    </div>

                    {/* Codes Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                      
                      {/* Card Number / Code */}
                      <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '10px 14px', border: '1px solid #BBF7D0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase' }}>VOUCHER / CARD CODE</div>
                          <div style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '1.05rem', color: '#1E1B4B', letterSpacing: '0.5px' }}>
                            {f.card_number || 'N/A'}
                          </div>
                        </div>
                        {f.card_number && (
                          <button
                            type="button"
                            onClick={() => copyToClipboard(f.card_number, `${item.id}_code`)}
                            style={{
                              background: copiedKey === `${item.id}_code` ? '#DCFCE7' : '#F3F4F6',
                              color: copiedKey === `${item.id}_code` ? '#16A34A' : '#374151',
                              border: 'none',
                              padding: '6px 10px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            {copiedKey === `${item.id}_code` ? <Check size={14} /> : <Copy size={14} />}
                            {copiedKey === `${item.id}_code` ? 'Copied' : 'Copy'}
                          </button>
                        )}
                      </div>

                      {/* PIN / Password (if present) */}
                      {f.pin && (
                        <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '10px 14px', border: '1px solid #BBF7D0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: '0.7rem', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase' }}>SECURITY PIN</div>
                            <div style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '1.05rem', color: '#1E1B4B', letterSpacing: '1px' }}>
                              {f.pin}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(f.pin, `${item.id}_pin`)}
                            style={{
                              background: copiedKey === `${item.id}_pin` ? '#DCFCE7' : '#F3F4F6',
                              color: copiedKey === `${item.id}_pin` ? '#16A34A' : '#374151',
                              border: 'none',
                              padding: '6px 10px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            {copiedKey === `${item.id}_pin` ? <Check size={14} /> : <Copy size={14} />}
                            {copiedKey === `${item.id}_pin` ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                      )}

                      {/* Expiry Date */}
                      {f.expiry_date && (
                        <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '10px 14px', border: '1px solid #BBF7D0' }}>
                          <div style={{ fontSize: '0.7rem', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase' }}>VALID UNTIL / EXPIRY</div>
                          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1E1B4B', marginTop: '2px' }}>
                            {new Date(f.expiry_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Redemption Instructions */}
                    {f.instructions && (
                      <div style={{ background: 'rgba(255, 255, 255, 0.75)', borderRadius: '12px', padding: '10px 14px', border: '1px dashed #86EFAC' }}>
                        <div style={{ fontSize: '0.725rem', color: '#166534', fontWeight: 800, marginBottom: '2px' }}>HOW TO REDEEM:</div>
                        <div style={{ color: '#1F2937', fontSize: '0.8rem', lineHeight: 1.4, whiteSpace: 'pre-line' }}>
                          {f.instructions}
                        </div>
                      </div>
                    )}

                    {/* Voucher Image / Attachment (View & Download) */}
                    {f.voucher_image_url && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', background: '#FFFFFF', padding: '10px 14px', borderRadius: '12px', border: '1px solid #BBF7D0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img
                            src={f.voucher_image_url}
                            alt="Voucher"
                            onClick={() => setPreviewImage(f.voucher_image_url)}
                            style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer', border: '1px solid #E5E7EB' }}
                          />
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '0.825rem', color: '#1E1B4B' }}>Voucher Document / Receipt</div>
                            <div style={{ color: '#6B7280', fontSize: '0.725rem' }}>Click image to zoom or download</div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => setPreviewImage(f.voucher_image_url)}
                            style={{
                              background: '#F3E8FF',
                              color: '#5B21B6',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '10px',
                              fontSize: '0.775rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Eye size={14} /> Preview
                          </button>
                          <a
                            href={f.voucher_image_url}
                            download={`voucher_${item.reference_id || item.id}.png`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              background: '#16A34A',
                              color: '#FFFFFF',
                              textDecoration: 'none',
                              padding: '6px 12px',
                              borderRadius: '10px',
                              fontSize: '0.775rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Download size={14} /> Download
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Status pending notice */}
                {item.status === 'Pending' && (
                  <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '12px', padding: '10px 14px', color: '#92400E', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={16} color="#D97706" />
                    <span>Your request has been received by Admin. Your digital voucher code will be issued shortly.</span>
                  </div>
                )}

                {/* Status rejected notice */}
                {item.status === 'Rejected' && (
                  <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', padding: '10px 14px', color: '#991B1B', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={16} color="#DC2626" />
                    <span>This request was rejected. The deducted {item.points} points have been refunded back to your wallet balance.</span>
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

      {/* FULLSCREEN VOUCHER IMAGE PREVIEW MODAL */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 12, 35, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '650px',
              width: '100%',
              background: '#FFFFFF',
              borderRadius: '20px',
              padding: '16px',
              position: 'relative',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '14px'
            }}
          >
            <button
              onClick={() => setPreviewImage(null)}
              style={{ position: 'absolute', top: '12px', right: '12px', background: '#F3F4F6', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={18} />
            </button>
            <h4 style={{ margin: '4px 0 0 0', color: '#1E1B4B', fontWeight: 800, fontSize: '1rem' }}>Voucher Document Preview</h4>
            <img
              src={previewImage}
              alt="Voucher Preview"
              style={{ maxWidth: '100%', maxHeight: '65vh', objectFit: 'contain', borderRadius: '12px' }}
            />
            <a
              href={previewImage}
              download="cashbackhub_voucher.png"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: '#16A34A',
                color: '#FFFFFF',
                padding: '10px 24px',
                borderRadius: '12px',
                textDecoration: 'none',
                fontWeight: 800,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Download size={16} /> Save / Download Image
            </a>
          </div>
        </div>
      )}

    </div>
  );
}
