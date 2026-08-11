import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import BrandLogo from '../../components/BrandLogo';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, RefreshCw, Gift, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export default function Wallet({ wallet, refreshWallet }) {
  const navigate = useNavigate();
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

  const availablePoints = wallet?.available_points || 0;
  const rupeeValue = (availablePoints / 10).toFixed(2);

  const popularVouchers = [
    { name: 'PhonePe Gift Voucher', minPts: 1000, value: '₹100' },
    { name: 'Flipkart Voucher', minPts: 1000, value: '₹100' },
    { name: 'Amazon Pay Gift Card', minPts: 1000, value: '₹100' },
    { name: 'Google Play Code', minPts: 1000, value: '₹100' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1100px', margin: '0 auto', width: '100%', paddingBottom: '95px', boxSizing: 'border-box' }}>
      
      {/* 1. PRIMARY WALLET BALANCE & WITHDRAWAL BANNER */}
      <div className="card-violet-banner" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', overflow: 'hidden' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', opacity: 0.9, letterSpacing: '0.5px' }}>
              IN-APP ACCUMULATED WALLET BALANCE
            </div>
            <div style={{ fontSize: 'clamp(1.8rem, 5.5vw, 2.6rem)', fontWeight: 800, marginTop: '2px', lineHeight: 1.1 }}>
              {availablePoints.toLocaleString()} <span style={{ fontSize: '1rem', fontWeight: 600, opacity: 0.9 }}>Points</span>
            </div>
          </div>

          {/* Converted Rupee Value Badge */}
          <div style={{ background: 'rgba(255, 255, 255, 0.15)', border: '1px solid rgba(255, 255, 255, 0.3)', padding: '10px 18px', borderRadius: '16px', textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, opacity: 0.9, textTransform: 'uppercase' }}>CONVERTED RUPEE VALUE</div>
            <div style={{ color: '#4ADE80', fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', fontWeight: 800, marginTop: '2px' }}>
              ₹{rupeeValue}
            </div>
          </div>
        </div>

        {/* Exchange Rate Formula Tag & Direct Withdrawal CTA */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', opacity: 0.95, fontWeight: 700 }}>
            <Sparkles size={16} color="#4ADE80" /> Conversion Rate: <span style={{ color: '#4ADE80', fontWeight: 800 }}>10 Points = ₹1.00</span>
          </div>

          <button onClick={() => navigate('/portal/withdraw')} className="btn-green" style={{ padding: '10px 20px', borderRadius: '14px', fontSize: '0.875rem', boxShadow: '0 6px 16px rgba(34, 197, 94, 0.35)' }}>
            Withdraw Vouchers & Coupons <ArrowRight size={16} />
          </button>
        </div>

      </div>

      {/* 2. EARNED vs REDEEMED METRICS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', width: '100%' }}>
        
        {/* Total Earned */}
        <div className="card-white" style={{ padding: '20px' }}>
          <div style={{ color: '#6B7280', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px' }}>TOTAL ACCUMULATED</div>
          <div style={{ color: '#16A34A', fontSize: 'clamp(1.4rem, 4.5vw, 2rem)', fontWeight: 800 }}>+{wallet?.total_earned?.toLocaleString() || 0} Pts</div>
          <div style={{ color: '#6B7280', fontSize: '0.8rem', marginTop: '4px', fontWeight: 500 }}>From daily check-ins, ads & spins</div>
        </div>

        {/* Total Redeemed */}
        <div className="card-white" style={{ padding: '20px' }}>
          <div style={{ color: '#6B7280', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px' }}>TOTAL WITHDRAWN</div>
          <div style={{ color: '#DC2626', fontSize: 'clamp(1.4rem, 4.5vw, 2rem)', fontWeight: 800 }}>-{wallet?.total_redeemed?.toLocaleString() || 0} Pts</div>
          <div style={{ color: '#6B7280', fontSize: '0.8rem', marginTop: '4px', fontWeight: 500 }}>Withdrawn as digital gift vouchers</div>
        </div>

      </div>

      {/* 3. POPULAR GIFT VOUCHERS & COUPONS CATALOG PREVIEW */}
      <div className="card-white" style={{ padding: '20px', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ color: '#1E1B4B', fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Gift size={18} color="#5B21B6" /> Withdraw Gift Vouchers & Coupons
            </h3>
            <p style={{ color: '#6B7280', fontSize: '0.8rem', marginTop: '2px', fontWeight: 500 }}>Select from instant brand vouchers and redeem points into real digital codes.</p>
          </div>

          <button onClick={() => navigate('/portal/withdraw')} style={{ background: '#F3E8FF', border: '1px solid #EDE9FE', color: '#5B21B6', padding: '6px 14px', borderRadius: '14px', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
            View All Catalog <ArrowRight size={14} />
          </button>
        </div>

        {/* Voucher Cards Quick Preview Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', width: '100%' }}>
          {popularVouchers.map((v, idx) => (
            <div key={idx} style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '14px', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <BrandLogo brandName={v.name} size={38} />
                <div>
                  <div style={{ color: '#1E1B4B', fontSize: '0.85rem', fontWeight: 800, lineHeight: 1.2 }}>{v.name}</div>
                  <div style={{ color: '#16A34A', fontSize: '0.775rem', fontWeight: 800, marginTop: '2px' }}>{v.value} <span style={{ color: '#6B7280', fontWeight: 600 }}>({v.minPts} Pts)</span></div>
                </div>
              </div>
              <button onClick={() => navigate('/portal/withdraw')} style={{ background: '#5B21B6', color: '#FFF', border: 'none', padding: '6px 10px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', flexShrink: 0 }}>
                Redeem
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 4. TRANSACTION HISTORY CARD LIST */}
      <div className="card-white" style={{ padding: '20px', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ color: '#1E1B4B', fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <WalletIcon size={18} color="#5B21B6" /> Wallet Transaction History
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

        {/* Transaction Cards List */}
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
