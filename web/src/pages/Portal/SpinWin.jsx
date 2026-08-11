import React, { useState, useEffect } from 'react';
import api from '../../api';
import SpinWheel from '../../components/SpinWheel';

export default function SpinWin({ refreshWallet }) {
  const [spinConfig, setSpinConfig] = useState({ slices: [], spins_available_today: 1 });

  useEffect(() => {
    fetchSpinConfig();
  }, []);

  const fetchSpinConfig = async () => {
    try {
      const res = await api.get('/spin/config');
      if (res.data.success) {
        setSpinConfig({ slices: res.data.slices, spins_available_today: res.data.spins_available_today });
      }
    } catch (err) {
      console.error('Failed to load spin config', err);
    }
  };

  const handleSpinPlay = async () => {
    try {
      const res = await api.post('/spin/play');
      if (res.data.success) {
        setSpinConfig(prev => ({ ...prev, spins_available_today: 0 }));
        refreshWallet();
        return res.data;
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Spin failed.');
      return null;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', maxWidth: '700px', margin: '0 auto', width: '100%', paddingBottom: '90px', boxSizing: 'border-box' }}>
      
      {/* Header Banner */}
      <div className="card-violet-banner" style={{ width: '100%', padding: '24px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(1.3rem, 4.5vw, 1.8rem)', fontWeight: 800, marginBottom: '6px' }}>🎡 Spin & Win Lucky Wheel</h2>
        <p style={{ opacity: 0.9, fontSize: '0.875rem' }}>Test your luck daily! Win up to 1,000 Points instantly credited to your wallet.</p>
      </div>

      {/* Wheel Card Container */}
      <div className="card-white" style={{ width: '100%', padding: '32px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <SpinWheel
          slices={spinConfig.slices}
          spinsAvailable={spinConfig.spins_available_today}
          onSpin={handleSpinPlay}
        />
      </div>

    </div>
  );
}
