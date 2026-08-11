import React, { useState, useEffect } from 'react';
import api from '../../api';
import SpinWheel from '../../components/SpinWheel';
import { Disc, Sparkles } from 'lucide-react';

export default function SpinWin({ refreshWallet }) {
  const [spinConfig, setSpinConfig] = useState({ slices: [], spins_available_today: 1 });
  const [spinHistory, setSpinHistory] = useState([]);

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center' }}>
      
      {/* Header Banner */}
      <div style={{ width: '100%', background: 'linear-gradient(135deg, #1E1B4B 0%, #311042 50%, #5B21B6 100%)', borderRadius: '20px', padding: '24px 32px', border: '1px solid rgba(124, 58, 237, 0.3)', textAlign: 'center' }}>
        <h2 style={{ color: '#FFF', fontSize: '1.8rem', fontWeight: 800, marginBottom: '6px' }}>🎡 Spin & Win Lucky Wheel</h2>
        <p style={{ color: '#C4B5FD', fontSize: '0.95rem' }}>Test your luck daily! Win up to 1,000 Points instantly credited to your wallet.</p>
      </div>

      {/* Wheel Card Container */}
      <div className="glass-card-dark" style={{ width: '100%', maxWidth: '600px', padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <SpinWheel
          slices={spinConfig.slices}
          spinsAvailable={spinConfig.spins_available_today}
          onSpin={handleSpinPlay}
        />
      </div>

    </div>
  );
}
