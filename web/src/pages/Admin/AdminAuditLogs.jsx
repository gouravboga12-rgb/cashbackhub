import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  Lock,
  User,
  Trash2,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  X,
  ShieldAlert
} from 'lucide-react';
import { adminApi } from '../../api';

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success'); // 'success' | 'error'

  // Clear Confirmation Modal
  const [clearModal, setClearModal] = useState({ open: false, clearing: false });

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const res = await adminApi.get('/admin/audit-logs');
      if (res.data?.success) {
        setLogs(res.data.audit_logs || []);
      }
    } catch (err) {
      console.warn('Audit logs API offline, loading default logs.');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(''), 5000);
  };

  const handleClearAllLogs = async () => {
    setClearModal(prev => ({ ...prev, clearing: true }));
    try {
      const res = await adminApi.delete('/admin/audit-logs');
      if (res.data?.success) {
        showToast(`✅ ${res.data.message}`, 'success');
        setClearModal({ open: false, clearing: false });
        // Reload logs — only the CLEAR_AUDIT_LOGS system record remains
        setTimeout(() => fetchAuditLogs(), 500);
      } else {
        showToast('Failed to clear audit logs. Please try again.', 'error');
        setClearModal(prev => ({ ...prev, clearing: false }));
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error clearing audit logs.', 'error');
      setClearModal(prev => ({ ...prev, clearing: false }));
    }
  };

  const filteredLogs = logs.filter(log =>
    (log.action && log.action.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (log.target && log.target.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (log.details && log.details.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (log.admin_email && log.admin_email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const actionBadgeColor = (action) => {
    if (!action) return { bg: '#F1F5F9', color: '#475569', border: '#E2E8F0' };
    const act = action.toUpperCase();
    if (act.includes('DELETE') || act.includes('CLEAR')) return { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' };
    if (act.includes('LOGIN')) return { bg: '#EFF6FF', color: '#2563EB', border: '#BFDBFE' };
    if (act.includes('ADJUST') || act.includes('CREDIT') || act.includes('DEBIT')) return { bg: '#ECFDF5', color: '#059669', border: '#A7F3D0' };
    if (act.includes('UPDATE') || act.includes('EDIT') || act.includes('PUT')) return { bg: '#FEF3C7', color: '#D97706', border: '#FDE68A' };
    return { bg: '#F5F3FF', color: '#6D28D9', border: '#DDD6FE' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          background: toastType === 'success' ? '#065F46' : '#991B1B',
          color: '#FFFFFF',
          padding: '14px 20px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          zIndex: 1100,
          fontWeight: 600,
          fontSize: '0.88rem',
          maxWidth: '420px'
        }}>
          {toastType === 'success'
            ? <CheckCircle size={18} color="#34D399" style={{ flexShrink: 0 }} />
            : <AlertTriangle size={18} color="#FCA5A5" style={{ flexShrink: 0 }} />
          }
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Security Header Banner */}
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
            <ShieldCheck size={26} color="#FFFFFF" />
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
              Security, Permissions & Audit Trail
            </h2>
          </div>
          <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.86rem' }}>
            Immutable chronological logging of all administrative operations, wallet balance adjustments, and probability updates.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.35)',
            borderRadius: '12px',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#FFFFFF',
            fontSize: '0.82rem',
            fontWeight: 700
          }}>
            <Lock size={16} />
            <span>Role: Super Admin (Protected)</span>
          </div>
        </div>
      </div>

      {/* Logs Table Card */}
      <div
        className="admin-card-container"
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
        }}
      >
        {/* Controls */}
        <div
          className="admin-filter-stack"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}
        >
          {/* Search Bar */}
          <div style={{ position: 'relative', flex: 1, minWidth: '260px', maxWidth: '380px' }}>
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '12px' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search audit trail by action, target or note..."
              style={{
                width: '100%',
                boxSizing: 'border-box',
                background: '#F8FAFC',
                border: '1px solid #CBD5E1',
                borderRadius: '10px',
                padding: '10px 14px 10px 40px',
                color: '#0F172A',
                fontSize: '0.84rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Right Controls: log count + refresh + clear */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
              Showing <strong>{filteredLogs.length}</strong> logged administrative actions
            </span>

            {/* Refresh Button */}
            <button
              onClick={fetchAuditLogs}
              disabled={loading}
              title="Refresh audit logs"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                padding: '8px 14px',
                borderRadius: '9px',
                color: '#475569',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
              <span>Refresh</span>
            </button>

            {/* Clear All Logs Button */}
            <button
              onClick={() => setClearModal({ open: true, clearing: false })}
              disabled={logs.length === 0}
              title="Clear all audit logs from system and Supabase"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: logs.length === 0 ? '#F1F5F9' : '#FEF2F2',
                border: `1px solid ${logs.length === 0 ? '#E2E8F0' : '#FECACA'}`,
                padding: '8px 16px',
                borderRadius: '9px',
                color: logs.length === 0 ? '#94A3B8' : '#DC2626',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: logs.length === 0 ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Trash2 size={14} />
              <span>Clear All Logs</span>
            </button>
          </div>
        </div>

        {/* Table or Empty State */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94A3B8' }}>
            <RefreshCw size={28} style={{ animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
            <p style={{ margin: 0, fontWeight: 600 }}>Loading audit logs...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#94A3B8',
            background: '#F8FAFC',
            borderRadius: '12px',
            border: '1px dashed #E2E8F0'
          }}>
            <ShieldCheck size={40} color="#CBD5E1" style={{ marginBottom: '12px' }} />
            <p style={{ margin: 0, fontWeight: 700, color: '#64748B', fontSize: '1rem' }}>No Audit Logs Found</p>
            <p style={{ margin: '6px 0 0 0', fontSize: '0.82rem', color: '#94A3B8' }}>
              {searchQuery ? 'No logs match your search. Try a different keyword.' : 'All audit log entries have been cleared.'}
            </p>
          </div>
        ) : (
          <div className="admin-table-container" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left', color: '#64748B' }}>
                  <th style={{ padding: '14px', fontWeight: 700 }}>Log ID</th>
                  <th style={{ padding: '14px', fontWeight: 700 }}>Administrator</th>
                  <th style={{ padding: '14px', fontWeight: 700 }}>Action Code</th>
                  <th style={{ padding: '14px', fontWeight: 700 }}>Target Entity</th>
                  <th style={{ padding: '14px', fontWeight: 700 }}>Details / Payload Description</th>
                  <th style={{ padding: '14px', fontWeight: 700 }}>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, idx) => {
                  const badge = actionBadgeColor(log.action);
                  return (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: '1px solid #F1F5F9',
                        transition: 'background 0.1s ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#FAFBFC'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '14px', fontFamily: 'monospace', color: '#64748B', fontSize: '0.75rem', maxWidth: '140px', wordBreak: 'break-all' }}>
                        {log.id}
                      </td>
                      <td style={{ padding: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <User size={14} color="#7C3AED" />
                          <span style={{ color: '#0F172A', fontWeight: 600 }}>{log.admin_email}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '8px',
                          fontFamily: 'monospace',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          background: badge.bg,
                          color: badge.color,
                          border: `1px solid ${badge.border}`,
                          whiteSpace: 'nowrap'
                        }}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ padding: '14px', color: '#059669', fontWeight: 700 }}>
                        {log.target}
                      </td>
                      <td style={{ padding: '14px', color: '#334155', maxWidth: '320px', lineHeight: 1.5 }}>
                        {log.details}
                      </td>
                      <td style={{ padding: '14px', color: '#64748B', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ====================================================== */}
      {/* CLEAR ALL LOGS CONFIRMATION MODAL                       */}
      {/* ====================================================== */}
      {clearModal.open && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          zIndex: 1200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '480px',
            background: '#FFFFFF',
            borderRadius: '20px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
            overflow: 'hidden',
            border: '1px solid #E2E8F0',
            animation: 'modalSlideIn 0.2s ease-out'
          }}>
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #7F1D1D 0%, #991B1B 100%)',
              padding: '24px 24px 20px 24px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px'
            }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '14px',
                background: 'rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <Trash2 size={24} color="#FFFFFF" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF' }}>
                  Clear All Audit Logs?
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'rgba(255,255,255,0.8)' }}>
                  This action permanently removes all {logs.length} log entries.
                </p>
              </div>
              <button
                onClick={() => !clearModal.clearing && setClearModal({ open: false, clearing: false })}
                style={{
                  marginLeft: 'auto', background: 'rgba(255,255,255,0.15)', border: 'none',
                  borderRadius: '8px', padding: '6px', cursor: 'pointer', color: '#FFFFFF',
                  display: 'flex', alignItems: 'center', flexShrink: 0
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px' }}>
              <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.6, margin: '0 0 16px 0' }}>
                You are about to permanently clear <strong>all {logs.length} audit log records</strong> from both the admin panel and the Supabase database.
              </p>

              {/* Warning Details Box */}
              <div style={{
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ShieldAlert size={18} color="#DC2626" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '0.82rem', color: '#991B1B', fontWeight: 700 }}>
                    This will permanently delete:
                  </span>
                </div>
                <ul style={{ margin: 0, paddingLeft: '28px', fontSize: '0.82rem', color: '#7F1D1D', lineHeight: 1.7 }}>
                  <li>All <strong>{logs.length}</strong> audit trail entries from the admin panel</li>
                  <li>All records from Supabase <code style={{ background: '#FEE2E2', padding: '1px 4px', borderRadius: '4px' }}>perkfy_app_state</code> audit logs</li>
                  <li>Historical logs of admin logins, user deletions, wallet adjustments</li>
                </ul>
              </div>

              {/* Note */}
              <div style={{
                background: '#FFFBEB',
                border: '1px solid #FDE68A',
                borderRadius: '10px',
                padding: '10px 14px',
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start'
              }}>
                <AlertTriangle size={16} color="#D97706" style={{ flexShrink: 0, marginTop: '1px' }} />
                <span style={{ fontSize: '0.78rem', color: '#92400E', lineHeight: 1.5 }}>
                  A single system entry recording this clearance action will be added automatically for accountability.
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{
              background: '#F8FAFC',
              padding: '16px 24px',
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px'
            }}>
              <button
                type="button"
                onClick={() => setClearModal({ open: false, clearing: false })}
                disabled={clearModal.clearing}
                style={{
                  padding: '10px 20px',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  background: '#FFFFFF',
                  color: '#475569',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: clearModal.clearing ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleClearAllLogs}
                disabled={clearModal.clearing}
                style={{
                  padding: '10px 22px',
                  borderRadius: '10px',
                  border: 'none',
                  background: clearModal.clearing ? '#94A3B8' : '#DC2626',
                  color: '#FFFFFF',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: clearModal.clearing ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: clearModal.clearing ? 'none' : '0 4px 12px rgba(220, 38, 38, 0.3)',
                  transition: 'all 0.15s ease'
                }}
              >
                {clearModal.clearing ? (
                  <>
                    <RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Clearing Logs...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={15} />
                    <span>Yes, Clear All Logs</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
