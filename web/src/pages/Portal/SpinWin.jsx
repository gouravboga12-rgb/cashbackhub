import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import SpinWheel from '../../components/SpinWheel';

const DAILY_SPIN_LIMIT = 10;
const COST_PER_SPIN = 10;

export default function SpinWin({ user, wallet, refreshWallet }) {
  const navigate = useNavigate();

  const slices = [
    { id: '1', label: '1000 Points', reward_points: 1000, color: '#5B21B6' },
    { id: '2', label: '500 Points', reward_points: 500, color: '#22C55E' },
    { id: '3', label: '200 Points', reward_points: 200, color: '#7C3AED' },
    { id: '4', label: '50 Points', reward_points: 50, color: '#4ADE80' },
    { id: '5', label: '100 Points', reward_points: 100, color: '#6D28D9' },
    { id: '6', label: 'Better Luck Next Time', reward_points: 0, color: '#EC4899' },
  ];

  const [spinConfig, setSpinConfig] = useState({
    slices: slices,
    spins_available_today: DAILY_SPIN_LIMIT,
    daily_limit: DAILY_SPIN_LIMIT,
    cost_per_spin: COST_PER_SPIN
  });

  useEffect(() => {
    checkSpinAvailability();
  }, []);

  const checkSpinAvailability = async () => {
    const todayStr = new Date().toISOString().split('T')[0];

    // Check backend first
    try {
      const res = await api.get('/spin/config');
      if (res.data && res.data.success) {
        setSpinConfig((prev) => ({
          ...prev,
          slices: res.data.slices && res.data.slices.length > 0 ? res.data.slices : slices,
          spins_available_today: res.data.spins_available_today !== undefined ? res.data.spins_available_today : DAILY_SPIN_LIMIT,
          daily_limit: res.data.daily_limit || DAILY_SPIN_LIMIT,
          cost_per_spin: res.data.cost_per_spin || COST_PER_SPIN
        }));
        return;
      }
    } catch (err) {
      console.warn('Using client spin limit tracker.');
    }

    // Client fallback tracker
    const lastSpinDate = localStorage.getItem('cashback_spin_date');
    if (lastSpinDate === todayStr) {
      const spinsUsed = parseInt(localStorage.getItem('cashback_spin_count_today') || '0', 10);
      setSpinConfig((prev) => ({
        ...prev,
        spins_available_today: Math.max(0, DAILY_SPIN_LIMIT - spinsUsed)
      }));
    } else {
      localStorage.setItem('cashback_spin_date', todayStr);
      localStorage.setItem('cashback_spin_count_today', '0');
      setSpinConfig((prev) => ({
        ...prev,
        spins_available_today: DAILY_SPIN_LIMIT
      }));
    }
  };

  const getAvailablePoints = () => {
    if (wallet && typeof wallet.available_points === 'number') {
      return wallet.available_points;
    }
    try {
      const saved = localStorage.getItem('cashback_wallet');
      if (saved) {
        return JSON.parse(saved).available_points || 0;
      }
    } catch (e) {}
    return 2520;
  };

  const handleSpinPlay = async () => {
    const todayStr = new Date().toISOString().split('T')[0];

    // Pick a winning index (weighted towards exciting rewards)
    const possibleIndices = [0, 1, 2, 3, 4, 5];
    const weights = [5, 15, 25, 30, 20, 5];
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let rand = Math.random() * totalWeight;
    let targetIndex = 0;
    for (let i = 0; i < weights.length; i++) {
      if (rand < weights[i]) {
        targetIndex = i;
        break;
      }
      rand -= weights[i];
    }

    const winnerSlice = slices[targetIndex];
    const rewardPoints = winnerSlice.reward_points;

    // 1. Try Backend API Play first
    try {
      const res = await api.post('/spin/play', { targetIndex, reward_points: rewardPoints });
      if (res.data && res.data.success) {
        setSpinConfig((prev) => ({
          ...prev,
          spins_available_today: res.data.spins_available_today
        }));
        if (typeof refreshWallet === 'function') {
          refreshWallet();
        }
        window.dispatchEvent(new Event('attendance_claimed'));
        return {
          targetIndex: typeof res.data.targetIndex === 'number' ? res.data.targetIndex : targetIndex,
          reward_points: res.data.reward_points,
          cost_points: COST_PER_SPIN,
          message: res.data.message
        };
      }
    } catch (err) {
      console.warn('Backend spin offline, executing verified client deduction & reward fallback.');
    }

    // 2. Client Fallback Execution:
    // Update daily spin count
    const spinsUsed = parseInt(localStorage.getItem('cashback_spin_count_today') || '0', 10) + 1;
    localStorage.setItem('cashback_spin_date', todayStr);
    localStorage.setItem('cashback_spin_count_today', spinsUsed.toString());
    setSpinConfig((prev) => ({
      ...prev,
      spins_available_today: Math.max(0, DAILY_SPIN_LIMIT - spinsUsed)
    }));

    // Deduct 10 points and credit won reward to local wallet
    try {
      const savedWallet = localStorage.getItem('cashback_wallet');
      let walletObj = savedWallet
        ? JSON.parse(savedWallet)
        : { available_points: 2520, total_earned: 3320, total_redeemed: 800 };

      // Deduct 10 points entry fee
      walletObj.available_points = Math.max(0, walletObj.available_points - COST_PER_SPIN);

      // Add reward if won
      if (rewardPoints > 0) {
        walletObj.available_points += rewardPoints;
        walletObj.total_earned += rewardPoints;
      }

      localStorage.setItem('cashback_wallet', JSON.stringify(walletObj));

      // Add transactions: 1 for -10 deduction and 1 for win (if > 0)
      const savedTxs = localStorage.getItem('cashback_transactions');
      let txList = savedTxs ? JSON.parse(savedTxs) : [];

      txList.unshift({
        id: `tx_${Date.now()}_fee`,
        type: 'Spin Entry Fee',
        description: `Spent ${COST_PER_SPIN} points on Lucky Spin Wheel`,
        points: -COST_PER_SPIN,
        created_at: new Date().toISOString()
      });

      if (rewardPoints > 0) {
        txList.unshift({
          id: `tx_${Date.now()}_win`,
          type: 'Lucky Spin Win',
          description: `Won ${rewardPoints} Points on Lucky Wheel`,
          points: rewardPoints,
          created_at: new Date().toISOString()
        });
      }

      localStorage.setItem('cashback_transactions', JSON.stringify(txList));
    } catch (e) {
      console.error('Spin wallet fallback error:', e);
    }

    // Trigger wallet refresh & UI event
    if (typeof refreshWallet === 'function') {
      refreshWallet();
    }
    window.dispatchEvent(new Event('attendance_claimed'));

    return {
      targetIndex: targetIndex,
      reward_points: rewardPoints,
      cost_points: COST_PER_SPIN,
      message: rewardPoints > 0
        ? `🎉 Congratulations! You won +${rewardPoints} Points!`
        : 'Better luck next time!'
    };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', maxWidth: '700px', margin: '0 auto', width: '100%', paddingBottom: '90px', boxSizing: 'border-box' }}>
      
      {/* Header Banner */}
      <div className="card-violet-banner" style={{ width: '100%', padding: '20px 16px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(1.3rem, 4.5vw, 1.8rem)', fontWeight: 800, marginBottom: '4px' }}>🎡 Spin & Win Lucky Wheel</h2>
        <p style={{ opacity: 0.9, fontSize: '0.85rem', margin: 0 }}>
          Test your luck up to <strong>{spinConfig.daily_limit || 10} times daily</strong>! Each spin costs {spinConfig.cost_per_spin || 10} Points. Win up to 1,000 Points instantly credited to your wallet.
        </p>
      </div>

      {/* Wheel Card Container */}
      <div className="card-white" style={{ width: '100%', padding: '24px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <SpinWheel
          slices={spinConfig.slices}
          spinsAvailable={spinConfig.spins_available_today}
          dailyLimit={spinConfig.daily_limit || 10}
          costPerSpin={spinConfig.cost_per_spin || 10}
          userPoints={getAvailablePoints()}
          onSpin={handleSpinPlay}
          onNavigateToAds={() => navigate('/portal/watch-ads')}
        />
      </div>

    </div>
  );
}
