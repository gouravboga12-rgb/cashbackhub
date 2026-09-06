import React, { useState, useEffect } from 'react';
import {
  Search,
  Coins,
  Tv,
  Disc,
  CalendarCheck2,
  Gift,
  UserPlus,
  Edit3,
  X
} from 'lucide-react';
import { adminApi } from '../../api';

export default function AdminActivities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [resolveModal, setResolveModal] = useState({ open: false, activity: null, status: 'resolved', note: '' });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchActivities();
  }, [typeFilter, statusFilter, searchQuery]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const res = await adminApi.get('/admin/activities', {
        params: {
          type: typeFilter,
          status: statusFilter,
          search: searchQuery
        }
      });
      if (res.data?.success) {
        setActivities(res.data.activities || []);
      }
    } catch (err) {
      console.warn('Activities API offline, loading default activity dataset.');
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (e) => {
    e.preventDefault();
    if (!resolveModal.activity) return;
    try {
      setProcessing(true);
      const res = await adminApi.put(`/admin/activities/${resolveModal.activity.id}/resolve`, {
        status: resolveModal.status,
        note: resolveModal.note
      });
      if (res.data?.success) {
        setResolveModal({ open: false, activity: null, status: 'resolved', note: '' });
        fetchActivities();
      }
    } catch (err) {
      alert('Error updating activity status');
    } finally {
      setProcessing(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'spin': return <Disc size={18} color="#DB2777" />;
      case 'attendance': return <CalendarCheck2 size={18} color="#7C3AED" />;
      case 'ad': return <Tv size={18} color="#0891B2" />;
      case 'voucher':
      case 'withdrawal': return <Gift size={18} color="#D97706" />;
      case 'referral': return <UserPlus size={18} color="#059669" />;
      default: return <Coins size={18} color="#2563EB" />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Search & Filter Header */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '16px',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
          <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '12px' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by user, email, activity title or description..."
            style={{
              width: '100%',
              boxSizing: 'border-box',
              background: '#F8FAFC',
              border: '1px solid #CBD5E1',
              borderRadius: '10px',
              padding: '11px 14px 11px 42px',
              color: '#0F172A',
              fontSize: '0.86rem',
              outline: 'none'
            }}
          />
        </div>

        {/* Type Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{
              background: '#F8FAFC',
              border: '1px solid #CBD5E1',
              borderRadius: '10px',
              padding: '10px 14px',
              color: '#0F172A',
              fontSize: '0.84rem',
              outline: 'none',
              fontWeight: 600
            }}
          >
            <option value="all">Activity Type: All</option>
            <option value="attendance">Daily Attendance</option>
            <option value="spin">Spin & Win</option>
            <option value="ad">Ads Watched</option>
            <option value="withdrawal">Withdrawals</option>
            <option value="voucher">Voucher Redemptions</option>
            <option value="referral">Signups / Bonus</option>
            <option value="adjustment">Admin Adjustments</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              background: '#F8FAFC',
              border: '1px solid #CBD5E1',
              borderRadius: '10px',
              padding: '10px 14px',
              color: '#0F172A',
              fontSize: '0.84rem',
              outline: 'none',
              fontWeight: 600
            }}
          >
            <option value="all">Status: All</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Activities Table */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>
            Unified User Activities Feed ({activities.length} entries)
          </h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left', color: '#64748B' }}>
                <th style={{ padding: '14px', fontWeight: 700 }}>Type</th>
                <th style={{ padding: '14px', fontWeight: 700 }}>User</th>
                <th style={{ padding: '14px', fontWeight: 700 }}>Activity & Description</th>
                <th style={{ padding: '14px', fontWeight: 700 }}>Points Impact</th>
                <th style={{ padding: '14px', fontWeight: 700 }}>Status</th>
                <th style={{ padding: '14px', fontWeight: 700 }}>Timestamp</th>
                <th style={{ padding: '14px', fontWeight: 700 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {activities.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: '#94A3B8' }}>
                    No matching activity logs found.
                  </td>
                </tr>
              ) : (
                activities.map((act, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '14px' }}>
                      <div style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '8px',
                        background: '#F1F5F9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {getActivityIcon(act.type)}
                      </div>
                    </td>

                    <td style={{ padding: '14px' }}>
                      <div style={{ fontWeight: 700, color: '#0F172A' }}>{act.user_name || 'User'}</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748B' }}>{act.user_email}</div>
                    </td>

                    <td style={{ padding: '14px' }}>
                      <div style={{ fontWeight: 700, color: '#1E293B' }}>{act.title}</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '2px' }}>{act.details}</div>
                      {act.resolution_note && (
                        <div style={{ fontSize: '0.72rem', color: '#059669', marginTop: '3px', fontWeight: 600 }}>
                          Resolved: {act.resolution_note}
                        </div>
                      )}
                    </td>

                    <td style={{
                      padding: '14px',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      color: act.points > 0 ? '#059669' : act.points < 0 ? '#DC2626' : '#64748B'
                    }}>
                      {act.points > 0 ? `+${act.points}` : act.points} pts
                    </td>

                    <td style={{ padding: '14px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        textTransform: 'capitalize',
                        background: act.status === 'completed' || act.status === 'resolved' ? '#ECFDF5' :
                                    act.status === 'pending' ? '#FFFBEB' : '#FEF2F2',
                        color: act.status === 'completed' || act.status === 'resolved' ? '#059669' :
                               act.status === 'pending' ? '#D97706' : '#DC2626'
                      }}>
                        {act.status}
                      </span>
                    </td>

                    <td style={{ padding: '14px', color: '#64748B', fontSize: '0.78rem' }}>
                      {new Date(act.created_at).toLocaleString()}
                    </td>

                    <td style={{ padding: '14px' }}>
                      <button
                        onClick={() => setResolveModal({
                          open: true,
                          activity: act,
                          status: act.status === 'pending' ? 'resolved' : act.status,
                          note: act.resolution_note || ''
                        })}
                        style={{
                          background: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          color: '#0F172A',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Edit3 size={13} />
                        <span>Review</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RESOLVE ACTIVITY MODAL */}
      {resolveModal.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(3px)' }}>
          <div style={{ width: '100%', maxWidth: '440px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0F172A', fontWeight: 800 }}>Review User Activity</h3>
              <button onClick={() => setResolveModal({ ...resolveModal, open: false })} style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '12px 14px', borderRadius: '10px', fontSize: '0.82rem', color: '#475569', marginBottom: '16px' }}>
              <div>User: <strong style={{ color: '#0F172A' }}>{resolveModal.activity?.user_name}</strong></div>
              <div>Action: <strong style={{ color: '#7C3AED' }}>{resolveModal.activity?.title}</strong></div>
              <div>Details: {resolveModal.activity?.details}</div>
            </div>

            <form onSubmit={handleResolve} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#64748B', fontWeight: 700, marginBottom: '6px' }}>Status</label>
                <select
                  value={resolveModal.status}
                  onChange={(e) => setResolveModal({ ...resolveModal, status: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box', background: '#F8FAFC', border: '1px solid #CBD5E1', padding: '10px 14px', borderRadius: '8px', color: '#0F172A', outline: 'none' }}
                >
                  <option value="completed">Completed / Valid</option>
                  <option value="resolved">Resolved / Reviewed</option>
                  <option value="pending">Pending Investigation</option>
                  <option value="flagged">Flagged / Suspicious</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#64748B', fontWeight: 700, marginBottom: '6px' }}>Admin Resolution Note</label>
                <textarea
                  rows="3"
                  value={resolveModal.note}
                  onChange={(e) => setResolveModal({ ...resolveModal, note: e.target.value })}
                  placeholder="e.g. Activity verified by administrator."
                  style={{ width: '100%', boxSizing: 'border-box', background: '#F8FAFC', border: '1px solid #CBD5E1', padding: '10px 14px', borderRadius: '8px', color: '#0F172A', outline: 'none', resize: 'none' }}
                />
              </div>

              <button
                type="submit"
                disabled={processing}
                style={{
                  marginTop: '8px',
                  background: '#7C3AED',
                  border: 'none',
                  color: '#FFFFFF',
                  padding: '12px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {processing ? 'Saving...' : 'Confirm Resolution'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
