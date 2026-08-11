import React, { useState, useEffect } from 'react';
import api from '../../api';
import SpinWheel from '../../components/SpinWheel';

export default function SpinWin({ refreshWallet }) {
  const [spinConfig, setSpinConfig] = useState({
    slices: [
      { id: '1', label: '1000 Points', reward_points: 1000, color: '#5B21B6' },
      { id: '2', label: '500 Points', reward_points: 500, color: '#22C55E' },
      { id: '3', label: '200 Points', reward_points: 200, color: '#7C3AED' },
      { id: '4', label: '50 Points', reward_points: 50, color: '#4ADE80' },
      { id: '5', label: '100 Points', reward_points: 100, color: '#6D28D9' },
      { id: '6', label: 'Better Luck Next Time', reward_points: 0, color: '#EC4899' },
    ],
    spins_available_today: 1
  });

  useEffect(() => {
    fetchSpinConfig();
    checkLocalSpinStatus();
  }, []);

  const checkLocalSpinStatus = () => {
    const today = new Date().toDateString();
    const lastSpinDate = localStorage.getItem('cashback_last_spin_date');
    if (lastSpinDate === today) {
      setSpinConfig((prev) => ({ ...prev, spins_available_today: 0 }));
    }
  };

  const fetchSpinConfig = async () => {
    try {
      const res = await api.get('/spin/config');
      if (res.data && res.data.success && res.data.slices) {
        setSpinConfig({
          slices: res.data.slices,
          spins_available_today: res.data.spins_available_today
        });
      }
    } catch (err) {
      console.warn('Using client spin config fallback.');
    }
  };

  const handleSpinPlay = async () => {
    try {
      const res = await api.post('/spin/play');
      if (res.data && res.data.success) {
        setSpinConfig((prev) => ({ ...prev, spins_available_today: 0 }));
        const today = new Date().toDateString();
        localStorage.setItem('cashback_last_spin_date', today);
        refreshWallet();
        return res.data;
      }
    } catch (err) {
      console.warn('Backend spin API offline, executing client spin reward fallback.');
    }

    // Client fallback: select winning slice (weighted towards positive rewards)
    const winningSlices = [
      { reward_points: 1000, message: '🎉 WOW! You won the JACKPOT 1,000 Points!' },
      { reward_points: 500, message: '🎉 Congratulations! You won 500 Points!' },
      { reward_points: 200, message: '🎉 Awesome! You won 200 Points!' },
      { reward_points: 100, message: '🎉 Great Spin! You won 100 Points!' },
      { reward_points: 50, message: '🎉 Good Spin! You won 50 Points!' },
    ];

    const winner = winningSlices[Math.floor(Math.random() * winningSlices.length)];
    const today = new Date().toDateString();
    localStorage.setItem('cashback_last_spin_date', today);
    setSpinConfig((prev) => ({ ...prev, spins_available_today: 0 }));

    // Add winning reward points directly to local wallet
    try {
      const walletData = localStorage.getItem('cashback_wallet') || JSON.stringify({ available_points: 2520, total_earned: 3320 });
      const parsed = JSON.parse(walletData);
      parsed.available_points += winner.reward_points;
      parsed.total_earned += winner.reward_points;
      localStorage.setItem('cashback_wallet', JSON.stringify(parsed));
    } catch (e) {}

    refreshWallet();

    return {
      success: true,
      reward_points: winner.reward_points,
      message: winner.message
    };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', maxWidth: '700px', margin: '0 auto', width: '100%', paddingBottom: '90px', boxSizing: 'border-box' }}>
      
      {/* Header Banner */}
      <div className="card-violet-banner" style={{ width: '100%', padding: '20px 16px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(1.3rem, 4.5vw, 1.8rem)', fontWeight: 800, marginBottom: '4px' }}>🎡 Spin & Win Lucky Wheel</h2>
        <p style={{ opacity: 0.9, fontSize: '0.85rem', margin: 0 }}>Test your luck daily! Win up to 1,000 Points instantly credited to your wallet.</p>
      </div>

      {/* Wheel Card Container */}
      <div className="card-white" style={{ width: '100%', padding: '24px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <SpinWheel
          slices={spinConfig.slices}
          spinsAvailable={spinConfig.spins_available_today}
          onSpin={handleSpinPlay}
        />
      </div>

    </div>
  );
}
