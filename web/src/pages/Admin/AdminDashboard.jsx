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
      console.warn('Dashboard stats API offline, loading fallback dataset.');
      setData({
        stats: {
          total_users: 5,
          active_users_today: 4,
          today_attendance_count: 3,
          today_ads_watched: 2,
          today_spins_count: 8,
          today_points_distributed: 720,
          total_points_distributed: 12540,
          total_voucher_purchases: 3,
          pending_withdrawals_count: 1,
          pending_withdrawals_points: 1000,
          pending_withdrawals_rupees: 100,
          total_vouchers_in_stock: 475
        },
        weekly_trends: [
          { day: 'Mon', distributed: 420, redeemed: 0, spins: 12 },
          { day: 'Tue', distributed: 650, redeemed: 1000, spins: 18 },
          { day: 'Wed', distributed: 510, redeemed: 0, spins: 15 },
          { day: 'Thu', distributed: 890, redeemed: 2000, spins: 22 },
          { day: 'Fri', distributed: 720, redeemed: 0, spins: 19 },
          { day: 'Sat', distributed: 940, redeemed: 1500, spins: 26 },
          { day: 'Sun', distributed: 720, redeemed: 1000, spins: 20 }
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

  const maxWeeklyDistributed = Math.max(...(data?.weekly_trends?.map(d => d.distributed) || [1000]), 1000);

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
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 6px 0', color: '#FFFFFF' }}>
            Welcome to Cashback Hub Control Center 🚀
          </h2>
          <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.88rem' }}>
            Real-time platform overview, user activity tracking, wallet ledger, and spin wheel algorithm management.
          </p>
        </div>

        <button
          onClick={fetchDashboardStats}
          disabled={refreshing}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.35)',
            color: '#FFFFFF',
            padding: '10px 18px',
            borderRadius: '10px',
            cursor: refreshing ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.85rem',
            fontWeight: 700,
            backdropFilter: 'blur(4px)'
          }}
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh Stats'}</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div
        className="admin-kpi-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '18px'
        }}
      >
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={() => navigate(card.link)}
              style={{
                background: '#FFFFFF',
                border: card.highlight ? '1px solid #FECACA' : '1px solid #E2E8F0',
                borderRadius: '16px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                position: 'relative',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748B' }}>{card.title}</span>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: card.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon size={20} color={card.color} />
                </div>
              </div>

              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                  {card.value}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>{card.subtext}</span>
                  <ArrowUpRight size={14} color="#94A3B8" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics & Distribution Trends Chart */}
      <div
        className="admin-grid-2col"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))',
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
              <span>+18.4% this week</span>
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
              const heightPercent = Math.max(15, (item.distributed / maxWeeklyDistributed) * 100);
              return (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ fontSize: '0.68rem', color: '#475569', marginBottom: '6px', fontWeight: 700 }}>
                    {item.distributed}
                  </div>
                  <div
                    title={`${item.day}: ${item.distributed} pts distributed, ${item.redeemed} redeemed`}
                    style={{
                      width: '100%',
                      maxWidth: '36px',
                      height: `${heightPercent}%`,
                      background: 'linear-gradient(180deg, #7C3AED 0%, #5B21B6 100%)',
                      borderRadius: '6px 6px 0 0',
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
