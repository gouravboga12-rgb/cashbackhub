import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import SpinWheel from '../../components/SpinWheel';
import { mergeWallet } from '../../utils/walletUtils';

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
      console.warn('Backend spin config offline, using default limit.');
    }
  };

  const getAvailablePoints = () => {
    if (wallet && wallet.available_points !== undefined && wallet.available_points !== null) {
      return Number(wallet.available_points) || 0;
    }
    return 0;
  };


  const handleSpinPlay = async () => {
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Try Backend API Play first
    try {
      const res = await api.post('/spin/play');
      if (res.data && res.data.success) {
        setSpinConfig((prev) => ({
          ...prev,
          spins_available_today: res.data.spins_available_today !== undefined ? res.data.spins_available_today : Math.max(0, prev.spins_available_today - 1)
        }));
        // Defer wallet update until spin completes and user clicks claim in completion modal
        return {
          targetIndex: typeof res.data.targetIndex === 'number' ? res.data.targetIndex : 0,
          reward_points: res.data.reward_points !== undefined ? res.data.reward_points : 0,
          cost_points: res.data.cost_points !== undefined ? res.data.cost_points : (spinConfig.cost_per_spin || COST_PER_SPIN),
          message: res.data.message,
          wallet: res.data.wallet
        };
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        // Backend actively returned an error (e.g. Insufficient points, Daily limit reached)
        throw new Error(err.response.data.message);
      }
      console.warn('Backend spin offline or network issue, using client simulation.');
    }

    // 2. Client Fallback Execution (only if network offline):
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

    const currentSlices = spinConfig.slices || slices;
    const winnerSlice = currentSlices[targetIndex] || currentSlices[0];
    const rewardPoints = winnerSlice.reward_points || 0;
    const spinCost = spinConfig.cost_per_spin || COST_PER_SPIN;

    setSpinConfig((prev) => ({
      ...prev,
      spins_available_today: Math.max(0, (prev.spins_available_today || DAILY_SPIN_LIMIT) - 1)
    }));

    return {
      targetIndex: targetIndex,
      reward_points: rewardPoints,
      cost_points: spinCost,
      message: rewardPoints > 0
        ? `🎉 Congratulations! You won +${rewardPoints} Points!`
        : 'Better luck next time!',
      wallet: null
    };
  };

  const handleClaimReward = (spinData) => {
    if (!spinData) return;
    if (typeof refreshWallet === 'function') {
      refreshWallet();
    }
    window.dispatchEvent(new Event('wallet_updated'));
    window.dispatchEvent(new Event('attendance_claimed'));
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
          onClaim={handleClaimReward}
          onNavigateToAds={() => navigate('/portal/play-dice')}
        />
      </div>

    </div>
  );
}
