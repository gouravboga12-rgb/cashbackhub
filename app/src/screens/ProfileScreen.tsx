import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Share,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import {
  User as UserIcon,
  Mail,
  Phone,
  Lock,
  LogOut,
  Sparkles,
  Share2,
  Copy,
  Bell,
  Volume2,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  Check,
  Edit3,
  Save,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../context/AuthContext';
import { showInAppNotification, triggerPushNotification, playNotificationAudio } from '../services/notificationService';
import api from '../services/api';

export default function ProfileScreen({ navigation }: any) {
  const { user, logout, refreshUser } = useAuth();

  const [pushEnabled, setPushEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Accordion Sections
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showReferSection, setShowReferSection] = useState(false);

  // Edit Profile State
  const [editName, setEditName] = useState(user?.name || '');
  const [editMobile, setEditMobile] = useState(user?.mobile || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [passMsg, setPassMsg] = useState('');
  const [passError, setPassError] = useState('');

  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = async () => {
    const code = user?.referral_code || 'PERKFY100';
    await Clipboard.setStringAsync(code);
    setCopiedCode(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    showInAppNotification('Copied!', `Referral code ${code} copied!`);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleShareReferral = async () => {
    const code = user?.referral_code || 'PERKFY100';
    try {
      await Share.share({
        message: `Use my invite code ${code} on Perkfy to receive 100 Free Welcome Points! Download: https://perkfy.app`,
      });
    } catch (e) {}
  };

  const handleProfileUpdate = async () => {
    setProfileError('');
    setProfileMsg('');

    if (!editName.trim()) {
      setProfileError('Name cannot be empty.');
      return;
    }

    setProfileLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const res = await api.put('/auth/profile', {
        name: editName.trim(),
        mobile: editMobile.trim(),
      });

      if (res.data?.success) {
        setProfileMsg('Profile updated successfully!');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showInAppNotification('Profile Updated', 'Your profile details were saved.');
        if (refreshUser) {
          await refreshUser();
        }
        setTimeout(() => {
          setProfileMsg('');
          setShowEditProfile(false);
        }, 1500);
      } else {
        setProfileError(res.data?.message || 'Failed to update profile.');
      }
    } catch (err: any) {
      setProfileError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    setPassError('');
    setPassMsg('');

    if (!currentPassword || !newPassword) {
      setPassError('Please fill in both current and new password.');
      return;
    }

    if (newPassword.length < 6) {
      setPassError('New password must be at least 6 characters long.');
      return;
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      setPassError('New passwords do not match. Please verify.');
      return;
    }

    setPassLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const res = await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      if (res.data?.success) {
        setPassMsg(res.data?.message || 'Password updated successfully!');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showInAppNotification('Success', 'Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          setPassMsg('');
          setShowPasswordForm(false);
        }, 2000);
      } else {
        setPassError(res.data?.message || 'Password update failed');
      }
    } catch (e: any) {
      setPassError(e.response?.data?.message || 'Error updating password. Check current password.');
    } finally {
      setPassLoading(false);
    }
  };

  const handleTestAlertSound = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (soundEnabled) {
      playNotificationAudio().catch(() => {});
    }
    showInAppNotification('Audio Chime Test 🔔', 'Sound and vibration triggered!');
    if (pushEnabled) {
      triggerPushNotification('Perkfy Test Alert 🌟', 'Notification delivered successfully!');
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out of your Perkfy account?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* User Profile Banner (1:1 with Web card-violet-banner) */}
        <LinearGradient
          colors={['#4C1D95', '#5B21B6', '#6D28D9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroBanner}
        >
          <View style={styles.avatarBorder}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarLetter}>
                  {user?.name ? user.name.trim().charAt(0).toUpperCase() : 'U'}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.heroTextWrap}>
            <Text style={styles.userName}>{user?.name || 'Perkfy Member'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'user@perkfy.app'}</Text>
            <Text style={styles.userMobile}>
              {user?.mobile ? user.mobile : 'No phone number linked'}
            </Text>
            <View style={styles.badgeRow}>
              <View style={styles.verifiedBadge}>
                <ShieldCheck size={13} color="#4ADE80" />
                <Text style={styles.verifiedText}>Verified Member</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Menu Cards (1:1 with Web Portal) */}
        <View style={styles.cardWhite}>
          {/* 1. Refer & Earn (+100 Pts) */}
          <TouchableOpacity
            onPress={() => setShowReferSection(!showReferSection)}
            style={styles.menuRow}
            activeOpacity={0.8}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconCircle, { backgroundColor: '#DCFCE7' }]}>
                <Sparkles size={18} color="#16A34A" />
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.menuTitle}>Refer & Earn</Text>
                <View style={styles.pillGreen}>
                  <Text style={styles.pillGreenText}>+100 Pts</Text>
                </View>
              </View>
            </View>
            {showReferSection ? (
              <ChevronDown size={18} color="#64748B" />
            ) : (
              <ChevronRight size={18} color="#94A3B8" />
            )}
          </TouchableOpacity>

          {showReferSection && (
            <View style={styles.accordionBox}>
              <Text style={styles.accordionSub}>
                Share your invite code with friends to earn 100 free welcome points when they join!
              </Text>
              <View style={styles.codeRow}>
                <Text style={styles.codeText}>{user?.referral_code || 'PERKFY100'}</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity onPress={handleCopyCode} style={styles.iconBtn}>
                    {copiedCode ? <Check size={16} color="#16A34A" /> : <Copy size={16} color="#5B21B6" />}
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleShareReferral} style={styles.iconBtn}>
                    <Share2 size={16} color="#5B21B6" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          <View style={styles.divider} />

          {/* 2. Edit Profile */}
          <TouchableOpacity
            onPress={() => {
              setEditName(user?.name || '');
              setEditMobile(user?.mobile || '');
              setShowEditProfile(!showEditProfile);
            }}
            style={styles.menuRow}
            activeOpacity={0.8}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconCircle, { backgroundColor: '#EDE9FE' }]}>
                <Edit3 size={18} color="#5B21B6" />
              </View>
              <Text style={styles.menuTitle}>Edit Profile</Text>
            </View>
            {showEditProfile ? (
              <ChevronDown size={18} color="#64748B" />
            ) : (
              <ChevronRight size={18} color="#94A3B8" />
            )}
          </TouchableOpacity>

          {showEditProfile && (
            <View style={styles.accordionBox}>
              {profileMsg ? (
                <View style={styles.successBanner}>
                  <CheckCircle2 size={15} color="#16A34A" />
                  <Text style={styles.successBannerText}>{profileMsg}</Text>
                </View>
              ) : null}
              {profileError ? (
                <View style={styles.errorBanner}>
                  <AlertCircle size={15} color="#DC2626" />
                  <Text style={styles.errorBannerText}>{profileError}</Text>
                </View>
              ) : null}

              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                value={editName}
                onChangeText={setEditName}
                placeholder="Your full name"
                placeholderTextColor="#94A3B8"
                style={styles.textInput}
              />

              <Text style={[styles.inputLabel, { marginTop: 10 }]}>Mobile Number</Text>
              <TextInput
                value={editMobile}
                onChangeText={setEditMobile}
                placeholder="e.g. 9876543210"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                style={styles.textInput}
              />

              <TouchableOpacity
                onPress={handleProfileUpdate}
                disabled={profileLoading}
                style={styles.saveBtn}
                activeOpacity={0.85}
              >
                {profileLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Save size={15} color="#FFFFFF" />
                    <Text style={styles.saveBtnText}>Save Profile</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.divider} />

          {/* 3. My Withdrawals Activity */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Activity')}
            style={styles.menuRow}
            activeOpacity={0.8}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconCircle, { backgroundColor: '#F0FDF4' }]}>
                <Clock size={18} color="#16A34A" />
              </View>
              <Text style={styles.menuTitle}>My Withdrawals & Vouchers</Text>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* 4. Change Password */}
          <TouchableOpacity
            onPress={() => setShowPasswordForm(!showPasswordForm)}
            style={styles.menuRow}
            activeOpacity={0.8}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconCircle, { backgroundColor: '#FEF3C7' }]}>
                <Lock size={18} color="#D97706" />
              </View>
              <Text style={styles.menuTitle}>Change Password</Text>
            </View>
            {showPasswordForm ? (
              <ChevronDown size={18} color="#64748B" />
            ) : (
              <ChevronRight size={18} color="#94A3B8" />
            )}
          </TouchableOpacity>

          {showPasswordForm && (
            <View style={styles.accordionBox}>
              {passMsg ? (
                <View style={styles.successBanner}>
                  <CheckCircle2 size={15} color="#16A34A" />
                  <Text style={styles.successBannerText}>{passMsg}</Text>
                </View>
              ) : null}
              {passError ? (
                <View style={styles.errorBanner}>
                  <AlertCircle size={15} color="#DC2626" />
                  <Text style={styles.errorBannerText}>{passError}</Text>
                </View>
              ) : null}

              <Text style={styles.inputLabel}>Current Password</Text>
              <View style={styles.passwordInputWrap}>
                <TextInput
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Enter current password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showCurrentPass}
                  style={styles.passInput}
                />
                <TouchableOpacity onPress={() => setShowCurrentPass(!showCurrentPass)}>
                  {showCurrentPass ? <EyeOff size={18} color="#64748B" /> : <Eye size={18} color="#64748B" />}
                </TouchableOpacity>
              </View>

              <Text style={[styles.inputLabel, { marginTop: 10 }]}>New Password</Text>
              <View style={styles.passwordInputWrap}>
                <TextInput
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Min 6 characters"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showNewPass}
                  style={styles.passInput}
                />
                <TouchableOpacity onPress={() => setShowNewPass(!showNewPass)}>
                  {showNewPass ? <EyeOff size={18} color="#64748B" /> : <Eye size={18} color="#64748B" />}
                </TouchableOpacity>
              </View>

              <Text style={[styles.inputLabel, { marginTop: 10 }]}>Confirm New Password</Text>
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Re-enter new password"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showNewPass}
                style={styles.textInput}
              />

              <TouchableOpacity
                onPress={handlePasswordChange}
                disabled={passLoading}
                style={[styles.saveBtn, { backgroundColor: '#5B21B6' }]}
                activeOpacity={0.85}
              >
                {passLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Lock size={15} color="#FFFFFF" />
                    <Text style={styles.saveBtnText}>Update Password</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Section: Preferences & Alerts */}
        <Text style={styles.sectionHeader}>APP PREFERENCES & ALERTS</Text>
        <View style={styles.cardWhite}>
          <View style={styles.prefRow}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconCircle, { backgroundColor: '#EDE9FE' }]}>
                <Bell size={18} color="#7C3AED" />
              </View>
              <View>
                <Text style={styles.prefTitle}>External Push Notifications</Text>
                <Text style={styles.prefSub}>Daily reminders & payout updates</Text>
              </View>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={setPushEnabled}
              trackColor={{ false: '#CBD5E1', true: '#7C3AED' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.prefRow}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconCircle, { backgroundColor: '#DCFCE7' }]}>
                <Volume2 size={18} color="#16A34A" />
              </View>
              <View>
                <Text style={styles.prefTitle}>In-App Audio Chimes</Text>
                <Text style={styles.prefSub}>Sounds on spin, dice & attendance</Text>
              </View>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              trackColor={{ false: '#CBD5E1', true: '#16A34A' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.divider} />

          <TouchableOpacity onPress={handleTestAlertSound} style={styles.prefRow} activeOpacity={0.8}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconCircle, { backgroundColor: '#FEF3C7' }]}>
                <Sparkles size={18} color="#D97706" />
              </View>
              <View>
                <Text style={styles.prefTitle}>Test Notification Alert Sound</Text>
                <Text style={styles.prefSub}>Plays alert_chime.wav with vibration</Text>
              </View>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn} activeOpacity={0.85}>
          <LogOut size={18} color="#DC2626" />
          <Text style={styles.logoutBtnText}>Sign Out of Perkfy</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scroll: {
    padding: 14,
    gap: 14,
    paddingBottom: 35,
  },
  heroBanner: {
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: '#5B21B6',
    shadowOpacity: 0.28,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 3,
  },
  avatarBorder: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2.5,
    borderColor: '#4ADE80',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
  },
  heroTextWrap: {
    flex: 1,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  userEmail: {
    color: '#E0E7FF',
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  userMobile: {
    color: '#C7D2FE',
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  verifiedText: {
    color: '#86EFAC',
    fontSize: 10,
    fontWeight: '800',
  },
  cardWhite: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  menuIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E1B4B',
  },
  pillGreen: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  pillGreenText: {
    color: '#16A34A',
    fontSize: 10,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  accordionBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EDE9FE',
    marginBottom: 12,
  },
  accordionSub: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 10,
    lineHeight: 16,
  },
  codeRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  codeText: {
    fontFamily: 'monospace',
    fontWeight: '800',
    fontSize: 15,
    color: '#1E1B4B',
  },
  iconBtn: {
    backgroundColor: '#F1F5F9',
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    fontSize: 13,
    color: '#1E1B4B',
  },
  passwordInputWrap: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
  },
  passInput: {
    flex: 1,
    fontSize: 13,
    color: '#1E1B4B',
  },
  saveBtn: {
    backgroundColor: '#16A34A',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  successBanner: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 8,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  successBannerText: {
    color: '#166534',
    fontSize: 11,
    fontWeight: '700',
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  errorBannerText: {
    color: '#DC2626',
    fontSize: 11,
    fontWeight: '700',
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginTop: 4,
    marginLeft: 4,
  },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  prefTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E1B4B',
  },
  prefSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  logoutBtn: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  logoutBtnText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '800',
  },
});
