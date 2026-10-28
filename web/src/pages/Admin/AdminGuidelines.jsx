import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Plus,
  Trash2,
  Edit3,
  X,
  Tv,
  Save,
  ExternalLink,
  Play,
  CheckCircle,
  AlertCircle,
  Calendar,
  Dices,
  Disc,
  Users,
  Gift,
  Sparkles,
  Smartphone,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { adminApi } from '../../api';

export default function AdminGuidelines() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Form State
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('How to Use Perkfy & Earn Rewards Daily');
  const [videoDesc, setVideoDesc] = useState('Watch this video to learn how to use the app correctly, play games, and earn real rewards!');
  const [guidelinesText, setGuidelinesText] = useState('');
  const [strictPolicyWarning, setStrictPolicyWarning] = useState(
    '🚨 Strict Fair Play Policy: 1 Device = 1 Account Only. Using multiple accounts or phone numbers on the same device will lead to permanent account suspension and cancellation of all reward withdrawals.'
  );

  // Dynamic Custom Guidelines List
  const [customGuidelines, setCustomGuidelines] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState(null);
  const [ruleTitle, setRuleTitle] = useState('');
  const [ruleDesc, setRuleDesc] = useState('');

  // Platform limits (read from server)
  const [platformSettings, setPlatformSettings] = useState({
    attendance_reward_points: 50,
    daily_spin_limit: 10,
    cost_per_spin: 25,
    daily_ad_limit: 10,
    points_to_rupee_ratio: 10,
    min_withdrawal_rupees: 100,
    referral_reward_points: 100
  });

  useEffect(() => {
    fetchGuidelines();
  }, []);

  const fetchGuidelines = async () => {
    try {
      setLoading(true);
      const res = await adminApi.get('/admin/guidelines');
      if (res.data?.success) {
        setVideoUrl(res.data.guide_video_url !== undefined ? res.data.guide_video_url : '');
        if (res.data.guide_video_title) setVideoTitle(res.data.guide_video_title);
        if (res.data.guide_video_description) setVideoDesc(res.data.guide_video_description);
        if (res.data.guidelines_text) setGuidelinesText(res.data.guidelines_text);
        if (res.data.strict_policy_warning) setStrictPolicyWarning(res.data.strict_policy_warning);
        if (Array.isArray(res.data.custom_guidelines)) setCustomGuidelines(res.data.custom_guidelines);
        if (res.data.platform_settings) setPlatformSettings(res.data.platform_settings);
      }
    } catch (e) {
      console.warn('Could not load guidelines config:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      const res = await adminApi.put('/admin/guidelines', {
        guide_video_url: videoUrl,
        guide_video_title: videoTitle,
        guide_video_description: videoDesc,
        guidelines_text: guidelinesText,
        strict_policy_warning: strictPolicyWarning,
        custom_guidelines: customGuidelines
      });

      if (res.data?.success) {
        setToastMsg('App Guidelines, Policy Warning & Custom Rules saved successfully!');
        setTimeout(() => setToastMsg(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating guidelines');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingRuleId(null);
    setRuleTitle('');
    setRuleDesc('');
    setShowAddModal(true);
  };

  const handleOpenEditModal = (rule) => {
    setEditingRuleId(rule.id);
    setRuleTitle(rule.title);
    setRuleDesc(rule.description);
    setShowAddModal(true);
  };

  const handleSaveRule = (e) => {
    e.preventDefault();
    if (!ruleTitle.trim() || !ruleDesc.trim()) {
      alert('Please enter both Title and Description for the guideline.');
      return;
    }

    if (editingRuleId) {
      setCustomGuidelines(prev =>
        prev.map(r => r.id === editingRuleId ? { ...r, title: ruleTitle.trim(), description: ruleDesc.trim() } : r)
      );
    } else {
      const newRule = {
        id: `crule_${Date.now()}`,
        title: ruleTitle.trim(),
        description: ruleDesc.trim()
      };
      setCustomGuidelines(prev => [...prev, newRule]);
    }

    setShowAddModal(false);
    setEditingRuleId(null);
    setRuleTitle('');
    setRuleDesc('');
  };

  const handleDeleteRule = (id) => {
    if (window.confirm('Are you sure you want to delete this custom guideline?')) {
      setCustomGuidelines(prev => prev.filter(r => r.id !== id));
    }
  };

  // Helper to extract YouTube video ID for preview
  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const ytId = getYouTubeId(videoUrl);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid #7C3AED', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '8px 0 40px 0' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div style={{ background: '#EDE9FE', padding: '8px', borderRadius: '12px' }}>
              <ShieldCheck size={24} color="#7C3AED" />
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1E1B4B', margin: 0 }}>
              App Guidelines & Policy Rules
            </h1>
          </div>
          <p style={{ color: '#6B7280', margin: 0, fontSize: '0.95rem' }}>
            Manage the Fair Play policy warning, custom guidelines, and YouTube tutorial displayed on the mobile app home screen.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: saving ? '#A78BFA' : '#7C3AED',
            color: '#FFFFFF',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: saving ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)',
            transition: 'all 0.2s ease'
          }}
        >
          <Save size={18} />
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>

      {toastMsg && (
        <div style={{ background: '#DCFCE7', border: '1px solid #86EFAC', borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '10px', color: '#166534', fontWeight: 600, marginBottom: '24px' }}>
          <CheckCircle size={20} color="#16A34A" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Grid: Editor on Left, Live Mobile Preview on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
        
        {/* LEFT COLUMN: Controls & Configurations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Card 1: Strict Fair Play Policy Warning Editor */}
          <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '24px', border: '1px solid #FECACA', boxShadow: '0 2px 10px rgba(220, 38, 38, 0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: '#FEE2E2', padding: '8px', borderRadius: '10px' }}>
                  <ShieldAlert size={20} color="#DC2626" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#991B1B', margin: 0 }}>
                    Strict Policy Warning Banner
                  </h3>
                  <p style={{ color: '#6B7280', fontSize: '0.82rem', margin: 0 }}>
                    Displayed prominently at the top of the mobile guidelines to prevent multi-accounting.
                  </p>
                </div>
              </div>
              <span style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', textTransform: 'uppercase' }}>
                High Priority
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.86rem', color: '#374151', marginBottom: '6px' }}>
                Policy Warning Text:
              </label>
              <textarea
                rows={3}
                value={strictPolicyWarning}
                onChange={(e) => setStrictPolicyWarning(e.target.value)}
                placeholder="🚨 Strict Fair Play Policy: 1 Device = 1 Account Only..."
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1.5px solid #FCA5A5',
                  background: '#FFF5F5',
                  fontSize: '0.88rem',
                  lineHeight: '1.5',
                  color: '#991B1B',
                  fontWeight: 600,
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                <span style={{ fontSize: '0.76rem', color: '#6B7280' }}>
                  Tip: Clearly state that multiple accounts on the same phone will lead to withdrawal forfeiture.
                </span>
                <button
                  type="button"
                  onClick={() => setStrictPolicyWarning('🚨 Strict Fair Play Policy: 1 Device = 1 Account Only. Using multiple accounts or phone numbers on the same device will lead to permanent account suspension and cancellation of all reward withdrawals.')}
                  style={{ background: 'transparent', border: 'none', color: '#DC2626', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Reset Default
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Dynamic Custom Guidelines Manager */}
          <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '24px', border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: '#EDE9FE', padding: '8px', borderRadius: '10px' }}>
                  <FileText size={20} color="#7C3AED" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1F2937', margin: 0 }}>
                    Custom Dynamic Guidelines ({customGuidelines.length})
                  </h3>
                  <p style={{ color: '#6B7280', fontSize: '0.82rem', margin: 0 }}>
                    Add extra custom guidelines, rules, or announcements for users.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleOpenAddModal}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#7C3AED',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(124, 58, 237, 0.25)'
                }}
              >
                <Plus size={16} /> Add New Guideline
              </button>
            </div>

            {/* List of Custom Guidelines */}
            {customGuidelines.length === 0 ? (
              <div style={{ background: '#F9FAFB', border: '1px dashed #D1D5DB', borderRadius: '12px', padding: '24px', textAlign: 'center', color: '#6B7280' }}>
                <Sparkles size={24} color="#9CA3AF" style={{ margin: '0 auto 8px auto', display: 'block' }} />
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#374151' }}>No Custom Guidelines Yet</div>
                <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                  Click <strong>"+ Add New Guideline"</strong> above to add custom terms, timing notices, or rules.
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {customGuidelines.map((rule, idx) => (
                  <div
                    key={rule.id || idx}
                    style={{
                      background: '#F9FAFB',
                      border: '1px solid #E5E7EB',
                      borderRadius: '12px',
                      padding: '14px 16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '12px'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ background: '#EEF2FF', color: '#4F46E5', fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '6px' }}>
                          Rule #{idx + 1}
                        </span>
                        <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: '#1F2937' }}>
                          {rule.title}
                        </h4>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: '#4B5563', lineHeight: '1.45' }}>
                        {rule.description}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(rule)}
                        title="Edit Guideline"
                        style={{
                          background: '#FFFFFF',
                          border: '1px solid #D1D5DB',
                          color: '#4B5563',
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteRule(rule.id)}
                        title="Delete Guideline"
                        style={{
                          background: '#FEE2E2',
                          border: '1px solid #FECACA',
                          color: '#DC2626',
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card 3: YouTube Video Tutorial Configuration */}
          <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '24px', border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ background: '#FEE2E2', padding: '8px', borderRadius: '10px' }}>
                <Tv size={20} color="#DC2626" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1F2937', margin: 0 }}>
                  YouTube Guide Video Setup
                </h3>
                <p style={{ color: '#6B7280', fontSize: '0.85rem', margin: 0 }}>
                  This video explains how users can use the app correctly and earn points.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', color: '#374151', marginBottom: '6px' }}>
                  YouTube Video URL:
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #D1D5DB',
                      fontSize: '0.9rem',
                      outline: 'none',
                      fontFamily: 'inherit'
                    }}
                  />
                  {videoUrl && (
                    <a
                      href={videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: '#F3F4F6',
                        color: '#374151',
                        border: '1px solid #D1D5DB',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        textDecoration: 'none',
                        fontWeight: 600,
                        fontSize: '0.85rem'
                      }}
                    >
                      <ExternalLink size={16} /> Test
                    </a>
                  )}

                  {videoUrl.trim() && (
                    <button
                      type="button"
                      onClick={() => setVideoUrl('')}
                      style={{
                        background: '#FEE2E2',
                        color: '#DC2626',
                        border: '1px solid #FECACA',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                      }}
                    >
                      Clear / Hide Video
                    </button>
                  )}
                </div>
                <span style={{ fontSize: '0.78rem', color: videoUrl.trim() ? '#9CA3AF' : '#10B981', marginTop: '6px', display: 'block', fontWeight: videoUrl.trim() ? 400 : 700 }}>
                  {videoUrl.trim()
                    ? 'Accepts standard YouTube links (e.g. https://www.youtube.com/watch?v=xyz or https://youtu.be/xyz).'
                    : 'ℹ️ No video link set: The tutorial video banner will be completely hidden in the mobile app.'}
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', color: '#374151', marginBottom: '6px' }}>
                  Video Banner Heading:
                </label>
                <input
                  type="text"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  placeholder="How to Use Perkfy & Earn Rewards Daily"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #D1D5DB',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', color: '#374151', marginBottom: '6px' }}>
                  Video Guide Explanation (Subtitle):
                </label>
                <textarea
                  rows={2}
                  value={videoDesc}
                  onChange={(e) => setVideoDesc(e.target.value)}
                  placeholder="This video is used for guiding you how to use the app correctly and earn rewards"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #D1D5DB',
                    fontSize: '0.9rem',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {ytId && (
                <div style={{ marginTop: '8px' }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: '#4B5563', marginBottom: '6px' }}>
                    YouTube Video Embed Preview:
                  </label>
                  <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                    <iframe
                      src={`https://www.youtube.com/embed/${ytId}`}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Real-Time Mobile App Preview */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Smartphone size={20} color="#7C3AED" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1F2937', margin: 0 }}>
              Live Mobile App Preview (In-App Card)
            </h3>
          </div>

          {/* Smartphone Frame Mockup */}
          <div style={{ background: '#F8F7FC', borderRadius: '24px', padding: '16px', border: '2px solid #E2E8F0', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}>
            
            {/* Guidelines Card as it appears on Dashboard */}
            <div style={{ background: '#FFFFFF', borderRadius: '18px', padding: '18px', border: '1px solid #E5E7EB', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
              
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '18px', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldCheck size={20} color="#4F46E5" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#1E1B4B' }}>App Guidelines & Reward Rules</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>AdMob Compliant • Tap to view details</div>
                  </div>
                </div>
              </div>

              {/* LIVE STRICT POLICY BANNER PREVIEW */}
              {strictPolicyWarning?.trim() && (
                <div style={{
                  background: '#FEF2F2',
                  border: '1.5px solid #FCA5A5',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  marginBottom: '14px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px'
                }}>
                  <AlertTriangle size={18} color="#DC2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ fontSize: '0.78rem', color: '#991B1B', fontWeight: 700, lineHeight: '1.45' }}>
                    {strictPolicyWarning}
                  </div>
                </div>
              )}

              {/* YouTube Guide Video Banner inside Card */}
              {videoUrl?.trim() && (
                <div style={{
                  background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)',
                  borderRadius: '14px',
                  padding: '16px',
                  color: '#FFFFFF',
                  marginBottom: '16px',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <span style={{ background: '#EF4444', color: '#FFF', fontSize: '0.65rem', fontWeight: 800, padding: '2px 8px', borderRadius: '6px', textTransform: 'uppercase' }}>
                      Official Video Tutorial
                    </span>
                  </div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '0.95rem', fontWeight: 800 }}>
                    ▶️ {videoTitle || 'How to Use Perkfy & Earn Rewards Daily'}
                  </h4>
                  <p style={{ margin: '0 0 12px 0', fontSize: '0.78rem', color: '#C7D2FE', lineHeight: '1.4' }}>
                    {videoDesc || 'Watch this video to learn how to use the app correctly and earn rewards.'}
                  </p>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#FFFFFF', color: '#1E1B4B', padding: '6px 14px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 800 }}>
                    <Play size={12} fill="#1E1B4B" /> Watch on YouTube
                  </div>
                </div>
              )}

              {/* Core System Guidelines Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                
                {/* 1. Daily Check-in */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Calendar size={15} color="#16A34A" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1F2937' }}>Daily Check-In Attendance</div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                      Claim <strong style={{ color: '#16A34A' }}>+{platformSettings.attendance_reward_points || 50} Bonus Points</strong> once per calendar day (IST) by checking in.
                    </div>
                  </div>
                </div>

                {/* 2. Lucky Dice */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Dices size={15} color="#4F46E5" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1F2937' }}>Lucky 3D Dice Game</div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                      Roll 3D dice up to <strong style={{ color: '#4F46E5' }}>10 times daily</strong>. Points match dice multiplier. 100% free to play.
                    </div>
                  </div>
                </div>

                {/* 3. Spin Wheel */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#FFEDD5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Disc size={15} color="#EA580C" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1F2937' }}>Lucky Spin & Win</div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                      Spin up to <strong style={{ color: '#EA580C' }}>{platformSettings.daily_spin_limit || 10} times daily</strong> (cost: {platformSettings.cost_per_spin || 25} pts per spin).
                    </div>
                  </div>
                </div>

                {/* 4. Refer & Earn */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Users size={15} color="#9333EA" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1F2937' }}>Refer & Earn</div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                      Share invite code. Earn <strong style={{ color: '#9333EA' }}>+{platformSettings.referral_reward_points || 100} Points</strong> when friends register.
                    </div>
                  </div>
                </div>

                {/* 5. Redemption */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Gift size={15} color="#059669" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1F2937' }}>Redemption & Conversion</div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                      Redeem for digital gift cards at rate of <strong>{platformSettings.points_to_rupee_ratio || 10} Points = ₹1.00</strong>. Min threshold: <strong>₹{platformSettings.min_withdrawal_rupees || 100}</strong>.
                    </div>
                  </div>
                </div>

                {/* Custom Guidelines in Preview */}
                {customGuidelines.map((rule, idx) => (
                  <div key={rule.id || idx} style={{ display: 'flex', gap: '10px', paddingTop: '4px', borderTop: '1px dashed #E5E7EB' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FileText size={15} color="#4B5563" />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1F2937' }}>{rule.title}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{rule.description}</div>
                    </div>
                  </div>
                ))}

              </div>

              {/* Security Badge */}
              <div style={{ marginTop: '14px', background: '#F1F5F9', borderRadius: '10px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={16} color="#475569" />
                <span style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 600 }}>
                  Perkfy strictly adheres to Google AdMob traffic policies. VPNs and bots are prohibited.
                </span>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* Modal for Add / Edit Custom Guideline Rule */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '520px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            border: '1px solid #E2E8F0'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ background: '#EDE9FE', padding: '6px', borderRadius: '8px' }}>
                  <FileText size={18} color="#7C3AED" />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1E1B4B', margin: 0 }}>
                  {editingRuleId ? 'Edit Guideline Rule' : 'Add New Guideline Rule'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveRule} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', color: '#374151', marginBottom: '6px' }}>
                  Rule Title:
                </label>
                <input
                  type="text"
                  required
                  value={ruleTitle}
                  onChange={(e) => setRuleTitle(e.target.value)}
                  placeholder="e.g. Daily Bonus Distribution Hours"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #D1D5DB',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', color: '#374151', marginBottom: '6px' }}>
                  Rule Description:
                </label>
                <textarea
                  required
                  rows={4}
                  value={ruleDesc}
                  onChange={(e) => setRuleDesc(e.target.value)}
                  placeholder="Explain the rule or information clearly for your app users..."
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #D1D5DB',
                    fontSize: '0.9rem',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '10px',
                    border: '1px solid #D1D5DB',
                    background: '#F3F4F6',
                    color: '#4B5563',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 22px',
                    borderRadius: '10px',
                    border: 'none',
                    background: '#7C3AED',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(124, 58, 237, 0.3)'
                  }}
                >
                  {editingRuleId ? 'Update Rule' : 'Add Rule to List'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
