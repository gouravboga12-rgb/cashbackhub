import React, { useState, useEffect } from 'react';
import {
  Dices,
  Save,
  Play,
  RotateCcw,
  Sparkles,
  Award,
  AlertCircle,
  CheckCircle,
  Clock,
  Tv,
  TrendingUp,
  BarChart2,
  Sliders,
  DollarSign,
  Activity
} from 'lucide-react';
import { adminApi } from '../../api';

const DEFAULT_FACES = [
  { face: 1, points: 0, weight: 20, label: 'Better Luck Next Time' },
  { face: 2, points: 0, weight: 20, label: 'Better Luck Next Time' },
  { face: 3, points: 5, weight: 25, label: '+5 Points' },
  { face: 4, points: 5, weight: 15, label: '+5 Points' },
  { face: 5, points: 8, weight: 12, label: '+8 Points' },
  { face: 6, points: 10, weight: 8, label: '+10 Points' }
];

export default function AdminDiceGame() {
  const [faces, setFaces] = useState(DEFAULT_FACES);
  const [dailyLimit, setDailyLimit] = useState(10);
  const [adDuration, setAdDuration] = useState(6);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Stats
  const [stats, setStats] = useState({
    today_rolls_count: 0,
    today_points_awarded: 0,
    total_rolls_count: 0,
    total_points_awarded: 0,
    recent_rolls: []
  });

  // Simulator
  const [simCount, setSimCount] = useState(1000);
  const [simulating, setSimulating] = useState(false);
  const [simResults, setSimResults] = useState(null);

  useEffect(() => {
    fetchDiceConfig();
  }, []);

  const fetchDiceConfig = async () => {
    try {
      setLoading(true);
      const res = await adminApi.get('/admin/dice');
      if (res.data && res.data.success) {
        if (res.data.settings) {
          if (Array.isArray(res.data.settings.faces) && res.data.settings.faces.length === 6) {
            setFaces(res.data.settings.faces);
          }
          if (res.data.settings.daily_limit !== undefined) {
            setDailyLimit(res.data.settings.daily_limit);
          }
          if (res.data.settings.ad_duration_seconds !== undefined) {
            setAdDuration(res.data.settings.ad_duration_seconds);
          }
        }
        setStats({
          today_rolls_count: res.data.today_rolls_count || 0,
          today_points_awarded: res.data.today_points_awarded || 0,
          total_rolls_count: res.data.total_rolls_count || 0,
          total_points_awarded: res.data.total_points_awarded || 0,
          recent_rolls: res.data.recent_rolls || []
        });
      }
    } catch (err) {
      console.warn('Failed to load admin dice settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message) => {
    setToastMsg(message);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleFaceChange = (index, field, value) => {
    setFaces((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const totalWeight = faces.reduce((sum, f) => sum + (Math.max(1, Number(f.weight) || 10)), 0);

  const handleSaveConfig = async () => {
    try {
      setSaving(true);
      const res = await adminApi.put('/admin/dice', {
        daily_limit: parseInt(dailyLimit, 10) || 10,
        ad_duration_seconds: parseInt(adDuration, 10) || 6,
        faces: faces.map((f) => ({
          face: parseInt(f.face, 10),
          points: parseInt(f.points, 10) || 0,
          weight: Math.max(1, parseInt(f.weight, 10) || 10),
          label: f.label
        }))
      });

      if (res.data && res.data.success) {
        showToast('Dice configuration saved successfully!');
        if (res.data.settings?.faces) {
          setFaces(res.data.settings.faces);
        }
      }
    } catch (err) {
      console.error('Error saving dice config:', err);
      showToast('Error saving configuration. Please check network.');
    } finally {
      setSaving(false);
    }
  };

  const handleRunSimulation = async () => {
    try {
      setSimulating(true);
      const res = await adminApi.post('/admin/dice/simulate', {
        rolls_count: simCount,
        faces
      });
      if (res.data && res.data.success) {
        setSimResults(res.data);
      }
    } catch (err) {
      console.error('Simulation error:', err);
      showToast('Failed to run simulation');
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1200px', margin: '0 auto', width: '100%', paddingBottom: '60px' }}>
      
      {/* Toast Alert */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          background: '#10B981',
          color: '#FFF',
          padding: '12px 20px',
          borderRadius: '12px',
          fontWeight: 800,
          boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle size={18} /> {toastMsg}
        </div>
      )}

      {/* Header Banner */}
      <div className="card-violet-banner" style={{ padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '14px', fontSize: '0.775rem', fontWeight: 800, color: '#FFF', marginBottom: '8px' }}>
            <Sliders size={14} /> GAME ENGINE CONTROL
          </div>
          <h2 style={{ color: '#FFF', fontSize: '1.45rem', fontWeight: 900, margin: '0 0 6px 0' }}>
            🎲 Dice Game Engine Management
          </h2>
          <p style={{ color: '#E9D5FF', fontSize: '0.875rem', margin: 0 }}>
            Configure outcome points for Faces 1–6, probability distribution weights, daily roll limits, and run live payout simulations.
          </p>
        </div>

        <button
          onClick={handleSaveConfig}
          disabled={saving}
          className="btn-green"
          style={{ padding: '12px 24px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, cursor: saving ? 'not-allowed' : 'pointer' }}
        >
          <Save size={18} /> {saving ? 'Saving Changes...' : 'Save Configuration'}
        </button>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        <div className="card-white" style={{ padding: '18px 20px' }}>
          <span style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 700 }}>Today's Rolls</span>
          <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1E1B4B', margin: '6px 0 0 0' }}>
            {stats.today_rolls_count}
          </h3>
        </div>
        <div className="card-white" style={{ padding: '18px 20px' }}>
          <span style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 700 }}>Today's Points Disbursed</span>
          <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#16A34A', margin: '6px 0 0 0' }}>
            +{stats.today_points_awarded} Pts
          </h3>
        </div>
        <div className="card-white" style={{ padding: '18px 20px' }}>
          <span style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 700 }}>Total All-Time Rolls</span>
          <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#5B21B6', margin: '6px 0 0 0' }}>
            {stats.total_rolls_count}
          </h3>
        </div>
        <div className="card-white" style={{ padding: '18px 20px' }}>
          <span style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 700 }}>Total Points Disbursed</span>
          <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#D97706', margin: '6px 0 0 0' }}>
            +{stats.total_points_awarded} Pts
          </h3>
        </div>
      </div>

      {/* GLOBAL RULES & LIMITS CARD */}
      <div className="card-white" style={{ padding: '22px 24px', borderRadius: '20px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E1B4B', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={20} color="#5B21B6" /> Global Gameplay Limits & Timers
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#374151', marginBottom: '6px' }}>
              Daily Rolls Per User (Limit)
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={dailyLimit}
              onChange={(e) => setDailyLimit(e.target.value)}
              className="form-input"
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
            <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
              Default: 10 rolls/day. Users cannot roll further once reached.
            </span>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#374151', marginBottom: '6px' }}>
              Pre-Roll Sponsor Ad Countdown (Seconds)
            </label>
            <input
              type="number"
              min="1"
              max="60"
              value={adDuration}
              onChange={(e) => setAdDuration(e.target.value)}
              className="form-input"
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
            <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
              Duration of mandatory sponsor ad playback before roll is unlocked.
            </span>
          </div>
        </div>
      </div>

      {/* FACE OUTCOMES MATRIX (FACES 1 TO 6) */}
      <div className="card-white" style={{ padding: '22px 24px', borderRadius: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1E1B4B', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={20} color="#5B21B6" /> Dice Outcome & Points Matrix (Faces 1 to 6)
            </h3>
            <p style={{ color: '#6B7280', fontSize: '0.825rem', margin: 0 }}>
              Specify the exact points granted when a user rolls each face, along with its probability weight.
            </p>
          </div>

          <div style={{ background: '#EDE9FE', color: '#5B21B6', padding: '6px 14px', borderRadius: '12px', fontSize: '0.825rem', fontWeight: 800 }}>
            Total Weight: {totalWeight}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {faces.map((faceItem, idx) => {
            const weightVal = Math.max(1, Number(faceItem.weight) || 10);
            const dropRate = ((weightVal / totalWeight) * 100).toFixed(1);

            return (
              <div
                key={faceItem.face}
                style={{
                  background: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                  borderRadius: '18px',
                  padding: '16px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                {/* Face Badge & Probability Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      background: '#1E1B4B',
                      color: '#FFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: '1.25rem'
                    }}>
                      {faceItem.face === 1 && '⚀'}
                      {faceItem.face === 2 && '⚁'}
                      {faceItem.face === 3 && '⚂'}
                      {faceItem.face === 4 && '⚃'}
                      {faceItem.face === 5 && '⚄'}
                      {faceItem.face === 6 && '⚅'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 900, color: '#1E1B4B', fontSize: '0.95rem' }}>
                        Face {faceItem.face}
                      </div>
                      <span style={{ fontSize: '0.725rem', color: '#6B7280' }}>
                        Die Side {faceItem.face}
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ background: '#DCFCE7', color: '#15803D', padding: '4px 10px', borderRadius: '10px', fontWeight: 800, fontSize: '0.775rem' }}>
                      {dropRate}% Odds
                    </span>
                  </div>
                </div>

                {/* Reward Points Input */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#374151', marginBottom: '4px' }}>
                    Reward Points Awarded
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="1000"
                    value={faceItem.points}
                    onChange={(e) => handleFaceChange(idx, 'points', e.target.value)}
                    className="form-input"
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </div>

                {/* Probability Weight Slider */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 800, color: '#374151', marginBottom: '4px' }}>
                    <span>Probability Weight</span>
                    <span style={{ color: '#5B21B6' }}>{weightVal}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={weightVal}
                    onChange={(e) => handleFaceChange(idx, 'weight', e.target.value)}
                    style={{ width: '100%', accentColor: '#5B21B6' }}
                  />
                </div>

                {/* Outcome Label */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#374151', marginBottom: '4px' }}>
                    Outcome Label / Text
                  </label>
                  <input
                    type="text"
                    value={faceItem.label}
                    onChange={(e) => handleFaceChange(idx, 'label', e.target.value)}
                    className="form-input"
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </div>

              </div>
            );
          })}
        </div>

        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleSaveConfig}
            disabled={saving}
            className="btn-green"
            style={{ padding: '12px 28px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, cursor: saving ? 'not-allowed' : 'pointer' }}
          >
            <Save size={18} /> {saving ? 'Saving...' : 'Save Dice Matrix'}
          </button>
        </div>
      </div>

      {/* LIVE MONTE CARLO SIMULATOR */}
      <div className="card-white" style={{ padding: '22px 24px', borderRadius: '20px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1E1B4B', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart2 size={20} color="#5B21B6" /> Odds & Payout Simulator
        </h3>
        <p style={{ color: '#6B7280', fontSize: '0.825rem', margin: '0 0 16px 0' }}>
          Simulate hundreds or thousands of automated rolls to verify the payout distribution and total points budget.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <select
            value={simCount}
            onChange={(e) => setSimCount(parseInt(e.target.value, 10))}
            className="form-input"
            style={{ width: '180px' }}
          >
            <option value="500">500 Rolls</option>
            <option value="1000">1,000 Rolls</option>
            <option value="5000">5,000 Rolls</option>
            <option value="10000">10,000 Rolls</option>
          </select>

          <button
            onClick={handleRunSimulation}
            disabled={simulating}
            className="btn-violet"
            style={{ padding: '10px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, cursor: simulating ? 'not-allowed' : 'pointer' }}
          >
            <Play size={16} fill="#FFF" /> {simulating ? 'Simulating...' : `Simulate ${simCount} Rolls`}
          </button>
        </div>

        {simResults && (
          <div style={{ background: '#F8FAFC', borderRadius: '16px', padding: '18px 20px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '18px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 700 }}>Total Simulated</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1E1B4B' }}>{simResults.simulated_rolls} Rolls</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 700 }}>Win Rate</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#16A34A' }}>{simResults.win_rate_percent}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 700 }}>Avg Points / Roll</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#5B21B6' }}>{simResults.avg_points_per_roll} Pts</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 700 }}>Total Points Payout</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#D97706' }}>+{simResults.total_points} Pts</div>
              </div>
            </div>

            {/* Distribution Bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {simResults.distribution.map((d) => (
                <div key={d.face} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '60px', fontWeight: 800, fontSize: '0.825rem', color: '#1E1B4B' }}>
                    Face {d.face} ({d.points}p)
                  </div>
                  <div style={{ flex: 1, height: '14px', background: '#E2E8F0', borderRadius: '7px', overflow: 'hidden' }}>
                    <div style={{
                      width: d.actual_percentage,
                      height: '100%',
                      background: d.points > 0 ? '#10B981' : '#94A3B8',
                      borderRadius: '7px'
                    }} />
                  </div>
                  <div style={{ width: '80px', textAlign: 'right', fontWeight: 800, fontSize: '0.8rem', color: '#475569' }}>
                    {d.actual_hits} ({d.actual_percentage})
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* RECENT DICE ROLLS LOG */}
      {stats.recent_rolls.length > 0 && (
        <div className="card-white" style={{ padding: '22px 24px', borderRadius: '20px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1E1B4B', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={20} color="#5B21B6" /> Recent User Rolls Audit Log
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #E5E7EB', color: '#6B7280' }}>
                  <th style={{ padding: '10px' }}>User</th>
                  <th style={{ padding: '10px' }}>Face Rolled</th>
                  <th style={{ padding: '10px' }}>Reward</th>
                  <th style={{ padding: '10px' }}>Sponsor Ad</th>
                  <th style={{ padding: '10px' }}>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_rolls.slice(0, 15).map((r, i) => (
                  <tr key={r.id || i} style={{ borderBottom: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '10px', fontWeight: 700, color: '#1E1B4B' }}>{r.user_name || r.user_email || 'User'}</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ background: '#EDE9FE', color: '#5B21B6', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>
                        Face {r.face}
                      </span>
                    </td>
                    <td style={{ padding: '10px', fontWeight: 800, color: (r.reward_points || 0) > 0 ? '#16A34A' : '#9CA3AF' }}>
                      {(r.reward_points || 0) > 0 ? `+${r.reward_points} Pts` : '0 Pts'}
                    </td>
                    <td style={{ padding: '10px', color: '#6B7280' }}>{r.ad_title || 'Sponsor Ad'}</td>
                    <td style={{ padding: '10px', color: '#9CA3AF' }}>
                      {r.created_at ? new Date(r.created_at).toLocaleString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
