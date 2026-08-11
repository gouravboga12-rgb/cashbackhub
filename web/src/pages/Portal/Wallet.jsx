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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1100px', margin: '0 auto', width: '100%', paddingBottom: '90px', boxSizing: 'border-box' }}>
      
      {/* WALLET METRICS BANNER */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', width: '100%' }}>
        
        {/* Available Points */}
        <div className="card-violet-banner" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px', opacity: 0.9 }}>AVAILABLE BALANCE</div>
          <div style={{ fontSize: 'clamp(1.5rem, 5vw, 2.2rem)', fontWeight: 800 }}>{wallet?.available_points?.toLocaleString() || 0} Pts</div>
          <div style={{ color: '#4ADE80', fontSize: '1.2rem', fontWeight: 800, marginTop: '4px' }}>₹{((wallet?.available_points || 0) / 10).toFixed(2)}</div>
        </div>

        {/* Total Earned */}
        <div className="card-white" style={{ padding: '20px' }}>
          <div style={{ color: '#6B7280', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>TOTAL EARNED</div>
          <div style={{ color: '#16A34A', fontSize: 'clamp(1.5rem, 5vw, 2.2rem)', fontWeight: 800 }}>+{wallet?.total_earned?.toLocaleString() || 0} Pts</div>
          <div style={{ color: '#6B7280', fontSize: '0.8rem', marginTop: '4px' }}>From attendance, ads & spins</div>
        </div>

        {/* Total Redeemed */}
        <div className="card-white" style={{ padding: '20px' }}>
          <div style={{ color: '#6B7280', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>TOTAL REDEEMED</div>
          <div style={{ color: '#DC2626', fontSize: 'clamp(1.5rem, 5vw, 2.2rem)', fontWeight: 800 }}>-{wallet?.total_redeemed?.toLocaleString() || 0} Pts</div>
          <div style={{ color: '#6B7280', fontSize: '0.8rem', marginTop: '4px' }}>Converted to gift vouchers</div>
        </div>

      </div>

      {/* TRANSACTION HISTORY — Card List (Mobile-Friendly) */}
      <div className="card-white" style={{ padding: '20px', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ color: '#1E1B4B', fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <WalletIcon size={18} color="#5B21B6" /> Transaction History
          </h3>

          {/* Filters */}
          <div className="no-scrollbar" style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
            {['ALL', 'CREDIT', 'DEBIT'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                style={{
                  padding: '5px 14px',
                  borderRadius: '16px',
                  border: '1px solid #E5E7EB',
                  background: filterType === type ? '#5B21B6' : '#FFFFFF',
                  color: filterType === type ? '#FFFFFF' : '#4B5563',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {type}
              </button>
            ))}
            <button onClick={fetchTransactions} style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', color: '#5B21B6', padding: '5px 10px', borderRadius: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* Mobile Card List Instead of Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredTxs.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#6B7280' }}>No transactions found.</div>
          ) : (
            filteredTxs.map((tx) => {
              const isCredit = tx.points > 0;
              return (
                <div key={tx.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: '#F9FAFB',
                  border: '1px solid #F3F4F6',
                  gap: '12px',
                  flexWrap: 'wrap',
                  width: '100%',
                  boxSizing: 'border-box'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '160px' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '10px',
                      background: isCredit ? '#DCFCE7' : '#FEE2E2',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                      {isCredit
                        ? <ArrowDownLeft color="#16A34A" size={18} />
                        : <ArrowUpRight color="#DC2626" size={18} />
                      }
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.875rem', color: '#1E1B4B' }}>{tx.type}</div>
                      <div style={{ color: '#6B7280', fontSize: '0.75rem' }}>{tx.description}</div>
                      <div style={{ color: '#6B7280', fontSize: '0.7rem' }}>{new Date(tx.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: isCredit ? '#16A34A' : '#DC2626', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {isCredit ? `+${tx.points}` : tx.points} Pts
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}
