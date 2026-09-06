import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Sparkles, Check, Phone, MessageSquare } from 'lucide-react';
import BrandLogo from './BrandLogo';

export default function VoucherModal({ voucher, wallet, onClose, onConfirm, pointsToRupeeRatio = 10 }) {
  const [step, setStep] = useState(1);
  const [selectedPoints, setSelectedPoints] = useState(voucher?.minimum_points || 1000);
  const [userMobile, setUserMobile] = useState('');
  const [userNotes, setUserNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!voucher) return null;

  const availablePoints = wallet?.available_points || 0;
  const rupeePreview = (selectedPoints / pointsToRupeeRatio).toFixed(2);
  const minPoints = voucher.minimum_points || 500;

  const standardDenominations = [
    { rupee: 50, pts: 500 },
    { rupee: 100, pts: 1000 },
    { rupee: 250, pts: 2500 },
    { rupee: 500, pts: 5000 },
    { rupee: 1000, pts: 10000 },
  ];

  const handleNext = () => {
    if (selectedPoints < minPoints) {
      setErrorMsg(`Minimum redemption requirement is ${minPoints} Points (₹${(minPoints / pointsToRupeeRatio).toFixed(2)})`);
      return;
    }
    if (selectedPoints > availablePoints) {
      setErrorMsg(`Insufficient balance. You have ${availablePoints.toLocaleString()} available points.`);
      return;
    }
    setErrorMsg('');
    setStep(2);
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await onConfirm({
        voucher_id: voucher.id,
        voucher_name: voucher.name,
        points: selectedPoints,
        rupee_value: parseFloat(rupeePreview),
        denomination: parseFloat(rupeePreview),
        user_mobile: userMobile,
        user_notes: userNotes
      });
      setStep(3); // Success step
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to submit withdrawal request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 12, 35, 0.78)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        maxWidth: '460px',
        width: '100%',
        background: '#FFFFFF',
        borderRadius: '24px',
        padding: '24px 20px',
        boxShadow: '0 20px 50px rgba(91, 33, 182, 0.25)',
        border: '1px solid #EDE9FE',
        position: 'relative',
        boxSizing: 'border-box',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#F4F3F8',
            border: 'none',
            color: '#4B5563',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>

        {/* Stepper Header (1 -> 2 -> 3) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%',
            background: step >= 1 ? '#22C55E' : '#E5E7EB',
            color: '#FFFFFF', fontWeight: 800, fontSize: '0.8rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {step > 1 ? <Check size={16} /> : '1'}
          </div>

          <div style={{ height: '3px', width: '36px', background: step >= 2 ? '#22C55E' : '#E5E7EB', borderRadius: '2px' }} />

          <div style={{
            width: '28px', height: '28px', borderRadius: '50%',
            background: step >= 2 ? '#22C55E' : '#E5E7EB',
            color: step >= 2 ? '#FFFFFF' : '#6B7280', fontWeight: 800, fontSize: '0.8rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {step > 2 ? <Check size={16} /> : '2'}
          </div>

          <div style={{ height: '3px', width: '36px', background: step >= 3 ? '#22C55E' : '#E5E7EB', borderRadius: '2px' }} />

          <div style={{
            width: '28px', height: '28px', borderRadius: '50%',
            background: step >= 3 ? '#22C55E' : '#E5E7EB',
            color: step >= 3 ? '#FFFFFF' : '#6B7280', fontWeight: 800, fontSize: '0.8rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            3
          </div>
        </div>

        {/* STEP 1: SELECT DENOMINATION & ENTER POINTS */}
        {step === 1 && (
          <div>
            {/* Voucher Brand Card Header */}
            <div style={{
              background: 'linear-gradient(135deg, #F8F7FC 0%, #F5F3FF 100%)',
              border: '1px solid #DDD6FE',
              borderRadius: '16px',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '18px'
            }}>
              <BrandLogo brandName={voucher.name} size={48} />
              <div>
                <h3 style={{ color: '#1E1B4B', fontSize: '1.05rem', fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
                  {voucher.name}
                </h3>
                <div style={{ color: '#6B7280', fontSize: '0.775rem', fontWeight: 600, marginTop: '2px' }}>
                  Provider: {voucher.provider || voucher.name.split(' ')[0]} • 10 Pts = ₹1
                </div>
              </div>
            </div>

            {/* Quick Denomination Chips */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ color: '#4B5563', fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                Select Denomination:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                {standardDenominations.map((d) => {
                  const isSelected = selectedPoints === d.pts;
                  const isAffordable = availablePoints >= d.pts;
                  return (
                    <button
                      key={d.rupee}
                      type="button"
                      onClick={() => setSelectedPoints(d.pts)}
                      style={{
                        padding: '8px 4px',
                        borderRadius: '12px',
                        border: isSelected ? '2px solid #5B21B6' : '1px solid #E5E7EB',
                        background: isSelected ? '#5B21B6' : (isAffordable ? '#F9FAFB' : '#F3F4F6'),
                        color: isSelected ? '#FFFFFF' : (isAffordable ? '#1E1B4B' : '#9CA3AF'),
                        fontWeight: 800,
                        fontSize: '0.8rem',
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
                  onClick={() => setSelectedPoints(availablePoints >= minPoints ? availablePoints : minPoints)}
                  style={{
                    padding: '8px 4px',
                    borderRadius: '12px',
                    border: selectedPoints === availablePoints ? '2px solid #16A34A' : '1px solid #BBF7D0',
                    background: selectedPoints === availablePoints ? '#16A34A' : '#DCFCE7',
                    color: selectedPoints === availablePoints ? '#FFFFFF' : '#166534',
                    fontWeight: 800,
                    fontSize: '0.775rem',
                    cursor: 'pointer',
                    textAlign: 'center'
                  }}
                >
                  <div>Max</div>
                  <div style={{ fontSize: '0.675rem', opacity: 0.9, fontWeight: 600 }}>{availablePoints} Pts</div>
                </button>
              </div>
            </div>

            {/* Custom Points Input */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ color: '#4B5563', fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                Or Enter Custom Points to Redeem:
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  value={selectedPoints}
                  onChange={(e) => setSelectedPoints(parseInt(e.target.value) || 0)}
                  step="50"
                  min={minPoints}
                  placeholder={`Min ${minPoints} pts`}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '14px',
                    background: '#F8F7FC',
                    border: '2px solid #5B21B6',
                    color: '#1E1B4B',
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    boxSizing: 'border-box'
                  }}
                />
                <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6B7280', fontWeight: 700, fontSize: '0.85rem' }}>
                  Pts
                </span>
              </div>
            </div>

            {/* Conversion Calculation Result */}
            <div style={{
              background: 'linear-gradient(135deg, #DCFCE7 0%, #F0FDF4 100%)',
              border: '1px solid #BBF7D0',
              borderRadius: '16px',
              padding: '12px 14px',
              textAlign: 'center',
              marginBottom: '14px'
            }}>
              <div style={{ color: '#166534', fontSize: '0.75rem', fontWeight: 700 }}>Equivalent Gift Card Value (10 Pts = ₹1):</div>
              <div style={{ color: '#16A34A', fontSize: '1.75rem', fontWeight: 800, lineHeight: 1.1, marginTop: '2px' }}>
                ₹{rupeePreview}
              </div>
              <div style={{ color: '#4B5563', fontSize: '0.725rem', marginTop: '2px' }}>
                Available Balance: <strong>{availablePoints.toLocaleString()} Pts</strong> (₹{(availablePoints / pointsToRupeeRatio).toFixed(2)})
              </div>
            </div>

            {/* Optional Delivery Mobile */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ color: '#4B5563', fontSize: '0.775rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                Delivery Phone / WhatsApp (Optional):
              </label>
              <div style={{ display: 'flex', alignItems: 'center', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '0 10px' }}>
                <Phone size={14} color="#9CA3AF" />
                <input
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  value={userMobile}
                  onChange={(e) => setUserMobile(e.target.value)}
                  style={{ width: '100%', padding: '10px 8px', border: 'none', background: 'transparent', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>
            </div>

            {errorMsg && (
              <div style={{ background: '#FEE2E2', border: '1px solid #DC2626', color: '#B91C1C', padding: '8px 12px', borderRadius: '12px', fontSize: '0.8rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircle size={15} /> {errorMsg}
              </div>
            )}

            <button
              type="button"
              onClick={handleNext}
              style={{
                width: '100%',
                padding: '13px',
                borderRadius: '16px',
                border: 'none',
                background: 'linear-gradient(135deg, #5B21B6 0%, #7C3AED 100%)',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 6px 20px rgba(91, 33, 182, 0.35)'
              }}
            >
              <span>Continue to Confirm</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* STEP 2: CONFIRMATION */}
        {step === 2 && (
          <div>
            <h3 style={{ color: '#1E1B4B', fontSize: '1.15rem', fontWeight: 800, marginBottom: '14px', textAlign: 'center' }}>
              Confirm Withdrawal Request
            </h3>
            
            <div style={{
              background: '#F8F7FC',
              borderRadius: '16px',
              padding: '16px',
              border: '1px solid #EDE9FE',
              marginBottom: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E5E7EB', paddingBottom: '8px', fontSize: '0.875rem' }}>
                <span style={{ color: '#6B7280', fontWeight: 600 }}>Selected Voucher:</span>
                <span style={{ color: '#1E1B4B', fontWeight: 800 }}>{voucher.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E5E7EB', paddingBottom: '8px', fontSize: '0.875rem' }}>
                <span style={{ color: '#6B7280', fontWeight: 600 }}>Points to Redeem:</span>
                <span style={{ color: '#DC2626', fontWeight: 800 }}>-{selectedPoints.toLocaleString()} Pts</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
                <span style={{ color: '#6B7280', fontWeight: 600 }}>Voucher Amount:</span>
                <span style={{ color: '#16A34A', fontWeight: 800, fontSize: '1.15rem' }}>₹{rupeePreview}</span>
              </div>
              {userMobile && (
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E5E7EB', paddingTop: '8px', fontSize: '0.825rem' }}>
                  <span style={{ color: '#6B7280', fontWeight: 600 }}>Delivery Contact:</span>
                  <span style={{ color: '#1E1B4B', fontWeight: 700 }}>{userMobile}</span>
                </div>
              )}
            </div>

            {/* Optional User Notes */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ color: '#4B5563', fontSize: '0.775rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                Add Note for Admin (Optional):
              </label>
              <textarea
                placeholder="Any special instructions or account ID..."
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                rows={2}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '10px', border: '1px solid #E5E7EB', background: '#F9FAFB', fontSize: '0.825rem', boxSizing: 'border-box', outline: 'none' }}
              />
            </div>

            {errorMsg && (
              <div style={{ background: '#FEE2E2', border: '1px solid #DC2626', color: '#B91C1C', padding: '8px 12px', borderRadius: '12px', fontSize: '0.8rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircle size={15} /> {errorMsg}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  flex: 1,
                  background: '#F8F7FC',
                  border: '1px solid #E5E7EB',
                  color: '#4B5563',
                  padding: '12px',
                  borderRadius: '14px',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmit}
                disabled={isSubmitting}
                style={{
                  flex: 2,
                  background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '14px',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  boxShadow: '0 6px 18px rgba(34, 197, 94, 0.35)'
                }}
              >
                {isSubmitting ? 'Processing...' : 'Confirm & Redeem'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SUCCESS */}
        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: '#DCFCE7',
              color: '#16A34A',
              margin: '0 auto 14px auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 18px rgba(34, 197, 94, 0.25)'
            }}>
              <CheckCircle2 size={36} />
            </div>

            <h3 style={{ color: '#1E1B4B', fontSize: '1.3rem', fontWeight: 800, marginBottom: '6px' }}>
              Request Submitted! 🎉
            </h3>

            <p style={{ color: '#6B7280', fontSize: '0.85rem', marginBottom: '20px', lineHeight: 1.5, fontWeight: 500 }}>
              Your withdrawal request for <strong>{voucher.name} (₹{rupeePreview})</strong> has been submitted to Admin. Once approved, your gift voucher code, PIN, and image will be available in <strong>My Withdrawals</strong>.
            </p>

            <button
              type="button"
              onClick={onClose}
              style={{
                width: '100%',
                padding: '13px',
                borderRadius: '16px',
                border: 'none',
                background: '#5B21B6',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: '0 6px 18px rgba(91, 33, 182, 0.3)'
              }}
            >
              View in My Withdrawals
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
