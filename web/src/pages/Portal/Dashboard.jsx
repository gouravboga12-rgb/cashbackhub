import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import SpinWheel from '../../components/SpinWheel';
import { Wallet, CheckCircle, Film, Disc, ArrowUpRight, Gift, Bell, Calendar } from 'lucide-react';

export default function Dashboard({ user, wallet, refreshWallet }) {
  const navigate = useNavigate();
  const [attendanceToday, setAttendanceToday] = useState(false);
  const [adProgress, setAdProgress] = useState({ completed_count: 0, daily_limit: 10 });
  const [spinConfig, setSpinConfig] = useState({ slices: [], spins_available_today: 1 });
  const [attLoading, setAttLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [attRes, adRes, spinRes] = await Promise.all([
        api.get('/attendance/today'),
        api.get('/ads'),
        api.get('/spin/config')
      ]);

      setAttendanceToday(attRes.data.completed);
      setAdProgress({ completed_count: adRes.data.completed_count, daily_limit: adRes.data.daily_limit });
      setSpinConfig({ slices: spinRes.data.slices, spins_available_today: spinRes.data.spins_available_today });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  };

  const handleMarkAttendance = async () => {
    if (attendanceToday || attLoading) return;
    setAttLoading(true);
    try {
      const res = await api.post('/attendance/check-in');
      if (res.data.success) {
        setAttendanceToday(true);
        refreshWallet();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Attendance error');
    } finally {
      setAttLoading(false);
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
      alert(err.response?.data?.message || 'Spin error');
      return null;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
      
      {/* Top Header Greeting */}
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E1B4B' }}>
          Hello, {user?.name || 'User'}! 👋
        </h2>
        <p style={{ color: '#6B7280', fontSize: '0.875rem', fontWeight: 500 }}>Keep earning, keep winning!</p>
      </div>

      {/* Main Violet Wallet Banner Card */}
      <div className="card-violet-banner" style={{ padding: '24px 28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, opacity: 0.9, marginBottom: '12px', letterSpacing: '0.5px' }}>
          My Wallet
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-baseline', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '2.4rem', fontWeight: 800 }}>{wallet?.available_points?.toLocaleString() || 0}</span>
            <span style={{ fontSize: '0.9rem', marginLeft: '6px', opacity: 0.9 }}>Points</span>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '2.4rem', fontWeight: 800, color: '#4ADE80' }}>₹{((wallet?.available_points || 0) / 10).toFixed(2)}</span>
            <span style={{ fontSize: '0.9rem', marginLeft: '6px', opacity: 0.9, color: '#E9D5FF' }}>Value</span>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', marginTop: '16px', paddingTop: '12px', textAlign: 'center', fontSize: '0.8rem', opacity: 0.9, fontWeight: 600 }}>
          10 Points = ₹1.00
        </div>
      </div>

      {/* Today's Activity Section */}
      <div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1E1B4B', marginBottom: '14px' }}>
          Today's Activity
        </h3>

        <div className="card-white" style={{ padding: '8px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Daily Attendance Item */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F3F4F6', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '200px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Calendar color="#16A34A" size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#1E1B4B' }}>Daily Attendance</h4>
                <p style={{ color: '#6B7280', fontSize: '0.825rem' }}>Mark attendance and earn 10 points</p>
              </div>
            </div>

            <button
              onClick={handleMarkAttendance}
              disabled={attendanceToday || attLoading}
              style={{
                background: attendanceToday ? '#DCFCE7' : 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
                color: attendanceToday ? '#16A34A' : '#FFFFFF',
                border: 'none',
                padding: '8px 20px',
                borderRadius: '20px',
                fontWeight: 800,
                fontSize: '0.875rem',
                cursor: attendanceToday ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {attendanceToday ? <><CheckCircle size={18} /> +10</> : (attLoading ? '...' : '+10 Check In')}
            </button>
          </div>

          {/* Watch Ads Item */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F3F4F6', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '200px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#FFEDD5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Film color="#EA580C" size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#1E1B4B' }}>Watch Ads ({adProgress.completed_count}/10)</h4>
                <p style={{ color: '#6B7280', fontSize: '0.825rem' }}>Watch 10 ads and earn 10 points per ad</p>
              </div>
            </div>

            <button onClick={() => navigate('/portal/watch-ads')} className="btn-violet" style={{ borderRadius: '20px', padding: '8px 24px' }}>
              Start
            </button>
          </div>

          {/* Spin & Win Item */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '200px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#FCE7F3', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Disc color="#DB2777" size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#1E1B4B' }}>Spin & Win</h4>
                <p style={{ color: '#6B7280', fontSize: '0.825rem' }}>Spin the wheel and win exciting points</p>
              </div>
            </div>

            <button onClick={() => navigate('/portal/spin')} className="btn-violet" style={{ borderRadius: '20px', padding: '8px 24px' }}>
              Spin
            </button>
          </div>

        </div>
      </div>

      {/* Watch Ads Promo Banner Card */}
      <div className="card-violet-banner" style={{ padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '6px' }}>Watch Ads. Earn Points.</h3>
          <p style={{ opacity: 0.9, fontSize: '0.9rem' }}>Complete 10 ads daily and earn 100 points!</p>
        </div>

        <button onClick={() => navigate('/portal/watch-ads')} className="btn-green" style={{ borderRadius: '20px', padding: '10px 24px' }}>
          Watch Ads Now
        </button>
      </div>

      {/* Interactive Spin Wheel Widget Section */}
      <div className="card-white" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1E1B4B', marginBottom: '4px' }}>🎡 Lucky Spin Wheel</h3>
        <p style={{ color: '#6B7280', fontSize: '0.85rem', marginBottom: '16px' }}>Spin daily for bonus rewards!</p>

        <SpinWheel
          slices={spinConfig.slices}
          spinsAvailable={spinConfig.spins_available_today}
          onSpin={handleSpinPlay}
        />
      </div>

    </div>
  );
}
