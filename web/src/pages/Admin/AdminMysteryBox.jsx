import React, { useState, useEffect } from 'react';
import {
  Package,
  Save,
  Play,
  RotateCcw,
  Sparkles,
  Award,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  BarChart2,
  Sliders,
  DollarSign,
  Activity,
  Plus,
  Trash2,
  Gift
} from 'lucide-react';
import { adminApi } from '../../api';

export default function AdminMysteryBox() {
  const [isActive, setIsActive] = useState(true);
  const [cooldownHours, setCooldownHours] = useState(24);
  const [tier1Prob, setTier1Prob] = useState(60);
  const [tier1Min, setTier1Min] = useState(0);
  const [tier1Max, setTier1Max] = useState(10);
  const [tier2Prob, setTier2Prob] = useState(40);
  const [tier2Rewards, setTier2Rewards] = useState([
    { id: 'mb_reward_50', points: 50, weight: 50, label: '50 Bonus Points' },
    { id: 'mb_reward_100', points: 100, weight: 50, label: '100 Mega Points' }
  ]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');

  // Stats
  const [stats, setStats] = useState({
    today_claims_count: 0,
    today_points_awarded: 0,
    total_claims_count: 0,
    total_points_awarded: 0,
    recent_claims: []
  });

  // Simulator
  const [simCount, setSimCount] = useState(1000);
  const [simulating, setSimulating] = useState(false);
  const [simResults, setSimResults] = useState(null);

  useEffect(() => {
    fetchMysteryBoxConfig();
  }, []);

  const fetchMysteryBoxConfig = async () => {
    try {
      setLoading(true);
      const res = await adminApi.get('/admin/mystery-box');
      if (res.data?.success) {
        const s = res.data.settings || {};
        setIsActive(s.is_active !== false);
        setCooldownHours(s.cooldown_hours || 24);
        setTier1Prob(s.tier1_probability !== undefined ? s.tier1_probability : 60);
        setTier1Min(s.tier1_min_points !== undefined ? s.tier1_min_points : 0);
        setTier1Max(s.tier1_max_points !== undefined ? s.tier1_max_points : 10);
        setTier2Prob(s.tier2_probability !== undefined ? s.tier2_probability : 40);
        if (Array.isArray(s.tier2_rewards) && s.tier2_rewards.length > 0) {
          setTier2Rewards(s.tier2_rewards);
        }
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (e) {
      console.error('Failed to fetch Mystery Box config:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleProbChange = (val, type) => {
    const num = Math.max(0, Math.min(100, parseInt(val, 10) || 0));
    if (type === 'tier1') {
      setTier1Prob(num);
      setTier2Prob(100 - num);
    } else {
      setTier2Prob(num);
      setTier1Prob(100 - num);
    }
  };

  const handleAddTier2Reward = () => {
    setTier2Rewards([
      ...tier2Rewards,
      { id: `mb_reward_${Date.now()}`, points: 200, weight: 20, label: '200 Ultra Points' }
    ]);
  };

  const handleRemoveTier2Reward = (idx) => {
    if (tier2Rewards.length <= 1) return;
    setTier2Rewards(tier2Rewards.filter((_, i) => i !== idx));
  };

  const handleTier2RewardChange = (idx, field, value) => {
    const updated = [...tier2Rewards];
    updated[idx] = {
      ...updated[idx],
      [field]: field === 'points' || field === 'weight' ? Math.max(1, parseInt(value, 10) || 1) : value
    };
    setTier2Rewards(updated);
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setToastMsg('');

    try {
      const payload = {
        is_active: isActive,
        cooldown_hours: cooldownHours,
        tier1_probability: tier1Prob,
        tier1_min_points: tier1Min,
        tier1_max_points: tier1Max,
        tier2_probability: tier2Prob,
        tier2_rewards: tier2Rewards
      };

      const res = await adminApi.put('/admin/mystery-box', payload);
      if (res.data?.success) {
        setToastType('success');
        setToastMsg('Mystery Box settings saved & live globally across App & Web!');
      } else {
        setToastType('error');
        setToastMsg(res.data?.message || 'Failed to save settings.');
      }
    } catch (err) {
      setToastType('error');
      setToastMsg('Network error saving settings.');
    } finally {
      setSaving(false);
      setTimeout(() => setToastMsg(''), 4000);
    }
  };

  const handleRunSimulation = async () => {
    setSimulating(true);
    setSimResults(null);

    try {
      const res = await adminApi.post('/admin/mystery-box/simulate', {
        count: simCount,
        tier1_probability: tier1Prob,
        tier1_min_points: tier1Min,
        tier1_max_points: tier1Max,
        tier2_rewards: tier2Rewards
      });

      if (res.data?.success) {
        setSimResults(res.data);
      }
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setSimulating(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
        <Sparkles size={32} className="spin-icon" style={{ margin: '0 auto 12px auto', display: 'block', color: '#7C3AED' }} />
        Loading Mystery Box Engine...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Toast Alert */}
      {toastMsg && (
        <div style={{
          padding: '14px 20px',
          borderRadius: '12px',
          background: toastType === 'success' ? '#DCFCE7' : '#FEE2E2',
          border: `1px solid ${toastType === 'success' ? '#86EFAC' : '#FECACA'}`,
          color: toastType === 'success' ? '#15803D' : '#DC2626',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}>
          {toastType === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #4C1D95 0%, #6D28D9 50%, #7C3AED 100%)',
        borderRadius: '20px',
        padding: '24px 28px',
        color: '#FFFFFF',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 10px 25px rgba(109, 40, 217, 0.25)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(8px)'
          }}>
            <Package size={30} color="#FDE047" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>Mystery Box Game Engine</h2>
              <span style={{
                background: isActive ? '#22C55E' : '#EF4444',
                color: '#FFF',
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '3px 10px',
                borderRadius: '12px',
                textTransform: 'uppercase'
              }}>
                {isActive ? 'Live & Active' : 'Paused'}
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', opacity: 0.9, fontSize: '0.85rem' }}>
              Dynamically control 1-per-day unboxing odds, payout limits, and admin bonus drops
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={saving}
          style={{
            background: '#22C55E',
            border: 'none',
            color: '#FFFFFF',
            padding: '12px 24px',
            borderRadius: '14px',
            fontWeight: 800,
            fontSize: '0.9rem',
            cursor: saving ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(34, 197, 94, 0.4)'
          }}
        >
          <Save size={18} />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748B', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>
            <span>TODAY'S UNBOXINGS</span>
            <Activity size={16} color="#7C3AED" />
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#0F172A' }}>
            {stats.today_claims_count.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: 600, marginTop: '4px' }}>
            + Active unique participants
          </div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748B', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>
            <span>POINTS DISBURSED TODAY</span>
            <Sparkles size={16} color="#F59E0B" />
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#0F172A' }}>
            {stats.today_points_awarded.toLocaleString()} <span style={{ fontSize: '0.9rem', color: '#64748B' }}>pts</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, marginTop: '4px' }}>
            Disbursed to user balances
          </div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748B', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>
            <span>ALL-TIME UNBOXINGS</span>
            <TrendingUp size={16} color="#0284C7" />
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#0F172A' }}>
            {stats.total_claims_count.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, marginTop: '4px' }}>
            Total global opens recorded
          </div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748B', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>
            <span>ALL-TIME POINTS REWARDED</span>
            <Award size={16} color="#16A34A" />
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#0F172A' }}>
            {stats.total_points_awarded.toLocaleString()} <span style={{ fontSize: '0.9rem', color: '#64748B' }}>pts</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: 600, marginTop: '4px' }}>
            Lifetime engagement budget
          </div>
        </div>
      </div>

      {/* Settings Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        
        {/* Tier 1 Box (Common 0 - 10 Points) */}
        <div style={{ background: '#FFFFFF', borderRadius: '18px', padding: '24px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Package size={22} color="#7C3AED" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>Tier 1: Standard Rewards</h3>
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Random small drops (0 - 10 pts)</span>
              </div>
            </div>
            <div style={{ background: '#EDE9FE', color: '#7C3AED', fontWeight: 800, padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem' }}>
              {tier1Prob}% Probability
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                Tier 1 Probability Weight (%):
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={tier1Prob}
                onChange={(e) => handleProbChange(e.target.value, 'tier1')}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.9rem', fontWeight: 700, boxSizing: 'border-box' }}
              />
              <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Automatically balances Tier 2 to {100 - tier1Prob}%</span>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  Min Points:
                </label>
                <input
                  type="number"
                  min="0"
                  value={tier1Min}
                  onChange={(e) => setTier1Min(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.9rem', fontWeight: 700, boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  Max Points:
                </label>
                <input
                  type="number"
                  min={tier1Min}
                  value={tier1Max}
                  onChange={(e) => setTier1Max(Math.max(tier1Min, parseInt(e.target.value, 10) || 10))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.9rem', fontWeight: 700, boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '12px', fontSize: '0.78rem', color: '#64748B', lineHeight: 1.5 }}>
              💡 When a user hits Tier 1 ({tier1Prob}%), they will receive a random outcome between <strong style={{ color: '#0F172A' }}>{tier1Min}</strong> and <strong style={{ color: '#0F172A' }}>{tier1Max} Points</strong>.
            </div>
          </div>
        </div>

        {/* Tier 2 Box (Admin Bonus Drops: 50 & 100 Points) */}
        <div style={{ background: '#FFFFFF', borderRadius: '18px', padding: '24px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Gift size={22} color="#D97706" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>Tier 2: Admin Mega Rewards</h3>
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Fixed high-value jackpots (50 & 100 pts)</span>
              </div>
            </div>
            <div style={{ background: '#FEF3C7', color: '#B45309', fontWeight: 800, padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem' }}>
              {tier2Prob}% Probability
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                Tier 2 Probability Weight (%):
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={tier2Prob}
                onChange={(e) => handleProbChange(e.target.value, 'tier2')}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.9rem', fontWeight: 700, boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Reward Pool & Relative Weights:</span>
                <button
                  type="button"
                  onClick={handleAddTier2Reward}
                  style={{ background: '#F1F5F9', border: 'none', color: '#7C3AED', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Plus size={14} /> Add Drop
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {tier2Rewards.map((reward, idx) => (
                  <div key={reward.id || idx} style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#F8FAFC', padding: '8px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <input
                      type="number"
                      placeholder="Points"
                      value={reward.points}
                      onChange={(e) => handleTier2RewardChange(idx, 'points', e.target.value)}
                      style={{ width: '75px', padding: '8px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: 800, textAlign: 'center' }}
                    />
                    <input
                      type="text"
                      placeholder="Label"
                      value={reward.label}
                      onChange={(e) => handleTier2RewardChange(idx, 'label', e.target.value)}
                      style={{ flex: 1, padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: 600 }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>Wt:</span>
                      <input
                        type="number"
                        placeholder="Weight"
                        value={reward.weight}
                        onChange={(e) => handleTier2RewardChange(idx, 'weight', e.target.value)}
                        style={{ width: '50px', padding: '8px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: 700, textAlign: 'center' }}
                      />
                    </div>
                    {tier2Rewards.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTier2Reward(idx)}
                        style={{ background: '#FEE2E2', border: 'none', color: '#DC2626', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: '#FFFBEB', border: '1px solid #FEF3C7', borderRadius: '12px', padding: '12px', fontSize: '0.78rem', color: '#92400E', lineHeight: 1.5 }}>
              🎁 Currently configured: When Tier 2 drops ({tier2Prob}%), users receive either <strong style={{ color: '#0F172A' }}>50 Points</strong> or <strong style={{ color: '#0F172A' }}>100 Points</strong>.
            </div>
          </div>
        </div>

      </div>

      {/* Global Limits & Rules */}
      <div style={{ background: '#FFFFFF', borderRadius: '18px', padding: '24px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>Platform Timezone & Cooldown Settings</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}>
          
          <div style={{ flex: 1, minWidth: '240px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
              Cooldown Period (Hours):
            </label>
            <input
              type="number"
              min="1"
              max="168"
              value={cooldownHours}
              onChange={(e) => setCooldownHours(Math.max(1, parseInt(e.target.value, 10) || 24))}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.9rem', fontWeight: 700, boxSizing: 'border-box' }}
            />
            <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Default 24h ensures 1 unboxing per day universally without timezone biases.</span>
          </div>

          <div style={{ flex: 1, minWidth: '240px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
              Feature State:
            </label>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              style={{
                width: '100%',
                padding: '11px 16px',
                borderRadius: '10px',
                border: 'none',
                background: isActive ? '#DCFCE7' : '#FEE2E2',
                color: isActive ? '#15803D' : '#DC2626',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              {isActive ? '✓ Mystery Box Enabled' : '✕ Mystery Box Paused'}
            </button>
          </div>

        </div>
      </div>

      {/* Probability Simulator */}
      <div style={{ background: '#FFFFFF', borderRadius: '18px', padding: '24px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>Monte Carlo Probability Simulator</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: '#64748B' }}>Test 1,000 simulated unboxings before committing changes</p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <select
              value={simCount}
              onChange={(e) => setSimCount(Number(e.target.value))}
              style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontWeight: 700, fontSize: '0.85rem' }}
            >
              <option value="500">500 Unboxings</option>
              <option value="1000">1,000 Unboxings</option>
              <option value="5000">5,000 Unboxings</option>
            </select>

            <button
              onClick={handleRunSimulation}
              disabled={simulating}
              style={{
                background: '#4C1D95',
                color: '#FFF',
                border: 'none',
                padding: '8px 18px',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: simulating ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Play size={14} fill="#FFF" />
              {simulating ? 'Running...' : 'Run Simulation'}
            </button>
          </div>
        </div>

        {simResults && (
          <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '16px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '14px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>Total Points Distributed:</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A' }}>{simResults.total_points_distributed?.toLocaleString()} pts</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>Avg Points Per Open:</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#7C3AED' }}>{simResults.avg_points_per_open} pts</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>Tier 1 Hits:</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#16A34A' }}>{simResults.tier1_hits} ({simResults.tier1_actual_percentage})</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>Tier 2 Hits:</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#D97706' }}>{simResults.tier2_hits} ({simResults.tier2_actual_percentage})</div>
              </div>
            </div>

            {simResults.tier2_rewards_breakdown && (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {simResults.tier2_rewards_breakdown.map((r, i) => (
                  <span key={i} style={{ background: '#FEF3C7', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, color: '#92400E' }}>
                    {r.label}: {r.hits} hits ({r.percentage})
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recent Claims Table */}
      <div style={{ background: '#FFFFFF', borderRadius: '18px', padding: '24px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
        <h3 style={{ margin: '0 0 14px 0', fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>Recent Mystery Box Claims</h3>
        
        {stats.recent_claims && stats.recent_claims.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B', textAlign: 'left' }}>
                  <th style={{ padding: '10px 12px' }}>User</th>
                  <th style={{ padding: '10px 12px' }}>Reward Tier</th>
                  <th style={{ padding: '10px 12px' }}>Points Won</th>
                  <th style={{ padding: '10px 12px' }}>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_claims.map((claim) => (
                  <tr key={claim.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 700, color: '#0F172A' }}>{claim.user_name || 'User'}</div>
                      <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{claim.user_email || claim.user_id}</div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        background: claim.tier === 'tier2' ? '#FEF3C7' : '#DCFCE7',
                        color: claim.tier === 'tier2' ? '#92400E' : '#15803D',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontWeight: 700,
                        fontSize: '0.75rem'
                      }}>
                        {claim.tier_label || (claim.tier === 'tier2' ? 'Mega Drop' : 'Common Drop')}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontWeight: 800, color: '#16A34A', fontSize: '0.95rem' }}>
                      +{claim.points_awarded} pts
                    </td>
                    <td style={{ padding: '12px', color: '#64748B' }}>
                      {claim.created_at ? new Date(claim.created_at).toLocaleString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '30px', color: '#94A3B8', fontSize: '0.85rem' }}>
            No claims recorded yet today.
          </div>
        )}
      </div>

    </div>
  );
}
