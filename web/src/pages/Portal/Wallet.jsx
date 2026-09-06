import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import BrandLogo from '../../components/BrandLogo';
import VoucherModal from '../../components/VoucherModal';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, RefreshCw, Gift, ArrowRight, Sparkles, TrendingUp, CreditCard, ShieldCheck, CheckCircle, AlertCircle } from 'lucide-react';

export default function Wallet({ wallet, refreshWallet }) {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [filterType, setFilterType] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [showConverted, setShowConverted] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);

  // Dynamic Voucher Brands from backend
  const [vouchers, setVouchers] = useState([
    { id: 'v_phonepe', name: 'PhonePe Gift Card', provider: 'PhonePe', minimum_points: 500, description: 'Instant PhonePe wallet & digital gift voucher.' },
    { id: 'v_flipkart', name: 'Flipkart Voucher', provider: 'Flipkart', minimum_points: 1000, description: 'Flipkart shopping gift card for any products.' },
    { id: 'v_amazon', name: 'Amazon Pay Gift Card', provider: 'Amazon', minimum_points: 1000, description: 'Amazon Pay balance code valid on shopping & bills.' },
    { id: 'v_googleplay', name: 'Google Play Code', provider: 'Google Play', minimum_points: 1000, description: 'Google Play Store gift card code for apps and games.' },
  ]);

  // Inline Quick Redeem State
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [withdrawPoints, setWithdrawPoints] = useState(1000);
  const [submittingInline, setSubmittingInline] = useState(false);
  const [inlineMsg, setInlineMsg] = useState(null);

  useEffect(() => {
    fetchTransactions();
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      const res = await api.get('/withdraw/vouchers');
      if (res.data && res.data.success && Array.isArray(res.data.vouchers) && res.data.vouchers.length > 0) {
        setVouchers(res.data.vouchers);
        setSelectedBrand(res.data.vouchers[0]);
      } else {
        setSelectedBrand(vouchers[0]);
      }
    } catch (e) {
      setSelectedBrand(vouchers[0]);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/wallet/transactions');
      if (res.data && res.data.success && Array.isArray(res.data.transactions) && res.data.transactions.length > 0) {
        setTransactions(res.data.transactions);
        setLoading(false);
        return;
      }
    } catch (err) {
      console.warn('Backend transactions API offline, loading local storage history.');
    }

    const saved = localStorage.getItem('cashback_transactions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTransactions(parsed);
          setLoading(false);
          return;
        }
      } catch (e) {}
    }

    const initialTxs = [
      { id: 'tx_101', type: 'Sign Up Bonus', description: 'Welcome registration bonus reward', points: 100, created_at: new Date(Date.now() - 86400000 * 3).toISOString() },
      { id: 'tx_102', type: 'Daily Attendance', description: 'Daily check-in reward points', points: 10, created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
      { id: 'tx_103', type: 'Watch Video Ads', description: 'Completed 10 daily ad views', points: 100, created_at: new Date(Date.now() - 86400000 * 1).toISOString() },
      { id: 'tx_104', type: 'Voucher Redemption', description: 'Redeemed PhonePe Gift Voucher', points: -1000, created_at: new Date(Date.now() - 3600000 * 4).toISOString() },
      { id: 'tx_105', type: 'Lucky Spin Win', description: 'Spin wheel prize reward', points: 500, created_at: new Date().toISOString() }
    ];

    localStorage.setItem('cashback_transactions', JSON.stringify(initialTxs));
    setTransactions(initialTxs);
    setLoading(false);
  };

  const handleRedemptionSubmit = async (redemptionData) => {
    try {
      const res = await api.post('/withdraw/request', redemptionData);
      if (res.data && res.data.success) {
        if (refreshWallet) refreshWallet();
        fetchTransactions();
        return res.data;
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Withdrawal request failed';
      throw new Error(errorMsg);
    }
  };

  const handleInlineWithdraw = async () => {
    if (!selectedBrand) {
      setInlineMsg({ type: 'error', text: 'Please select a gift card brand' });
      return;
    }
    const minPts = selectedBrand.minimum_points || 500;
    if (withdrawPoints < minPts) {
      setInlineMsg({ type: 'error', text: `Minimum redemption for ${selectedBrand.name} is ${minPts} Pts (₹${minPts / 10})` });
      return;
    }
    if (withdrawPoints > (wallet?.available_points || 0)) {
      setInlineMsg({ type: 'error', text: `Insufficient points. You have ${wallet?.available_points || 0} Pts.` });
      return;
    }

    setSubmittingInline(true);
    setInlineMsg(null);

    try {
      const rupeeVal = withdrawPoints / 10;
      await handleRedemptionSubmit({
        voucher_id: selectedBrand.id,
        voucher_name: selectedBrand.name,
        points: withdrawPoints,
        rupee_value: rupeeVal,
        denomination: rupeeVal
      });
      setInlineMsg({ type: 'success', text: `₹${rupeeVal} ${selectedBrand.name} withdrawal requested! Check 'My Withdrawals' for status.` });
      setTimeout(() => setInlineMsg(null), 6000);
    } catch (err) {
      setInlineMsg({ type: 'error', text: err.message || 'Withdrawal failed. Try again.' });
    } finally {
      setSubmittingInline(false);
    }
  };

  const filteredTxs = transactions.filter((tx) => {
    if (filterType === 'CREDIT') return tx.points > 0;
    if (filterType === 'DEBIT') return tx.points < 0;
    return true;
  });

  const availablePoints = wallet?.available_points || 0;
  const rupeeValue = (availablePoints / 10).toFixed(2);
  const inlineRupeeVal = (withdrawPoints / 10).toFixed(2);

  const denominationPresets = [
    { rupee: 50, pts: 500 },
    { rupee: 100, pts: 1000 },
    { rupee: 250, pts: 2500 },
    { rupee: 500, pts: 5000 },
    { rupee: 1000, pts: 10000 }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '1000px', margin: '0 auto', width: '100%', paddingBottom: '95px', boxSizing: 'border-box' }}>
      
      {/* 1. PREMIUM CREDIT-CARD STYLE WALLET BANNER */}
      <div style={{
        background: 'linear-gradient(135deg, #4C1D95 0%, #5B21B6 50%, #6D28D9 100%)',
        borderRadius: '22px',
        padding: '22px 20px',
        color: '#FFFFFF',
        boxShadow: '0 10px 28px rgba(91, 33, 182, 0.28)',
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {/* Subtle background glow */}
        <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.15)', filter: 'blur(30px)', pointerEvents: 'none' }} />

        {/* Top Header Row: Balance & Rupee Conversion */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px', position: 'relative', zIndex: 5 }}>
          <div>
            <div style={{ fontSize: '0.725rem', fontWeight: 800, textTransform: 'uppercase', opacity: 0.85, letterSpacing: '0.5px' }}>
              AVAILABLE BALANCE
            </div>
            <div style={{ fontSize: 'clamp(2rem, 6vw, 2.8rem)', fontWeight: 800, lineHeight: 1, marginTop: '4px' }}>
              {availablePoints.toLocaleString()} <span style={{ fontSize: '1rem', fontWeight: 600, opacity: 0.9 }}>Pts</span>
            </div>
          </div>

          {/* Rupee Conversion Button / Converted Rupee Pill */}
          {!showConverted ? (
            <button
              type="button"
              onClick={() => setShowConverted(true)}
              style={{
                background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
                color: '#FFFFFF',
                border: 'none',
                padding: '9px 18px',
                borderRadius: '16px',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 16px rgba(34, 197, 94, 0.35)',
                flexShrink: 0,
                position: 'relative',
                zIndex: 10,
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <RefreshCw size={15} /> Convert to ₹
            </button>
          ) : (
            <div
              onClick={() => setShowConverted(false)}
              style={{
                background: 'rgba(255, 255, 255, 0.16)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                padding: '8px 16px',
                borderRadius: '16px',
                textAlign: 'right',
                flexShrink: 0,
                cursor: 'pointer',
                position: 'relative',
                zIndex: 10
              }}
            >
              <div style={{ fontSize: '0.675rem', fontWeight: 800, opacity: 0.85, textTransform: 'uppercase' }}>CONVERTED RUPEES</div>
              <div style={{ color: '#4ADE80', fontSize: 'clamp(1.2rem, 4vw, 1.6rem)', fontWeight: 800, marginTop: '2px' }}>
                ₹{rupeeValue}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Action Bar */}
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.18)',
          paddingTop: '14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ color: '#E9D5FF', fontSize: '0.775rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Sparkles size={14} color="#4ADE80" /> 10 Points = ₹1.00 Value (Voucher Only)
          </div>
          <button
            onClick={() => navigate('/portal/my-withdrawals')}
            style={{
              background: 'rgba(255, 255, 255, 0.18)',
              border: 'none',
              color: '#FFFFFF',
              padding: '6px 14px',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            My Vouchers <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* 2. SIDE-BY-SIDE STATS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', width: '100%' }}>
        <div className="card-white" style={{ padding: '16px 14px' }}>
          <div style={{ color: '#6B7280', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>TOTAL EARNED</div>
          <div style={{ color: '#16A34A', fontSize: 'clamp(1.25rem, 4vw, 1.7rem)', fontWeight: 800 }}>
            +{wallet?.total_earned?.toLocaleString() || 0} Pts
          </div>
          <div style={{ color: '#9CA3AF', fontSize: '0.725rem', marginTop: '2px', fontWeight: 600 }}>Daily ads, checkins & spins</div>
        </div>

        <div className="card-white" style={{ padding: '16px 14px' }}>
          <div style={{ color: '#6B7280', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>TOTAL WITHDRAWN</div>
          <div style={{ color: '#DC2626', fontSize: 'clamp(1.25rem, 4vw, 1.7rem)', fontWeight: 800 }}>
            -{wallet?.total_redeemed?.toLocaleString() || 0} Pts
          </div>
          <div style={{ color: '#9CA3AF', fontSize: '0.725rem', marginTop: '2px', fontWeight: 600 }}>In gift vouchers</div>
        </div>
      </div>

      {/* 3. DEDICATED GIFT CARD WITHDRAWAL SECTION */}
      <div className="card-white" style={{ padding: '20px 18px', width: '100%', boxSizing: 'border-box', border: '1.5px solid #E0E7FF' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ color: '#1E1B4B', fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <Gift size={20} color="#5B21B6" /> Gift Card Withdrawal
            </h3>
            <p style={{ color: '#6B7280', fontSize: '0.8rem', margin: '4px 0 0 0' }}>
              Convert your wallet points into instant digital gift cards (10 Points = ₹1.00)
            </p>
          </div>
          <button
            onClick={() => navigate('/portal/withdraw')}
            style={{
              background: '#F3E8FF',
              border: 'none',
              color: '#5B21B6',
              padding: '6px 14px',
              borderRadius: '12px',
              fontSize: '0.775rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            Full Catalog <ArrowRight size={13} />
          </button>
        </div>

        {/* Step 1: Select Brand Gift Card */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ color: '#374151', fontSize: '0.825rem', fontWeight: 800, display: 'block', marginBottom: '8px' }}>
            1. Select Gift Card Brand:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px' }}>
            {vouchers.map((v) => {
              const isSelected = selectedBrand?.id === v.id;
              return (
                <div
                  key={v.id}
                  onClick={() => setSelectedBrand(v)}
                  style={{
                    background: isSelected ? '#F5F3FF' : '#FAFAFA',
                    border: isSelected ? '2px solid #5B21B6' : '1px solid #E5E7EB',
                    borderRadius: '14px',
                    padding: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <BrandLogo brandName={v.name} size={32} />
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ color: isSelected ? '#5B21B6' : '#1E1B4B', fontSize: '0.8rem', fontWeight: 800, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                      {v.name}
                    </div>
                    <div style={{ color: '#6B7280', fontSize: '0.675rem', fontWeight: 600 }}>
                      Min: {v.minimum_points || 500} Pts
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 2: Select Denomination / Amount */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ color: '#374151', fontSize: '0.825rem', fontWeight: 800, display: 'block', marginBottom: '8px' }}>
            2. Choose Denomination:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(85px, 1fr))', gap: '8px', marginBottom: '10px' }}>
            {denominationPresets.map((d) => {
              const isSelected = withdrawPoints === d.pts;
              const canAfford = availablePoints >= d.pts;
              return (
                <button
                  key={d.rupee}
                  type="button"
                  onClick={() => setWithdrawPoints(d.pts)}
                  style={{
                    padding: '8px 4px',
                    borderRadius: '12px',
                    border: isSelected ? '2px solid #5B21B6' : '1px solid #E5E7EB',
                    background: isSelected ? '#5B21B6' : (canAfford ? '#FFFFFF' : '#F3F4F6'),
                    color: isSelected ? '#FFFFFF' : (canAfford ? '#1E1B4B' : '#9CA3AF'),
                    fontWeight: 800,
                    fontSize: '0.825rem',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div>₹{d.rupee}</div>
                  <div style={{ fontSize: '0.675rem', opacity: isSelected ? 0.9 : 0.7, fontWeight: 600 }}>{d.pts} Pts</div>
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setWithdrawPoints(availablePoints >= 500 ? availablePoints : 500)}
              style={{
                padding: '8px 4px',
                borderRadius: '12px',
                border: withdrawPoints === availablePoints ? '2px solid #16A34A' : '1px solid #BBF7D0',
                background: withdrawPoints === availablePoints ? '#16A34A' : '#DCFCE7',
                color: withdrawPoints === availablePoints ? '#FFFFFF' : '#166534',
                fontWeight: 800,
                fontSize: '0.8rem',
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              <div>All Points</div>
              <div style={{ fontSize: '0.675rem', opacity: 0.9, fontWeight: 600 }}>{availablePoints} Pts</div>
            </button>
          </div>

          {/* Custom Points Field */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="number"
                value={withdrawPoints}
                onChange={(e) => setWithdrawPoints(parseInt(e.target.value) || 0)}
                step="50"
                min={selectedBrand?.minimum_points || 500}
                placeholder="Enter custom points"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  border: '1.5px solid #D1D5DB',
                  background: '#F9FAFB',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  color: '#1E1B4B',
                  boxSizing: 'border-box'
                }}
              />
              <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6B7280', fontSize: '0.8rem', fontWeight: 700 }}>
                Pts
              </span>
            </div>
          </div>
        </div>

        {/* Live Conversion Summary Box */}
        <div style={{
          background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
          borderRadius: '14px',
          border: '1px solid #BBF7D0',
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
          marginBottom: '14px'
        }}>
          <div>
            <div style={{ color: '#166534', fontSize: '0.75rem', fontWeight: 700 }}>YOU WILL RECEIVE:</div>
            <div style={{ color: '#16A34A', fontSize: '1.4rem', fontWeight: 800 }}>
              ₹{inlineRupeeVal} <span style={{ fontSize: '0.85rem', color: '#1E1B4B', fontWeight: 700 }}>({selectedBrand?.name || 'Gift Voucher'})</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#6B7280', fontSize: '0.725rem', fontWeight: 600 }}>Points Deducted:</div>
            <div style={{ color: '#DC2626', fontSize: '1.1rem', fontWeight: 800 }}>
              -{withdrawPoints.toLocaleString()} Pts
            </div>
          </div>
        </div>

        {inlineMsg && (
          <div style={{
            background: inlineMsg.type === 'success' ? '#DCFCE7' : '#FEE2E2',
            color: inlineMsg.type === 'success' ? '#166534' : '#991B1B',
            border: `1px solid ${inlineMsg.type === 'success' ? '#86EFAC' : '#FCA5A5'}`,
            padding: '10px 14px',
            borderRadius: '12px',
            fontSize: '0.825rem',
            fontWeight: 700,
            marginBottom: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {inlineMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            <span>{inlineMsg.text}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={handleInlineWithdraw}
            disabled={submittingInline || availablePoints < (selectedBrand?.minimum_points || 500)}
            style={{
              flex: 1,
              background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
              color: '#FFFFFF',
              border: 'none',
              padding: '13px',
              borderRadius: '14px',
              fontSize: '0.925rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 6px 18px rgba(34, 197, 94, 0.35)',
              opacity: (submittingInline || availablePoints < (selectedBrand?.minimum_points || 500)) ? 0.6 : 1
            }}
          >
            <Gift size={17} /> {submittingInline ? 'Submitting...' : `Submit Withdrawal Request (₹${inlineRupeeVal})`}
          </button>

          <button
            type="button"
            onClick={() => setSelectedVoucher(selectedBrand)}
            style={{
              background: '#F8F7FC',
              border: '1.5px solid #DDD6FE',
              color: '#5B21B6',
              padding: '13px 18px',
              borderRadius: '14px',
              fontSize: '0.85rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            Custom Options
          </button>
        </div>
      </div>

      {/* 4. TRANSACTION HISTORY CARD LIST */}
      <div className="card-white" style={{ padding: '18px 16px', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ color: '#1E1B4B', fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
            <WalletIcon size={18} color="#5B21B6" /> Points Activity Ledger
          </h3>

          {/* Filters */}
          <div className="no-scrollbar" style={{ display: 'flex', gap: '4px', overflowX: 'auto' }}>
            {['ALL', 'CREDIT', 'DEBIT'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                style={{
                  padding: '4px 12px',
                  borderRadius: '14px',
                  border: '1px solid #E5E7EB',
                  background: filterType === type ? '#5B21B6' : '#FFFFFF',
                  color: filterType === type ? '#FFFFFF' : '#4B5563',
                  fontWeight: 800,
                  fontSize: '0.775rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {type}
              </button>
            ))}
            <button onClick={fetchTransactions} style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', color: '#5B21B6', padding: '4px 8px', borderRadius: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <RefreshCw size={13} />
            </button>
          </div>
        </div>

        {/* Transaction Cards List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredTxs.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#6B7280', fontSize: '0.85rem' }}>No transactions found.</div>
          ) : (
            filteredTxs.map((tx) => {
              const isCredit = tx.points > 0;
              return (
                <div key={tx.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  background: '#F8F7FC',
                  border: '1px solid #F3F4F6',
                  gap: '10px',
                  flexWrap: 'wrap',
                  width: '100%',
                  boxSizing: 'border-box'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '150px' }}>
                    <div style={{
                      width: '34px', height: '34px', borderRadius: '10px',
                      background: isCredit ? '#DCFCE7' : '#FEE2E2',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                      {isCredit
                        ? <ArrowDownLeft color="#16A34A" size={16} />
                        : <ArrowUpRight color="#DC2626" size={16} />
                      }
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#1E1B4B', lineHeight: 1.2 }}>{tx.type}</div>
                      <div style={{ color: '#6B7280', fontSize: '0.725rem' }}>{tx.description}</div>
                      <div style={{ color: '#9CA3AF', fontSize: '0.675rem' }}>{new Date(tx.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: isCredit ? '#16A34A' : '#DC2626', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {isCredit ? `+${tx.points}` : tx.points} Pts
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* VOUCHER REDEMPTION MODAL POPUP */}
      {selectedVoucher && (
        <VoucherModal
          voucher={selectedVoucher}
          wallet={wallet}
          onClose={() => setSelectedVoucher(null)}
          onConfirm={handleRedemptionSubmit}
        />
      )}

    </div>
  );
}
