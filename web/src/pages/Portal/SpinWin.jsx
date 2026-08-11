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
    checkSpinAvailability();
  }, []);

  const checkSpinAvailability = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const lastSpinDate = localStorage.getItem('cashback_last_spin_date');

    if (lastSpinDate === todayStr) {
      setSpinConfig((prev) => ({ ...prev, spins_available_today: 0 }));
    } else {
      setSpinConfig((prev) => ({ ...prev, spins_available_today: 1 }));
    }
  };

  const handleSpinPlay = async () => {
    const todayStr = new Date().toISOString().split('T')[0];

    // Select winning slice
    const winningSlices = [
      { reward_points: 1000, message: '🎉 WOW! You won the JACKPOT 1,000 Points!' },
      { reward_points: 500, message: '🎉 Congratulations! You won 500 Points!' },
      { reward_points: 200, message: '🎉 Awesome! You won 200 Points!' },
      { reward_points: 100, message: '🎉 Great Spin! You won 100 Points!' },
      { reward_points: 50, message: '🎉 Good Spin! You won 50 Points!' },
    ];

    const winner = winningSlices[Math.floor(Math.random() * winningSlices.length)];

    // 1. Mark spin as completed for today
    localStorage.setItem('cashback_last_spin_date', todayStr);
    setSpinConfig((prev) => ({ ...prev, spins_available_today: 0 }));

    // 2. Add winning points directly to wallet balance
    try {
      const savedWallet = localStorage.getItem('cashback_wallet');
      let walletObj = savedWallet
        ? JSON.parse(savedWallet)
        : { available_points: 2520, total_earned: 3320, total_redeemed: 800 };

      walletObj.available_points += winner.reward_points;
      walletObj.total_earned += winner.reward_points;
      localStorage.setItem('cashback_wallet', JSON.stringify(walletObj));
    } catch (e) {
      console.error('Spin wallet update error:', e);
    }

    // 3. Log transaction to transaction history
    try {
      const savedTxs = localStorage.getItem('cashback_transactions');
      let txList = savedTxs ? JSON.parse(savedTxs) : [];
      txList.unshift({
        id: `tx_${Date.now()}`,
        type: 'Lucky Spin Win',
        description: `Won ${winner.reward_points} Points on Lucky Wheel`,
        points: winner.reward_points,
        created_at: new Date().toISOString()
      });
      localStorage.setItem('cashback_transactions', JSON.stringify(txList));
    } catch (e) {
      console.error('Spin tx update error:', e);
    }

    // 4. Send API request in background
    try {
      api.post('/spin/play', { reward_points: winner.reward_points }).catch(() => {});
    } catch (err) {}

    // 5. Instantly trigger wallet refresh and event notification
    if (typeof refreshWallet === 'function') {
      refreshWallet();
    }
    window.dispatchEvent(new Event('attendance_claimed'));

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
