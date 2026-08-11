import React, { useState, useEffect } from 'react';
import api from '../../api';
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
      if (res.data.success) {
        setWithdrawals(res.data.withdrawals);
      }
    } catch (err) {
      console.error('Failed to load withdrawal history', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = withdrawals.filter((w) => {
    if (activeTab === 'Pending') return w.status === 'Pending';
    if (activeTab === 'Approved') return w.status === 'Approved';
    if (activeTab === 'Rejected') return w.status === 'Rejected';
    if (activeTab === 'Fulfilled') return w.status === 'Fulfilled';
    return true;
  });

  const getBadgeStyle = (status) => {
    if (status === 'Approved') return 'badge-approved';
    if (status === 'Rejected') return 'badge-rejected';
    if (status === 'Fulfilled') return 'badge-fulfilled';
    return 'badge-pending';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1100px', margin: '0 auto' }}>
      
      {/* Header Banner */}
      <div className="card-violet-banner" style={{ padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>📋 My Withdrawals</h2>
          <p style={{ opacity: 0.9, fontSize: '0.9rem' }}>Track status of your voucher redemptions in real-time</p>
        </div>
        <button onClick={fetchWithdrawals} style={{ background: '#FFFFFF', color: '#5B21B6', border: 'none', padding: '10px 20px', borderRadius: '20px', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* FILTER TABS */}
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
        {['ALL', 'Pending', 'Approved', 'Fulfilled', 'Rejected'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 20px',
              borderRadius: '20px',
              border: '1px solid #E5E7EB',
              background: activeTab === tab ? '#5B21B6' : '#FFFFFF',
              color: activeTab === tab ? '#FFFFFF' : '#4B5563',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* WITHDRAWAL CARDS / LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filtered.length === 0 ? (
          <div className="card-white" style={{ padding: '48px', textAlign: 'center', color: '#6B7280' }}>
            No withdrawal requests found in this category.
          </div>
        ) : (
          filtered.map((item) => (
            <div key={item.id} className="card-white" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                  💳
                </div>
                <div>
                  <h4 style={{ color: '#1E1B4B', fontSize: '1.05rem', fontWeight: 800, marginBottom: '2px' }}>{item.voucher_name}</h4>
                  <div style={{ color: '#6B7280', fontSize: '0.825rem' }}>
                    Ref ID: <span style={{ fontFamily: 'monospace', color: '#5B21B6', fontWeight: 700 }}>{item.reference_id}</span> • {new Date(item.created_at).toLocaleString()}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#16A34A', fontSize: '1.2rem', fontWeight: 800 }}>₹{item.rupee_value}</div>
                  <div style={{ color: '#DC2626', fontSize: '0.85rem', fontWeight: 700 }}>-{item.points?.toLocaleString()} Pts</div>
                </div>
                <span className={getBadgeStyle(item.status)} style={{ fontSize: '0.85rem' }}>
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
