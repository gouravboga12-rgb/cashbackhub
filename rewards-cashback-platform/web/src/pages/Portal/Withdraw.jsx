import React, { useState, useEffect } from 'react';
import api from '../../api';
import VoucherModal from '../../components/VoucherModal';
import { Gift, ArrowRight } from 'lucide-react';

export default function Withdraw({ wallet, refreshWallet }) {
  const [vouchers, setVouchers] = useState([]);
  const [selectedVoucher, setSelectedVoucher] = useState(null);

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      const res = await api.get('/withdraw/vouchers');
      if (res.data.success) {
        setVouchers(res.data.vouchers);
      }
    } catch (err) {
      console.error('Failed to load vouchers', err);
    }
  };

  const handleRedemptionSubmit = async (redemptionData) => {
    const res = await api.post('/withdraw/request', redemptionData);
    if (res.data.success) {
      refreshWallet();
    }
    return res.data;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #311042 50%, #5B21B6 100%)', borderRadius: '20px', padding: '24px 32px', border: '1px solid rgba(124, 58, 237, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ color: '#FFF', fontSize: '1.6rem', fontWeight: 800 }}>🎁 Digital Gift Voucher Catalog</h2>
          <p style={{ color: '#C4B5FD', fontSize: '0.9rem' }}>Redeem your points for instant gift cards (10 Points = ₹1.00)</p>
        </div>
        <div style={{ background: 'rgba(109, 40, 217, 0.3)', border: '1px solid #7C3AED', color: '#4ADE80', fontWeight: 800, padding: '10px 20px', borderRadius: '14px', fontSize: '1.1rem' }}>
          Available Balance: {wallet?.available_points?.toLocaleString() || 0} Pts (₹{((wallet?.available_points || 0) / 10).toFixed(2)})
        </div>
      </div>

      {/* VOUCHER GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        {vouchers.map((voucher) => (
          <div key={voucher.id} className="glass-card-dark" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '3rem', marginBottom: '14px', textAlign: 'center' }}>{voucher.logo || '💳'}</div>
              <h3 style={{ color: '#FFF', fontSize: '1.25rem', fontWeight: 800, textAlign: 'center', marginBottom: '6px' }}>{voucher.name}</h3>
              <p style={{ color: '#C4B5FD', fontSize: '0.85rem', textAlign: 'center', lineHeight: 1.5, marginBottom: '20px' }}>{voucher.description}</p>
            </div>

            <div>
              <div style={{ background: '#1E1445', borderRadius: '10px', padding: '10px', textAlign: 'center', border: '1px solid #3B2F6B', marginBottom: '16px' }}>
                <span style={{ color: '#C4B5FD', fontSize: '0.75rem' }}>MINIMUM REDEMPTION</span>
                <div style={{ color: '#4ADE80', fontSize: '1.1rem', fontWeight: 800 }}>
                  {voucher.minimum_points} Pts = ₹{voucher.minimum_points / 10}
                </div>
              </div>

              <button onClick={() => setSelectedVoucher(voucher)} className="btn-green" style={{ width: '100%' }}>
                Redeem Voucher <ArrowRight size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* VOUCHER MODAL */}
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
