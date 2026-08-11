import React, { useState, useEffect } from 'react';
import api from '../../api';
import VoucherModal from '../../components/VoucherModal';
import BrandLogo from '../../components/BrandLogo';
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '1100px', margin: '0 auto', boxSizing: 'border-box', paddingBottom: '80px' }}>
      
      {/* Header Banner */}
      <div className="card-violet-banner" style={{ padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ color: '#FFF', fontSize: '1.5rem', fontWeight: 800 }}>🎁 Digital Gift Voucher Catalog</h2>
          <p style={{ color: '#E9D5FF', fontSize: '0.875rem' }}>Redeem your points for instant brand gift cards (10 Points = ₹1.00)</p>
        </div>
        <div style={{ background: 'rgba(255, 255, 255, 0.15)', border: '1px solid rgba(255,255,255,0.3)', color: '#4ADE80', fontWeight: 800, padding: '8px 18px', borderRadius: '16px', fontSize: '1rem' }}>
          Wallet: {wallet?.available_points?.toLocaleString() || 0} Pts (₹{((wallet?.available_points || 0) / 10).toFixed(2)})
        </div>
      </div>

      {/* VOUCHER GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', width: '100%' }}>
        {vouchers.map((voucher) => (
          <div key={voucher.id} className="card-white" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <BrandLogo brandName={voucher.name} size={64} />
              </div>
              <h3 style={{ color: '#1E1B4B', fontSize: '1.2rem', fontWeight: 800, textAlign: 'center', marginBottom: '6px' }}>{voucher.name}</h3>
              <p style={{ color: '#6B7280', fontSize: '0.85rem', textAlign: 'center', lineHeight: 1.5, marginBottom: '20px' }}>{voucher.description}</p>
            </div>

            <div>
              <div style={{ background: '#F8F7FC', borderRadius: '12px', padding: '10px', textAlign: 'center', border: '1px solid #E5E7EB', marginBottom: '16px' }}>
                <span style={{ color: '#6B7280', fontSize: '0.75rem', fontWeight: 700 }}>MINIMUM REDEMPTION</span>
                <div style={{ color: '#16A34A', fontSize: '1.1rem', fontWeight: 800 }}>
                  {voucher.minimum_points} Pts = ₹{voucher.minimum_points / 10}
                </div>
              </div>

              <button onClick={() => setSelectedVoucher(voucher)} className="btn-green" style={{ width: '100%', borderRadius: '14px', padding: '12px' }}>
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
