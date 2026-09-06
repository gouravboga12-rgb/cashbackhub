import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Activity,
  CalendarCheck2,
  Tv,
  Disc,
  Coins,
  Gift,
  Clock,
  ArrowUpRight,
  TrendingUp,
  RefreshCw,
  ChevronRight,
  Zap,
  Star,
  BarChart3
} from 'lucide-react';
import { adminApi } from '../../api';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setRefreshing(true);
      const res = await adminApi.get('/admin/dashboard/stats');
      if (res.data && res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.warn('Dashboard stats API offline, loading empty fallback dataset.');
      setData({
        stats: {
          total_users: 0, active_users_today: 0, today_attendance_count: 0,
          today_ads_watched: 0, today_spins_count: 0, today_points_distributed: 0,
          total_points_distributed: 0, total_voucher_purchases: 0,
          pending_withdrawals_count: 0, pending_withdrawals_points: 0,
          pending_withdrawals_rupees: 0, total_vouchers_in_stock: 0
        },
        points_breakdown: {
          grand_total:  { points: 0, rupees: '0.00' },
          attendance:   { points: 0, rupees: '0.00' },
          watch_ads:    { points: 0, rupees: '0.00' },
          spin_wheel:   { points: 0, rupees: '0.00' },
          signup_bonus: { points: 0, rupees: '0.00' },
          other:        { points: 0, rupees: '0.00' }
        },
        weekly_trends: [
          { day: 'Mon', distributed: 0, redeemed: 0, spins: 0 },
          { day: 'Tue', distributed: 0, redeemed: 0, spins: 0 },
          { day: 'Wed', distributed: 0, redeemed: 0, spins: 0 },
          { day: 'Thu', distributed: 0, redeemed: 0, spins: 0 },
          { day: 'Fri', distributed: 0, redeemed: 0, spins: 0 },
          { day: 'Sat', distributed: 0, redeemed: 0, spins: 0 },
          { day: 'Sun', distributed: 0, redeemed: 0, spins: 0 }
        ],
        recent_activities: []
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const bd = data?.points_breakdown || {};
  const grandTotal = bd.grand_total?.points || 0;

  // Category breakdown rows — ordered as requested
  const pointsCategories = [
    {
      key: 'grand_total',
      label: 'Total Points (All Categories)',
      icon: BarChart3,
      color: '#5B21B6',
      bg: 'linear-gradient(135deg, #5B21B6 0%, #7C3AED 100%)',
      bgLight: '#F5F3FF',
      borderColor: '#DDD6FE',
      isTotal: true,
      points: bd.grand_total?.points || 0,
      rupees: bd.grand_total?.rupees || '0.00'
    },
    {
      key: 'attendance',
      label: 'Daily Attendance',
      icon: CalendarCheck2,
      color: '#7C3AED',
      bg: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
      bgLight: '#F5F3FF',
      borderColor: '#DDD6FE',
      points: bd.attendance?.points || 0,
      rupees: bd.attendance?.rupees || '0.00'
    },
    {
      key: 'watch_ads',
      label: 'Watch Ads Reward',
      icon: Tv,
      color: '#0891B2',
      bg: 'linear-gradient(135deg, #0891B2, #0E7490)',
      bgLight: '#ECFEFF',
      borderColor: '#A5F3FC',
      points: bd.watch_ads?.points || 0,
      rupees: bd.watch_ads?.rupees || '0.00'
    },
    {
      key: 'spin_wheel',
      label: 'Spin Wheel Wins',
      icon: Disc,
      color: '#DB2777',
      bg: 'linear-gradient(135deg, #DB2777, #BE185D)',
      bgLight: '#FDF2F8',
      borderColor: '#FBCFE8',
      points: bd.spin_wheel?.points || 0,
      rupees: bd.spin_wheel?.rupees || '0.00'
    },
    {
      key: 'signup_bonus',
      label: 'Sign-Up Welcome Bonus',
      icon: Star,
      color: '#D97706',
      bg: 'linear-gradient(135deg, #D97706, #B45309)',
      bgLight: '#FFFBEB',
      borderColor: '#FDE68A',
      points: bd.signup_bonus?.points || 0,
      rupees: bd.signup_bonus?.rupees || '0.00'
    },
    {
      key: 'other',
      label: 'Other / Manual Rewards',
      icon: Zap,
      color: '#059669',
      bg: 'linear-gradient(135deg, #059669, #047857)',
      bgLight: '#ECFDF5',
      borderColor: '#A7F3D0',
      points: bd.other?.points || 0,
      rupees: bd.other?.rupees || '0.00'
    }
  ];

  const statCards = [
    { title: 'Total Users', value: data?.stats?.total_users || 0, subtext: 'Registered Platform Users', icon: Users, color: '#2563EB', bg: '#EFF6FF', link: '/admin/attendance' },
    { title: 'Active Users Today', value: data?.stats?.active_users_today || 0, subtext: 'Engaged with features today', icon: Activity, color: '#059669', bg: '#ECFDF5', link: '/admin/attendance' },
    { title: "Today's Attendance", value: data?.stats?.today_attendance_count || 0, subtext: 'Completed daily check-in', icon: CalendarCheck2, color: '#7C3AED', bg: '#F5F3FF', link: '/admin/attendance' },
    { title: 'Ads Watched Today', value: data?.stats?.today_ads_watched || 0, subtext: 'Rewarded video completions', icon: Tv, color: '#0891B2', bg: '#ECFEFF', link: '/admin/activities' },
    { title: "Today's Lucky Spins", value: data?.stats?.today_spins_count || 0, subtext: 'Wheel spins recorded', icon: Disc, color: '#DB2777', bg: '#FDF2F8', link: '/admin/spin-wheel' },
    {
      title: 'Points Distributed',
      value: (data?.stats?.today_points_distributed || 0).toLocaleString(),
      subtext: `Total all-time: ${(data?.stats?.total_points_distributed || 0).toLocaleString()} pts`,
      icon: Coins, color: '#D97706', bg: '#FFFBEB', link: '/admin/wallets'
    },
    { title: 'Voucher Redemptions', value: data?.stats?.total_voucher_purchases || 0, subtext: `${data?.stats?.total_vouchers_in_stock || 0} in active stock`, icon: Gift, color: '#4F46E5', bg: '#EEF2FF', link: '/admin/wallets' },
    {
      title: 'Pending Withdrawals',
      value: data?.stats?.pending_withdrawals_count || 0,
      subtext: `Value: ₹${data?.stats?.pending_withdrawals_rupees || 0} (${data?.stats?.pending_withdrawals_points || 0} pts)`,
      icon: Clock, color: '#DC2626', bg: '#FEF2F2', link: '/admin/wallets',
      highlight: (data?.stats?.pending_withdrawals_count || 0) > 0
    }
  ];

  const maxWeeklyDistributed = Math.max(...(data?.weekly_trends?.map(d => d.distributed) || [0]), 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Welcome Banner */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '1.4rem' }}>👋</span>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
              Welcome back, Super Admin
            </h2>
          </div>
          <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.88rem' }}>
            Real-time operations dashboard for user rewards, daily attendance, spin & win, and wallet redemptions.
          </p>
        </div>

        <button
          onClick={fetchDashboardStats}
          disabled={refreshing}
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: '#FFFFFF',
            padding: '10px 18px',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
        >
          <RefreshCw size={16} className={refreshing ? 'spin-anim' : ''} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh Live Data'}</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        {statCards.map((card, idx) => {
          const IconComp = card.icon;
          return (
            <div
              key={idx}
              className="admin-stat-card"
              onClick={() => navigate(card.link)}
              style={{
                background: '#FFFFFF',
                border: card.highlight ? '2px solid #EF4444' : '1px solid #E2E8F0',
                borderRadius: '16px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconComp size={22} color={card.color} />
                </div>
                <ArrowUpRight size={18} color="#94A3B8" />
              </div>

              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>
                  {card.title}
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                  {card.value.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.74rem', color: card.highlight ? '#DC2626' : '#94A3B8', marginTop: '6px', fontWeight: card.highlight ? 700 : 500 }}>
                  {card.subtext}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* CATEGORY-WISE POINTS BREAKDOWN SECTION                            */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
      }}>
        {/* Section Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>
              Points Distribution — Category Breakdown
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: '#64748B' }}>
              All-time total reward points issued per activity category (points + ₹ value)
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#059669', background: '#ECFDF5', padding: '5px 12px', borderRadius: '20px', fontWeight: 700 }}>
            <TrendingUp size={13} />
            <span>Live Supabase Data</span>
          </div>
        </div>

        {/* Category Rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {pointsCategories.map((cat, idx) => {
            const IconComp = cat.icon;
            const barWidth = grandTotal > 0 ? Math.max(3, (cat.points / grandTotal) * 100) : 0;

            return (
              <div
                key={cat.key}
                style={{
                  background: cat.isTotal ? cat.bgLight : '#FAFBFC',
                  border: `1px solid ${cat.borderColor || '#E2E8F0'}`,
                  borderRadius: '12px',
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  position: 'relative',
                  overflow: 'hidden',
                  ...(cat.isTotal ? { boxShadow: '0 2px 10px rgba(91,33,182,0.08)' } : {})
                }}
              >
                {/* Icon */}
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: cat.isTotal ? cat.bg : cat.bgLight,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: cat.isTotal ? '0 2px 8px rgba(91,33,182,0.2)' : 'none'
                }}>
                  <IconComp size={18} color={cat.isTotal ? '#FFFFFF' : cat.color} />
                </div>

                {/* Label + Bar */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: cat.isTotal ? '0.88rem' : '0.82rem', fontWeight: cat.isTotal ? 800 : 700, color: cat.isTotal ? '#5B21B6' : '#0F172A', marginBottom: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {cat.label}
                    {cat.isTotal && <span style={{ marginLeft: '8px', fontSize: '0.7rem', background: '#7C3AED', color: '#FFF', padding: '1px 7px', borderRadius: '10px', fontWeight: 700 }}>GRAND TOTAL</span>}
                  </div>
                  {/* Progress bar */}
                  <div style={{ height: '5px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${cat.isTotal ? 100 : barWidth}%`,
                      background: cat.isTotal ? cat.bg : cat.color,
                      borderRadius: '4px',
                      transition: 'width 0.6s ease'
                    }} />
                  </div>
                </div>

                {/* Points + Rupees */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: cat.isTotal ? '1.2rem' : '1rem', fontWeight: 800, color: cat.isTotal ? '#5B21B6' : '#0F172A', lineHeight: 1.1 }}>
                    {cat.points.toLocaleString()} <span style={{ fontSize: cat.isTotal ? '0.72rem' : '0.68rem', fontWeight: 600, color: '#94A3B8' }}>pts</span>
                  </div>
                  <div style={{ fontSize: cat.isTotal ? '0.84rem' : '0.76rem', color: '#059669', fontWeight: 700, marginTop: '2px' }}>
                    ₹{cat.rupees}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Analytics & Shortcuts Section */}
      <div
        className="admin-dashboard-two-col"
        style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}
      >
        {/* Weekly Points Distribution Trend */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                7-Day Points Distribution Trend
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: '#64748B' }}>
                Daily reward points issued to active users vs redemptions
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#059669', background: '#ECFDF5', padding: '4px 10px', borderRadius: '20px', fontWeight: 700 }}>
              <TrendingUp size={14} />
              <span>Real-Time Live Feed</span>
            </div>
          </div>

          {/* Bar Chart */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '180px', paddingTop: '20px', borderBottom: '1px solid #E2E8F0', gap: '12px' }}>
            {data?.weekly_trends?.map((item, idx) => {
              const val = item.distributed || 0;
              const heightPercent = val > 0 && maxWeeklyDistributed > 0 ? Math.max(12, (val / maxWeeklyDistributed) * 100) : 0;
              return (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ fontSize: '0.68rem', color: val > 0 ? '#5B21B6' : '#94A3B8', marginBottom: '6px', fontWeight: 700 }}>
                    {val}
                  </div>
                  <div
                    title={`${item.day}: ${val} pts distributed`}
                    style={{ width: '100%', maxWidth: '36px', height: val > 0 ? `${heightPercent}%` : '3px', background: val > 0 ? 'linear-gradient(180deg, #7C3AED 0%, #5B21B6 100%)' : '#E2E8F0', borderRadius: val > 0 ? '6px 6px 0 0' : '2px', transition: 'height 0.3s ease' }}
                  />
                  <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '8px', fontWeight: 600 }}>
                    {item.day}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: '20px', marginTop: '16px', fontSize: '0.76rem', color: '#64748B' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#7C3AED' }} />
              Points Distributed (Attendance, Ads, Spins)
            </div>
          </div>
        </div>

        {/* Quick Management Shortcuts */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 16px 0', color: '#0F172A' }}>
            Quick Admin Shortcuts
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
            {[
              { label: 'Adjust Spin Wheel Odds & Daily Limits', sub: 'Manage 1,000 pts cap & slice probabilities', icon: Disc, color: '#DB2777', bg: '#FDF2F8', link: '/admin/spin-wheel' },
              { label: 'Review Withdrawal Requests', sub: `${data?.stats?.pending_withdrawals_count || 0} requests awaiting approval`, icon: Clock, color: '#DC2626', bg: '#FEF2F2', link: '/admin/wallets' },
              { label: 'Daily Attendance Roster', sub: 'Check user streaks and today\'s check-ins', icon: CalendarCheck2, color: '#7C3AED', bg: '#F5F3FF', link: '/admin/attendance' }
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div
                  key={i}
                  onClick={() => navigate(s.link)}
                  style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'all 0.15s ease' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#F1F5F9'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#F8FAFC'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={18} color={s.color} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>{s.label}</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748B' }}>{s.sub}</div>
                    </div>
                  </div>
                  <ChevronRight size={16} color="#94A3B8" />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Activity Table Preview */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>
              Live System Activity Stream
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: '#64748B' }}>
              Latest transactions, attendance claims, and reward events
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/activities')}
            style={{ background: 'transparent', border: 'none', color: '#7C3AED', fontSize: '0.84rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <span>View All Activities</span>
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="admin-table-container" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left', color: '#64748B' }}>
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>User</th>
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>Activity</th>
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>Points</th>
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>Status</th>
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {(data?.recent_activities || []).length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem' }}>
                    No recent activity to display
                  </td>
                </tr>
              ) : data?.recent_activities?.map((act, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '14px', color: '#0F172A', fontWeight: 600 }}>{act.user_name || 'User'}</td>
                  <td style={{ padding: '14px', color: '#334155' }}>{act.title || act.details}</td>
                  <td style={{ padding: '14px', fontWeight: 800, color: (act.points || 0) > 0 ? '#059669' : '#DC2626' }}>
                    {(act.points || 0) > 0 ? `+${act.points}` : act.points} pts
                  </td>
                  <td style={{ padding: '14px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'capitalize', background: act.status === 'completed' ? '#ECFDF5' : '#FEF2F2', color: act.status === 'completed' ? '#059669' : '#DC2626' }}>
                      {act.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px', color: '#64748B', fontSize: '0.78rem' }}>
                    {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
