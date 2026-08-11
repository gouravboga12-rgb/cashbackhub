import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, RefreshCw } from 'lucide-react';

export default function Wallet({ wallet, refreshWallet }) {
  const [transactions, setTransactions] = useState([]);
  const [filterType, setFilterType] = useState('ALL');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/wallet/transactions');
      if (res.data.success) {
        setTransactions(res.data.transactions);
      }
    } catch (err) {
      console.error('Failed to load transactions', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTxs = transactions.filter((tx) => {
    if (filterType === 'CREDIT') return tx.points > 0;
    if (filterType === 'DEBIT') return tx.points < 0;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1100px', margin: '0 auto' }}>
      
      {/* WALLET METRICS BANNER */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
        
        {/* Available Points */}
        <div className="card-violet-banner" style={{ padding: '24px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px', opacity: 0.9 }}>AVAILABLE BALANCE</div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800 }}>{wallet?.available_points?.toLocaleString() || 0} Pts</div>
          <div style={{ color: '#4ADE80', fontSize: '1.2rem', fontWeight: 800, marginTop: '4px' }}>₹{((wallet?.available_points || 0) / 10).toFixed(2)}</div>
        </div>

        {/* Total Earned */}
        <div className="card-white" style={{ padding: '24px' }}>
          <div style={{ color: '#6B7280', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>TOTAL EARNED</div>
          <div style={{ color: '#16A34A', fontSize: '2.2rem', fontWeight: 800 }}>+{wallet?.total_earned?.toLocaleString() || 0} Pts</div>
          <div style={{ color: '#6B7280', fontSize: '0.85rem', marginTop: '4px' }}>From attendance, ads & spins</div>
        </div>

        {/* Total Redeemed */}
        <div className="card-white" style={{ padding: '24px' }}>
          <div style={{ color: '#6B7280', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>TOTAL REDEEMED</div>
          <div style={{ color: '#DC2626', fontSize: '2.2rem', fontWeight: 800 }}>-{wallet?.total_redeemed?.toLocaleString() || 0} Pts</div>
          <div style={{ color: '#6B7280', fontSize: '0.85rem', marginTop: '4px' }}>Converted to gift vouchers</div>
        </div>

      </div>

      {/* TRANSACTION HISTORY TABLE */}
      <div className="card-white" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <h3 style={{ color: '#1E1B4B', fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <WalletIcon size={20} color="#5B21B6" /> Transaction History
          </h3>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {['ALL', 'CREDIT', 'DEBIT'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                style={{
                  padding: '6px 16px',
                  borderRadius: '20px',
                  border: '1px solid #E5E7EB',
                  background: filterType === type ? '#5B21B6' : '#FFFFFF',
                  color: filterType === type ? '#FFFFFF' : '#4B5563',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                {type}
              </button>
            ))}
            <button onClick={fetchTransactions} style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', color: '#5B21B6', padding: '6px 12px', borderRadius: '20px', cursor: 'pointer' }}>
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* Table View */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', color: '#1E1B4B', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: '#F8F7FC', borderBottom: '1px solid #E5E7EB', color: '#6B7280', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px' }}>Type</th>
                <th style={{ padding: '12px 16px' }}>Description</th>
                <th style={{ padding: '12px 16px' }}>Reference ID</th>
                <th style={{ padding: '12px 16px' }}>Date & Time</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Points</th>
              </tr>
            </thead>
            <tbody>
              {filteredTxs.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: '#6B7280' }}>
                    No transactions found.
                  </td>
                </tr>
              ) : (
                filteredTxs.map((tx) => {
                  const isCredit = tx.points > 0;
                  return (
                    <tr key={tx.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {isCredit ? <ArrowDownLeft color="#16A34A" size={18} /> : <ArrowUpRight color="#DC2626" size={18} />}
                        {tx.type}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#4B5563' }}>{tx.description}</td>
                      <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: '0.8rem', color: '#5B21B6' }}>{tx.reference_id}</td>
                      <td style={{ padding: '14px 16px', color: '#6B7280', fontSize: '0.8rem' }}>{new Date(tx.created_at).toLocaleString()}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 800, fontSize: '1rem', color: isCredit ? '#16A34A' : '#DC2626' }}>
                        {isCredit ? `+${tx.points}` : tx.points} Pts
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
