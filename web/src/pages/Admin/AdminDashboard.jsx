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
  ChevronRight
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
          total_users: 0,
          active_users_today: 0,
          today_attendance_count: 0,
          today_ads_watched: 0,
          today_spins_count: 0,
          today_points_distributed: 0,
          total_points_distributed: 0,
          total_voucher_purchases: 0,
          pending_withdrawals_count: 0,
          pending_withdrawals_points: 0,
          pending_withdrawals_rupees: 0,
          total_vouchers_in_stock: 0
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

  const statCards = [
    {
      title: 'Total Users',
      value: data?.stats?.total_users || 0,
      subtext: 'Registered Platform Users',
      icon: Users,
      color: '#2563EB',
      bg: '#EFF6FF',
      link: '/admin/attendance'
    },
    {
      title: 'Active Users Today',
      value: data?.stats?.active_users_today || 0,
      subtext: 'Engaged with features today',
      icon: Activity,
      color: '#059669',
      bg: '#ECFDF5',
      link: '/admin/attendance'
    },
    {
      title: "Today's Attendance",
      value: data?.stats?.today_attendance_count || 0,
      subtext: 'Completed daily check-in',
      icon: CalendarCheck2,
      color: '#7C3AED',
      bg: '#F5F3FF',
      link: '/admin/attendance'
    },
    {
      title: 'Ads Watched Today',
      value: data?.stats?.today_ads_watched || 0,
      subtext: 'Rewarded video completions',
      icon: Tv,
      color: '#0891B2',
      bg: '#ECFEFF',
      link: '/admin/activities'
    },
    {
      title: "Today's Lucky Spins",
      value: data?.stats?.today_spins_count || 0,
      subtext: 'Wheel spins recorded',
      icon: Disc,
      color: '#DB2777',
      bg: '#FDF2F8',
      link: '/admin/spin-wheel'
    },
    {
      title: 'Points Distributed',
      value: (data?.stats?.today_points_distributed || 0).toLocaleString(),
      subtext: `Total all-time: ${(data?.stats?.total_points_distributed || 0).toLocaleString()} pts`,
      icon: Coins,
      color: '#D97706',
      bg: '#FFFBEB',
      link: '/admin/wallets'
    },
    {
      title: 'Voucher Redemptions',
      value: data?.stats?.total_voucher_purchases || 0,
      subtext: `${data?.stats?.total_vouchers_in_stock || 0} in active stock`,
      icon: Gift,
      color: '#4F46E5',
      bg: '#EEF2FF',
      link: '/admin/wallets'
    },
    {
      title: 'Pending Withdrawals',
      value: data?.stats?.pending_withdrawals_count || 0,
      subtext: `Value: ₹${data?.stats?.pending_withdrawals_rupees || 0} (${data?.stats?.pending_withdrawals_points || 0} pts)`,
      icon: Clock,
      color: '#DC2626',
      bg: '#FEF2F2',
      link: '/admin/wallets',
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
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px'
        }}
      >
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
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: card.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
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

      {/* Analytics & Shortcuts Section */}
      <div
        className="admin-dashboard-two-col"
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '24px'
        }}
      >
        {/* Weekly Points Distribution Trend */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '16px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                7-Day Points Distribution Trend
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: '#64748B' }}>
                Daily reward points issued to active users vs redemptions
              </p>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.75rem',
              color: '#059669',
              background: '#ECFDF5',
              padding: '4px 10px',
              borderRadius: '20px',
              fontWeight: 700
            }}>
              <TrendingUp size={14} />
              <span>Real-Time Live Feed</span>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            height: '180px',
            paddingTop: '20px',
            borderBottom: '1px solid #E2E8F0',
            gap: '12px'
          }}>
            {data?.weekly_trends?.map((item, idx) => {
              const val = item.distributed || 0;
              const heightPercent = val > 0 && maxWeeklyDistributed > 0 ? Math.max(12, (val / maxWeeklyDistributed) * 100) : 0;
              return (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ fontSize: '0.68rem', color: val > 0 ? '#5B21B6' : '#94A3B8', marginBottom: '6px', fontWeight: 700 }}>
                    {val}
                  </div>
                  <div
                    title={`${item.day}: ${val} pts distributed, ${item.redeemed || 0} redeemed`}
                    style={{
                      width: '100%',
                      maxWidth: '36px',
                      height: val > 0 ? `${heightPercent}%` : '3px',
                      background: val > 0 ? 'linear-gradient(180deg, #7C3AED 0%, #5B21B6 100%)' : '#E2E8F0',
                      borderRadius: val > 0 ? '6px 6px 0 0' : '2px',
                      transition: 'height 0.3s ease'
                    }}
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
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '16px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
        }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 16px 0', color: '#0F172A' }}>
            Quick Admin Shortcuts
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
            <div
              onClick={() => navigate('/admin/spin-wheel')}
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#F1F5F9'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#F8FAFC'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#FDF2F8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Disc size={18} color="#DB2777" />
                </div>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>Adjust Spin Wheel Odds & Daily Limits</div>
                  <div style={{ fontSize: '0.74rem', color: '#64748B' }}>Manage 1,000 pts cap & slice probabilities</div>
                </div>
              </div>
              <ChevronRight size={16} color="#94A3B8" />
            </div>

            <div
              onClick={() => navigate('/admin/wallets')}
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#F1F5F9'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#F8FAFC'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={18} color="#DC2626" />
                </div>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>Review Withdrawal Requests</div>
                  <div style={{ fontSize: '0.74rem', color: '#64748B' }}>{data?.stats?.pending_withdrawals_count || 0} requests awaiting approval</div>
                </div>
              </div>
              <ChevronRight size={16} color="#94A3B8" />
            </div>

            <div
              onClick={() => navigate('/admin/attendance')}
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#F1F5F9'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#F8FAFC'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CalendarCheck2 size={18} color="#7C3AED" />
                </div>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>Daily Attendance Roster</div>
                  <div style={{ fontSize: '0.74rem', color: '#64748B' }}>Check user streaks and today's check-ins</div>
                </div>
              </div>
              <ChevronRight size={16} color="#94A3B8" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Table Preview */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
      }}>
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
            style={{
              background: 'transparent',
              border: 'none',
              color: '#7C3AED',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
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
              {data?.recent_activities?.map((act, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '14px', color: '#0F172A', fontWeight: 600 }}>
                    {act.user_name || 'User'}
                  </td>
                  <td style={{ padding: '14px', color: '#334155' }}>
                    {act.title || act.details}
                  </td>
                  <td style={{
                    padding: '14px',
                    fontWeight: 800,
                    color: act.points > 0 ? '#059669' : '#DC2626'
                  }}>
                    {act.points > 0 ? `+${act.points}` : act.points} pts
                  </td>
                  <td style={{ padding: '14px' }}>
                    <span style={{
                      padding: '3px 10px',
                      borderRadius: '12px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      textTransform: 'capitalize',
                      background: act.status === 'completed' ? '#ECFDF5' : '#FEF2F2',
                      color: act.status === 'completed' ? '#059669' : '#DC2626'
                    }}>
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
