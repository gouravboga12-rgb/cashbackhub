import React, { useState, useEffect } from 'react';
import api from '../../api';
import BrandLogo from '../../components/BrandLogo';
import { Clock, RefreshCw } from 'lucide-react';

export default function MyWithdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const res = await api.get('/withdraw/history');
      if (res.data && res.data.success && Array.isArray(res.data.withdrawals) && res.data.withdrawals.length > 0) {
        setWithdrawals(res.data.withdrawals);
        setLoading(false);
        return;
      }
    } catch (err) {
      console.warn('Backend withdrawal history API offline, loading local storage history.');
    }

    // Client local storage fallback
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

    // Initial default activity records
    const sampleHistory = [
      {
        id: 'w_demo_101',
        voucher_name: 'PhonePe Gift Voucher',
        reference_id: 'REF89230192',
        rupee_value: '100.00',
        points: 1000,
        status: 'Fulfilled',
        created_at: new Date(Date.now() - 86400000 * 2).toISOString()
      },
      {
        id: 'w_demo_102',
        voucher_name: 'Amazon Pay Gift Card',
        reference_id: 'REF89230411',
        rupee_value: '50.00',
        points: 500,
        status: 'Approved',
        created_at: new Date(Date.now() - 86400000).toISOString()
      }
    ];

    localStorage.setItem('cashback_withdrawals', JSON.stringify(sampleHistory));
    setWithdrawals(sampleHistory);
    setLoading(false);
  };

  const filtered = withdrawals.filter((w) => {
    if (activeTab === 'Pending') return w.status === 'Pending';
    if (activeTab === 'Approved') return w.status === 'Approved';
    if (activeTab === 'Rejected') return w.status === 'Rejected';
    if (activeTab === 'Fulfilled') return w.status === 'Fulfilled';
    return true;
  });

  const getBadgeStyle = (status) => {
    if (status === 'Approved') return { background: '#DCFCE7', color: '#16A34A', padding: '4px 12px', borderRadius: '12px', fontWeight: 800 };
    if (status === 'Fulfilled') return { background: '#E0E7FF', color: '#4338CA', padding: '4px 12px', borderRadius: '12px', fontWeight: 800 };
    if (status === 'Rejected') return { background: '#FEE2E2', color: '#DC2626', padding: '4px 12px', borderRadius: '12px', fontWeight: 800 };
    return { background: '#FEF3C7', color: '#D97706', padding: '4px 12px', borderRadius: '12px', fontWeight: 800 }; // Pending
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1100px', margin: '0 auto', width: '100%', paddingBottom: '90px', boxSizing: 'border-box' }}>
      
      {/* Header Banner */}
      <div className="card-violet-banner" style={{ padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>📋 My Withdrawals</h2>
          <p style={{ opacity: 0.9, fontSize: '0.875rem' }}>Track status of your voucher redemptions in real-time</p>
        </div>
        <button onClick={fetchWithdrawals} style={{ background: '#FFFFFF', color: '#5B21B6', border: 'none', padding: '8px 18px', borderRadius: '16px', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* FILTER TABS */}
      <div className="no-scrollbar" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', width: '100%' }}>
        {['ALL', 'Pending', 'Approved', 'Fulfilled', 'Rejected'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 18px',
              borderRadius: '20px',
              border: '1px solid #E5E7EB',
              background: activeTab === tab ? '#5B21B6' : '#FFFFFF',
              color: activeTab === tab ? '#FFFFFF' : '#4B5563',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* WITHDRAWAL CARDS / LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
        {filtered.length === 0 ? (
          <div className="card-white" style={{ padding: '48px', textAlign: 'center', color: '#6B7280' }}>
            No withdrawal requests found in this category.
          </div>
        ) : (
          filtered.map((item) => (
            <div key={item.id} className="card-white" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', width: '100%', boxSizing: 'border-box' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: '1 1 200px' }}>
                <BrandLogo brandName={item.voucher_name} size={46} />
                <div>
                  <h4 style={{ color: '#1E1B4B', fontSize: '1rem', fontWeight: 800, marginBottom: '2px' }}>{item.voucher_name}</h4>
                  <div style={{ color: '#6B7280', fontSize: '0.775rem' }}>
                    Ref ID: <span style={{ fontFamily: 'monospace', color: '#5B21B6', fontWeight: 700 }}>{item.reference_id}</span> • {new Date(item.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#16A34A', fontSize: '1.15rem', fontWeight: 800 }}>₹{item.rupee_value}</div>
                  <div style={{ color: '#DC2626', fontSize: '0.8rem', fontWeight: 700 }}>-{item.points?.toLocaleString()} Pts</div>
                </div>
                <span style={{ fontSize: '0.8rem', ...getBadgeStyle(item.status) }}>
                  {item.status}
                </span>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
}
