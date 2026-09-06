import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import BrandLogo from '../../components/BrandLogo';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, RefreshCw, Gift, ArrowRight, Sparkles, AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react';

export default function Wallet({ wallet, refreshWallet }) {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [filterType, setFilterType] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [showConverted, setShowConverted] = useState(false);

  // Dynamic Voucher Brands
  const [vouchers, setVouchers] = useState([
    { id: 'vch_phonepe', name: 'PhonePe Gift Voucher', provider: 'PhonePe', minimum_points: 100, description: 'Redeem instantly for mobile recharges, bills & shopping on PhonePe.' },
    { id: 'vch_flipkart', name: 'Flipkart Voucher', provider: 'Flipkart', minimum_points: 100, description: 'Shop items on Flipkart electronics, fashion & appliances.' },
    { id: 'vch_amazon', name: 'Amazon Pay Gift Card', provider: 'Amazon', minimum_points: 100, description: 'Add money directly to your Amazon Pay wallet balance.' },
    { id: 'vch_gplay', name: 'Google Play Gift Voucher', provider: 'Google Play', minimum_points: 100, description: 'Buy apps, games & in-game rewards on Google Play Store.' },
  ]);

  // Selected Brand & Withdrawal Input in RUPEES (₹)
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [withdrawRupees, setWithdrawRupees] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedbackError, setFeedbackError] = useState(null);
  const [successWithdrawal, setSuccessWithdrawal] = useState(null);

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
      console.warn('Backend transactions API offline, loading local history.');
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
      { id: 'tx_103', type: 'Watch Video Ads', description: 'Completed daily ad views', points: 100, created_at: new Date(Date.now() - 86400000 * 1).toISOString() },
      { id: 'tx_104', type: 'Lucky Spin Win', description: 'Spin wheel prize reward', points: 500, created_at: new Date().toISOString() }
    ];

    localStorage.setItem('cashback_transactions', JSON.stringify(initialTxs));
    setTransactions(initialTxs);
    setLoading(false);
  };

  const availablePoints = wallet?.available_points || 0;
  const availableRupees = (availablePoints / 10).toFixed(2);

  const numRupees = parseFloat(withdrawRupees) || 0;
  const pointsRequired = Math.round(numRupees * 10);
  const minRupees = 10;
  const minPoints = 100;

  const isUnderMin = numRupees > 0 && numRupees < minRupees;
  const isInsufficient = numRupees >= minRupees && pointsRequired > availablePoints && !successWithdrawal;
  const neededPoints = Math.max(0, pointsRequired - availablePoints);
  const neededRupees = (neededPoints / 10).toFixed(2);

  const handleWithdrawSubmit = async (e) => {
    if (e) e.preventDefault();
    setFeedbackError(null);

    if (!selectedBrand) {
      setFeedbackError('Please select a Gift Card Brand.');
      return;
    }

    if (!numRupees || numRupees < minRupees) {
      setFeedbackError(`Minimum withdrawal amount is ₹10.00 (100 Points).`);
      return;
    }

    if (pointsRequired > availablePoints) {
      setFeedbackError(`Insufficient Points: You have ${availablePoints} Pts (₹${availableRupees}). You need ${neededPoints} more Pts (₹${neededRupees}) to withdraw ₹${numRupees.toFixed(2)}.`);
      return;
    }

    setSubmitting(true);

    try {
      const res = await api.post('/withdraw/request', {
        voucher_id: selectedBrand.id,
        voucher_name: selectedBrand.name,
        points: pointsRequired,
        rupee_value: numRupees,
        denomination: numRupees
      });

      if (res.data && res.data.success) {
        setSuccessWithdrawal({
          brand: selectedBrand.name,
          amount: numRupees,
          points: pointsRequired,
          referenceId: res.data.withdrawal?.reference_id || `WD-${Date.now()}`
        });
        setWithdrawRupees('');
        setFeedbackError(null);

        if (refreshWallet) refreshWallet();
        fetchTransactions();
      } else {
        setFeedbackError(res.data?.message || 'Withdrawal request failed.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to submit withdrawal request.';
      setFeedbackError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTxs = transactions.filter((tx) => {
    if (filterType === 'CREDIT') return tx.points > 0;
    if (filterType === 'DEBIT') return tx.points < 0;
    return true;
  });

  const rupeePresets = [
    { rupee: 10, pts: 100 },
    { rupee: 20, pts: 200 },
    { rupee: 50, pts: 500 },
    { rupee: 100, pts: 1000 },
    { rupee: 250, pts: 2500 },
    { rupee: 500, pts: 5000 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '1000px', margin: '0 auto', width: '100%', paddingBottom: '95px', boxSizing: 'border-box' }}>
      
      {/* 1. PREMIUM WALLET BANNER */}
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
                ₹{availableRupees}
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
            <Sparkles size={14} color="#4ADE80" /> 10 Points = ₹1.00 (Minimum Withdrawal: ₹10 / 100 Pts)
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
            My Withdrawals <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* 2. DEDICATED GIFT CARD WITHDRAWAL SECTION */}
      <div className="card-white" style={{ padding: '20px 18px', width: '100%', boxSizing: 'border-box', border: '1.5px solid #E0E7FF' }}>
        
        {/* SUCCESSFUL WITHDRAWAL BANNER CARD */}
        {successWithdrawal ? (
          <div style={{
            background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
            border: '2px solid #86EFAC',
            borderRadius: '18px',
            padding: '24px 20px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            animation: 'modalPop 0.3s ease'
          }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#16A34A', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(22, 163, 74, 0.3)' }}>
              <CheckCircle2 size={34} />
            </div>

            <div>
              <h3 style={{ color: '#14532D', fontSize: '1.25rem', fontWeight: 800, margin: '0 0 6px 0' }}>
                Withdrawal Request Submitted! 🎉
              </h3>
              <p style={{ color: '#166534', fontSize: '0.875rem', margin: 0, lineHeight: 1.5, fontWeight: 600 }}>
                Your request for <strong>₹{successWithdrawal.amount.toFixed(2)} {successWithdrawal.brand}</strong> has been placed.
              </p>
              <div style={{ color: '#4B5563', fontSize: '0.775rem', marginTop: '6px' }}>
                Ref ID: <strong style={{ fontFamily: 'monospace', color: '#5B21B6' }}>{successWithdrawal.referenceId}</strong> • Status: <span style={{ color: '#D97706', fontWeight: 700 }}>Pending Admin Delivery</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '8px', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
              <button
                type="button"
                onClick={() => navigate('/portal/my-withdrawals')}
                style={{
                  background: '#16A34A',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '14px',
                  fontWeight: 800,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)'
                }}
              >
                Track in My Withdrawals <ArrowRight size={16} />
              </button>
              <button
                type="button"
                onClick={() => setSuccessWithdrawal(null)}
                style={{
                  background: '#FFFFFF',
                  color: '#15803D',
                  border: '1.5px solid #86EFAC',
                  padding: '12px 18px',
                  borderRadius: '14px',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <RotateCcw size={15} /> Make Another Withdrawal
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3 style={{ color: '#1E1B4B', fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <Gift size={20} color="#5B21B6" /> Gift Card Withdrawal
                </h3>
                <p style={{ color: '#6B7280', fontSize: '0.8rem', margin: '4px 0 0 0' }}>
                  Withdraw your points as instant brand digital gift vouchers (10 Points = ₹1.00)
                </p>
              </div>
              <button
                onClick={() => navigate('/portal/my-withdrawals')}
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
                My Gift Cards <ArrowRight size={13} />
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
                      onClick={() => {
                        setSelectedBrand(v);
                        setFeedbackError(null);
                      }}
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
                          Min: ₹10 (100 Pts)
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Choose Denomination Presets */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ color: '#374151', fontSize: '0.825rem', fontWeight: 800, display: 'block', marginBottom: '8px' }}>
                2. Choose Denomination (Rupees):
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(85px, 1fr))', gap: '8px', marginBottom: '10px' }}>
                {rupeePresets.map((d) => {
                  const isSelected = numRupees === d.rupee;
                  const canAfford = availablePoints >= d.pts;
                  return (
                    <button
                      key={d.rupee}
                      type="button"
                      onClick={() => {
                        setWithdrawRupees(d.rupee);
                        setFeedbackError(null);
                      }}
                      style={{
                        padding: '8px 4px',
                        borderRadius: '12px',
                        border: isSelected ? '2px solid #5B21B6' : '1px solid #E5E7EB',
                        background: isSelected ? '#5B21B6' : (canAfford ? '#FFFFFF' : '#F9FAFB'),
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
                  onClick={() => {
                    // If balance >= 100 pts (₹10), set exact balance; otherwise set minimum ₹10
                    if (availablePoints >= 100) {
                      setWithdrawRupees(Math.floor(availablePoints / 10));
                    } else {
                      setWithdrawRupees(10);
                    }
                    setFeedbackError(null);
                  }}
                  style={{
                    padding: '8px 4px',
                    borderRadius: '12px',
                    border: (numRupees === Math.floor(availablePoints / 10) && availablePoints >= 100) ? '2px solid #16A34A' : '1px solid #BBF7D0',
                    background: (numRupees === Math.floor(availablePoints / 10) && availablePoints >= 100) ? '#16A34A' : '#DCFCE7',
                    color: (numRupees === Math.floor(availablePoints / 10) && availablePoints >= 100) ? '#FFFFFF' : '#166534',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    textAlign: 'center'
                  }}
                >
                  <div>All Balance</div>
                  <div style={{ fontSize: '0.675rem', opacity: 0.9, fontWeight: 600 }}>{availablePoints} Pts</div>
                </button>
              </div>

              {/* Step 3: Direct Rupees (₹) Input Field */}
              <div style={{ marginTop: '12px' }}>
                <label style={{ color: '#374151', fontSize: '0.8rem', fontWeight: 800, display: 'block', marginBottom: '6px' }}>
                  Or Enter Custom Amount in Rupees (₹):
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#5B21B6', fontSize: '1.2rem', fontWeight: 800 }}>
                    ₹
                  </span>
                  <input
                    type="number"
                    value={withdrawRupees}
                    onChange={(e) => {
                      setWithdrawRupees(e.target.value);
                      setFeedbackError(null);
                    }}
                    step="1"
                    min="10"
                    placeholder="Enter amount in ₹ (Minimum ₹10)"
                    style={{
                      width: '100%',
                      padding: '11px 14px 11px 32px',
                      borderRadius: '12px',
                      border: (isInsufficient || isUnderMin) ? '2px solid #F87171' : '1.5px solid #5B21B6',
                      background: '#F9FAFB',
                      fontSize: '1.15rem',
                      fontWeight: 800,
                      color: '#1E1B4B',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Live Calculation / Points Deduction Display */}
            {numRupees > 0 && (
              <div style={{
                background: (isInsufficient || isUnderMin) ? '#FEF2F2' : 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
                borderRadius: '14px',
                border: (isInsufficient || isUnderMin) ? '1px solid #FECACA' : '1px solid #BBF7D0',
                padding: '12px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px',
                marginBottom: '14px'
              }}>
                <div>
                  <div style={{ color: (isInsufficient || isUnderMin) ? '#991B1B' : '#166534', fontSize: '0.75rem', fontWeight: 700 }}>
                    YOU WILL RECEIVE:
                  </div>
                  <div style={{ color: (isInsufficient || isUnderMin) ? '#DC2626' : '#16A34A', fontSize: '1.4rem', fontWeight: 800 }}>
                    ₹{numRupees.toFixed(2)} <span style={{ fontSize: '0.85rem', color: '#1E1B4B', fontWeight: 700 }}>({selectedBrand?.name || 'Gift Voucher'})</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#6B7280', fontSize: '0.725rem', fontWeight: 600 }}>Points Deducted:</div>
                  <div style={{ color: '#DC2626', fontSize: '1.15rem', fontWeight: 800 }}>
                    -{pointsRequired.toLocaleString()} Pts
                  </div>
                </div>
              </div>
            )}

            {/* Minimum ₹10 Warning Alert (when user enters < 10) */}
            {isUnderMin && (
              <div style={{
                background: '#FFFBEB',
                color: '#92400E',
                border: '1.5px solid #FCD34D',
                padding: '12px 14px',
                borderRadius: '14px',
                fontSize: '0.84rem',
                fontWeight: 700,
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px'
              }}>
                <AlertCircle size={20} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 800, color: '#B45309' }}>Minimum Withdrawal is ₹10.00 (100 Points)</div>
                  <div style={{ marginTop: '2px', lineHeight: 1.4 }}>
                    {availablePoints < 100 ? (
                      <>Your current balance is <strong>{availablePoints} Pts</strong> (₹{availableRupees}). You need <strong>{100 - availablePoints} more Pts</strong> to make a withdrawal.</>
                    ) : (
                      <>Please enter an amount of at least ₹10.00 (100 Points).</>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Insufficient Points Warning Box (when amount >= 10 but points > balance) */}
            {isInsufficient && (
              <div style={{
                background: '#FEF2F2',
                color: '#991B1B',
                border: '1.5px solid #FCA5A5',
                padding: '12px 14px',
                borderRadius: '14px',
                fontSize: '0.84rem',
                fontWeight: 700,
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px'
              }}>
                <AlertCircle size={20} color="#DC2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 800, color: '#B91C1C' }}>Insufficient Points Balance!</div>
                  <div style={{ marginTop: '2px', lineHeight: 1.4 }}>
                    You have <strong>{availablePoints} Pts</strong> (₹{availableRupees}). You need <strong>{neededPoints} more Pts</strong> (₹{neededRupees}) to withdraw ₹{numRupees.toFixed(2)}.
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {feedbackError && (
              <div style={{
                background: '#FEE2E2',
                color: '#991B1B',
                border: '1px solid #FCA5A5',
                padding: '12px 14px',
                borderRadius: '14px',
                fontSize: '0.84rem',
                fontWeight: 700,
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={18} />
                <span>{feedbackError}</span>
              </div>
            )}

            {/* Clean Full-Width Submit Button */}
            <div>
              <button
                type="button"
                onClick={handleWithdrawSubmit}
                disabled={submitting || isInsufficient || numRupees < minRupees}
                style={{
                  width: '100%',
                  background: (isInsufficient || numRupees < minRupees)
                    ? '#9CA3AF'
                    : 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '14px',
                  borderRadius: '14px',
                  fontSize: '0.975rem',
                  fontWeight: 800,
                  cursor: (isInsufficient || numRupees < minRupees) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: (isInsufficient || numRupees < minRupees) ? 'none' : '0 6px 20px rgba(34, 197, 94, 0.35)',
                  transition: 'all 0.2s ease'
                }}
              >
                <Gift size={18} />
                <span>
                  {submitting
                    ? 'Processing Request...'
                    : isUnderMin
                      ? 'Minimum Withdrawal is ₹10.00 (100 Pts)'
                      : isInsufficient
                        ? `Need ${neededPoints} More Points to Withdraw`
                        : numRupees >= minRupees
                          ? `Submit Withdrawal Request (₹${numRupees.toFixed(2)})`
                          : 'Enter Amount (Min ₹10)'}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. TRANSACTION HISTORY CARD LIST */}
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

    </div>
  );
}
