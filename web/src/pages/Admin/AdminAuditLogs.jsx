import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  Lock,
  User
} from 'lucide-react';
import { adminApi } from '../../api';

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredLogs = logs.filter(log =>
    (log.action && log.action.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (log.target && log.target.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (log.details && log.details.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (log.admin_email && log.admin_email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
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
          <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
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

          <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
            Showing <strong>{filteredLogs.length}</strong> logged administrative actions
          </div>
        </div>

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
              {filteredLogs.map((log, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '14px', fontFamily: 'monospace', color: '#64748B', fontSize: '0.78rem' }}>
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
                      padding: '4px 8px',
                      borderRadius: '8px',
                      fontFamily: 'monospace',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      background: '#F5F3FF',
                      color: '#6D28D9',
                      border: '1px solid #DDD6FE'
                    }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ padding: '14px', color: '#059669', fontWeight: 700 }}>
                    {log.target}
                  </td>
                  <td style={{ padding: '14px', color: '#334155' }}>
                    {log.details}
                  </td>
                  <td style={{ padding: '14px', color: '#64748B', fontSize: '0.78rem' }}>
                    {new Date(log.timestamp).toLocaleString()}
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
