import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Sparkles, Check } from 'lucide-react';
import BrandLogo from './BrandLogo';

export default function VoucherModal({ voucher, wallet, onClose, onConfirm, pointsToRupeeRatio = 10 }) {
  const [step, setStep] = useState(1);
  const [selectedPoints, setSelectedPoints] = useState(1000);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!voucher) return null;

  const availablePoints = wallet?.available_points || 0;
  const rupeePreview = (selectedPoints / pointsToRupeeRatio).toFixed(2);
  const minPoints = voucher.minimum_points || 1000;

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
      await onConfirm({ voucher_id: voucher.id, points: selectedPoints });
      setStep(3); // Success step
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit withdrawal request.');
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
        maxWidth: '440px',
        width: '100%',
        background: '#FFFFFF',
        borderRadius: '24px',
        padding: '24px 20px',
        boxShadow: '0 20px 50px rgba(91, 33, 182, 0.2)',
        border: '1px solid #EDE9FE',
        position: 'relative',
        boxSizing: 'border-box',
        animation: 'modalPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
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

        {/* STEP 1: ENTER POINTS */}
        {step === 1 && (
          <div>
            {/* Voucher Brand Card Header */}
            <div style={{
              background: '#F8F7FC',
              border: '1px solid #EDE9FE',
              borderRadius: '16px',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '18px'
            }}>
              <BrandLogo brandName={voucher.name} size={44} />
              <div>
                <h3 style={{ color: '#1E1B4B', fontSize: '1.05rem', fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
                  {voucher.name}
                </h3>
                <div style={{ color: '#6B7280', fontSize: '0.775rem', fontWeight: 600, marginTop: '2px' }}>
                  Provider: {voucher.provider || voucher.name.split(' ')[0]}
                </div>
              </div>
            </div>

            {/* Input Points */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ color: '#4B5563', fontSize: '0.825rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                Enter Points to Redeem:
              </label>
              <input
                type="number"
                value={selectedPoints}
                onChange={(e) => setSelectedPoints(parseInt(e.target.value) || 0)}
                step="100"
                min={minPoints}
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
            </div>

            {/* Quick Select Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '16px' }}>
              {[1000, 2000, 5000].map((pts) => (
                <button
                  key={pts}
                  type="button"
                  onClick={() => setSelectedPoints(pts)}
                  style={{
                    padding: '8px 4px',
                    borderRadius: '12px',
                    border: selectedPoints === pts ? '1.5 solid #5B21B6' : '1px solid #E5E7EB',
                    background: selectedPoints === pts ? '#5B21B6' : '#F3E8FF',
                    color: selectedPoints === pts ? '#FFFFFF' : '#5B21B6',
                    fontWeight: 800,
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                >
                  {pts} Pts
                </button>
              ))}
              <button
                type="button"
                onClick={() => setSelectedPoints(availablePoints || 1000)}
                style={{
                  padding: '8px 4px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '0.725rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                Max ({availablePoints})
              </button>
            </div>

            {/* Rupee Value Preview Banner */}
            <div style={{
              background: 'linear-gradient(135deg, #DCFCE7 0%, #F0FDF4 100%)',
              border: '1px solid #BBF7D0',
              borderRadius: '16px',
              padding: '12px 14px',
              textAlign: 'center',
              marginBottom: '18px'
            }}>
              <div style={{ color: '#166534', fontSize: '0.775rem', fontWeight: 600 }}>You will receive voucher worth:</div>
              <div style={{ color: '#16A34A', fontSize: '1.6rem', fontWeight: 800, lineHeight: 1.1, marginTop: '2px' }}>
                ₹{rupeePreview}
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
                background: 'linear-gradient(135deg, #2563EB 0%, #16A34A 100%)',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 6px 20px rgba(37, 99, 235, 0.35)'
              }}
            >
              <span>Next Step</span>
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
              marginBottom: '18px',
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
              Your withdrawal request for <strong>{voucher.name} (₹{rupeePreview})</strong> has been submitted successfully! Details will be sent to your registered account.
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
              Done
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
