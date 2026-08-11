import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle, Gift } from 'lucide-react';

export default function VoucherModal({ voucher, wallet, onClose, onConfirm, pointsToRupeeRatio = 10 }) {
  const [step, setStep] = useState(1);
  const [selectedPoints, setSelectedPoints] = useState(1000);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!voucher) return null;

  const availablePoints = wallet?.available_points || 0;
  const rupeePreview = (selectedPoints / pointsToRupeeRatio).toFixed(2);

  const handleNext = () => {
    if (selectedPoints < voucher.minimum_points) {
      setErrorMsg(`Minimum redemption requirement is ${voucher.minimum_points} Points (₹${voucher.minimum_points / pointsToRupeeRatio})`);
      return;
    }
    if (selectedPoints > availablePoints) {
      setErrorMsg(`Insufficient balance. You have ${availablePoints} available points.`);
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
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(14, 11, 31, 0.85)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="glass-card-dark" style={{ maxWidth: '520px', width: '100%', padding: '32px', position: 'relative' }}>
        
        {/* Close Button */}
        <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: '#C4B5FD', cursor: 'pointer' }}>
          <X size={24} />
        </button>

        {/* Stepper Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: step >= 1 ? '#22C55E' : '#3B2F6B', color: '#FFF', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</div>
          <div style={{ height: '3px', width: '40px', background: step >= 2 ? '#22C55E' : '#3B2F6B' }} />
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: step >= 2 ? '#22C55E' : '#3B2F6B', color: '#FFF', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</div>
          <div style={{ height: '3px', width: '40px', background: step >= 3 ? '#22C55E' : '#3B2F6B' }} />
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: step >= 3 ? '#22C55E' : '#3B2F6B', color: '#FFF', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</div>
        </div>

        {/* STEP 1: ENTER POINTS */}
        {step === 1 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', padding: '16px', background: '#1E1445', borderRadius: '12px', border: '1px solid #3B2F6B' }}>
              <div style={{ fontSize: '2rem' }}>{voucher.logo || '💳'}</div>
              <div>
                <h3 style={{ color: '#FFF', fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>{voucher.name}</h3>
                <p style={{ color: '#C4B5FD', fontSize: '0.85rem', margin: 0 }}>Provider: {voucher.provider}</p>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: '#C4B5FD', fontSize: '0.875rem', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                Enter Points to Redeem:
              </label>
              <input
                type="number"
                value={selectedPoints}
                onChange={(e) => setSelectedPoints(parseInt(e.target.value) || 0)}
                step="100"
                min={voucher.minimum_points}
                style={{ width: '100%', padding: '14px', borderRadius: '10px', background: '#1E1445', border: '1px solid #7C3AED', color: '#FFF', fontSize: '1.2rem', fontWeight: 800 }}
              />
            </div>

            {/* Quick Select Buttons */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              {[1000, 2000, 5000].map((pts) => (
                <button
                  key={pts}
                  onClick={() => setSelectedPoints(pts)}
                  style={{ flex: 1, padding: '8px', borderRadius: '8px', background: selectedPoints === pts ? '#7C3AED' : '#1E1445', border: '1px solid #3B2F6B', color: '#FFF', fontWeight: 700, cursor: 'pointer' }}
                >
                  {pts} Pts
                </button>
              ))}
              <button
                onClick={() => setSelectedPoints(availablePoints)}
                style={{ flex: 1, padding: '8px', borderRadius: '8px', background: '#22C55E', border: 'none', color: '#FFF', fontWeight: 800, cursor: 'pointer' }}
              >
                Max ({availablePoints})
              </button>
            </div>

            {/* Rupee Value Preview Banner */}
            <div style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid #22C55E', borderRadius: '12px', padding: '16px', textAlign: 'center', marginBottom: '24px' }}>
              <span style={{ color: '#C4B5FD', fontSize: '0.85rem' }}>You will receive voucher worth:</span>
              <div style={{ color: '#4ADE80', fontSize: '1.6rem', fontWeight: 800 }}>₹{rupeePreview}</div>
            </div>

            {errorMsg && (
              <div style={{ color: '#EF4444', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircle size={16} /> {errorMsg}
              </div>
            )}

            <button onClick={handleNext} className="btn-primary" style={{ width: '100%' }}>
              Next Step
            </button>
          </div>
        )}

        {/* STEP 2: CONFIRMATION */}
        {step === 2 && (
          <div>
            <h3 style={{ color: '#FFF', fontSize: '1.25rem', fontWeight: 800, marginBottom: '16px', textAlign: 'center' }}>Confirm Withdrawal Request</h3>
            
            <div style={{ background: '#1E1445', borderRadius: '12px', padding: '20px', border: '1px solid #3B2F6B', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
                <span style={{ color: '#C4B5FD' }}>Selected Voucher:</span>
                <span style={{ color: '#FFF', fontWeight: 700 }}>{voucher.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
                <span style={{ color: '#C4B5FD' }}>Points to Redeem:</span>
                <span style={{ color: '#EF4444', fontWeight: 800 }}>-{selectedPoints.toLocaleString()} Pts</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#C4B5FD' }}>Voucher Amount:</span>
                <span style={{ color: '#4ADE80', fontWeight: 800, fontSize: '1.2rem' }}>₹{rupeePreview}</span>
              </div>
            </div>

            {errorMsg && (
              <div style={{ color: '#EF4444', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircle size={16} /> {errorMsg}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setStep(1)} style={{ flex: 1, background: 'transparent', border: '1px solid #3B2F6B', color: '#C4B5FD', padding: '12px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>
                Back
              </button>
              <button onClick={handleConfirmSubmit} disabled={isSubmitting} className="btn-green" style={{ flex: 2 }}>
                {isSubmitting ? 'Processing...' : 'Confirm & Redeem'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SUCCESS */}
        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#22C55E', margin: '0 auto 16px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle color="#FFF" size={36} />
            </div>
            <h3 style={{ color: '#FFF', fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>Request Submitted!</h3>
            <p style={{ color: '#C4B5FD', fontSize: '0.95rem', marginBottom: '24px', lineHeight: 1.5 }}>
              Your withdrawal request for <strong>{voucher.name} (₹{rupeePreview})</strong> has been submitted. Voucher details will be delivered to your registered email & phone once fulfilled!
            </p>
            <button onClick={onClose} className="btn-primary" style={{ width: '100%' }}>
              Done
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
