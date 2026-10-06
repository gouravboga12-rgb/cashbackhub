import React, { useState, useEffect } from 'react';
import api from '../api';
import {
  Bell,
  CheckCircle2,
  Trash2,
  X,
  Gift,
  Disc,
  Dices,
  Calendar,
  Tv,
  Wallet,
  Sparkles,
  Check,
  Volume2
} from 'lucide-react';

// Format timestamp to relative human readable string
function formatRelativeTime(dateString) {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

// Icon and color badge per notification type
function getNotificationMeta(type) {
  switch (type) {
    case 'referral':
      return {
        icon: Gift,
        color: '#16A34A',
        bg: '#DCFCE7',
        border: '#BBF7D0',
        badge: 'Referral'
      };
    case 'welcome':
      return {
        icon: Sparkles,
        color: '#7C3AED',
        bg: '#EDE9FE',
        border: '#DDD6FE',
        badge: 'Welcome'
      };
    case 'spin':
      return {
        icon: Disc,
        color: '#9333EA',
        bg: '#F3E8FF',
        border: '#E9D5FF',
        badge: 'Spin Win'
      };
    case 'dice':
      return {
        icon: Dices,
        color: '#4F46E5',
        bg: '#EEF2FF',
        border: '#E0E7FF',
        badge: 'Dice Roll'
      };
    case 'attendance':
      return {
        icon: Calendar,
        color: '#059669',
        bg: '#D1FAE5',
        border: '#A7F3D0',
        badge: 'Attendance'
      };
    case 'ad':
      return {
        icon: Tv,
        color: '#D97706',
        bg: '#FEF3C7',
        border: '#FDE68A',
        badge: 'Ad Reward'
      };
    case 'withdrawal':
      return {
        icon: Wallet,
        color: '#2563EB',
        bg: '#DBEAFE',
        border: '#BFDBFE',
        badge: 'Voucher'
      };
    default:
      return {
        icon: Bell,
        color: '#5B21B6',
        bg: '#F5F3FF',
        border: '#EDE9FE',
        badge: 'Update'
      };
  }
}

export default function NotificationModal({ isOpen, onClose, onCountChange }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'
  const [pushPermission, setPushPermission] = useState(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      if (res.data?.success) {
        const notifs = res.data.notifications || [];
        setNotifications(notifs);
        if (onCountChange) {
          onCountChange(res.data.unread_count || 0);
        }
      }
    } catch (err) {
      console.warn('Could not fetch notifications:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Request browser push notification permission
  const handleEnablePush = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setPushPermission(perm);
        if (perm === 'granted') {
          new Notification('Perkfy Notifications Enabled!', {
            body: 'You will now receive instant reward alerts right on your device.',
            icon: '/perkfy-logo.png'
          });
        }
      } catch (e) {
        console.warn('Push permission request failed:', e);
      }
    }
  };

  // Mark single notification as read
  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
      );
      if (onCountChange) {
        const unread = notifications.filter(n => n.id !== id && !n.is_read).length;
        onCountChange(unread);
      }
    } catch (err) {
      console.warn('Failed to mark read:', err);
    }
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      if (onCountChange) onCountChange(0);
    } catch (err) {
      console.warn('Failed to mark all read:', err);
    }
  };

  // Clear / remove single notification
  const handleClearSingle = async (e, id) => {
    e.stopPropagation();
    try {
      await api.delete(`/notifications/${id}`);
      const updated = notifications.filter(n => n.id !== id);
      setNotifications(updated);
      if (onCountChange) {
        onCountChange(updated.filter(n => !n.is_read).length);
      }
    } catch (err) {
      console.warn('Failed to delete notification:', err);
    }
  };

  // Clear all notifications
  const handleClearAll = async () => {
    if (notifications.length === 0) return;
    try {
      await api.delete('/notifications/clear-all');
      setNotifications([]);
      if (onCountChange) onCountChange(0);
    } catch (err) {
      console.warn('Failed to clear all notifications:', err);
    }
  };

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const filteredNotifications =
    filter === 'unread' ? notifications.filter(n => !n.is_read) : notifications;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(5px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: 0
      }}
    >
      <style>{`
        @media (min-width: 768px) {
          .notif-container {
            border-radius: 24px !important;
            max-width: 480px !important;
            max-height: 85vh !important;
            margin-bottom: auto !important;
            margin-top: 70px !important;
            margin-right: 20px !important;
            margin-left: auto !important;
            animation: notifDesktopIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) !important;
          }
        }
        @keyframes notifSlideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes notifDesktopIn {
          from { transform: translateY(-10px) scale(0.97); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}</style>

      <div
        className="notif-container"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '100%',
          maxHeight: '88vh',
          background: '#FFFFFF',
          borderTopLeftRadius: '26px',
          borderTopRightRadius: '26px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.2)',
          border: '1px solid #EDE9FE',
          animation: 'notifSlideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
          overflow: 'hidden'
        }}
      >
        {/* Mobile Drag Indicator Bar */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '10px', paddingBottom: '4px' }}>
          <div style={{ width: '40px', height: '4px', borderRadius: '4px', background: '#E2E8F0' }} />
        </div>

        {/* Header */}
        <div style={{
          padding: '14px 18px 12px 18px',
          borderBottom: '1px solid #F1F5F9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              background: '#F5F3FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#5B21B6'
            }}>
              <Bell size={17} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1E1B4B', margin: 0 }}>
                  Notifications
                </h2>
                {unreadCount > 0 && (
                  <span style={{
                    background: '#EF4444',
                    color: '#FFF',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '2px 7px',
                    borderRadius: '10px'
                  }}>
                    {unreadCount} new
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                title="Mark all as read"
                style={{
                  background: '#F8F7FC',
                  border: '1px solid #EDE9FE',
                  borderRadius: '8px',
                  padding: '5px 9px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#5B21B6',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Check size={12} /> Mark Read
              </button>
            )}

            {notifications.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                title="Clear all notifications"
                style={{
                  background: '#FEF2F2',
                  border: '1px solid #FEE2E2',
                  borderRadius: '8px',
                  padding: '5px 9px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#DC2626',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Trash2 size={12} /> Clear All
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: '#F1F5F9',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748B',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Push Notification Banner Prompt if not granted */}
        {pushPermission !== 'granted' && typeof window !== 'undefined' && 'Notification' in window && (
          <div style={{
            background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)',
            borderBottom: '1px solid #DDD6FE',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Volume2 size={16} color="#7C3AED" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4C1D95', lineHeight: 1.3 }}>
                Enable push alerts to never miss rewards!
              </span>
            </div>
            <button
              type="button"
              onClick={handleEnablePush}
              style={{
                background: '#7C3AED',
                color: '#FFF',
                border: 'none',
                borderRadius: '8px',
                padding: '4px 10px',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                flexShrink: 0,
                boxShadow: '0 2px 6px rgba(124, 58, 237, 0.3)'
              }}
            >
              Enable
            </button>
          </div>
        )}

        {/* Filter Tabs */}
        {notifications.length > 0 && (
          <div style={{
            padding: '8px 18px',
            background: '#FAFAFD',
            borderBottom: '1px solid #F1F5F9',
            display: 'flex',
            gap: '8px'
          }}>
            <button
              type="button"
              onClick={() => setFilter('all')}
              style={{
                padding: '4px 12px',
                borderRadius: '20px',
                border: 'none',
                background: filter === 'all' ? '#5B21B6' : '#E2E8F0',
                color: filter === 'all' ? '#FFFFFF' : '#475569',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('unread')}
              style={{
                padding: '4px 12px',
                borderRadius: '20px',
                border: 'none',
                background: filter === 'unread' ? '#5B21B6' : '#E2E8F0',
                color: filter === 'unread' ? '#FFFFFF' : '#475569',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Unread ({unreadCount})
            </button>
          </div>
        )}

        {/* Notification List Scroll Area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {loading && notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94A3B8' }}>
              <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '48px 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94A3B8'
              }}>
                <CheckCircle2 size={32} />
              </div>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
                {filter === 'unread' ? 'No unread notifications' : "You're all caught up!"}
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0, maxWidth: '280px', lineHeight: 1.5 }}>
                {filter === 'unread'
                  ? 'All notifications have been read. Switch to All to see past history.'
                  : 'New reward alerts, referral updates, and win notices will appear here.'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => {
              const meta = getNotificationMeta(notif.type);
              const IconComp = meta.icon;
              return (
                <div
                  key={notif.id}
                  onClick={() => handleMarkAsRead(notif.id)}
                  style={{
                    background: notif.is_read ? '#FFFFFF' : '#FAF5FF',
                    border: notif.is_read ? '1px solid #E2E8F0' : '1.5px solid #DDD6FE',
                    borderRadius: '16px',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    position: 'relative',
                    boxShadow: notif.is_read ? 'none' : '0 2px 8px rgba(124, 58, 237, 0.08)'
                  }}
                >
                  {/* Category Icon Badge */}
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '12px',
                    background: meta.bg,
                    border: `1px solid ${meta.border}`,
                    color: meta.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}>
                    <IconComp size={18} />
                  </div>

                  {/* Notification Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginBottom: '2px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          color: meta.color,
                          background: meta.bg,
                          padding: '1px 6px',
                          borderRadius: '6px'
                        }}>
                          {meta.badge}
                        </span>
                        <h4 style={{
                          fontSize: '0.88rem',
                          fontWeight: notif.is_read ? 700 : 800,
                          color: '#0F172A',
                          margin: 0
                        }}>
                          {notif.title}
                        </h4>
                      </div>

                      {/* Unread indicator dot */}
                      {!notif.is_read && (
                        <span style={{
                          width: '7px',
                          height: '7px',
                          borderRadius: '50%',
                          background: '#7C3AED',
                          flexShrink: 0
                        }} />
                      )}
                    </div>

                    <p style={{
                      margin: '3px 0 6px 0',
                      fontSize: '0.8rem',
                      color: notif.is_read ? '#64748B' : '#334155',
                      lineHeight: 1.45,
                      fontWeight: notif.is_read ? 500 : 600
                    }}>
                      {notif.message}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 600 }}>
                        {formatRelativeTime(notif.created_at)}
                      </span>

                      {/* Single Item Clear / Delete Button */}
                      <button
                        type="button"
                        onClick={(e) => handleClearSingle(e, notif.id)}
                        title="Remove notification"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#94A3B8',
                          padding: '2px 4px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px',
                          fontSize: '0.7rem',
                          fontWeight: 600
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div style={{
          padding: '10px 18px',
          background: '#F8FAFC',
          borderTop: '1px solid #F1F5F9',
          textAlign: 'center',
          fontSize: '0.72rem',
          color: '#94A3B8',
          fontWeight: 600
        }}>
          Tap any notification to mark it as read • Click 🗑️ to remove
        </div>
      </div>
    </div>
  );
}
