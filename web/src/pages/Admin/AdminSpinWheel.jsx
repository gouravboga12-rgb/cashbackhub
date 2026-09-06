import React, { useState, useEffect } from 'react';
import {
  Disc,
  Plus,
  Save,
  Trash2,
  CheckCircle,
  Play,
  Info,
  Tv,
  Settings2,
  Zap,
  Sliders,
  Gift
} from 'lucide-react';
import { adminApi } from '../../api';

export default function AdminSpinWheel() {
  const [slices, setSlices] = useState([]);
  const [dailySpinLimit, setDailySpinLimit] = useState(10);
  const [dailyAdLimit, setDailyAdLimit] = useState(10);
  const [costPerSpin, setCostPerSpin] = useState(10);
  const [adRewardPoints, setAdRewardPoints] = useState(10);
  const [signupBonusPoints, setSignupBonusPoints] = useState(100);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingLimits, setSavingLimits] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [simResults, setSimResults] = useState(null);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    fetchSpinConfig();
  }, []);

  const fetchSpinConfig = async () => {
    try {
      setLoading(true);
      const res = await adminApi.get('/admin/spin-wheel');
      if (res.data?.success) {
        setSlices(res.data.slices || []);
        if (res.data.daily_spin_limit_per_user !== undefined) {
          setDailySpinLimit(res.data.daily_spin_limit_per_user);
        }
        if (res.data.daily_ad_limit !== undefined) {
          setDailyAdLimit(res.data.daily_ad_limit);
        }
        if (res.data.cost_per_spin !== undefined) {
          setCostPerSpin(res.data.cost_per_spin);
        }
        if (res.data.ad_reward_points !== undefined) {
          setAdRewardPoints(res.data.ad_reward_points);
        }
        if (res.data.signup_bonus_points !== undefined) {
          setSignupBonusPoints(res.data.signup_bonus_points);
        }
      }
    } catch (err) {
      console.warn('Spin wheel config API offline, loading default slices.');
      setSlices([
        { id: 'slice_1', label: '1,000 Points', reward_points: 1000, probability_weight: 5, color: '#5B21B6', daily_limit: 5, today_awarded_count: 1, remaining_limit: 4, is_active: true },
        { id: 'slice_2', label: '500 Points', reward_points: 500, probability_weight: 15, color: '#4ADE80', daily_limit: 15, today_awarded_count: 3, remaining_limit: 12, is_active: true },
        { id: 'slice_3', label: '200 Points', reward_points: 200, probability_weight: 25, color: '#6D28D9', daily_limit: 50, today_awarded_count: 12, remaining_limit: 38, is_active: true },
        { id: 'slice_4', label: '100 Points', reward_points: 100, probability_weight: 25, color: '#22C55E', daily_limit: 100, today_awarded_count: 24, remaining_limit: 76, is_active: true },
        { id: 'slice_5', label: '50 Points', reward_points: 50, probability_weight: 20, color: '#7C3AED', daily_limit: 0, today_awarded_count: 45, remaining_limit: 'Unlimited', is_active: true },
        { id: 'slice_6', label: 'Better Luck Next Time', reward_points: 0, probability_weight: 10, color: '#EC4899', daily_limit: 0, today_awarded_count: 18, remaining_limit: 'Unlimited', is_active: true }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleSliceChange = (index, field, value) => {
    const updated = [...slices];
    updated[index] = { ...updated[index], [field]: value };
    setSlices(updated);
  };

  const handleAddSlice = () => {
    const newId = `slice_${Date.now()}`;
    setSlices([
      ...slices,
      {
        id: newId,
        label: 'New Reward',
        reward_points: 150,
        probability_weight: 10,
        color: '#2563EB',
        daily_limit: 0,
        today_awarded_count: 0,
        remaining_limit: 'Unlimited',
        is_active: true
      }
    ]);
  };

  const handleDeleteSlice = (index) => {
    if (slices.length <= 2) {
      alert('The spin wheel must have at least 2 reward outcomes.');
      return;
    }
    const updated = slices.filter((_, i) => i !== index);
    setSlices(updated);
  };

  const handleSaveDailyLimits = async () => {
    try {
      setSavingLimits(true);
      const payload = {
        daily_spin_limit: parseInt(dailySpinLimit, 10) || 10,
        daily_ad_limit: parseInt(dailyAdLimit, 10) || 10,
        cost_per_spin: parseInt(costPerSpin, 10) || 10,
        ad_reward_points: parseInt(adRewardPoints, 10) || 10,
        signup_bonus_points: parseInt(signupBonusPoints, 10) >= 0 ? parseInt(signupBonusPoints, 10) : 100,
        slices
      };

      let responseData = null;
      try {
        const res = await adminApi.put('/admin/settings', payload);
        if (res.data?.success) {
          responseData = res.data;
        }
      } catch (err1) {
        // Fallback to spin-wheel endpoint
        const res2 = await adminApi.put('/admin/spin-wheel', payload);
        if (res2.data?.success) {
          responseData = res2.data;
        }
      }

      if (responseData) {
        if (responseData.daily_spin_limit_per_user !== undefined) setDailySpinLimit(responseData.daily_spin_limit_per_user);
        if (responseData.daily_ad_limit !== undefined) setDailyAdLimit(responseData.daily_ad_limit);
        if (responseData.cost_per_spin !== undefined) setCostPerSpin(responseData.cost_per_spin);
        if (responseData.ad_reward_points !== undefined) setAdRewardPoints(responseData.ad_reward_points);
        if (responseData.signup_bonus_points !== undefined) setSignupBonusPoints(responseData.signup_bonus_points);
        if (responseData.slices) setSlices(responseData.slices);
        showToast('Platform settings (Daily Limits & Sign-Up Bonus) updated successfully!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating daily limits. Please check backend connection.');
    } finally {
      setSavingLimits(false);
    }
  };

  const handleSaveConfig = async () => {
    try {
      setSaving(true);
      const res = await adminApi.put('/admin/spin-wheel', {
        slices,
        daily_spin_limit: parseInt(dailySpinLimit, 10) || 10,
        daily_ad_limit: parseInt(dailyAdLimit, 10) || 10,
        cost_per_spin: parseInt(costPerSpin, 10) || 10,
        ad_reward_points: parseInt(adRewardPoints, 10) || 10
      });
      if (res.data?.success) {
        if (res.data.daily_spin_limit_per_user !== undefined) setDailySpinLimit(res.data.daily_spin_limit_per_user);
        if (res.data.daily_ad_limit !== undefined) setDailyAdLimit(res.data.daily_ad_limit);
        if (res.data.cost_per_spin !== undefined) setCostPerSpin(res.data.cost_per_spin);
        if (res.data.ad_reward_points !== undefined) setAdRewardPoints(res.data.ad_reward_points);
        if (res.data.slices) setSlices(res.data.slices);
        showToast('Spin Wheel configuration & daily limits saved successfully!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving configuration');
    } finally {
      setSaving(false);
    }
  };

  const totalActiveWeight = slices
    .filter(s => s.is_active)
    .reduce((sum, s) => sum + (parseInt(s.probability_weight, 10) || 0), 0);

  // Live Probability Simulator
  const runSimulation = (trials = 1000) => {
    setSimulating(true);
    setTimeout(() => {
      const counts = {};
      slices.forEach(s => { counts[s.label] = 0; });

      const eligible = slices.filter(s => s.is_active);
      const weightSum = eligible.reduce((acc, s) => acc + (parseInt(s.probability_weight, 10) || 0), 0);

      for (let t = 0; t < trials; t++) {
        let rand = Math.random() * weightSum;
        for (let i = 0; i < eligible.length; i++) {
          const s = eligible[i];
          const w = parseInt(s.probability_weight, 10) || 0;
          if (rand < w) {
            counts[s.label] = (counts[s.label] || 0) + 1;
            break;
          }
          rand -= w;
        }
      }

      setSimResults({ trials, counts });
      setSimulating(false);
    }, 300);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: '#059669',
          color: '#FFFFFF',
          padding: '12px 20px',
          borderRadius: '10px',
          fontWeight: 700,
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div
        className="admin-banner-flex"
        style={{
          background: 'linear-gradient(135deg, #5B21B6 0%, #7C3AED 100%)',
          borderRadius: '16px',
          padding: '24px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 8px 24px rgba(91, 33, 182, 0.2)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <Disc size={26} color="#FFFFFF" />
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
              Spin & Win Probability & Daily Budget Engine
            </h2>
          </div>
          <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.86rem' }}>
            Configure outcome rewards, weighted probability distribution, and strict daily caps (e.g. max 5 wins of 1,000 pts/day).
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={handleAddSlice}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.35)',
              color: '#FFFFFF',
              padding: '10px 16px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '0.84rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Plus size={16} /> Add Slice
          </button>

          <button
            onClick={handleSaveConfig}
            disabled={saving}
            style={{
              background: '#FFFFFF',
              border: 'none',
              color: '#5B21B6',
              padding: '10px 20px',
              borderRadius: '10px',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: '0.88rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)'
            }}
          >
            <Save size={16} />
            <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </div>

      {/* Platform Daily Limits Configuration Card */}
      <div
        className="admin-card-container"
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sliders size={22} color="#7C3AED" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                Daily Limits & User Engagement Quotas
              </h3>
              <p style={{ margin: '3px 0 0 0', fontSize: '0.82rem', color: '#64748B' }}>
                Configure custom daily allowances for user ad watches, lucky spins, and point reward economics.
              </p>
            </div>
          </div>

          <button
            onClick={handleSaveDailyLimits}
            disabled={savingLimits}
            style={{
              background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
              border: 'none',
              color: '#FFFFFF',
              padding: '9px 18px',
              borderRadius: '10px',
              cursor: savingLimits ? 'not-allowed' : 'pointer',
              fontSize: '0.84rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)'
            }}
          >
            <Save size={15} />
            <span>{savingLimits ? 'Saving Limits...' : 'Save Daily Limits'}</span>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          {/* Custom Ads Watch Limit */}
          <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Tv size={18} color="#EA580C" />
              <label style={{ fontSize: '0.86rem', fontWeight: 800, color: '#1E293B' }}>
                Daily Ads Watch Limit
              </label>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="number"
                min="1"
                max="100"
                value={dailyAdLimit}
                onChange={(e) => setDailyAdLimit(e.target.value)}
                style={{
                  flex: 1,
                  background: '#FFFFFF',
                  border: '1.5px solid #CBD5E1',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: '#0F172A',
                  outline: 'none'
                }}
              />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748B' }}>ads / day</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.74rem', color: '#64748B', lineHeight: 1.3 }}>
              Maximum video ads a user can watch & earn rewards from each day.
            </p>
          </div>

          {/* Custom Spins Limit */}
          <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Disc size={18} color="#7C3AED" />
              <label style={{ fontSize: '0.86rem', fontWeight: 800, color: '#1E293B' }}>
                Daily Spin Wheel Limit
              </label>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="number"
                min="1"
                max="100"
                value={dailySpinLimit}
                onChange={(e) => setDailySpinLimit(e.target.value)}
                style={{
                  flex: 1,
                  background: '#FFFFFF',
                  border: '1.5px solid #CBD5E1',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: '#0F172A',
                  outline: 'none'
                }}
              />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748B' }}>spins / day</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.74rem', color: '#64748B', lineHeight: 1.3 }}>
              Maximum spins allowed per user per day before midnight reset.
            </p>
          </div>

          {/* Points Per Ad Reward */}
          <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={18} color="#16A34A" />
              <label style={{ fontSize: '0.86rem', fontWeight: 800, color: '#1E293B' }}>
                Ad Watch Reward
              </label>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="number"
                min="1"
                max="1000"
                value={adRewardPoints}
                onChange={(e) => setAdRewardPoints(e.target.value)}
                style={{
                  flex: 1,
                  background: '#FFFFFF',
                  border: '1.5px solid #CBD5E1',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: '#0F172A',
                  outline: 'none'
                }}
              />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748B' }}>points / ad</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.74rem', color: '#64748B', lineHeight: 1.3 }}>
              Points credited to user wallet for each completed ad video.
            </p>
          </div>

          {/* Cost Per Spin */}
          <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Settings2 size={18} color="#2563EB" />
              <label style={{ fontSize: '0.86rem', fontWeight: 800, color: '#1E293B' }}>
                Cost Per Spin
              </label>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="number"
                min="0"
                max="1000"
                value={costPerSpin}
                onChange={(e) => setCostPerSpin(e.target.value)}
                style={{
                  flex: 1,
                  background: '#FFFFFF',
                  border: '1.5px solid #CBD5E1',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: '#0F172A',
                  outline: 'none'
                }}
              />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748B' }}>points / spin</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.74rem', color: '#64748B', lineHeight: 1.3 }}>
              Wallet points deducted to play the lucky wheel (0 for free).
            </p>
          </div>

          {/* Sign-Up Welcome Bonus for New Accounts */}
          <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Gift size={18} color="#9333EA" />
                <label style={{ fontSize: '0.86rem', fontWeight: 800, color: '#1E293B' }}>
                  Sign-Up Welcome Bonus
                </label>
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#059669', background: '#ECFDF5', padding: '2px 8px', borderRadius: '10px' }}>
                ≈ ₹{((parseInt(signupBonusPoints, 10) || 0) / 10).toFixed(2)}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="number"
                min="0"
                max="10000"
                value={signupBonusPoints}
                onChange={(e) => setSignupBonusPoints(e.target.value)}
                style={{
                  flex: 1,
                  background: '#FFFFFF',
                  border: '1.5px solid #CBD5E1',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: '#0F172A',
                  outline: 'none'
                }}
              />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748B' }}>pts / new user</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.74rem', color: '#64748B', lineHeight: 1.3 }}>
              Free welcome points automatically credited to new user wallets upon registration (Email & Google).
            </p>
          </div>
        </div>
      </div>

      {/* Rules Notice */}
      <div style={{
        background: '#EFF6FF',
        border: '1px solid #BFDBFE',
        borderRadius: '12px',
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        fontSize: '0.84rem',
        color: '#1E40AF'
      }}>
        <Info size={20} color="#2563EB" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong style={{ color: '#1E3A8A' }}>Autonomous Budget Lockout Protocol:</strong> When a slice reaches its daily limit (e.g. 5/5 for 1,000 Points), the engine automatically removes it from active probability selection and redistributes odds fairly until 00:00 midnight daily reset.
        </div>
      </div>

      {/* Slices Manager Table */}
      <div
        className="admin-card-container"
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}
      >
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 16px 0', color: '#0F172A' }}>
          Configured Wheel Outcomes ({slices.length} Slices)
        </h3>

        <div className="admin-table-container" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left', color: '#64748B' }}>
                <th style={{ padding: '12px', fontWeight: 700 }}>Color</th>
                <th style={{ padding: '12px', fontWeight: 700 }}>Reward Label</th>
                <th style={{ padding: '12px', fontWeight: 700 }}>Points Value</th>
                <th style={{ padding: '12px', fontWeight: 700 }}>Weight / Probability</th>
                <th style={{ padding: '12px', fontWeight: 700 }}>Daily Limit</th>
                <th style={{ padding: '12px', fontWeight: 700 }}>Today's Won</th>
                <th style={{ padding: '12px', fontWeight: 700 }}>Remaining Budget</th>
                <th style={{ padding: '12px', fontWeight: 700 }}>Active</th>
                <th style={{ padding: '12px', fontWeight: 700 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {slices.map((slice, idx) => {
                const weight = parseInt(slice.probability_weight, 10) || 0;
                const probability = totalActiveWeight > 0 && slice.is_active ? ((weight / totalActiveWeight) * 100).toFixed(1) : 0;
                const isCapped = slice.daily_limit > 0 && slice.today_awarded_count >= slice.daily_limit;

                return (
                  <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9', opacity: slice.is_active ? 1 : 0.5 }}>
                    {/* Color picker */}
                    <td style={{ padding: '12px' }}>
                      <input
                        type="color"
                        value={slice.color || '#5B21B6'}
                        onChange={(e) => handleSliceChange(idx, 'color', e.target.value)}
                        style={{ width: '32px', height: '32px', border: '1px solid #E2E8F0', borderRadius: '6px', cursor: 'pointer', background: 'transparent' }}
                      />
                    </td>

                    {/* Label */}
                    <td style={{ padding: '12px' }}>
                      <input
                        type="text"
                        value={slice.label}
                        onChange={(e) => handleSliceChange(idx, 'label', e.target.value)}
                        style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '8px 12px', color: '#0F172A', fontSize: '0.84rem', width: '160px', fontWeight: 600, outline: 'none' }}
                      />
                    </td>

                    {/* Reward Points */}
                    <td style={{ padding: '12px' }}>
                      <input
                        type="number"
                        min="0"
                        value={slice.reward_points}
                        onChange={(e) => handleSliceChange(idx, 'reward_points', parseInt(e.target.value, 10) || 0)}
                        style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '8px 12px', color: '#0F172A', fontSize: '0.84rem', width: '90px', fontWeight: 700, outline: 'none' }}
                      />
                    </td>

                    {/* Probability Weight */}
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={slice.probability_weight}
                          onChange={(e) => handleSliceChange(idx, 'probability_weight', parseInt(e.target.value, 10) || 1)}
                          style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '8px 12px', color: '#0F172A', fontSize: '0.84rem', width: '70px', fontWeight: 700, outline: 'none' }}
                        />
                        <span style={{ fontSize: '0.78rem', color: '#7C3AED', fontWeight: 800, minWidth: '45px' }}>
                          {probability}%
                        </span>
                      </div>
                    </td>

                    {/* Daily Limit */}
                    <td style={{ padding: '12px' }}>
                      <input
                        type="number"
                        min="0"
                        placeholder="0 = Unlimited"
                        value={slice.daily_limit}
                        onChange={(e) => handleSliceChange(idx, 'daily_limit', parseInt(e.target.value, 10) || 0)}
                        style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '8px 12px', color: '#0F172A', fontSize: '0.84rem', width: '85px', outline: 'none' }}
                      />
                    </td>

                    {/* Today Awarded */}
                    <td style={{ padding: '12px', fontWeight: 700, color: '#334155' }}>
                      {slice.today_awarded_count || 0} wins
                    </td>

                    {/* Remaining Budget Status */}
                    <td style={{ padding: '12px' }}>
                      {isCapped ? (
                        <span style={{ padding: '3px 8px', borderRadius: '10px', background: '#FEF2F2', color: '#DC2626', fontSize: '0.72rem', fontWeight: 800 }}>
                          Limit Reached (Locked)
                        </span>
                      ) : (
                        <span style={{ padding: '3px 8px', borderRadius: '10px', background: '#ECFDF5', color: '#059669', fontSize: '0.72rem', fontWeight: 800 }}>
                          {slice.daily_limit > 0 ? `${slice.daily_limit - (slice.today_awarded_count || 0)} left` : 'Unlimited'}
                        </span>
                      )}
                    </td>

                    {/* Active Checkbox */}
                    <td style={{ padding: '12px' }}>
                      <input
                        type="checkbox"
                        checked={slice.is_active !== false}
                        onChange={(e) => handleSliceChange(idx, 'is_active', e.target.checked)}
                        style={{ width: '18px', height: '18px', accentColor: '#7C3AED', cursor: 'pointer' }}
                      />
                    </td>

                    {/* Delete */}
                    <td style={{ padding: '12px' }}>
                      <button
                        onClick={() => handleDeleteSlice(idx)}
                        style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', cursor: 'pointer', padding: '6px', borderRadius: '6px' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simulator Card */}
      <div
        className="admin-card-container"
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>
              🎲 Monte-Carlo Probability Distribution Simulator
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: '#64748B' }}>
              Simulate 1,000 spins using the configured weights to audit fairness and expected payouts.
            </p>
          </div>

          <button
            onClick={() => runSimulation(1000)}
            disabled={simulating}
            style={{
              background: '#F5F3FF',
              border: '1px solid #DDD6FE',
              color: '#6D28D9',
              padding: '8px 16px',
              borderRadius: '10px',
              cursor: simulating ? 'not-allowed' : 'pointer',
              fontSize: '0.84rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Play size={14} />
            <span>{simulating ? 'Simulating 1,000 spins...' : 'Run 1,000 Spin Test'}</span>
          </button>
        </div>

        {simResults && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginTop: '16px' }}>
            {Object.entries(simResults.counts).map(([label, count], idx) => {
              const pct = ((count / simResults.trials) * 100).toFixed(1);
              return (
                <div key={idx} style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>{label}</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: '4px 0' }}>
                    {count} <span style={{ fontSize: '0.76rem', color: '#059669', fontWeight: 700 }}>({pct}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '5px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: '#7C3AED' }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
