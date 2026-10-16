import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Share,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
} from 'react-native';
import {
  User as UserIcon,
  Mail,
  Phone,
  Lock,
  LogOut,
  Users,
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
  Wallet,
  HelpCircle,
  Info,
  MessageSquare,
  FileText,
  Shield,
  X,
  Copy,
  Share2,
  Sparkles,
  Trash2,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../context/AuthContext';
import { showInAppNotification } from '../services/notificationService';
import api from '../services/api';

export default function ProfileScreen({ navigation }: any) {
  const { user, logout, refreshUser, deleteAccount } = useAuth();

  // Accordion Sections
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showReferModal, setShowReferModal] = useState(false);

  // Informational Modals
  const [activeInfoModal, setActiveInfoModal] = useState<
    'help' | 'about' | 'contact' | 'terms' | 'privacy' | null
  >(null);

  // Account Deletion State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

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

  const referralCode = user?.referral_code || 'PERKFY100';

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(referralCode);
    setCopiedCode(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    showInAppNotification('Copied!', `Referral code ${referralCode} copied!`);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleShareReferral = async () => {
    try {
      await Share.share({
        message: `Use my invite code ${referralCode} on Perkfy to receive 100 Free Welcome Points! Download: https://perkfy.app`,
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
        showInAppNotification('Success', 'Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          setPassMsg('');
          setShowPasswordForm(false);
        }, 2000);
      } else {
        setPassError(res.data?.message || 'Password update failed.');
      }
    } catch (e: any) {
      setPassError(
        e.response?.data?.message || 'Failed to change password. Please check your current password.'
      );
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

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.trim() !== 'DELETE') {
      setDeleteError('Please type DELETE in capital letters to confirm.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setDeleteLoading(true);
    setDeleteError('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    try {
      const res = await deleteAccount();
      if (res.success) {
        setShowDeleteModal(false);
        setDeleteConfirmText('');
        Alert.alert(
          'Account Deleted',
          'Your Perkfy account and all personal data have been permanently removed.'
        );
      } else {
        setDeleteError(res.message || 'Failed to delete account. Please try again.');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (err: any) {
      setDeleteError(err.message || 'Error processing deletion.');
    } finally {
      setDeleteLoading(false);
    }
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
          </View>
        </LinearGradient>

        {/* Menu Cards (1:1 with Web Portal) */}
        <View style={styles.cardWhite}>
          {/* 1. Refer & Earn (+100 Pts) */}
          <TouchableOpacity
            onPress={() => setShowReferModal(true)}
            style={styles.menuRow}
            activeOpacity={0.8}
          >
            <View style={styles.menuLeft}>
              <Users size={20} color="#16A34A" />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={styles.menuTitle}>Refer & Earn</Text>
                <View style={styles.pillGreen}>
                  <Text style={styles.pillGreenText}>+100 Pts</Text>
                </View>
              </View>
            </View>
            <ChevronRight size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* 2. Edit Profile Accordion */}
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
              <Edit3 size={20} color="#5B21B6" />
              <Text style={styles.menuTitle}>Edit Profile</Text>
            </View>
            {showEditProfile ? (
              <ChevronDown size={18} color="#64748B" />
            ) : (
              <ChevronRight size={18} color="#9CA3AF" />
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

          {/* 3. Change Password Accordion */}
          <TouchableOpacity
            onPress={() => setShowPasswordForm(!showPasswordForm)}
            style={styles.menuRow}
            activeOpacity={0.8}
          >
            <View style={styles.menuLeft}>
              <Lock size={20} color="#5B21B6" />
              <Text style={styles.menuTitle}>Change Password</Text>
            </View>
            {showPasswordForm ? (
              <ChevronDown size={18} color="#64748B" />
            ) : (
              <ChevronRight size={18} color="#9CA3AF" />
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
                  {showCurrentPass ? (
                    <EyeOff size={18} color="#64748B" />
                  ) : (
                    <Eye size={18} color="#64748B" />
                  )}
                </TouchableOpacity>
              </View>

              <Text style={[styles.inputLabel, { marginTop: 10 }]}>
                New Password (min 6 characters)
              </Text>
              <View style={styles.passwordInputWrap}>
                <TextInput
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Enter new password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showNewPass}
                  style={styles.passInput}
                />
                <TouchableOpacity onPress={() => setShowNewPass(!showNewPass)}>
                  {showNewPass ? (
                    <EyeOff size={18} color="#64748B" />
                  ) : (
                    <Eye size={18} color="#64748B" />
                  )}
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
                style={[styles.saveBtn, { backgroundColor: '#16A34A' }]}
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

          <View style={styles.divider} />

          {/* 4. My Withdrawals */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Activity')}
            style={styles.menuRow}
            activeOpacity={0.8}
          >
            <View style={styles.menuLeft}>
              <Clock size={20} color="#5B21B6" />
              <Text style={styles.menuTitle}>My Withdrawals</Text>
            </View>
            <ChevronRight size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* 5. Transaction History */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Wallet')}
            style={styles.menuRow}
            activeOpacity={0.8}
          >
            <View style={styles.menuLeft}>
              <Wallet size={20} color="#5B21B6" />
              <Text style={styles.menuTitle}>Transaction History</Text>
            </View>
            <ChevronRight size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* 6. Help & Support */}
          <TouchableOpacity
            onPress={() => setActiveInfoModal('help')}
            style={styles.menuRow}
            activeOpacity={0.8}
          >
            <View style={styles.menuLeft}>
              <HelpCircle size={20} color="#5B21B6" />
              <Text style={styles.menuTitle}>Help & Support</Text>
            </View>
            <ChevronRight size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* 7. About Us */}
          <TouchableOpacity
            onPress={() => setActiveInfoModal('about')}
            style={styles.menuRow}
            activeOpacity={0.8}
          >
            <View style={styles.menuLeft}>
              <Info size={20} color="#5B21B6" />
              <Text style={styles.menuTitle}>About Us</Text>
            </View>
            <ChevronRight size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* 8. Contact Us */}
          <TouchableOpacity
            onPress={() => setActiveInfoModal('contact')}
            style={styles.menuRow}
            activeOpacity={0.8}
          >
            <View style={styles.menuLeft}>
              <MessageSquare size={20} color="#5B21B6" />
              <Text style={styles.menuTitle}>Contact Us</Text>
            </View>
            <ChevronRight size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* 9. Terms & Conditions */}
          <TouchableOpacity
            onPress={() => setActiveInfoModal('terms')}
            style={styles.menuRow}
            activeOpacity={0.8}
          >
            <View style={styles.menuLeft}>
              <FileText size={20} color="#5B21B6" />
              <Text style={styles.menuTitle}>Terms & Conditions</Text>
            </View>
            <ChevronRight size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* 10. Privacy Policy */}
          <TouchableOpacity
            onPress={() => setActiveInfoModal('privacy')}
            style={styles.menuRow}
            activeOpacity={0.8}
          >
            <View style={styles.menuLeft}>
              <Shield size={20} color="#5B21B6" />
              <Text style={styles.menuTitle}>Privacy Policy</Text>
            </View>
            <ChevronRight size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* 11. Logout */}
          <TouchableOpacity
            onPress={handleLogout}
            style={styles.menuRow}
            activeOpacity={0.8}
          >
            <View style={styles.menuLeft}>
              <LogOut size={20} color="#64748B" />
              <Text style={[styles.menuTitle, { color: '#64748B' }]}>Logout</Text>
            </View>
            <ChevronRight size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* 12. Delete Account (Play Store Self-Service Requirement) */}
          <TouchableOpacity
            onPress={() => {
              setDeleteConfirmText('');
              setDeleteError('');
              setShowDeleteModal(true);
            }}
            style={styles.menuRow}
            activeOpacity={0.8}
          >
            <View style={styles.menuLeft}>
              <Trash2 size={20} color="#DC2626" />
              <Text style={[styles.menuTitle, { color: '#DC2626' }]}>Delete Account</Text>
            </View>
            <ChevronRight size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* REFER & EARN MODAL (1:1 with Web ReferModal) */}
      <Modal visible={showReferModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.referModalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Refer Friends & Earn</Text>
              <TouchableOpacity onPress={() => setShowReferModal(false)}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={{ alignItems: 'center', marginVertical: 12 }}>
              <View style={styles.referIconWrap}>
                <Sparkles size={32} color="#16A34A" />
              </View>
              <Text style={styles.referBadgeText}>Get +100 Free Points Per Friend</Text>
              <Text style={styles.referSub}>
                Invite your friends with your unique code. Both of you receive bonus rewards when they sign up!
              </Text>
            </View>

            <View style={styles.codeBox}>
              <Text style={styles.codeValue}>{referralCode}</Text>
              <TouchableOpacity onPress={handleCopyCode} style={styles.copyBtn}>
                {copiedCode ? <Check size={16} color="#16A34A" /> : <Copy size={16} color="#5B21B6" />}
                <Text style={[styles.copyBtnText, copiedCode && { color: '#16A34A' }]}>
                  {copiedCode ? 'Copied' : 'Copy'}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={handleShareReferral} style={styles.shareBtn} activeOpacity={0.85}>
              <Share2 size={18} color="#FFFFFF" />
              <Text style={styles.shareBtnText}>Share Invite Link</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* INFORMATIONAL BOTTOM SHEET MODALS */}
      <Modal
        visible={activeInfoModal !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveInfoModal(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.infoModalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {activeInfoModal === 'help' && 'Help & Support'}
                {activeInfoModal === 'about' && 'About Perkfy'}
                {activeInfoModal === 'contact' && 'Contact Us'}
                {activeInfoModal === 'terms' && 'Terms & Conditions'}
                {activeInfoModal === 'privacy' && 'Privacy Policy'}
              </Text>
              <TouchableOpacity onPress={() => setActiveInfoModal(null)}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
              {activeInfoModal === 'help' && (
                <View style={{ gap: 10 }}>
                  <Text style={styles.infoTextHeading}>How Can We Help You?</Text>
                  <Text style={styles.infoText}>
                    Welcome to the Perkfy Help Center. Here are common solutions:
                  </Text>
                  <Text style={styles.bulletItem}>
                    • <Text style={{ fontWeight: '800' }}>Withdrawals:</Text> Vouchers are sent directly to your registered account upon admin review.
                  </Text>
                  <Text style={styles.bulletItem}>
                    • <Text style={{ fontWeight: '800' }}>Points Conversion:</Text> Check your wallet rate anytime; min redemption is configured dynamically.
                  </Text>
                  <Text style={styles.bulletItem}>
                    • <Text style={{ fontWeight: '800' }}>Support Email:</Text> support@perkfy.app
                  </Text>
                </View>
              )}

              {activeInfoModal === 'about' && (
                <View style={{ gap: 10 }}>
                  <Text style={styles.infoTextHeading}>Welcome to Perkfy 🎉</Text>
                  <Text style={styles.infoText}>
                    Perkfy is the premier daily rewards, gamification, and cash voucher platform in India. Turn your free time into valuable vouchers from Amazon, Flipkart, PhonePe, and Google Play!
                  </Text>
                  <Text style={styles.infoText}>
                    Spin wheels, roll lucky dice, crack mystery boxes, and complete verified partner tasks to accumulate points and withdraw seamlessly.
                  </Text>
                </View>
              )}

              {activeInfoModal === 'contact' && (
                <View style={{ gap: 10 }}>
                  <Text style={styles.infoTextHeading}>Get In Touch</Text>
                  <Text style={styles.infoText}>
                    We are here to support your experience 24/7.
                  </Text>
                  <Text style={styles.bulletItem}>
                    • <Text style={{ fontWeight: '800' }}>Email:</Text> support@perkfy.app
                  </Text>
                  <Text style={styles.bulletItem}>
                    • <Text style={{ fontWeight: '800' }}>Phone:</Text> +91 73374 01590
                  </Text>
                  <Text style={styles.bulletItem}>
                    • <Text style={{ fontWeight: '800' }}>Headquarters:</Text> Hyderabad, Telangana, India
                  </Text>
                </View>
              )}

              {activeInfoModal === 'terms' && (
                <View style={{ gap: 10 }}>
                  <Text style={styles.infoTextHeading}>Terms & Conditions</Text>
                  <Text style={styles.infoText}>
                    1. <Text style={{ fontWeight: '800' }}>Promotional Rewards Model:</Text> Perkfy is a 100% free-to-play loyalty and promotional reward service. No purchase, payment, or wager of real money is required or permitted to play games or win points.
                  </Text>
                  <Text style={styles.infoText}>
                    2. <Text style={{ fontWeight: '800' }}>Not Gambling / No Real Money Betting:</Text> Points accumulated in the app have no direct cash value and represent promotional tokens redeemable strictly for approved partner merchant gift cards (e.g. Amazon, Flipkart, Swiggy, Google Play) or direct cashback subject to platform redemption terms and inventory.
                  </Text>
                  <Text style={styles.infoText}>
                    3. <Text style={{ fontWeight: '800' }}>One Account Per Person:</Text> Each user may register and operate only one account. Use of emulators, bot scripts, VPN fraud, or multiple accounts is strictly prohibited and results in immediate termination and forfeiture of points.
                  </Text>
                  <Text style={styles.infoText}>
                    4. <Text style={{ fontWeight: '800' }}>Account Deletion:</Text> You hold the unconditional right to delete your account at any time through Profile &gt; Delete Account.
                  </Text>
                </View>
              )}

              {activeInfoModal === 'privacy' && (
                <View style={{ gap: 10 }}>
                  <Text style={styles.infoTextHeading}>Privacy & Data Protection Policy</Text>
                  <Text style={styles.infoText}>
                    Your privacy and data security are our highest priority. All data transmission is secured with industry-standard TLS/SSL encryption.
                  </Text>
                  <Text style={styles.infoText}>
                    <Text style={{ fontWeight: '800' }}>Data Collected:</Text> Name, email address, mobile number (optional), device identifiers, and game reward progress used solely for authentication, anti-fraud verification, and voucher delivery.
                  </Text>
                  <Text style={styles.infoText}>
                    <Text style={{ fontWeight: '800' }}>Account & Data Deletion:</Text> You can permanently delete your Perkfy account and all personal records directly from the Profile screen by selecting "Delete Account" and typing DELETE to confirm. Upon confirmation, your profile, authentication credentials, wallet records, and attendance data are purged from our servers.
                  </Text>
                  <Text style={styles.infoText}>
                    You can also request manual data deletion anytime by emailing: <Text style={{ fontWeight: '800', color: '#5B21B6' }}>perkfy2026@gmail.com</Text>.
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* DELETE ACCOUNT CONFIRMATION MODAL (Type DELETE safeguard) */}
      <Modal visible={showDeleteModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.deleteModalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <AlertCircle size={22} color="#DC2626" />
                <Text style={[styles.modalTitle, { color: '#DC2626' }]}>Delete Account</Text>
              </View>
              <TouchableOpacity onPress={() => setShowDeleteModal(false)}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.deleteWarningText}>
              This action is permanent and cannot be undone. All your earned points, wallet balance, active rewards, and game streak will be permanently erased.
            </Text>

            <Text style={styles.deletePromptText}>
              To confirm deletion, please type <Text style={{ fontWeight: '800', color: '#DC2626' }}>DELETE</Text> in capital letters below:
            </Text>

            <TextInput
              value={deleteConfirmText}
              onChangeText={setDeleteConfirmText}
              placeholder="Type DELETE"
              placeholderTextColor="#94A3B8"
              autoCapitalize="characters"
              style={styles.deleteInput}
            />

            {deleteError ? (
              <Text style={styles.deleteErrorText}>{deleteError}</Text>
            ) : null}

            <View style={styles.deleteActions}>
              <TouchableOpacity
                onPress={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                }}
                style={styles.cancelBtn}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleDeleteAccount}
                disabled={deleteConfirmText.trim() !== 'DELETE' || deleteLoading}
                style={[
                  styles.confirmDeleteBtn,
                  deleteConfirmText.trim() !== 'DELETE' && { opacity: 0.45, backgroundColor: '#9CA3AF' }
                ]}
                activeOpacity={0.85}
              >
                {deleteLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmDeleteBtnText}>Delete Permanently</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    width: 64,
    height: 64,
    borderRadius: 32,
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
  cardWhite: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
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
    gap: 14,
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E1B4B',
  },
  pillGreen: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  pillGreenText: {
    color: '#16A34A',
    fontSize: 10,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  accordionBox: {
    backgroundColor: '#F8F7FC',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EDE9FE',
    marginBottom: 12,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  referModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 380,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E1B4B',
  },
  referIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  referBadgeText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#15803D',
  },
  referSub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 14,
    marginBottom: 12,
  },
  codeValue: {
    fontFamily: 'monospace',
    fontWeight: '900',
    fontSize: 16,
    color: '#1E1B4B',
    letterSpacing: 1,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  copyBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#5B21B6',
  },
  shareBtn: {
    backgroundColor: '#16A34A',
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  shareBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  infoModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  infoTextHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E1B4B',
    marginBottom: 2,
  },
  infoText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
  bulletItem: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
  deleteModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 6,
  },
  deleteWarningText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
    marginTop: 10,
    marginBottom: 12,
  },
  deletePromptText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E1B4B',
    marginBottom: 8,
  },
  deleteInput: {
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '700',
    color: '#DC2626',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  deleteErrorText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
    marginBottom: 10,
  },
  deleteActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  confirmDeleteBtn: {
    flex: 1.3,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmDeleteBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
