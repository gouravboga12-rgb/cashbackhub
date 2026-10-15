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
  ActivityIndicator
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
  Check
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../context/AuthContext';
import { showInAppNotification, triggerPushNotification } from '../services/notificationService';
import api from '../services/api';
import { COLORS } from '../theme';

export default function ProfileScreen() {
  const { user, wallet, logout, refreshUser } = useAuth();

  const [pushEnabled, setPushEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Change password form
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [passMsg, setPassMsg] = useState('');

  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = () => {
    const code = user?.referral_code || 'PERKFY100';
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

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      setPassMsg('Please enter your current and new password');
      return;
    }
    setPassLoading(true);
    try {
      const res = await api.post('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      });
      if (res.data?.success) {
        showInAppNotification('Success', 'Password updated successfully!');
        setShowPasswordModal(false);
        setCurrentPassword('');
        setNewPassword('');
      } else {
        setPassMsg(res.data?.message || 'Password update failed');
      }
    } catch (e: any) {
      setPassMsg(e.response?.data?.message || 'Error updating password');
    } finally {
      setPassLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out of your Perkfy account?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const handleTestPush = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    showInAppNotification('Testing In-App Notification 🔔', 'Sound and vibration triggered!');
    await triggerPushNotification(
      'Perkfy Alert 🌟',
      'This is a test notification with custom sound alert chime!'
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Profile Header Card */}
        <View style={styles.profileCard}>
          <LinearGradient colors={['#5B21B6', '#7C3AED']} style={styles.avatarWrap}>
            <Text style={styles.avatarLetter}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </Text>
          </LinearGradient>
          <Text style={styles.userName}>{user?.name || 'Perkfy Member'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'user@perkfy.app'}</Text>

          <View style={styles.accountBadge}>
            <ShieldCheck size={14} color="#16A34A" />
            <Text style={styles.accountBadgeText}>Verified Account</Text>
          </View>
        </View>

        {/* Referral Card */}
        <LinearGradient colors={['#F5EEFD', '#EDE9FE']} style={styles.referralCard}>
          <View style={styles.referralTop}>
            <View style={styles.giftIconWrap}>
              <Sparkles size={20} color="#7C3AED" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.referralTitle}>Your Referral Code</Text>
              <Text style={styles.referralSub}>Invite friends to earn 50 bonus points each!</Text>
            </View>
          </View>

          <View style={styles.codeRow}>
            <Text style={styles.codeText}>{user?.referral_code || 'PERKFY100'}</Text>

            <View style={styles.btnGroup}>
              <TouchableOpacity onPress={handleCopyCode} style={styles.iconActionBtn}>
                {copiedCode ? <Check size={16} color="#16A34A" /> : <Copy size={16} color="#5B21B6" />}
              </TouchableOpacity>
              <TouchableOpacity onPress={handleShareReferral} style={styles.iconActionBtn}>
                <Share2 size={16} color="#5B21B6" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Preferences Section */}
        <Text style={styles.sectionTitle}>App Preferences & Alerts</Text>
        <View style={styles.menuGroup}>
          <View style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconWrap, { backgroundColor: '#F3E8FF' }]}>
                <Bell size={18} color="#7C3AED" />
              </View>
              <View>
                <Text style={styles.menuTitle}>External Push Notifications</Text>
                <Text style={styles.menuSub}>Daily reminders & payout updates</Text>
              </View>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={setPushEnabled}
              trackColor={{ false: '#CBD5E1', true: '#7C3AED' }}
            />
          </View>

          <View style={styles.menuDivider} />

          <View style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconWrap, { backgroundColor: '#DCFCE7' }]}>
                <Volume2 size={18} color="#16A34A" />
              </View>
              <View>
                <Text style={styles.menuTitle}>In-App Audio Chimes</Text>
                <Text style={styles.menuSub}>Sounds on spin, dice & attendance</Text>
              </View>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              trackColor={{ false: '#CBD5E1', true: '#16A34A' }}
            />
          </View>

          <View style={styles.menuDivider} />

          {/* Test Push Sound Trigger */}
          <TouchableOpacity onPress={handleTestPush} style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconWrap, { backgroundColor: '#FEF3C7' }]}>
                <Sparkles size={18} color="#D97706" />
              </View>
              <View>
                <Text style={styles.menuTitle}>Test Notification Alert Sound</Text>
                <Text style={styles.menuSub}>Plays alert_chime.wav with vibration</Text>
              </View>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Security Section */}
        <Text style={styles.sectionTitle}>Security</Text>
        <View style={styles.menuGroup}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setShowPasswordModal(!showPasswordModal)}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconWrap, { backgroundColor: '#F1F5F9' }]}>
                <Lock size={18} color="#475569" />
              </View>
              <Text style={styles.menuTitle}>Change Account Password</Text>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>

          {showPasswordModal && (
            <View style={styles.passwordForm}>
              <TextInput
                style={styles.passInput}
                placeholder="Current Password"
                secureTextEntry
                value={currentPassword}
                onChangeText={setCurrentPassword}
              />
              <TextInput
                style={styles.passInput}
                placeholder="New Password"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />
              {passMsg ? <Text style={styles.passMsg}>{passMsg}</Text> : null}
              <TouchableOpacity
                onPress={handleChangePassword}
                disabled={passLoading}
                style={styles.savePassBtn}
              >
                {passLoading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.savePassText}>Update Password</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
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
  header: {
    paddingHorizontal: 16,
    paddingTop: 45,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E1B4B',
  },
  scroll: {
    padding: 16,
    gap: 16,
    paddingBottom: 30,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatarWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    elevation: 3,
  },
  avatarLetter: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E1B4B',
  },
  userEmail: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  accountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 10,
  },
  accountBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#16A34A',
  },
  referralCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EDE9FE',
  },
  referralTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  giftIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  referralTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E1B4B',
  },
  referralSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 16,
    fontWeight: '800',
    color: '#5B21B6',
    letterSpacing: 1,
  },
  btnGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  iconActionBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  menuGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E1B4B',
  },
  menuSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 62,
  },
  passwordForm: {
    padding: 14,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 10,
  },
  passInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    fontSize: 13,
  },
  passMsg: {
    fontSize: 11,
    color: '#DC2626',
    fontWeight: '600',
  },
  savePassBtn: {
    backgroundColor: '#5B21B6',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  savePassText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 8,
  },
  logoutBtnText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '800',
  },
});
