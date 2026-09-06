import React, { useState, useEffect } from 'react';
import {
  CalendarCheck2,
  CheckCircle2,
  XCircle,
  Flame,
  Search,
  Tv,
  Coins,
  Download,
  UserCheck
} from 'lucide-react';
import { adminApi } from '../../api';

export default function AdminAttendance() {
  const [users, setUsers] = useState([]);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all'); // all, completed, pending
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'logs'

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const res = await adminApi.get('/admin/attendance');
      if (res.data && res.data.success) {
        setUsers(res.data.users || []);
        setHistoryLogs(res.data.history_logs || []);
      }
    } catch (err) {
      console.warn('Backend attendance API offline, loading fallback dataset.');
      setUsers([]);
      setHistoryLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.mobile && user.mobile.includes(searchQuery));

    if (!matchesSearch) return false;
    if (filterStatus === 'completed') return user.completed_today;
    if (filterStatus === 'pending') return !user.completed_today;
    return true;
  });

  const todayCompletedCount = users.filter(u => u.completed_today).length;
  const todayAdRewardCount = users.filter(u => u.ad_reward_completed).length;

  const exportCsv = () => {
    const headers = 'User Name,Email,Mobile,Completed Today,Ad Reward Claimed,Current Streak,Total Days,Points Awarded\n';
    const rows = filteredUsers.map(u => 
      `"${u.name}","${u.email}","${u.mobile}",${u.completed_today ? 'Yes' : 'No'},${u.ad_reward_completed ? 'Yes' : 'No'},${u.streak_days},${u.total_attendance_days},${u.reward_points_awarded}`
    ).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `cashback_attendance_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Header Summary Cards */}
      <div
        className="admin-kpi-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px'
        }}
      >
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '14px',
          padding: '18px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserCheck size={24} color="#059669" />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700 }}>Checked-In Today</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A' }}>
              {todayCompletedCount} / {users.length}
            </div>
          </div>
        </div>

        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '14px',
          padding: '18px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#ECFEFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Tv size={24} color="#0891B2" />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700 }}>Ad Reward Completed</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A' }}>
              {todayAdRewardCount} Users
            </div>
          </div>
        </div>

        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '14px',
          padding: '18px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Coins size={24} color="#D97706" />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700 }}>Attendance Points Today</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A' }}>
              +{(todayCompletedCount * 10).toLocaleString()} pts
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
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
        {/* Controls Bar */}
        <div
          className="admin-filter-stack"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '20px'
          }}
        >
          {/* Tabs */}
          <div className="admin-tabs-scroll" style={{ display: 'flex', gap: '8px', background: '#F1F5F9', padding: '4px', borderRadius: '10px' }}>
            <button
              onClick={() => setActiveTab('users')}
              style={{
                background: activeTab === 'users' ? '#7C3AED' : 'transparent',
                border: 'none',
                color: activeTab === 'users' ? '#FFFFFF' : '#475569',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              Users Attendance Roster ({filteredUsers.length})
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              style={{
                background: activeTab === 'logs' ? '#7C3AED' : 'transparent',
                border: 'none',
                color: activeTab === 'logs' ? '#FFFFFF' : '#475569',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              Raw Attendance Logs
            </button>
          </div>

          {/* Search, Filter & Export */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search user name or email..."
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '10px',
                  padding: '10px 14px 10px 38px',
                  color: '#0F172A',
                  fontSize: '0.84rem',
                  outline: 'none',
                  width: '220px'
                }}
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '10px',
                padding: '10px 14px',
                color: '#0F172A',
                fontSize: '0.84rem',
                outline: 'none',
                fontWeight: 500
              }}
            >
              <option value="all">Status: All Users</option>
              <option value="completed">Completed Today</option>
              <option value="pending">Pending Check-in</option>
            </select>

            <button
              onClick={exportCsv}
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                color: '#0F172A',
                padding: '10px 14px',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontSize: '0.84rem',
                fontWeight: 700
              }}
            >
              <Download size={15} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Users Table */}
        {activeTab === 'users' ? (
          <div className="admin-table-container" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left', color: '#64748B' }}>
                  <th style={{ padding: '14px', fontWeight: 700 }}>User Profile</th>
                  <th style={{ padding: '14px', fontWeight: 700 }}>Today's Check-in</th>
                  <th style={{ padding: '14px', fontWeight: 700 }}>Ad Reward Status</th>
                  <th style={{ padding: '14px', fontWeight: 700 }}>Streak</th>
                  <th style={{ padding: '14px', fontWeight: 700 }}>Total Attended</th>
                  <th style={{ padding: '14px', fontWeight: 700 }}>Total Points</th>
                  <th style={{ padding: '14px', fontWeight: 700 }}>Last Recorded</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: '#94A3B8' }}>
                      No matching user attendance records found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      {/* User Info */}
                      <td style={{ padding: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '50%',
                            background: '#2563EB',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            color: '#FFFFFF',
                            fontSize: '0.8rem'
                          }}>
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: '#0F172A' }}>{user.name}</div>
                            <div style={{ fontSize: '0.74rem', color: '#64748B' }}>{user.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Today Status */}
                      <td style={{ padding: '14px' }}>
                        {user.completed_today ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            background: '#ECFDF5',
                            color: '#059669',
                            fontSize: '0.78rem',
                            fontWeight: 700
                          }}>
                            <CheckCircle2 size={14} /> Completed
                          </span>
                        ) : (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            background: '#FEF2F2',
                            color: '#DC2626',
                            fontSize: '0.78rem',
                            fontWeight: 700
                          }}>
                            <XCircle size={14} /> Pending
                          </span>
                        )}
                      </td>

                      {/* Ad Reward Completed */}
                      <td style={{ padding: '14px' }}>
                        {user.ad_reward_completed ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            background: '#ECFEFF',
                            color: '#0891B2',
                            fontSize: '0.78rem',
                            fontWeight: 700
                          }}>
                            <Tv size={14} /> Ad Watched (+10)
                          </span>
                        ) : (
                          <span style={{ color: '#94A3B8', fontSize: '0.78rem' }}>Not Watched</span>
                        )}
                      </td>

                      {/* Streak */}
                      <td style={{ padding: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#D97706', fontWeight: 700 }}>
                          <Flame size={16} color="#D97706" />
                          <span>{user.streak_days} Days</span>
                        </div>
                      </td>

                      {/* Total Days */}
                      <td style={{ padding: '14px', color: '#334155', fontWeight: 700 }}>
                        {user.total_attendance_days} Days
                      </td>

                      {/* Points Awarded */}
                      <td style={{ padding: '14px', color: '#7C3AED', fontWeight: 800 }}>
                        +{user.reward_points_awarded} pts
                      </td>

                      {/* Last Check-in */}
                      <td style={{ padding: '14px', color: '#64748B', fontSize: '0.78rem' }}>
                        {user.last_check_in ? new Date(user.last_check_in).toLocaleDateString() : 'Never'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* Raw Logs View */
          <div className="admin-table-container" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left', color: '#64748B' }}>
                  <th style={{ padding: '14px', fontWeight: 700 }}>Check-in ID</th>
                  <th style={{ padding: '14px', fontWeight: 700 }}>User ID / Name</th>
                  <th style={{ padding: '14px', fontWeight: 700 }}>Check-in Date</th>
                  <th style={{ padding: '14px', fontWeight: 700 }}>Reward</th>
                  <th style={{ padding: '14px', fontWeight: 700 }}>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {historyLogs.map((log, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '14px', fontFamily: 'monospace', color: '#64748B' }}>{log.id}</td>
                    <td style={{ padding: '14px', color: '#0F172A', fontWeight: 600 }}>{log.user_name || log.user_id}</td>
                    <td style={{ padding: '14px', color: '#059669', fontWeight: 700 }}>{log.check_in_date}</td>
                    <td style={{ padding: '14px', color: '#D97706', fontWeight: 800 }}>+{log.reward_points || 10} pts</td>
                    <td style={{ padding: '14px', color: '#64748B', fontSize: '0.78rem' }}>{new Date(log.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
